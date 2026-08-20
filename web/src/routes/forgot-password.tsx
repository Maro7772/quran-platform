import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  Phone,
  ArrowRight,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  MessageCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../lib/axios';

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPassword,
});

// eslint-disable-next-line react-refresh/only-export-components
function ForgotPassword() {
  const navigate = useNavigate();

  // الخطوة الحالية: 1 (طلب الهاتف) | 2 (كود الـ OTP والواتساب) | 3 (كلمة المرور الجديدة) | 4 (النجاح)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // البيانات
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [senderPhone, setSenderPhone] = useState('01276528220');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [whatsappAdminUrl, setWhatsappAdminUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // حالات الواجهة
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // التحقق من وجود توكن ورقم في الـ URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    const phoneParam = params.get('phone') || params.get('email');

    if (tokenParam && phoneParam) {
      setPhone(phoneParam);
      setResetToken(tokenParam);
      setStep(3);
    }
  }, []);

  // مؤقت إعادة الإرسال
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // 1. طلب رمز استعادة الواتساب
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!phone.trim()) {
      setErrorMessage('يرجى إدخال رقم الهاتف المسجل');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', {
        phone: phone.trim()
      });
      setSuccessMessage(res.data?.message || 'تم تجهيز رمز التحقق بنجاح');
      setSenderPhone(res.data?.senderPhone || '01276528220');
      setWhatsappUrl(res.data?.whatsappUrl || '');
      setWhatsappAdminUrl(res.data?.whatsappAdminUrl || '');
      setStep(2);
      setResendCooldown(60); // 60 ثانية قبل إعادة الإرسال

      // فتح محادثة الواتساب تلقائياً في نافذة جديدة إذا توفر الرابط
      if (res.data?.whatsappUrl) {
        window.open(res.data.whatsappUrl, '_blank');
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'حدث خطأ، تأكدي من صحة رقم الهاتف المسجل'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 2. التحقق من كود الـ OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setErrorMessage('يرجى إدخال رمز التحقق المكون من 6 أرقام');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/verify-reset-code', {
        phone: phone.trim(),
        code: otpCode.trim()
      });
      setResetToken(res.data?.token || '');
      setSuccessMessage('تم التحقق من الرمز بنجاح! يمكنكِ الآن كتابة كلمة المرور الجديدة 🌸');
      setStep(3);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'رمز التحقق غير صحيح أو انتهت صلاحيته'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 3. تعيين كلمة المرور الجديدة
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف أو أرقام');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        phone: phone.trim(),
        code: otpCode.trim() || undefined,
        token: resetToken || undefined,
        newPassword
      });

      setSuccessMessage(res.data?.message || 'تم تغيير كلمة المرور بنجاح!');
      setStep(4);

      // توجيه تلقائي لصفحة تسجيل الدخول بعد 3 ثوانٍ
      setTimeout(() => {
        navigate({ to: '/login' });
      }, 3000);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور، يرجى المحاولة مرة أخرى'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // إعادة إرسال الكود
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { phone: phone.trim() });
      setSuccessMessage('تم تجهيز رمز تحقق جديد عبر واتساب بنجاح 💬');
      setSenderPhone(res.data?.senderPhone || '01276528220');
      setWhatsappUrl(res.data?.whatsappUrl || '');
      setWhatsappAdminUrl(res.data?.whatsappAdminUrl || '');
      setResendCooldown(60);

      if (res.data?.whatsappUrl) {
        window.open(res.data.whatsappUrl, '_blank');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'فشل إعادة إرسال الرمز، يرجى المحاولة لاحقاً');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* القسم الأيمن: الفورم والخطوات */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 relative bg-white">
        
        <Link
          to="/login"
          className="absolute top-6 right-6 sm:top-8 sm:right-8 inline-flex items-center gap-2 text-text-main/60 hover:text-primary transition-colors text-sm font-bold"
        >
          <ArrowRight size={18} />
          العودة لتسجيل الدخول
        </Link>

        <div className="w-full max-w-md pt-8 sm:pt-0">

          {/* مؤشر الخطوات */}
          {step < 4 && (
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                step === 1 ? 'bg-primary text-white shadow-xs' : 'bg-primary/10 text-primary-dark'
              }`}>
                <span>1</span>
                <span>رقم الهاتف</span>
              </div>
              <div className="w-6 h-0.5 bg-secondary/30"></div>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                step === 2 ? 'bg-primary text-white shadow-xs' : step > 2 ? 'bg-primary/10 text-primary-dark' : 'bg-neutral-bg text-text-main/40'
              }`}>
                <span>2</span>
                <span>رمز الواتساب</span>
              </div>
              <div className="w-6 h-0.5 bg-secondary/30"></div>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                step === 3 ? 'bg-primary text-white shadow-xs' : 'bg-neutral-bg text-text-main/40'
              }`}>
                <span>3</span>
                <span>كلمة المرور</span>
              </div>
            </div>
          )}

          {/* التنبيهات والرسائل */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold flex items-center gap-2">
              <span className="shrink-0">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && step !== 4 && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ======================= الخطوة 1: طلب الاستعادة برقم الهاتف ======================= */}
          {step === 1 && (
            <div>
              <div className="mb-8 text-center lg:text-right">
                <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-3">
                  <KeyRound size={28} />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-primary-dark mb-2">نسيتِ كلمة المرور؟</h1>
                <p className="text-text-main/70 text-sm sm:text-base leading-relaxed">
                  أدخلي رقم هاتفكِ المسجل بالواتساب وسنرسل لكِ رمز التحقق السريع ورابطاً لإنشاء كلمة مرور جديدة فوراً 🌸.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleRequestReset}>
                <div>
                  <label className="block text-sm font-bold text-primary-dark mb-2" htmlFor="phone">
                    رقم الهاتف (واتساب)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-primary/50">
                      <Phone size={20} />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-secondary/50 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-text-main text-base"
                      placeholder="رقم الهاتف المسجل بالواتساب"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-dark text-white py-4 rounded-2xl font-bold text-base shadow-lg hover:bg-primary-dark/90 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <MessageCircle size={20} />}
                  <span>طلب رمز التحقق عبر واتساب ←</span>
                </button>
              </form>
            </div>
          )}

          {/* ======================= الخطوة 2: إدخال كود التحقق OTP والواتساب ======================= */}
          {step === 2 && (
            <div>
              <div className="mb-6 text-center lg:text-right">
                <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 mb-3">
                  <MessageCircle size={28} />
                </div>
                <h1 className="text-3xl font-bold text-primary-dark mb-2">رمز التحقق عبر واتساب</h1>
                <p className="text-text-main/70 text-sm leading-relaxed">
                  تم إرسال رمز التحقق لرقمكِ: <strong className="text-primary-dark font-bold dir-ltr">{phone}</strong>
                </p>
              </div>

              {/* بطاقة رقم الإرسال المعتمد 01276528220 */}
              <div className="mb-4 p-3 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between text-xs">
                <span className="text-text-main/80 font-bold">رقم الإرسال المعتمد للمنصة:</span>
                <span className="font-bold text-primary-dark dir-ltr font-mono text-sm">{senderPhone}</span>
              </div>

              {/* أزرار الواتساب */}
              {whatsappUrl && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2.5">
                  <p className="text-xs text-emerald-800 font-bold">
                    اضغطي على الزر أدناه لفتح رسالة الواتساب واستلام الرمز فوراً:
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
                  >
                    <MessageCircle size={18} />
                    <span>فتح محادثة الواتساب الآن 💬</span>
                  </a>

                  {whatsappAdminUrl && (
                    <a
                      href={whatsappAdminUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 w-full text-xs text-emerald-800 hover:text-emerald-950 font-bold transition-colors pt-1"
                    >
                      <span>تواصل مع رقم المنصة المعتمد ({senderPhone}) للمساعدة ←</span>
                    </a>
                  )}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleVerifyOtp}>
                <div>
                  <label className="block text-sm font-bold text-primary-dark mb-2" htmlFor="otp">
                    أدخلي رمز التحقق السداسي (OTP)
                  </label>
                  <input
                    id="otp"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-4 px-4 text-center tracking-[12px] font-mono text-2xl font-bold rounded-2xl border-2 border-primary/40 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-primary-dark"
                    placeholder="••••••"
                    dir="ltr"
                    autoFocus
                    required
                  />
                  <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-700 font-semibold mt-2">
                    <ShieldCheck size={14} />
                    <span>صلاحية هذا الرمز هي ٣٠ دقيقة من وقت الطلب</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full bg-primary-dark text-white py-4 rounded-2xl font-bold text-base shadow-lg hover:bg-primary-dark/90 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                  <span>تأكيد الرمز والمتابعة ←</span>
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setErrorMessage(''); }}
                    className="text-text-main/60 hover:text-primary font-bold transition-colors cursor-pointer"
                  >
                    تغيير رقم الهاتف
                  </button>

                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || isLoading}
                    className="text-primary hover:text-primary-dark font-bold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    <span>
                      {resendCooldown > 0 ? `إعادة الإرسال بعد ${resendCooldown} ثانية` : 'إعادة إرسال الرمز'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ======================= الخطوة 3: تعيين كلمة المرور الجديدة ======================= */}
          {step === 3 && (
            <div>
              <div className="mb-8 text-center lg:text-right">
                <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 mb-3">
                  <Lock size={28} />
                </div>
                <h1 className="text-3xl font-bold text-primary-dark mb-2">كلمة المرور الجديدة</h1>
                <p className="text-text-main/70 text-sm leading-relaxed">
                  أنشئي كلمة مرور قوية لتأمين حسابكِ في المنصة.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleResetPassword}>
                <div>
                  <label className="block text-sm font-bold text-primary-dark mb-1.5" htmlFor="new-password">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-primary/50">
                      <Lock size={18} />
                    </div>
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-secondary/50 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                      placeholder="6 أحرف أو أرقام على الأقل"
                      dir="rtl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-main/40 hover:text-primary transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-primary-dark mb-1.5" htmlFor="confirm-password">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-primary/50">
                      <Lock size={18} />
                    </div>
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-secondary/50 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                      placeholder="أعيدي كتابة كلمة المرور"
                      dir="rtl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 left-0 pl-4 flex items-center text-text-main/40 hover:text-primary transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !newPassword || !confirmPassword}
                  className="w-full bg-primary-dark text-white py-4 rounded-2xl font-bold text-base shadow-lg hover:bg-primary-dark/90 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                  <span>حفظ كلمة المرور الجديدة ←</span>
                </button>
              </form>
            </div>
          )}

          {/* ======================= الخطوة 4: شاشة النجاح ======================= */}
          {step === 4 && (
            <div className="text-center py-6 space-y-6">
              <div className="inline-flex p-4 rounded-3xl bg-emerald-100 text-emerald-700 animate-bounce">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-primary-dark">تم بنجاح وبتوفيق الله 🌸</h2>
                <p className="text-text-main/70 text-sm leading-relaxed max-w-sm mx-auto">
                  تم تحديث كلمة المرور لحسابكِ بنجاح. يمكنكِ الآن تسجيل الدخول برقم هاتفكِ وكلمة المرور الجديدة.
                </p>
              </div>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 bg-primary-dark text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg hover:bg-primary-dark/90 transition-all cursor-pointer"
              >
                <span>الانتقال لتسجيل الدخول الآن ←</span>
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* القسم الأيسر: الصورة والآية الكريمة */}
      <div className="hidden lg:block lg:w-1/2 relative bg-primary-dark overflow-hidden">
        <div className="absolute inset-0 bg-primary-dark/40 mix-blend-multiply z-10"></div>
        <img 
          src="/Mushaf.webp" 
          alt="Quran Mushaf" 
          className="absolute inset-0 w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-16 bg-linear-to-t from-primary-dark/95 via-primary-dark/50 to-transparent">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-bold mb-4 w-fit border border-white/15">
            <Sparkles size={14} />
            <span>مقرأة تحفيظ وتجويد القرآن الكريم</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            "لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا"
          </h2>
          <p className="text-white/80 text-lg max-w-lg leading-relaxed">
            نحن هنا لمساعدتكِ للعودة إلى مساركِ ومواصلة رحلتكِ المباركة في حفظ وتدبر كتاب الله عز وجل.
          </p>
        </div>
      </div>
    </div>
  );
}