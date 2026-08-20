/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/useAuthStore';
import {
  Video,
  Plus,
  Calendar,
  Clock,
  ExternalLink,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
} from 'lucide-react';

export const Route = createFileRoute('/_dashboard/sessions')({
  component: SessionsPage,
});

function SessionsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newScheduledAt, setNewScheduledAt] = useState('');
  const [newDuration, setNewDuration] = useState(60);
  const [newMeetingUrl, setNewMeetingUrl] = useState('');
  const [formError, setFormError] = useState('');

  // جلب الحلقات بناءً على الدور
  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['sessions', user?.role],
    queryFn: async () => {
      const endpoint = isAdmin ? '/admin/sessions' : '/student/sessions';
      const response = await api.get(endpoint);
      return response.data;
    },
  });

  // إضافة حلقة جديدة (للمعلمة)
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: newTitle,
        description: newDescription || undefined,
        scheduledAt: new Date(newScheduledAt).toISOString(),
        durationMinutes: Number(newDuration),
        meetingUrl: newMeetingUrl || undefined,
      };
      const response = await api.post('/admin/sessions', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewScheduledAt('');
      setNewDuration(60);
      setNewMeetingUrl('');
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'حدث خطأ أثناء إنشاء الحلقة');
    },
  });

  // حذف حلقة (للمعلمة)
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.delete(`/admin/sessions/${sessionId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newTitle || !newScheduledAt) {
      setFormError('يرجى تحديد عنوان الحلقة وموعدها');
      return;
    }
    createSessionMutation.mutate();
  };

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
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-secondary/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-dark mb-1">
            الحلقات القرآنية المباشرة 🎙️
          </h2>
          <p className="text-text-main/60 text-xs sm:text-sm">
            {isAdmin ? 'إدارة وجدولة جلسات التلاوة والتجويد المباشرة' : 'جدول حلقاتكِ المباشرة وروابط الانضمام'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 bg-primary-dark text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md hover:bg-primary-dark/90 hover:shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Plus size={18} />
            <span>جدولة حلقة جديدة</span>
          </button>
        )}
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={36} />
        </div>
      ) : error ? (
        <div className="p-8 rounded-3xl bg-red-50 text-red-600 font-bold text-center border border-red-200">
          حدث خطأ أثناء جلب الحلقات. يرجى المحاولة لاحقاً.
        </div>
      ) : sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sessions.map((session: any) => {
            const isPast = new Date(session.scheduledAt) < new Date();

            return (
              <div
                key={session.id}
                className="bg-white rounded-3xl p-6 shadow-xs border border-secondary/25 flex flex-col justify-between gap-5 hover:border-primary/50 transition-all hover:shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isPast
                          ? 'bg-neutral-bg text-text-main/60'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {!isPast && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                      {isPast ? 'حلقة منتهية' : 'حلقة قادمة'}
                    </span>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          if (confirm('هل أنتِ متأكدة من حذف هذه الحلقة؟')) {
                            deleteSessionMutation.mutate(session.id);
                          }
                        }}
                        className="p-2 rounded-xl text-text-main/40 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="حذف الحلقة"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-primary-dark">{session.title}</h3>
                  {session.description && (
                    <p className="text-xs sm:text-sm text-text-main/70 leading-relaxed">
                      {session.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-text-main/70 pt-2 border-t border-secondary/15">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={15} className="text-primary" />
                      {formatDate(session.scheduledAt)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={15} className="text-primary" />
                      {session.durationMinutes} دقيقة
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  {session.meetingUrl ? (
                    <a
                      href={session.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-primary-dark text-white py-3 rounded-xl font-bold text-xs shadow-xs hover:bg-primary-dark/90 transition-all"
                    >
                      <ExternalLink size={16} />
                      <span>الانضمام إلى البث المباشر</span>
                    </a>
                  ) : (
                    <div className="w-full py-2.5 rounded-xl bg-neutral-bg text-text-main/50 text-center font-bold text-xs border border-secondary/20">
                      رابط البث غير متاح حالياً
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-secondary/20 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Video size={28} />
          </div>
          <h4 className="text-base font-bold text-text-main">لا توجد حلقات مجدولة حالياً</h4>
          <p className="text-xs text-text-main/60">
            {isAdmin ? 'اضغطي على زر "جدولة حلقة جديدة" لإنشاء أول حلقة' : 'سيتم إضافة الحلقات وتنبيهكِ بمواعيدها قريباً'}
          </p>
        </div>
      )}

      {/* Modal: Create Session (Teacher) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-main/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-secondary/20 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-secondary/15 flex items-center justify-between bg-neutral-bg">
              <h3 className="font-bold text-lg text-primary-dark flex items-center gap-2">
                <Video size={20} className="text-primary" />
                <span>جدولة حلقة قرآنية جديدة</span>
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-text-main/50 hover:bg-white hover:text-text-main transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-primary-dark mb-1.5">عنوان الحلقة</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: حلقة تصحيح التلاوة وتجويد سورة البقرة"
                  className="w-full px-4 py-3 rounded-xl border border-secondary/40 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary-dark mb-1.5">الوصف (اختياري)</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="توجيهات أو صفحات الحفظ المحددة..."
                  className="w-full px-4 py-3 rounded-xl border border-secondary/40 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary-dark mb-1.5">موعد الحلقة</label>
                  <input
                    type="datetime-local"
                    value={newScheduledAt}
                    onChange={(e) => setNewScheduledAt(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-secondary/40 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary-dark mb-1.5">المدة بالدقائق</label>
                  <input
                    type="number"
                    min={15}
                    max={240}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-secondary/40 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary-dark mb-1.5">رابط البث (Zoom / Google Meet / إلخ)</label>
                <input
                  type="url"
                  value={newMeetingUrl}
                  onChange={(e) => setNewMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-4 py-3 rounded-xl border border-secondary/40 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
                  dir="ltr"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-secondary/40 text-text-main/70 font-bold text-xs hover:bg-neutral-bg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={createSessionMutation.isPending}
                  className="inline-flex items-center gap-2 bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-primary-dark/90 transition-all disabled:opacity-50"
                >
                  {createSessionMutation.isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  <span>حفظ وجدولة الحلقة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
