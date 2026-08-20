import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Phone, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/useAuthStore';
import { useMutation } from '@tanstack/react-query';

export const Route = createFileRoute('/login')({
  component: Login,
});

// eslint-disable-next-line react-refresh/only-export-components
function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/login', {
        identifier: identifier.trim(),
        password
      });
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data.user);
      if (data.user?.role === 'ADMIN') {
        navigate({ to: '/teacher-dashboard' });
      } else {
        navigate({ to: '/student-dashboard' });
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول، تأكدي من رقم الهاتف وكلمة المرور.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!identifier.trim() || !password) {
      setErrorMessage('يرجى إدخال رقم الهاتف وكلمة المرور');
      return;
    }
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen flex">
      {/* القسم الأيمن: الفورم */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative bg-white">
        
        <Link to="/" className="absolute top-8 right-8 inline-flex items-center gap-2 text-text-main/60 hover:text-primary transition-colors text-sm font-bold">
          <ArrowRight size={18} />
          العودة للموقع
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-primary-dark mb-3">تسجيل الدخول</h1>
            <p className="text-text-main/70 text-lg">مرحباً بكِ مجدداً في رحلتكِ مع القرآن الكريم 🌿</p>
          </div>

          {/* عرض رسالة الخطأ إن وجدت */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold">
              {errorMessage}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-primary-dark mb-2" htmlFor="identifier">
                رقم الهاتف (واتساب)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-primary/50">
                  <Phone size={22} />
                </div>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-4 pr-12 py-4 rounded-2xl border border-secondary/50 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-text-main text-lg"
                  placeholder="رقم الهاتف أو البريد الإلكتروني"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-primary-dark" htmlFor="password">كلمة المرور</label>
                <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-dark font-bold transition-colors">
                  نسيتِ كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-primary/50">
                  <Lock size={22} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 rounded-2xl border border-secondary/50 bg-neutral-bg focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-text-main text-lg"
                  placeholder="أدخلي كلمة المرور"
                  dir="rtl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-4 flex items-center text-primary/60 hover:text-primary transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-primary-dark text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-primary-dark/90 hover:shadow-xl transition-all duration-300 mt-4 transform hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <span>تسجيل الدخول</span>
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-text-main/70 font-bold text-lg">
            ليس لديكِ حساب؟{' '}
            <Link to="/register" className="text-primary hover:text-primary-dark transition-colors">
              انضمي إلينا الآن
            </Link>
          </p>
        </div>
      </div>

      {/* القسم الأيسر: الصورة */}
      <div className="hidden lg:block lg:w-1/2 relative bg-primary-dark overflow-hidden">
        <div className="absolute inset-0 bg-primary-dark/30 mix-blend-multiply z-10"></div>
        <img 
          src="/kabaa.webp" 
          alt="Kaaba in Mecca" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-16 bg-linear-to-t from-primary-dark/90 to-transparent">
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            "وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا"
          </h2>
          <p className="text-white/80 text-xl max-w-lg leading-relaxed">
            بيئة إيمانية هادئة تساعدكِ على الحفظ والتدبر، بخطوات ثابتة وصحبة صالحة.
          </p>
        </div>
      </div>
    </div>
  );
}