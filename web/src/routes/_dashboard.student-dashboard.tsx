/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/useAuthStore';
import {
  Video,
  Clock,
  Calendar,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Sparkles,
  Loader2,
  FileText,
  Hourglass,
  HeartHandshake,
} from 'lucide-react';
import VideoPlayerModal from '../components/video/VideoPlayerModal';

export const Route = createFileRoute('/_dashboard/student-dashboard')({
  beforeLoad: () => {
    const { user } = useAuthStore.getState();
    if (user && user.role !== 'STUDENT') {
      throw redirect({ to: '/teacher-dashboard' });
    }
  },
  component: StudentDashboard,
});

function StudentDashboard() {
  const { user } = useAuthStore();
  const [playbackData, setPlaybackData] = useState<any>(null);
  const [loadingPlaybackId, setLoadingPlaybackId] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // 1. جلب الحلقة القادمة
  const { data: upcomingSession, isLoading: isUpcomingLoading } = useQuery({
    queryKey: ['student-upcoming-session'],
    queryFn: async () => {
      const response = await api.get('/student/sessions/upcoming');
      return response.data;
    },
  });

  // 2. جلب التسجيلات المتاحة
  const { data: recordings, isLoading: isRecordingsLoading } = useQuery({
    queryKey: ['student-recordings'],
    queryFn: async () => {
      const response = await api.get('/student/recordings');
      return response.data;
    },
  });

  // 3. جلب سجل الحضور
  const { data: attendanceHistory, isLoading: isAttendanceLoading } = useQuery({
    queryKey: ['student-attendance'],
    queryFn: async () => {
      const response = await api.get('/student/attendance');
      return response.data;
    },
  });

  // تشغيل تسجيل
  const handlePlayRecording = async (recordingId: string) => {
    try {
      setLoadingPlaybackId(recordingId);
      setPlaybackError(null);
      const res = await api.get(`/student/recordings/${recordingId}/playback`);
      setPlaybackData(res.data);
    } catch (err: any) {
      setPlaybackError(err.response?.data?.message || 'تعذر تشغيل هذا التسجيل، يرجى مراجعة المعلمة أو التأكد من مهلة الـ ٧ أيام.');
    } finally {
      setLoadingPlaybackId(null);
    }
  };

  const attendedCount = attendanceHistory?.filter((a: any) => a.status === 'PRESENT').length || 0;
  const totalSessionsCount = attendanceHistory?.length || 0;
  const attendanceRate = totalSessionsCount > 0 ? Math.round((attendedCount / totalSessionsCount) * 100) : 100;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Hero / Motivation Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary-dark via-primary-dark to-primary p-8 sm:p-10 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-secondary">
            <Sparkles size={14} />
            <span>مرحباً بكِ في مقرأة ورتل</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-arabic leading-tight">
            "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ"
          </h2>
          <p className="text-white/80 text-sm sm:text-base leading-relaxed">
            طالبتنا العزيزة <span className="font-bold text-white">{user?.name}</span>، هنيئاً لكِ مجالس القرآن ومرافقة آياته العظيمة.
          </p>
        </div>
        <div className="absolute left-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
          <BookOpen size={240} />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-secondary/25 flex items-center justify-between">
          <div>
            <p className="text-text-main/60 text-xs font-bold mb-1">نسبة الالتزام بالحلقات</p>
            <h3 className="text-3xl font-bold text-primary-dark">{attendanceRate}%</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <CheckCircle2 size={28} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xs border border-secondary/25 flex items-center justify-between">
          <div>
            <p className="text-text-main/60 text-xs font-bold mb-1">الحلقات التي تم حضورها</p>
            <h3 className="text-3xl font-bold text-primary-dark">{attendedCount}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-secondary/30 flex items-center justify-center text-primary-dark">
            <Video size={28} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xs border border-secondary/25 flex items-center justify-between">
          <div>
            <p className="text-text-main/60 text-xs font-bold mb-1">تسجيلات متاحة للمراجعة والتعويض</p>
            <h3 className="text-3xl font-bold text-primary-dark">{recordings?.length || 0}</h3>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <PlayCircle size={28} />
          </div>
        </div>
      </div>

      {/* Upcoming Session Spotlight */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-secondary/25">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/15 rounded-2xl text-primary-dark">
              <Video size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary-dark">الحلقة المباشرة القادمة</h3>
              <p className="text-xs text-text-main/60">موعد جلستكِ القرآنية القادمة مع المعلمة</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            مباشر
          </span>
        </div>

        {isUpcomingLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : upcomingSession ? (
          <div className="bg-neutral-bg rounded-2xl p-6 border border-secondary/30 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <h4 className="text-lg font-bold text-primary-dark">{upcomingSession.title}</h4>
                <div className="flex flex-wrap gap-4 text-xs font-semibold text-text-main/70">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={15} className="text-primary" />
                    {formatDate(upcomingSession.scheduledAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={15} className="text-primary" />
                    {upcomingSession.durationMinutes} دقيقة
                  </span>
                </div>
              </div>

              {upcomingSession.meetingUrl ? (
                <a
                  href={upcomingSession.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-primary-dark text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md hover:bg-primary-dark/90 hover:shadow-lg transition-all"
                >
                  <ExternalLink size={18} />
                  <span>دخول قاعة البث المباشر</span>
                </a>
              ) : (
                <span className="text-xs text-text-main/50 font-bold bg-white px-4 py-2 rounded-xl border border-secondary/30">
                  رابط القاعة سيتوفر قبل الموعد
                </span>
              )}
            </div>

            {upcomingSession.notes && upcomingSession.notes.length > 0 && (
              <div className="pt-4 border-t border-secondary/20 space-y-2">
                <p className="text-xs font-bold text-primary-dark flex items-center gap-1.5">
                  <FileText size={14} />
                  <span>توجيهات المعلمة للحلقة:</span>
                </p>
                <div className="p-3 bg-white rounded-xl border border-secondary/20 text-xs text-text-main/80 leading-relaxed">
                  {upcomingSession.notes[0]?.content}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10 px-4 rounded-2xl bg-neutral-bg/60 border border-secondary/15">
            <p className="text-text-main/70 font-bold text-sm">لا توجد حلقات مباشرة مجدولة حالياً</p>
            <p className="text-text-main/50 text-xs mt-1">سيتم إشعاركِ فور تحديد موعد الحلقة القادمة من المعلمة</p>
          </div>
        )}
      </div>

      {/* Playback Error Alert */}
      {playbackError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold flex items-center gap-2">
          <AlertCircle size={20} className="shrink-0" />
          <span>{playbackError}</span>
        </div>
      )}

      {/* Available Recordings Section with 7-Day Badges */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-secondary/25 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-600">
              <PlayCircle size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary-dark">تسجيلات الحلقات المتاحة</h3>
              <p className="text-xs text-text-main/60">مراجعة وتعويض الحلقات (صلاحية المشاهدة مؤقتة لمدة ٧ أيام)</p>
            </div>
          </div>
          <Link
            to="/recordings"
            className="text-xs font-bold text-primary hover:text-primary-dark transition-colors"
          >
            عرض الكل ←
          </Link>
        </div>

        {isRecordingsLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : recordings && recordings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recordings.slice(0, 4).map((rec: any) => {
              const daysLeft = rec.remaining?.days ?? null;
              const hoursLeft = rec.remaining?.hours ?? null;

              return (
                <div
                  key={rec.id}
                  className="p-5 rounded-2xl bg-neutral-bg border border-secondary/30 flex flex-col justify-between gap-4 hover:border-primary/50 transition-all hover:shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-primary">
                        {rec.session?.title || 'حلقة قرآنية'}
                      </span>
                      {rec.isCustomSelected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-800 bg-purple-100/80 border border-purple-300 px-2.5 py-0.5 rounded-full">
                          <HeartHandshake size={11} className="text-purple-600" />
                          <span>مخصص لكِ من المعلمة 🌸</span>
                        </span>
                      ) : rec.isCompensation ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/70 border border-amber-300 px-2.5 py-0.5 rounded-full">
                          <Clock size={11} />
                          <span>تعويض غياب 🌸</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                          <span>مراجعة وتثبيت 🌿</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-text-main text-base">{rec.title}</h4>

                    {rec.expiresAt && (
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/50">
                        <span className="flex items-center gap-1">
                          <Hourglass size={12} />
                          مهلة الـ ٧ أيام:
                        </span>
                        <span>
                          {daysLeft !== null
                            ? `متبقي ${daysLeft} يوم ${hoursLeft !== null ? `و ${hoursLeft} س` : ''}`
                            : new Date(rec.expiresAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handlePlayRecording(rec.id)}
                    disabled={loadingPlaybackId === rec.id}
                    className="w-full inline-flex items-center justify-center gap-2 bg-primary-dark text-white py-2.5 rounded-xl font-bold text-xs hover:bg-primary-dark/90 transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
                  >
                    {loadingPlaybackId === rec.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <PlayCircle size={16} />
                    )}
                    <span>مشاهدة التسجيل</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 px-4 rounded-2xl bg-neutral-bg/60 border border-secondary/15">
            <p className="text-text-main/70 font-bold text-sm">لا توجد تسجيلات منشورة ومتاحة لحسابكِ حالياً ✨</p>
            <p className="text-text-main/50 text-xs mt-1">تتاح التسجيلات للحاضرات والغائبات فور اعتمادها ونشرها من المعلمة</p>
          </div>
        )}
      </div>

      {/* Attendance History Preview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-secondary/25 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary-dark">سجل الحضور والغياب</h3>
              <p className="text-xs text-text-main/60">متابعة التزامكِ في الحلقات السابقة</p>
            </div>
          </div>
        </div>

        {isAttendanceLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : attendanceHistory && attendanceHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-secondary/25 text-text-main/60 text-xs">
                  <th className="py-3 px-4 font-bold">الحلقة</th>
                  <th className="py-3 px-4 font-bold">التاريخ</th>
                  <th className="py-3 px-4 font-bold">المدة</th>
                  <th className="py-3 px-4 text-center font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/15">
                {attendanceHistory.slice(0, 5).map((att: any) => (
                  <tr key={att.id} className="hover:bg-neutral-bg/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-primary-dark text-sm">
                      {att.session?.title || 'حلقة تجويد وتلاوة'}
                    </td>
                    <td className="py-3.5 px-4 text-text-main/70 text-xs">
                      {att.session?.scheduledAt ? formatDate(att.session.scheduledAt) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-text-main/70 text-xs">
                      {att.session?.durationMinutes ? `${att.session.durationMinutes} دقيقة` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${att.status === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                      >
                        {att.status === 'PRESENT' ? 'حاضرة 🌸' : 'غائبة'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 px-4 rounded-2xl bg-neutral-bg/60 border border-secondary/15 text-xs text-text-main/60 font-semibold">
            لم يتم تسجيل حضوركِ في أي حلقة بعد. ستظهر بياناتكِ هنا فور بدء الحلقات.
          </div>
        )}
      </div>

      {/* Advanced Video Player Modal with Watermark & Security */}
      <VideoPlayerModal
        playbackData={playbackData}
        onClose={() => setPlaybackData(null)}
      />

    </div>
  );
}

