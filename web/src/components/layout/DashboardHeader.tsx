import { Menu, LogOut, Shield, ChevronDown, User as UserIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../lib/axios';

interface DashboardHeaderProps {
  onOpenMobileMenu: () => void;
}

export default function DashboardHeader({ onOpenMobileMenu }: DashboardHeaderProps) {
  const { user, logout } = useAuthStore();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
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
      window.location.href = '/login';
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-20 bg-neutral-bg/85 backdrop-blur-md border-b border-secondary/20 h-20 flex items-center px-4 sm:px-6 lg:px-8 justify-between">
      
      {/* Left side (in RTL: Right side): Mobile Toggle & Welcome Greeting */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl border border-secondary/40 bg-white text-text-main hover:bg-neutral-bg transition-colors"
          aria-label="فتح القائمة"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-primary-dark font-arabic">
            أهلاً بكِ، {user?.name || 'زائرتنا الكريمة'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-text-main/60 hidden sm:block">
            نسأل الله لكِ علماً نافعاً ورفعةً بالقرآن الكريم
          </p>
        </div>
      </div>

      {/* Right side (in RTL: Left side): Profile & Role Badge */}
      <div className="flex items-center gap-3">
        
        {/* Role Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-dark text-xs font-bold">
          <Shield size={14} className="text-primary" />
          <span>{isAdmin ? 'حساب المعلمة (إشراف)' : 'حساب الطالبة'}</span>
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-full border border-secondary/40 bg-white hover:bg-neutral-bg transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-primary/20 text-primary-dark flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0) || <UserIcon size={16} />}
            </div>
            <div className="text-right hidden sm:block text-xs">
              <p className="font-bold text-text-main leading-tight">{user?.name}</p>
              <span className="text-[10px] text-text-main/60" dir="ltr">{user?.email}</span>
            </div>
            <ChevronDown size={16} className={`text-text-main/50 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {userDropdownOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-secondary/20 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-2.5 border-b border-secondary/15 text-right">
                <p className="font-bold text-sm text-text-main">{user?.name}</p>
                <p className="text-xs text-text-main/60 truncate" dir="ltr">{user?.email}</p>
                <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-secondary/30 text-primary-dark text-[10px] font-bold">
                  {isAdmin ? 'معلمة' : 'طالبة'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors text-right cursor-pointer"
              >
                <LogOut size={16} />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
