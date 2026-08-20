/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/useAuthStore';
import {
  CheckCircle2,
  XCircle,
  Save,
  Loader2,
  Users,
  Check,
  Film,
  Clock,
} from 'lucide-react';


export const Route = createFileRoute('/_dashboard/attendance')({
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (user && user.role !== 'ADMIN') {
      throw redirect({ to: '/student-dashboard' });
    }
  },
  component: AttendancePage,
});

function AttendancePage() {
  const queryClient = useQueryClient();
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [localAttendance, setLocalAttendance] = useState<{ [userId: string]: 'PRESENT' | 'ABSENT' }>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  // جلب كل الحلقات لاختيار الحلقة المراد تسجيل حضورها
  const { data: sessions, isLoading: isSessionsLoading } = useQuery({
    queryKey: ['admin-sessions-attendance'],
    queryFn: async () => {
      const res = await api.get('/admin/sessions');
      if (res.data && res.data.length > 0 && !selectedSessionId) {
        setSelectedSessionId(res.data[0].id);
      }
      return res.data;
    },
  });

  // جلب قائمة الحضور للحلقة المحددة
  const { data: studentList, isLoading: isAttendanceLoading } = useQuery({
    queryKey: ['admin-attendance-records', selectedSessionId],
    queryFn: async () => {
      if (!selectedSessionId) return [];
      const res = await api.get(`/admin/attendance/${selectedSessionId}`);
      // تهيئة الـ local state بناءً على البيانات القادمة من السيرفر
      const initialMap: { [userId: string]: 'PRESENT' | 'ABSENT' } = {};
      res.data.forEach((s: any) => {
        if (s.status) {
          initialMap[s.userId] = s.status;
        }
      });
      setLocalAttendance(initialMap);
      return res.data;
    },
    enabled: !!selectedSessionId,
  });

  // حفظ الحضور والغياب
  const saveAttendanceMutation = useMutation({
    mutationFn: async () => {
      const records = Object.entries(localAttendance).map(([userId, status]) => ({
        userId,
        status,
      }));
      const res = await api.put(`/admin/attendance/${selectedSessionId}`, {
        attendance: records,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-attendance-records', selectedSessionId] });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
  });

  const handleToggleStatus = (userId: string, status: 'PRESENT' | 'ABSENT') => {
    setLocalAttendance((prev) => ({
      ...prev,
      [userId]: status,
    }));
  };

  const markAll = (status: 'PRESENT' | 'ABSENT') => {
    if (!studentList) return;
    const newMap: { [userId: string]: 'PRESENT' | 'ABSENT' } = {};
    studentList.forEach((s: any) => {
      newMap[s.userId] = status;
    });
    setLocalAttendance(newMap);
  };

  const presentCount = Object.values(localAttendance).filter((s) => s === 'PRESENT').length;
  const absentCount = Object.values(localAttendance).filter((s) => s === 'ABSENT').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-secondary/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-dark mb-1">
            إدارة الحضور والغياب 📝
          </h2>
          <p className="text-text-main/60 text-xs sm:text-sm">
            تسجيل حضور الطالبات في الحلقات وتحديد من يحق لهن الوصول لتسجيلات الحلقة
          </p>
        </div>

        {selectedSessionId && (
          <button
            onClick={() => saveAttendanceMutation.mutate()}
            disabled={saveAttendanceMutation.isPending || !studentList || studentList.length === 0}
            className="inline-flex items-center gap-2 bg-primary-dark text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md hover:bg-primary-dark/90 hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            {saveAttendanceMutation.isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : savedSuccess ? (
              <Check size={18} className="text-secondary" />
            ) : (
              <Save size={18} />
            )}
            <span>{savedSuccess ? 'تم حفظ الحضور بنجاح!' : 'حفظ سجل الحضور'}</span>
          </button>
        )}
      </div>

      {/* Session Selector & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Selector Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xs border border-secondary/25 space-y-3">
          <label className="block text-xs font-bold text-primary-dark">
            اختاري الحلقة المراد رصد حضورها:
          </label>
          {isSessionsLoading ? (
            <div className="py-4 flex justify-center">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : sessions && sessions.length > 0 ? (
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-secondary/40 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary outline-none text-sm font-bold text-primary-dark"
            >
              {sessions.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.title} — {new Date(s.scheduledAt).toLocaleDateString('ar-EG', { weekday: 'short', month: 'short', day: 'numeric' })}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-text-main/50 font-bold">لا توجد حلقات مسجلة في النظام بعد</p>
          )}

          {studentList && studentList.length > 0 && (
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => markAll('PRESENT')}
                className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                تحديد الجميع كـ "حاضرة"
              </button>
              <button
                type="button"
                onClick={() => markAll('ABSENT')}
                className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                تحديد الجميع كـ "غائبة"
              </button>
            </div>
          )}
        </div>

        {/* Counter Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-secondary/25 flex items-center justify-around">
          <div className="text-center">
            <span className="text-xs text-text-main/60 font-bold block mb-1">الحاضرات</span>
            <span className="text-3xl font-bold text-emerald-600">{presentCount}</span>
          </div>
          <div className="h-10 w-px bg-secondary/30"></div>
          <div className="text-center">
            <span className="text-xs text-text-main/60 font-bold block mb-1">الغائبات</span>
            <span className="text-3xl font-bold text-rose-600">{absentCount}</span>
          </div>
          <div className="h-10 w-px bg-secondary/30"></div>
          <div className="text-center">
            <span className="text-xs text-text-main/60 font-bold block mb-1">الإجمالي</span>
            <span className="text-3xl font-bold text-primary-dark">{studentList?.length || 0}</span>
          </div>
        </div>

      </div>

      {/* 7-Day Compensation Info Banner */}
      <div className="p-5 rounded-3xl bg-linear-to-r from-primary/10 via-neutral-bg to-amber-500/10 border border-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 shrink-0">
            <Clock size={20} />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-primary-dark text-sm">
              نظام المشاهدة التعويضية للغائبات (مهلة ٧ أيام) 🌸
            </h4>
            <p className="text-xs text-text-main/70 leading-relaxed">
              الطالبات المرصودات كـ <strong className="text-rose-600">"غائبة"</strong> سيتاح لهن تسجيل الحلقة بالفيديو تلقائياً لمدة <strong>٧ أيام</strong> فور نشره في مكتبة التسجيلات لتعويض ما فاتهن من تلاوة وتجويد.
            </p>
          </div>
        </div>
        <Link
          to="/recordings"
          className="inline-flex items-center justify-center gap-2 bg-primary-dark text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-xs hover:bg-primary-dark/90 transition-all shrink-0"
        >
          <Film size={15} />
          <span>مكتبة التسجيلات ←</span>
        </Link>
      </div>

      {/* Students Attendance Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-secondary/20 overflow-hidden p-6 sm:p-8">
        <h3 className="text-lg font-bold text-primary-dark mb-4 flex items-center gap-2">
          <Users size={20} className="text-primary" />
          <span>كشف طالبات الحلقة ({studentList?.length || 0})</span>
        </h3>

        {isAttendanceLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="animate-spin text-primary" size={36} />
          </div>
        ) : studentList && studentList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-secondary/25 text-text-main/60 text-xs">
                  <th className="py-3 px-4 font-bold">اسم الطالبة</th>
                  <th className="py-3 px-4 text-center font-bold">الحالة</th>
                  <th className="py-3 px-4 text-center font-bold">تسجيل سريع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/15">
                {studentList.map((st: any) => {
                  const currentStatus = localAttendance[st.userId];

                  return (
                    <tr key={st.userId} className="hover:bg-neutral-bg/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary-dark flex items-center justify-center font-bold text-sm">
                            {st.name?.charAt(0) || 'ط'}
                          </div>
                          <span className="font-bold text-primary-dark text-sm">{st.name}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${currentStatus === 'PRESENT'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : currentStatus === 'ABSENT'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-neutral-bg text-text-main/50 border border-secondary/20'
                            }`}
                        >
                          {currentStatus === 'PRESENT' ? 'حاضرة 🌸' : currentStatus === 'ABSENT' ? 'غائبة' : 'لم يُرصد بعد'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(st.userId, 'PRESENT')}
                            className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentStatus === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                          >
                            <CheckCircle2 size={15} />
                            <span>حاضرة</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(st.userId, 'ABSENT')}
                            className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentStatus === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              }`}
                          >
                            <XCircle size={15} />
                            <span>غائبة</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl bg-neutral-bg/60 border border-secondary/15 text-xs text-text-main/60 font-semibold">
            {selectedSessionId
              ? 'لا توجد طالبات مفعلات لتسجيل حضورهن في هذه الحلقة'
              : 'يرجى اختيار حلقة من القائمة أعلاه لعرض كشف الحضور'}
          </div>
        )}
      </div>

    </div>
  );
}
