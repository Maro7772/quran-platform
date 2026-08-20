import { Link, useNavigate } from '@tanstack/react-router';
import { BookOpen, LogIn, LayoutDashboard, LogOut, User, ChevronDown, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../lib/axios';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      setDropdownOpen(false);
      navigate({ to: '/login' });
    }
  };

  const dashboardPath = user?.role === 'ADMIN' ? '/teacher-dashboard' : '/student-dashboard';
  const roleTitle = user?.role === 'ADMIN' ? 'معلمة' : 'طالبة';

  return (
    <header className="sticky top-0 z-50 bg-neutral-bg/85 backdrop-blur-md border-b border-secondary/20 transition-all">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-primary-dark rounded-2xl text-white shadow-xs group-hover:bg-primary-dark/90 transition-colors duration-300">
              <BookOpen size={26} />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-primary-dark tracking-wide font-arabic">
                منصة ورتل
              </span>
              <span className="text-xs text-text-main/60 font-medium">مقرأة القرآن الكريم</span>
            </div>
          </Link>

          {/* Public Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-semibold text-text-main">
            <Link to="/" className="hover:text-primary transition-colors [&.active]:text-primary">
              الرئيسية
            </Link>
            <a href="#program" className="hover:text-primary transition-colors">
              البرنامج
            </a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">
              كيف نعمل
            </a>
            <a href="#faq" className="hover:text-primary transition-colors">
              الأسئلة الشائعة
            </a>
          </nav>

          {/* Actions / Auth Area */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary/15 text-primary-dark hover:bg-primary/25 rounded-full font-bold transition-all text-sm shadow-xs"
                >
                  <LayoutDashboard size={18} />
                  <span>لوحة التحكم</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-secondary/40 bg-white hover:bg-neutral-bg text-text-main font-semibold transition-colors focus:outline-none cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary-dark flex items-center justify-center font-bold text-sm">
                      {user.name?.charAt(0) || <User size={16} />}
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold text-text-main leading-tight">{user.name}</p>
                      <span className="text-[10px] text-primary font-bold">{roleTitle}</span>
                    </div>
                    <ChevronDown size={16} className={`text-text-main/50 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-secondary/20 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-secondary/15 text-right">
                        <p className="font-bold text-sm text-text-main truncate">{user.name}</p>
                        <p className="text-xs text-text-main/60 truncate" dir="ltr">{user.email}</p>
                      </div>
                      <Link
                        to={dashboardPath}
                        onClick={() => setDropdownOpen(false)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-text-main hover:bg-neutral-bg hover:text-primary transition-colors text-right"
                      >
                        <LayoutDashboard size={16} />
                        <span>لوحة {roleTitle}</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-right cursor-pointer"
                      >
                        <LogOut size={16} />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 text-primary-dark font-bold hover:bg-secondary/30 rounded-full transition-colors text-sm"
                >
                  <LogIn size={18} />
                  <span>دخول</span>
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-dark text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-xs hover:bg-primary-dark/90 hover:shadow-md transition-all duration-300"
                >
                  انضمي إلينا
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-primary-dark hover:bg-secondary/20 transition-colors cursor-pointer"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-secondary/20 space-y-3">
            <nav className="flex flex-col space-y-2 font-semibold text-text-main px-2">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-secondary/20 hover:text-primary transition-colors"
              >
                الرئيسية
              </Link>
              <a
                href="#program"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-secondary/20 hover:text-primary transition-colors"
              >
                البرنامج
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-secondary/20 hover:text-primary transition-colors"
              >
                كيف نعمل
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-secondary/20 hover:text-primary transition-colors"
              >
                الأسئلة الشائعة
              </a>
            </nav>

            <div className="pt-3 border-t border-secondary/20 px-2 space-y-2">
              {isAuthenticated && user ? (
                <>
                  <div className="px-3 py-2 rounded-xl bg-white border border-secondary/30 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-text-main">{user.name}</p>
                      <span className="text-xs text-primary font-bold">{roleTitle}</span>
                    </div>
                    <Link
                      to={dashboardPath}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold"
                    >
                      لوحة التحكم
                    </Link>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-600 font-bold bg-red-50 text-sm"
                  >
                    <LogOut size={16} />
                    <span>تسجيل الخروج</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-secondary/40 text-primary-dark font-bold text-sm"
                  >
                    دخول
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-primary-dark text-white font-bold text-sm shadow-sm"
                  >
                    انضمي إلينا
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}