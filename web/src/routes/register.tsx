import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/axios';
import { useMutation } from '@tanstack/react-query';

export const Route = createFileRoute('/register')({
  component: Register,
});

// eslint-disable-next-line react-refresh/only-export-components
function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  // استخدام TanStack Query Mutation لإرسال طلب التسجيل
  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/register', {
        name: name.trim(),
        phone: phone.trim(),
        password,
        ...(email.trim() ? { email: email.trim() } : {})
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'تم التسجيل بنجاح! جاري تحويلك لتسجيل الدخول...');
      setTimeout(() => {
        navigate({ to: '/login' });
      }, 2000);
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب، يرجى التأكد من البيانات.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !phone.trim() || !password || !confirmPassword) {
      setErrorMessage('يرجى كتابة الاسم ورقم الهاتف وكلمة المرور وتأكيدها');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }

    registerMutation.mutate();
  };

  return (
    <div className="h-screen w-full flex overflow-hidden">
      {/* القسم الأيمن: الفورم */}
      <div className="w-full lg:w-1/2 h-full flex flex-col p-6 sm:p-10 relative bg-white overflow-y-auto custom-scrollbar">
        
        {/* زر العودة */}
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center gap-2 text-text-main/60 hover:text-primary transition-colors text-sm font-bold">
            <ArrowRight size={18} />
            العودة للموقع
          </Link>
        </div>

        {/* حاوية الفورم */}
        <div className="w-full max-w-lg mx-auto flex-1 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-primary-dark mb-2">إنشاء حساب جديد</h1>
            <p className="text-text-main/70 text-base lg:text-lg">ابدأي رحلتكِ المباركة معنا برقم هاتفكِ وكلمة المرور 🌿</p>
          </div>

          {/* رسائل الخطأ والنجاح */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-sm font-bold">
              {successMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* صف 1: الاسم ورقم الهاتف */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-primary-dark mb-1.5" htmlFor="name">الاسم بالكامل</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-primary/50"><User size={20} /></div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-4 pr-11 py-3 rounded-2xl border border-secondary/50 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                    placeholder="الاسم الكامل"
                    dir="rtl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-primary-dark mb-1.5" htmlFor="phone">
                  رقم الهاتف (واتساب)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-primary/50"><Phone size={20} /></div>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-4 pr-11 py-3 rounded-2xl border border-secondary/50 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                    placeholder="رقم الهاتف المسجل بالواتساب"
                    dir="ltr"
                    required
                  />
                </div>
              </div>
            </div>

            {/* صف 2: البريد الإلكتروني (اختياري) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-bold text-primary-dark" htmlFor="email">
                  البريد الإلكتروني
                </label>
                <span className="text-xs text-text-main/50 font-normal">(اختياري)</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-primary/50"><Mail size={20} /></div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 rounded-2xl border border-secondary/50 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                  placeholder="أدخلي بريدك الإلكتروني (إن وجد)"
                  dir="rtl"
                />
              </div>
            </div>

            {/* صف 3: كلمة المرور وتأكيدها */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-primary-dark mb-1.5" htmlFor="password">كلمة المرور</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-primary/50"><Lock size={20} /></div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-2xl border border-secondary/50 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                    placeholder="كلمة المرور"
                    dir="rtl"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary/60 hover:text-primary focus:outline-none">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-primary-dark mb-1.5" htmlFor="confirmPassword">تأكيد كلمة المرور</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-primary/50"><Lock size={20} /></div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-2xl border border-secondary/50 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
                    placeholder="تأكيد كلمة المرور"
                    dir="rtl"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 left-0 pl-3 flex items-center text-primary/60 hover:text-primary focus:outline-none">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-primary-dark text-white py-3.5 rounded-2xl font-bold text-lg shadow-lg hover:bg-primary-dark/90 hover:shadow-xl transition-all mt-6 transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={22} />
                  <span>جاري إنشاء الحساب...</span>
                </>
              ) : (
                <span>إنشاء الحساب</span>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-text-main/70 font-bold">
            لديكِ حساب بالفعل؟{' '}
            <Link to="/login" className="text-primary hover:text-primary-dark transition-colors">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>

      {/* القسم الأيسر: الصورة */}
      <div className="hidden lg:block lg:w-1/2 h-full relative bg-primary-dark overflow-hidden">
        <div className="absolute inset-0 bg-primary-dark/30 mix-blend-multiply z-10"></div>
        <img 
          src="/tree.webp" 
          alt="Kaaba in Mecca" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-12 lg:p-16 bg-linear-to-t from-primary-dark/95 via-primary-dark/50 to-transparent">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
            بيئة داعمة ومحفزة للاستمرار
          </h2>
          <p className="text-white/90 text-lg lg:text-xl max-w-lg leading-relaxed">
            نرافقكِ خطوة بخطوة في رحلة حفظ وتدبر كتاب الله. انضمي لمجتمعنا الآن.
          </p>
        </div>
      </div>
    </div>
  );
}