/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Clock,
  ShieldAlert,
  Sparkles,
  Lock,
  HeartHandshake
} from 'lucide-react';

interface VideoPlayerModalProps {
  playbackData: {
    playbackUrl: string;
    rawUrl?: string;
    videoType?: string;
    title: string;
    sessionTitle?: string;
    expiresAt?: string;
    isCompensation?: boolean;
    isCustomSelected?: boolean;
    remaining?: {
      days: number | null;
      hours: number | null;
      totalMs: number | null;
    };
    watermark?: {
      studentName: string;
      studentEmail: string;
      studentId: string;
      sessionTimestamp: string;
    };
  } | null;
  onClose: () => void;
}

export default function VideoPlayerModal({
  playbackData,
  onClose,
}: VideoPlayerModalProps) {
  if (!playbackData) return null;

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isProtectedShield, setIsProtectedShield] = useState(false);
  const controlsTimeoutRef = useRef<any>(null);

  // العلامة المائية المتحركة للأمان ومنع التسريب
  const [watermarkPos, setWatermarkPos] = useState({ top: '25%', right: '30%' });

  useEffect(() => {
    const interval = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 65 + 15) + '%';
      const randomRight = Math.floor(Math.random() * 65 + 10) + '%';
      setWatermarkPos({ top: randomTop, right: randomRight });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // منع لقطات الشاشة لحماية خصوصية المقرأة
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' ||
        (e as any).keyCode === 44 ||
        (e.ctrlKey && (e.key === 's' || e.key === 'u' || e.key === 'p')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'J')) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        setIsProtectedShield(true);
        setTimeout(() => setIsProtectedShield(false), 2200);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // تنسيق الوقت
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2, 0.75];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    handleRateChange(nextRate);
  };

  const skipSeconds = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      Math.max(0, videoRef.current.currentTime + seconds),
      duration
    );
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => { });
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const isDirectVideo =
    playbackData.videoType === 'direct' ||
    playbackData.playbackUrl.endsWith('.mp4') ||
    playbackData.playbackUrl.endsWith('.webm') ||
    playbackData.playbackUrl.includes('/uploads/videos/');

  const daysLeft = playbackData.remaining?.days ?? null;
  const hoursLeft = playbackData.remaining?.hours ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-text-main/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
      dir="rtl"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="bg-neutral-900 text-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-white/15 flex flex-col max-h-[92vh]">

        {/* رأس المشغل العربي */}
        <div className="p-4 sm:p-5 bg-neutral-950 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">

          {/* الجانب الأيمن: عنوان التسجيل والحلقة */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/20 text-secondary border border-primary/30 shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white line-clamp-1">
                {playbackData.title}
              </h3>
              {playbackData.sessionTitle && (
                <p className="text-xs text-white/60 mt-0.5">{playbackData.sessionTitle}</p>
              )}
            </div>
          </div>

          {/* الجانب الأيسر: شارات الحالة والوقت وزر الإغلاق */}
          <div className="flex items-center gap-2.5">

            {/* وسم الصلاحية والنوع */}
            {playbackData.isCustomSelected ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <HeartHandshake size={13} />
                <span>مخصص لكِ من المعلمة 🌸</span>
              </span>
            ) : playbackData.isCompensation ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Clock size={13} />
                <span>تعويض غياب (متاح ٧ أيام)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span>مراجعة وتثبيت 🌿</span>
              </span>
            )}

            {/* عداد الأيام المتبقية */}
            {daysLeft !== null && (
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${daysLeft <= 2
                    ? 'bg-rose-500/25 text-rose-300 border-rose-500/50 animate-pulse'
                    : 'bg-white/10 text-white/90 border-white/20'
                  }`}
              >
                <Clock size={13} />
                <span>
                  متبقي {daysLeft} {daysLeft === 1 ? 'يوم' : daysLeft === 2 ? 'يومان' : 'أيام'} {hoursLeft !== null && `و ${hoursLeft} ساعة`}
                </span>
              </span>
            )}

            {/* زر الإغلاق */}
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/10"
              title="إغلاق المشغل"
            >
              <X size={16} />
              <span className="hidden sm:inline">إغلاق</span>
            </button>
          </div>
        </div>

        {/* مساحة عرض الفيديو */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="relative bg-black aspect-video flex items-center justify-center overflow-hidden group select-none"
        >
          {/* حماية الخصوصية ومنع التقاط الشاشة */}
          {isProtectedShield && (
            <div className="absolute inset-0 z-40 bg-neutral-950 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <ShieldAlert size={48} className="text-amber-400 animate-bounce" />
              <h4 className="text-lg font-bold text-white">حماية خصوصية المقرأة</h4>
              <p className="text-xs text-white/70 max-w-sm">
                عزيزتي الطالبة، تسجيلات الحلقات مخصصة لمشاهدتكِ الفردية فقط وتمنع محاولات التصوير أو التسجيل لضمان الأمان والخصوصية.
              </p>
            </div>
          )}

          {/* العلامة المائية المتحركة لحساب الطالبة */}
          {playbackData.watermark && (
            <div
              style={{
                position: 'absolute',
                top: watermarkPos.top,
                right: watermarkPos.right,
                transition: 'all 3.5s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
              className="z-30 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-xs border border-white/15 text-[11px] font-sans text-white/40 flex flex-col items-center leading-tight shadow-md"
            >
              <span className="font-bold">{playbackData.watermark.studentName}</span>
              <span className="text-[9px] opacity-75 dir-ltr">{playbackData.watermark.studentEmail}</span>
            </div>
          )}

          {/* مشغل الفيديو */}
          {isDirectVideo ? (
            <video
              ref={videoRef}
              src={playbackData.playbackUrl}
              autoPlay
              controlsList="nodownload nofullscreen noplaybackrate"
              disablePictureInPicture
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                }
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(videoRef.current.duration);
                }
              }}
              onEnded={() => setIsPlaying(false)}
              onClick={handlePlayPause}
              className="w-full h-full object-contain cursor-pointer"
            />
          ) : (
            <iframe
              src={playbackData.playbackUrl}
              title={playbackData.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}

          {/* شريط التحكم المخصص */}
          {isDirectVideo && (
            <div
              className={`absolute inset-x-0 bottom-0 z-30 p-4 sm:p-5 bg-linear-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            >
              {/* شريط التمرير (SeekBar) - يبدأ من اليسار لليمين */}
              <div className="relative mb-3 flex items-center group/seek" dir="ltr">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  style={{
                    background: `linear-gradient(to right, #d4af37 0%, #d4af37 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.25) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.25) 100%)`
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-secondary focus:outline-none transition-all hover:h-2.5"
                />
              </div>

              {/* شريط الأزرار (LTR: اليسار للتحكم في التشغيل والصوت، واليمين للسرعات وملء الشاشة) */}
              <div className="flex items-center justify-between gap-3 text-xs" dir="ltr">

                {/* الجانب الأيسر: التشغيل، التقديم، التأخير، الصوت المنظم، والعداد الزمني */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">

                  {/* زر تشغيل / إيقاف */}
                  <button
                    onClick={handlePlayPause}
                    className="px-3.5 py-2.5 rounded-xl bg-primary-dark hover:bg-primary-dark/90 text-white transition-all cursor-pointer shadow-md flex items-center gap-1.5 font-bold shrink-0"
                    title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    <span className="text-[11px] font-bold">{isPlaying ? 'إيقاف' : 'تشغيل'}</span>
                  </button>

                  {/* تأخير 10 ثوانٍ */}
                  <button
                    onClick={() => skipSeconds(-10)}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    title="تأخير ١٠ ثوانٍ"
                  >
                    <RotateCcw size={15} />
                    <span className="text-[10px] font-bold">١٠ث</span>
                  </button>

                  {/* تقديم 10 ثوانٍ */}
                  <button
                    onClick={() => skipSeconds(10)}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    title="تقديم ١٠ ثوانٍ"
                  >
                    <RotateCw size={15} />
                    <span className="text-[10px] font-bold">١٠ث</span>
                  </button>

                  {/* قسم الصوت المنسق بدقة بدون أي تداخل */}
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/10 shrink-0">
                    <button
                      onClick={toggleMute}
                      className="text-white/80 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                      title={isMuted || volume === 0 ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
                    >
                      {isMuted || volume === 0 ? <VolumeX size={17} className="text-rose-400" /> : <Volume2 size={17} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      dir="ltr"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      style={{
                        background: `linear-gradient(to right, #d4af37 0%, #d4af37 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
                      }}
                      className="w-16 sm:w-20 h-1.5 rounded-lg appearance-none cursor-pointer accent-secondary focus:outline-none"
                      title={`مستوى الصوت: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                    />
                  </div>

                  {/* التوقيت الزمني */}
                  <div className="font-mono text-xs text-white/90 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 font-bold shrink-0">
                    <span>{formatTime(currentTime)}</span>
                    <span className="mx-1 text-white/40">/</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* الجانب الأيمن: أزرار السرعة وملء الشاشة */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  
                  {/* زر السرعة للشاشات الصغيرة (الموبايل) بنقرة واحدة للتنقل بين السرعات */}
                  <button
                    type="button"
                    onClick={cyclePlaybackRate}
                    className="sm:hidden px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-secondary font-bold text-xs border border-white/15 cursor-pointer shadow-xs"
                    title="الضغط لتغيير سرعة الفيديو"
                  >
                    {playbackRate === 1 ? '١× سرعة' : `${playbackRate}×`}
                  </button>

                  {/* أزرار سرعة التشغيل للشاشات المتوسطة والكبيرة */}
                  <div className="hidden sm:flex items-center bg-white/10 rounded-xl p-1 border border-white/15">
                    {[
                      { rate: 0.75, label: '٠.٧٥×' },
                      { rate: 1, label: '١× عادي' },
                      { rate: 1.25, label: '١.٢٥×' },
                      { rate: 1.5, label: '١.٥×' },
                      { rate: 2, label: '٢×' },
                    ].map(({ rate, label }) => (
                      <button
                        key={rate}
                        onClick={() => handleRateChange(rate)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                          playbackRate === rate
                            ? 'bg-secondary text-primary-dark shadow-sm'
                            : 'text-white/70 hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* زر ملء الشاشة */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1.5 font-bold text-xs border border-white/10"
                    title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
                  >
                    {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                    <span className="hidden md:inline">{isFullscreen ? 'تصغير' : 'ملء الشاشة'}</span>
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* الشريط السفلي الأمني */}
        <div className="p-4 bg-neutral-950 border-t border-white/10 flex items-start gap-2.5 text-xs text-white/70">
          <Lock size={16} className="text-secondary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-white/90">
              تسجيل محمي ومخصص لحساب الطالبة{' '}
              <span className="text-secondary font-bold">
                {playbackData.watermark?.studentName || 'المسجلة'}
              </span>
            </p>
            <p className="text-[11px] text-white/55 leading-relaxed">
              {playbackData.isCustomSelected
                ? 'تمت إتاحة هذا التسجيل خصيصاً لكِ من قِبل المعلمة لمتابعة حفظكِ وتجويدكِ 🌸.'
                : playbackData.isCompensation
                  ? 'تمت إتاحة هذا التسجيل خصيصاً لتعويض غيابكِ عن الحلقة ومراجعة الورد قبل انتهاء مهلة الـ ٧ أيام.'
                  : 'هذا التسجيل متاح للمراجعة والتثبيت ضمن فترة الصلاحية المحددة من المعلمة.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

