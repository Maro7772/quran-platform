/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useMemo } from 'react';
import { api } from '../lib/axios';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import {
  Film,
  PlayCircle,
  Plus,
  Send,
  Clock,
  AlertCircle,
  Loader2,
  X,
  Lock,
  Globe,
  Users,
  CheckCircle2,
  Trash2,
  UploadCloud,
  Sparkles,
  Search,
  Check,
  HeartHandshake,
} from 'lucide-react';
import VideoPlayerModal from '../components/video/VideoPlayerModal';

export const Route = createFileRoute('/_dashboard/recordings')({
  component: RecordingsPage,
});

export default function RecordingsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [selectedRecordingForAccess, setSelectedRecordingForAccess] = useState<any>(null);

  // Form states (Teacher create)
  const [title, setTitle] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [storageKey, setStorageKey] = useState('');
  const [accessMode, setAccessMode] = useState<'SELECTED_STUDENTS' | 'ALL_ACTIVE_STUDENTS' | 'ATTENDEES_ONLY'>('SELECTED_STUDENTS');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [publishNow, setPublishNow] = useState(true);
  const [durationDays, setDurationDays] = useState(7);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [formError, setFormError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Access Modal Edit states
  const [editAccessStudentIds, setEditAccessStudentIds] = useState<string[]>([]);
  const [editAccessMode, setEditAccessMode] = useState<string>('SELECTED_STUDENTS');
  const [editSearchQuery, setEditSearchQuery] = useState('');

  // Student Filter state (All / Custom / Compensation / Review)
  const [studentFilter, setStudentFilter] = useState<'ALL' | 'CUSTOM' | 'COMPENSATION' | 'REVIEW'>('ALL');

  // Video Player state
  const [playbackData, setPlaybackData] = useState<any>(null);
  const [loadingPlaybackId, setLoadingPlaybackId] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  // 1. جلب التسجيلات
  const { data: recordings, isLoading } = useQuery({
    queryKey: ['recordings', user?.role],
    queryFn: async () => {
      const endpoint = isAdmin ? '/admin/recordings' : '/student/recordings';
      const response = await api.get(endpoint);
      return response.data;
    },
  });

  // 2. جلب الحلقات لربط التسجيل بها (للمعلمة)
  const { data: sessions } = useQuery({
    queryKey: ['admin-sessions-select'],
    queryFn: async () => {
      if (!isAdmin) return [];
      const response = await api.get('/admin/sessions');
      return response.data;
    },
    enabled: isAdmin,
  });

  // 3. جلب قائمة الطالبات (للمعلمة لتحديد الطالبات بالاسم)
  const { data: allStudents } = useQuery({
    queryKey: ['admin-all-students-select'],
    queryFn: async () => {
      if (!isAdmin) return [];
      const response = await api.get('/admin/students');
      return response.data;
    },
    enabled: isAdmin,
  });

  // 4. جلب سجل حضور وغياب الحلقة المختارة (للمعلمة لمساعدتها في تحديد الحاضرات أو الغائبات)
  const { data: createSessionAttendance } = useQuery({
    queryKey: ['admin-session-attendance', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      const response = await api.get(`/admin/attendance/${sessionId}`);
      return response.data;
    },
    enabled: !!sessionId && isAdmin,
  });

  const { data: editSessionAttendance } = useQuery({
    queryKey: ['admin-session-attendance', selectedRecordingForAccess?.sessionId],
    queryFn: async () => {
      if (!selectedRecordingForAccess?.sessionId) return [];
      const response = await api.get(`/admin/attendance/${selectedRecordingForAccess.sessionId}`);
      return response.data;
    },
    enabled: !!selectedRecordingForAccess?.sessionId && isAdmin,
  });

  // Attendance map helper
  const createAttendanceMap = useMemo(() => {
    const map = new Map<string, string>();
    if (Array.isArray(createSessionAttendance)) {
      createSessionAttendance.forEach((item: any) => {
        if (item.userId && item.status) {
          map.set(item.userId, item.status);
        }
      });
    }
    return map;
  }, [createSessionAttendance]);

  const editAttendanceMap = useMemo(() => {
    const map = new Map<string, string>();
    if (Array.isArray(editSessionAttendance)) {
      editSessionAttendance.forEach((item: any) => {
        if (item.userId && item.status) {
          map.set(item.userId, item.status);
        }
      });
    }
    return map;
  }, [editSessionAttendance]);

  // تصفية الطالبات حسب البحث
  const filteredStudents = useMemo(() => {
    if (!allStudents) return [];
    if (!studentSearchQuery.trim()) return allStudents;
    const q = studentSearchQuery.trim().toLowerCase();
    return allStudents.filter((st: any) =>
      st.name?.toLowerCase().includes(q) ||
      st.phone?.includes(q) ||
      st.email?.toLowerCase().includes(q)
    );
  }, [allStudents, studentSearchQuery]);

  const filteredEditStudents = useMemo(() => {
    if (!allStudents) return [];
    if (!editSearchQuery.trim()) return allStudents;
    const q = editSearchQuery.trim().toLowerCase();
    return allStudents.filter((st: any) =>
      st.name?.toLowerCase().includes(q) ||
      st.phone?.includes(q) ||
      st.email?.toLowerCase().includes(q)
    );
  }, [allStudents, editSearchQuery]);

  // رفع فيديو مباشرة إلى Cloudinary من المتصفح (Direct High-Speed Upload)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setFormError('');
      setUploadProgress(5);

      // 1. جلب التوقيع الأمني من السيرفر
      const sigRes = await api.get('/admin/recordings/upload-signature');
      const { signature, timestamp, apiKey, cloudName, folder } = sigRes.data;

      // 2. الرفع المباشر إلى Cloudinary من المتصفح لتفادي قيود الحجم وسرعة قصوى
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('folder', folder);

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percent);
            }
          },
        }
      );

      setUploadProgress(100);
      setStorageKey(cloudinaryRes.data.secure_url);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setFormError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'فشل في رفع الفيديو، يرجى المحاولة مرة أخرى أو استخدام رابط مباشر'
      );
    } finally {
      setIsUploading(false);
    }
  };

  // إنشاء وتسجيل الفيديو
  const createRecordingMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/admin/recordings', {
        title: title.trim(),
        sessionId,
        storageKey: storageKey.trim(),
        accessMode,
        selectedUserIds: accessMode === 'SELECTED_STUDENTS' ? selectedStudentIds : [],
        publishNow,
        durationDays: Number(durationDays),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
      setCreateModalOpen(false);
      setTitle('');
      setSessionId('');
      setStorageKey('');
      setAccessMode('SELECTED_STUDENTS');
      setSelectedStudentIds([]);
      setStudentSearchQuery('');
      setPublishNow(true);
      setDurationDays(7);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'حدث خطأ أثناء إضافة التسجيل');
    },
  });

  // تحديث الطالبات المسموح لهن لتسجيل موجود
  const updateAccessMutation = useMutation({
    mutationFn: async () => {
      const response = await api.put(`/admin/recordings/${selectedRecordingForAccess.id}/access`, {
        selectedUserIds: editAccessStudentIds,
        accessMode: editAccessMode,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
      setAccessModalOpen(false);
      setSelectedRecordingForAccess(null);
      setEditAccessStudentIds([]);
    },
  });

  // نشر التسجيل المعلق كمسودة
  const publishDirectMutation = useMutation({
    mutationFn: async (recId: string) => {
      const response = await api.post(`/admin/recordings/${recId}/publish`, {
        durationDays: 7,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
    },
  });

  // حذف التسجيل
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/recordings/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordings'] });
    },
  });

  // تشغيل التسجيل
  const handlePlayRecording = async (recordingId: string) => {
    try {
      setLoadingPlaybackId(recordingId);
      setPlaybackError(null);
      const endpoint = isAdmin
        ? `/admin/recordings/${recordingId}/playback`
        : `/student/recordings/${recordingId}/playback`;
      const res = await api.get(endpoint);
      setPlaybackData(res.data);
    } catch (err: any) {
      setPlaybackError(err.response?.data?.message || 'غير مصرح بمشاهدة هذا التسجيل أو انتهت صلاحية الـ ٧ أيام.');
    } finally {
      setLoadingPlaybackId(null);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim() || !sessionId || !storageKey.trim()) {
      setFormError('يرجى كتابة عنوان التسجيل واختيار الحلقة وتحديد الفيديو');
      return;
    }
    if (accessMode === 'SELECTED_STUDENTS' && selectedStudentIds.length === 0) {
      setFormError('يرجى اختيار طالبة واحدة على الأقل من القائمة أدناه أو تغيير نوع الصلاحية');
      return;
    }
    createRecordingMutation.mutate();
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    if (!allStudents) return;
    setSelectedStudentIds(allStudents.map((s: any) => s.id));
  };

  const selectPresentStudents = () => {
    if (!allStudents) return;
    const presentIds = allStudents
      .filter((s: any) => createAttendanceMap.get(s.id) === 'PRESENT')
      .map((s: any) => s.id);
    setSelectedStudentIds(presentIds.length > 0 ? presentIds : allStudents.map((s: any) => s.id));
  };

  const selectAbsentStudents = () => {
    if (!allStudents) return;
    const absentIds = allStudents
      .filter((s: any) => createAttendanceMap.get(s.id) === 'ABSENT')
      .map((s: any) => s.id);
    setSelectedStudentIds(absentIds);
  };

  const deselectAllStudents = () => {
    setSelectedStudentIds([]);
  };

  // فتح نافذة تعديل الطالبات المسموح لهن
  const openAccessModal = (rec: any) => {
    setSelectedRecordingForAccess(rec);
    setEditAccessMode(rec.accessMode);
    const existingIds = rec.allowedUsers?.map((au: any) => au.userId || au.user?.id) || [];
    setEditAccessStudentIds(existingIds);
    setEditSearchQuery('');
    setAccessModalOpen(true);
  };

  const toggleEditStudentSelection = (studentId: string) => {
    setEditAccessStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const selectEditPresentStudents = () => {
    if (!allStudents) return;
    const presentIds = allStudents
      .filter((s: any) => editAttendanceMap.get(s.id) === 'PRESENT')
      .map((s: any) => s.id);
    setEditAccessStudentIds(presentIds.length > 0 ? presentIds : allStudents.map((s: any) => s.id));
  };

  const selectEditAbsentStudents = () => {
    if (!allStudents) return;
    const absentIds = allStudents
      .filter((s: any) => editAttendanceMap.get(s.id) === 'ABSENT')
      .map((s: any) => s.id);
    setEditAccessStudentIds(absentIds);
  };

  // فلترة التسجيلات للطالبة
  const filteredRecordings = recordings?.filter((rec: any) => {
    if (isAdmin) return true;
    if (studentFilter === 'CUSTOM') return rec.isCustomSelected;
    if (studentFilter === 'COMPENSATION') return rec.isCompensation;
    if (studentFilter === 'REVIEW') return !rec.isCompensation && !rec.isCustomSelected;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <Globe size={13} />
            <span>منشور ومتاح</span>
          </span>
        );
      case 'DRAFT':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Lock size={13} />
            <span>مسودة</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            <Clock size={13} />
            <span>منتهي الصلاحية</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8" dir="rtl">

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-secondary/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary-dark mb-1 flex items-center gap-2">
            <span>مكتبة التسجيلات القرآنية</span>
            <span className="text-xl">🎬</span>
          </h2>
          <p className="text-text-main/70 text-xs sm:text-sm">
            {isAdmin
              ? 'رفع تسجيلات الحلقات وتحديد الطالبات المسموح لهن بالمشاهدة بضغطة زر واحدة 🌸'
              : 'مشاهدة تسجيلات الحلقات المخصصة لحسابكِ للمراجعة وتثبيت التلاوة'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 bg-primary-dark text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-md hover:bg-primary-dark/90 hover:shadow-lg transition-all cursor-pointer shrink-0"
          >
            <Plus size={20} />
            <span>إضافة تسجيل فيديو وتحديد الطالبات</span>
          </button>
        )}
      </div>

      {/* Student Filter Tabs */}
      {!isAdmin && (
        <div className="flex items-center gap-2 border-b border-secondary/20 pb-3 overflow-x-auto">
          <button
            onClick={() => setStudentFilter('ALL')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${studentFilter === 'ALL'
              ? 'bg-primary-dark text-white shadow-xs'
              : 'bg-white text-text-main/70 border border-secondary/30 hover:bg-neutral-bg'
              }`}
          >
            جميع تسجيلاتي ({recordings?.length || 0})
          </button>
          <button
            onClick={() => setStudentFilter('CUSTOM')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${studentFilter === 'CUSTOM'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
              }`}
          >
            <HeartHandshake size={14} />
            <span>مخصص لي من المعلمة 🌸</span>
          </button>
          <button
            onClick={() => setStudentFilter('COMPENSATION')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${studentFilter === 'COMPENSATION'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
          >
            <Clock size={14} />
            <span>تعويض غياب (٧ أيام)</span>
          </button>
          <button
            onClick={() => setStudentFilter('REVIEW')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${studentFilter === 'REVIEW'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
              }`}
          >
            <Sparkles size={14} />
            <span>المراجعة والتثبيت 🌿</span>
          </button>
        </div>
      )}

      {/* Playback Error Alert */}
      {playbackError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold flex items-center gap-2">
          <AlertCircle size={20} className="shrink-0" />
          <span>{playbackError}</span>
        </div>
      )}

      {/* Recordings Grid */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={36} />
        </div>
      ) : filteredRecordings && filteredRecordings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecordings.map((rec: any) => {
            const daysLeft = rec.remaining?.days ?? null;
            const hoursLeft = rec.remaining?.hours ?? null;
            const allowedCount = rec.allowedUsers?.length || 0;

            return (
              <div
                key={rec.id}
                className="bg-white rounded-3xl p-6 shadow-xs border border-secondary/25 flex flex-col justify-between gap-5 hover:border-primary/50 transition-all hover:shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary truncate max-w-[150px]">
                      {rec.session?.title || 'حلقة قرآنية'}
                    </span>
                    {getStatusBadge(rec.status)}
                  </div>

                  <h3 className="text-lg font-bold text-primary-dark line-clamp-2">{rec.title}</h3>

                  {/* Badges for Student: Custom Selected vs Compensation vs Review */}
                  {!isAdmin && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rec.isCustomSelected ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                          <HeartHandshake size={12} className="text-purple-600" />
                          <span>مخصص لكِ من المعلمة 🌸</span>
                        </span>
                      ) : rec.isCompensation ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Clock size={12} className="text-amber-600" />
                          <span>تعويض غياب (متاح ٧ أيام)</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <span>مراجعة وتثبيت 🌿</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Target info badge for Teacher */}
                  {isAdmin && (
                    <div className="space-y-2 pt-1">
                      <div className="p-2.5 rounded-2xl bg-neutral-bg border border-secondary/25 flex items-center justify-between text-xs">
                        <span className="text-text-main/70 font-bold">صلاحية العرض:</span>
                        {rec.accessMode === 'SELECTED_STUDENTS' ? (
                          <span className="font-bold text-purple-700 flex items-center gap-1">
                            <Users size={14} />
                            <span>مخصص لـ ({allowedCount}) طالبات</span>
                          </span>
                        ) : rec.accessMode === 'ATTENDEES_ONLY' ? (
                          <span className="font-bold text-emerald-700">الحاضرات فقط</span>
                        ) : (
                          <span className="font-bold text-primary-dark">جميع الطالبات</span>
                        )}
                      </div>

                      {/* Display names of first 3 students if selected */}
                      {rec.accessMode === 'SELECTED_STUDENTS' && rec.allowedUsers && rec.allowedUsers.length > 0 && (
                        <div className="text-[11px] text-text-main/60 flex flex-wrap gap-1 items-center">
                          <span className="font-semibold text-text-main/80">الطالبات:</span>
                          {rec.allowedUsers.slice(0, 3).map((au: any) => (
                            <span key={au.id || au.userId} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 font-bold border border-purple-100">
                              {au.user?.name || 'طالبة'}
                            </span>
                          ))}
                          {rec.allowedUsers.length > 3 && (
                            <span className="text-purple-600 font-bold">+{rec.allowedUsers.length - 3} أخريات</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Expiry Bar */}
                  {rec.expiresAt && (
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200">
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-amber-600" />
                        <span>مهلة المشاهدة:</span>
                      </span>
                      <span>
                        {daysLeft !== null
                          ? `متبقي ${daysLeft} ${daysLeft === 1 ? 'يوم' : 'أيام'} ${hoursLeft !== null ? `و ${hoursLeft} س` : ''}`
                          : new Date(rec.expiresAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-3 border-t border-secondary/15">
                  {isAdmin ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {/* تعديل الطالبات */}
                        <button
                          onClick={() => openAccessModal(rec)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary-dark py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border border-primary/20"
                          title="تعديل الطالبات المسموح لهن بمشاهدة الفيديو"
                        >
                          <Users size={14} />
                          <span>تعديل الطالبات 👥</span>
                        </button>

                        {/* معاينة الفيديو */}
                        <button
                          onClick={() => handlePlayRecording(rec.id)}
                          disabled={loadingPlaybackId === rec.id}
                          className="p-2.5 rounded-xl bg-neutral-bg hover:bg-secondary/30 text-primary-dark font-bold transition-colors cursor-pointer"
                          title="معاينة وتشغيل الفيديو"
                        >
                          <PlayCircle size={18} />
                        </button>

                        {/* حذف التسجيل */}
                        <button
                          onClick={() => {
                            if (confirm('هل أنتِ متأكدة من حذف هذا التسجيل؟')) {
                              deleteMutation.mutate(rec.id);
                            }
                          }}
                          className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                          title="حذف التسجيل"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      {/* نشر مباشر إذا كان مسودة */}
                      {rec.status === 'DRAFT' && (
                        <button
                          onClick={() => publishDirectMutation.mutate(rec.id)}
                          disabled={publishDirectMutation.isPending}
                          className="w-full inline-flex items-center justify-center gap-1.5 bg-primary-dark text-white py-2 rounded-xl font-bold text-xs shadow-xs hover:bg-primary-dark/90 transition-all cursor-pointer"
                        >
                          <Send size={14} />
                          <span>نشر التسجيل الآن للطالبات</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePlayRecording(rec.id)}
                      disabled={loadingPlaybackId === rec.id}
                      className="w-full inline-flex items-center justify-center gap-2 bg-primary-dark text-white py-3 rounded-2xl font-bold text-xs hover:bg-primary-dark/90 transition-all shadow-md cursor-pointer"
                    >
                      {loadingPlaybackId === rec.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <PlayCircle size={18} />
                      )}
                      <span>مشاهدة تسجيل الحلقة ⏵</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-secondary/20 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Film size={28} />
          </div>
          <h4 className="text-base font-bold text-text-main">لا توجد تسجيلات متاحة حالياً</h4>
          <p className="text-xs text-text-main/60">
            {isAdmin ? 'أضيفي أول تسجيل وحددي الطالبات ليظهر لهن فوراً' : 'ستظهر التسجيلات فور إتاحتها من قِبل المعلمة لحسابكِ'}
          </p>
        </div>
      )}

      {/* ===================== Modal: إضافة تسجيل وتحديد الطالبات (للمعلمة) ===================== */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-main/70 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-secondary/20 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">

            {/* Modal Header */}
            <div className="p-6 border-b border-secondary/15 flex items-center justify-between bg-neutral-bg">
              <h3 className="font-bold text-lg text-primary-dark flex items-center gap-2">
                <Film size={22} className="text-primary" />
                <span>إضافة تسجيل وتحديد الطالبات المسموح لهن</span>
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-text-main/50 hover:bg-white hover:text-text-main transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
              {formError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. الحلقة والعنوان */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-primary-dark mb-1.5">اختاري الحلقة القرآنية</label>
                  <select
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-secondary/40 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
                    required
                  >
                    <option value="">-- اختاري الحلقة التابع لها الفيديو --</option>
                    {sessions?.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({new Date(s.scheduledAt).toLocaleDateString('ar-EG')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary-dark mb-1.5">عنوان التسجيل</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: مراجعة سورة مريم وأحكام النون الساكنة"
                    className="w-full px-4 py-3 rounded-2xl border border-secondary/40 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
                    required
                  />
                </div>
              </div>

              {/* 2. رفع الفيديو أو الرابط */}
              <div>
                <label className="block text-xs font-bold text-primary-dark mb-1.5">
                  ملف الفيديو (رفع من الجهاز أو رابط)
                </label>

                {/* زر رفع من الجهاز */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 text-center space-y-2 mb-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="video/*,audio/*"
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center">
                    <UploadCloud size={30} className="text-primary mb-1" />
                    <p className="text-xs font-bold text-primary-dark">
                      رفع فيديو من الهاتف أو الحاسوب
                    </p>
                    <p className="text-[11px] text-text-main/60">
                      يدعم ملفات الفيديو MP4, WebM, MOV حتى 500 ميجابايت
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors cursor-pointer shadow-xs"
                  >
                    {isUploading ? `جاري الرفع (${uploadProgress}%)...` : 'اختيار ملف الفيديو من جهازي 📁'}
                  </button>
                </div>

                {/* إدخال الرابط يدوياً */}
                <input
                  type="text"
                  value={storageKey}
                  onChange={(e) => setStorageKey(e.target.value)}
                  placeholder="أو ألصقي الرابط المباشر https://... أو YouTube أو Drive"
                  className="w-full px-4 py-2.5 rounded-xl border border-secondary/40 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary outline-none text-xs font-mono"
                  dir="ltr"
                  required
                />

                {/* نماذج سريعة للتجربة */}
                <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-text-main/50">نموذج فوري:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setStorageKey('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
                      if (!title) setTitle('حلقة التجويد وتصحيح التلاوة');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-neutral-bg text-primary-dark text-[10px] font-bold border border-secondary/30 hover:bg-secondary/20 cursor-pointer"
                  >
                    🎬 نموذج فيديو مباشر (MP4)
                  </button>
                </div>
              </div>

              {/* 3. اختيار الطالبات المسموح لهن (القسم الأهم) */}
              <div className="space-y-3 pt-2 border-t border-secondary/15">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-primary-dark">
                    من يمكنها مشاهدة هذا الفيديو؟ 🎯
                  </label>
                </div>

                {/* خيارات الصلاحية */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccessMode('SELECTED_STUDENTS')}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-1 ${accessMode === 'SELECTED_STUDENTS'
                      ? 'border-purple-600 bg-purple-50/70 text-purple-900 shadow-xs ring-1 ring-purple-600'
                      : 'border-secondary/30 bg-neutral-bg text-text-main/70 hover:bg-white'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">طالبات محددات 🌸</span>
                      {accessMode === 'SELECTED_STUDENTS' && <Check size={14} className="text-purple-700" />}
                    </div>
                    <span className="text-[10px] text-text-main/60 leading-tight">تختارهن المعلمة بالاسم</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccessMode('ALL_ACTIVE_STUDENTS')}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-1 ${accessMode === 'ALL_ACTIVE_STUDENTS'
                      ? 'border-primary bg-primary/5 text-primary-dark shadow-xs ring-1 ring-primary'
                      : 'border-secondary/30 bg-neutral-bg text-text-main/70 hover:bg-white'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">جميع الطالبات 👥</span>
                      {accessMode === 'ALL_ACTIVE_STUDENTS' && <Check size={14} className="text-primary" />}
                    </div>
                    <span className="text-[10px] text-text-main/60 leading-tight">الحاضرات والغائبات</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccessMode('ATTENDEES_ONLY')}
                    className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-1 ${accessMode === 'ATTENDEES_ONLY'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-1 ring-emerald-600'
                      : 'border-secondary/30 bg-neutral-bg text-text-main/70 hover:bg-white'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">الحاضرات فقط 🌿</span>
                      {accessMode === 'ATTENDEES_ONLY' && <Check size={14} className="text-emerald-700" />}
                    </div>
                    <span className="text-[10px] text-text-main/60 leading-tight">من سجلن حضوراً</span>
                  </button>
                </div>

                {/* قائمة الطالبات للاختيار بالاسم */}
                {accessMode === 'SELECTED_STUDENTS' && (
                  <div className="space-y-3 p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-purple-950">
                          حددي الطالبات المسموح لهن بمشاهدة هذا التسجيل 🎯
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-800/80 leading-relaxed">
                        💡 يمكنكِ اختيار أي طالبة (حاضرة للتثبيت والمراجعة أو غائبة للتعويض) — سيظهر الفيديو فقط لمن تم تحديدهن.
                      </p>
                    </div>

                    {/* أزرار التحديد السريع */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <button
                        type="button"
                        onClick={selectAllStudents}
                        className="px-2.5 py-1 rounded-lg bg-purple-700 text-white text-[11px] font-bold shadow-xs hover:bg-purple-800 transition-colors cursor-pointer"
                      >
                        تحديد الكل ({allStudents?.length || 0})
                      </button>
                      <button
                        type="button"
                        onClick={selectPresentStudents}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                        title="تحديد الطالبات اللاتي سجلن حضوراً لمراجعة الحلقة"
                      >
                        🌸 الحاضرات فقط
                      </button>
                      <button
                        type="button"
                        onClick={selectAbsentStudents}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-300 text-[11px] font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                        title="تحديد الطالبات الغائبات لتعويض الحلقة"
                      >
                        ⚠️ الغائبات فقط
                      </button>
                      <button
                        type="button"
                        onClick={deselectAllStudents}
                        className="px-2.5 py-1 rounded-lg bg-white text-text-main/70 border border-secondary/30 text-[11px] font-bold hover:bg-neutral-bg transition-colors cursor-pointer mr-auto"
                      >
                        إلغاء التحديد
                      </button>
                    </div>

                    {/* مربع البحث السريع */}
                    <div className="relative">
                      <Search size={16} className="absolute right-3 top-2.5 text-purple-400" />
                      <input
                        type="text"
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        placeholder="ابحثي بالاسم أو رقم الهاتف..."
                        className="w-full pl-3 pr-9 py-2 rounded-xl bg-white border border-purple-200 text-xs focus:ring-1 focus:ring-purple-600 outline-none"
                      />
                    </div>

                    {/* شارة عدد الطالبات المختارة */}
                    <div className="text-[11px] font-bold text-purple-900 bg-purple-100/80 px-3 py-1.5 rounded-xl border border-purple-200 flex items-center justify-between">
                      <span>تم اختيار ({selectedStudentIds.length} من {allStudents?.length || 0}) طالبة</span>
                      <span className="text-[10px] text-purple-700">اضغطي على أي طالبة لتحديدها/إلغائها</span>
                    </div>

                    {/* قائمة الاختيار مع Scrollbar */}
                    <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                      {filteredStudents?.map((st: any) => {
                        const isChecked = selectedStudentIds.includes(st.id);
                        const status = createAttendanceMap.get(st.id);

                        return (
                          <label
                            key={st.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${isChecked
                              ? 'bg-purple-100/90 border-purple-400 shadow-xs'
                              : 'bg-white border-secondary/25 hover:bg-purple-50/50'
                              }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isChecked ? 'bg-purple-700 text-white' : 'bg-secondary/30 text-primary-dark'
                                }`}>
                                {st.name?.charAt(0) || 'ط'}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-text-main text-xs">{st.name}</span>
                                  {status === 'PRESENT' && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      حاضرة 🌸
                                    </span>
                                  )}
                                  {status === 'ABSENT' && (
                                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                      غائبة ⚠️
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-text-main/50 dir-ltr text-right">{st.phone}</p>
                              </div>
                            </div>

                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleStudentSelection(st.id)}
                              className="w-4 h-4 rounded text-purple-600 accent-purple-600 cursor-pointer"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 4. خيارات النشر والمدة */}
              <div className="space-y-3 pt-2 border-t border-secondary/15">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-primary-dark">
                    مدة إتاحة المشاهدة
                  </label>
                  <span className="text-[11px] text-amber-700 font-bold">
                    ينتهي التسجيل بعد {durationDays} أيام من النشر
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[3, 7, 14, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDurationDays(days)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${durationDays === days
                        ? 'bg-primary-dark text-white border-primary-dark shadow-xs'
                        : 'bg-neutral-bg text-text-main border-secondary/30 hover:bg-secondary/20'
                        }`}
                    >
                      {days} أيام {days === 7 ? '🌸' : ''}
                    </button>
                  ))}
                </div>

                {/* خيار النشر الفوري */}
                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publishNow}
                    onChange={(e) => setPublishNow(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-emerald-900 block">
                      نشر الفيديو فوراً للطالبات المحددات 🚀
                    </span>
                    <span className="text-[10px] text-emerald-700">
                      سيظهر الفيديو في لوحة الطالبات المحددة فور الضغط على حفظ
                    </span>
                  </div>
                </label>
              </div>

              {/* أزرار الإجراء */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-secondary/15">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-secondary/40 text-text-main/70 font-bold text-xs hover:bg-neutral-bg cursor-pointer"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={createRecordingMutation.isPending || isUploading}
                  className="inline-flex items-center gap-2 bg-primary-dark text-white px-7 py-3 rounded-2xl font-bold text-xs shadow-md hover:bg-primary-dark/90 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {createRecordingMutation.isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  <span>
                    {publishNow ? 'نشر وإتاحة الفيديو للطالبات المحددات ←' : 'حفظ كمسودة'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== Modal: تعديل الطالبات المسموح لهن (لأي تسجيل موجود) ===================== */}
      {accessModalOpen && selectedRecordingForAccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-main/70 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-secondary/20 p-6 space-y-4 max-h-[90vh] flex flex-col">

            <div className="flex items-center justify-between border-b border-secondary/15 pb-3">
              <h3 className="font-bold text-base sm:text-lg text-primary-dark flex items-center gap-2">
                <Users size={20} className="text-purple-600" />
                <span>تعديل الطالبات المخصص لهن هذا التسجيل</span>
              </h3>
              <button
                onClick={() => setAccessModalOpen(false)}
                className="p-1 rounded-lg text-text-main/50 hover:bg-neutral-bg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-purple-50 text-purple-900 text-xs font-bold border border-purple-200">
              التسجيل: {selectedRecordingForAccess.title}
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {/* اختيار نوع الصلاحية */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setEditAccessMode('SELECTED_STUDENTS')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${editAccessMode === 'SELECTED_STUDENTS'
                    ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                    : 'bg-neutral-bg text-text-main border-secondary/30'
                    }`}
                >
                  طالبات محددات 🌸
                </button>
                <button
                  type="button"
                  onClick={() => setEditAccessMode('ALL_ACTIVE_STUDENTS')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${editAccessMode === 'ALL_ACTIVE_STUDENTS'
                    ? 'bg-primary-dark text-white border-primary-dark shadow-xs'
                    : 'bg-neutral-bg text-text-main border-secondary/30'
                    }`}
                >
                  جميع الطالبات
                </button>
                <button
                  type="button"
                  onClick={() => setEditAccessMode('ATTENDEES_ONLY')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${editAccessMode === 'ATTENDEES_ONLY'
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-neutral-bg text-text-main border-secondary/30'
                    }`}
                >
                  الحاضرات فقط
                </button>
              </div>

              {/* قائمة الطالبات إذا كان طالبات محددات */}
              {editAccessMode === 'SELECTED_STUDENTS' && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-purple-950 block">
                      حددي الطالبات المسموح لهن بمشاهدة هذا التسجيل 🎯
                    </span>
                    <p className="text-[11px] text-purple-800/80">
                      💡 يمكنكِ اختيار أي طالبة (سواء كانت حاضرة أو غائبة) — سيظهر التسجيل للطالبات المختارة فقط.
                    </p>
                  </div>

                  {/* أزرار التحديد السريع */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setEditAccessStudentIds(allStudents?.map((s: any) => s.id) || [])}
                      className="px-2.5 py-1 rounded-lg bg-purple-700 text-white text-[11px] font-bold shadow-xs hover:bg-purple-800 transition-colors cursor-pointer"
                    >
                      تحديد الكل ({allStudents?.length || 0})
                    </button>
                    <button
                      type="button"
                      onClick={selectEditPresentStudents}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                      title="تحديد الطالبات الحاضرات لمراجعة وتثبيت الحلقة"
                    >
                      🌸 الحاضرات فقط
                    </button>
                    <button
                      type="button"
                      onClick={selectEditAbsentStudents}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-300 text-[11px] font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                      title="تحديد الطالبات الغائبات لتعويض الحلقة"
                    >
                      ⚠️ الغائبات فقط
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditAccessStudentIds([])}
                      className="px-2.5 py-1 rounded-lg bg-white text-text-main/70 border border-secondary/30 text-[11px] font-bold hover:bg-neutral-bg transition-colors cursor-pointer mr-auto"
                    >
                      إلغاء الكل
                    </button>
                  </div>

                  {/* بحث */}
                  <div className="relative">
                    <Search size={15} className="absolute right-3 top-2.5 text-text-main/40" />
                    <input
                      type="text"
                      value={editSearchQuery}
                      onChange={(e) => setEditSearchQuery(e.target.value)}
                      placeholder="ابحثي بالاسم..."
                      className="w-full pl-3 pr-8 py-2 rounded-xl bg-neutral-bg border border-secondary/30 text-xs outline-none"
                    />
                  </div>

                  {/* شارة العدد */}
                  <div className="text-[11px] font-bold text-purple-900 bg-purple-100/80 px-3 py-1.5 rounded-xl border border-purple-200 flex items-center justify-between">
                    <span>تم اختيار ({editAccessStudentIds.length} من {allStudents?.length || 0}) طالبة</span>
                    <span className="text-[10px] text-purple-700">اضغطي على أي طالبة لتحديدها/إلغائها</span>
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                    {filteredEditStudents?.map((st: any) => {
                      const isChecked = editAccessStudentIds.includes(st.id);
                      const status = editAttendanceMap.get(st.id);

                      return (
                        <label
                          key={st.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${isChecked
                            ? 'bg-purple-100/90 border-purple-400 shadow-xs'
                            : 'bg-white border-secondary/20 hover:bg-neutral-bg'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-text-main">{st.name}</span>
                            {status === 'PRESENT' && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                حاضرة 🌸
                              </span>
                            )}
                            {status === 'ABSENT' && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                غائبة ⚠️
                              </span>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleEditStudentSelection(st.id)}
                            className="w-4 h-4 rounded text-purple-600 accent-purple-600 cursor-pointer"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-secondary/15">
              <button
                type="button"
                onClick={() => setAccessModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-secondary/40 text-text-main/70 font-bold text-xs hover:bg-neutral-bg cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => updateAccessMutation.mutate()}
                disabled={updateAccessMutation.isPending}
                className="inline-flex items-center gap-2 bg-primary-dark text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:bg-primary-dark/90 transition-all disabled:opacity-50 cursor-pointer"
              >
                {updateAccessMutation.isPending ? <Loader2 className="animate-spin" size={15} /> : <CheckCircle2 size={16} />}
                <span>حفظ التعديلات وتحديث الطالبات</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Advanced Video Player Modal with Watermark & Security */}
      <VideoPlayerModal
        playbackData={playbackData}
        onClose={() => setPlaybackData(null)}
      />

    </div>
  );
}

