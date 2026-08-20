/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, redirect } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { CheckCircle, Users, Loader2, ShieldAlert, Check, Clock, UserCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const Route = createFileRoute('/_dashboard/teacher-dashboard')({
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (user && user.role !== 'ADMIN') {
      throw redirect({ to: '/student-dashboard' });
    }
  },
  component: TeacherDashboard,
});

function TeacherDashboard() {
  const queryClient = useQueryClient();

  // جلب كل الطالبات
  const { data: students, isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await api.get('/admin/students');
      return response.data;
    },
  });

  // تفعيل حساب الطالبة (تغيير الـ status إلى ACTIVE)
  const activateMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const response = await api.patch(`/admin/students/${studentId}/status`, {
        status: 'ACTIVE',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={44} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-red-50 border border-red-200 text-red-600 font-bold text-center">
        حدث خطأ أثناء جلب بيانات الطالبات. يرجى التأكد من تشغيل الخادم وصلاحيات حسابك.
      </div>
    );
  }

  // تصفية الطالبات اللواتي في قيد الانتظار (PENDING) والنشطات
  const pendingStudents = students?.filter((s: any) => s.status === 'PENDING') || [];
  const activeStudents = students?.filter((s: any) => s.status === 'ACTIVE') || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-secondary/25 flex items-center justify-between">
          <div>
            <p className="text-text-main/60 text-xs font-bold mb-1">إجمالي الطالبات المسجلات</p>
            <h3 className="text-3xl font-bold text-primary-dark">{students?.length || 0}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Users size={28} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xs border border-secondary/25 flex items-center justify-between">
          <div>
            <p className="text-text-main/60 text-xs font-bold mb-1">طالبات في انتظار التفعيل</p>
            <h3 className="text-3xl font-bold text-amber-600">{pendingStudents.length}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock size={28} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xs border border-secondary/25 flex items-center justify-between">
          <div>
            <p className="text-text-main/60 text-xs font-bold mb-1">طالبات نشطات في الحلقات</p>
            <h3 className="text-3xl font-bold text-primary">{activeStudents.length}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <UserCheck size={28} />
          </div>
        </div>
      </div>

      {/* قائمة الطلبات المعلقة */}
      <div className="bg-white rounded-3xl shadow-xs border border-secondary/20 overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-primary-dark flex items-center gap-2">
              <ShieldAlert size={22} className="text-amber-500" />
              <span>طلبات الانضمام المعلقة ({pendingStudents.length})</span>
            </h2>
            <p className="text-xs text-text-main/60 mt-1">مراجعة وتفعيل حسابات الطالبات الجدد للوصول إلى الحلقات</p>
          </div>
        </div>

        {pendingStudents.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl bg-neutral-bg/60 border border-secondary/15">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Check size={28} />
            </div>
            <p className="text-text-main/70 font-bold text-base">لا توجد طلبات معلقة في الوقت الحالي ✨</p>
            <p className="text-text-main/50 text-xs mt-1">تمت مراجعة وتفعيل جميع طلبات التسجيل</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-secondary/25 text-text-main/60 text-xs">
                  <th className="py-4 px-4 font-bold">اسم الطالبة</th>
                  <th className="py-4 px-4 font-bold">البريد الإلكتروني</th>
                  <th className="py-4 px-4 font-bold">رقم الهاتف</th>
                  <th className="py-4 px-4 text-center font-bold">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/15">
                {pendingStudents.map((student: any) => (
                  <tr key={student.id} className="hover:bg-neutral-bg/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary-dark flex items-center justify-center font-bold text-sm">
                          {student.name?.charAt(0) || 'ط'}
                        </div>
                        <span className="font-bold text-primary-dark text-sm">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-text-main/80 text-sm" dir="ltr">{student.email}</td>
                    <td className="py-4 px-4 text-text-main/80 text-sm" dir="ltr">{student.phone || 'غير مسجل'}</td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => activateMutation.mutate(student.id)}
                        disabled={activateMutation.isPending}
                        className="inline-flex items-center gap-2 bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm hover:bg-primary-dark/90 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {activateMutation.isPending ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        <span>تفعيل الحساب</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
