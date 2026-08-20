import { Link, useRouterState } from '@tanstack/react-router';
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Video,
  Film,
  CalendarCheck,
  Globe,
  LogOut,
  X,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { api } from '../../lib/axios';

interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
}

interface DashboardSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function DashboardSidebar({ mobileOpen = false, onCloseMobile }: DashboardSidebarProps) {
  const { user, logout } = useAuthStore();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isAdmin = user?.role === 'ADMIN';

  const teacherNavItems: NavItem[] = [
    {
      title: 'طلبات الانضمام',
      path: '/teacher-dashboard',
      icon: Users,
      badge: 'الرئيسية',
    },
    {
      title: 'الحلقات المباشرة',
      path: '/sessions',
      icon: Video,
    },
    {
      title: 'مكتبة التسجيلات',
      path: '/recordings',
      icon: Film,
    },
    {
      title: 'إدارة الحضور',
      path: '/attendance',
      icon: CalendarCheck,
    },
  ];

  const studentNavItems: NavItem[] = [
    {
      title: 'لوحة الطالبة',
      path: '/student-dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'الحلقات المباشرة',
      path: '/sessions',
      icon: Video,
    },
    {
      title: 'تسجيلاتي المتاحة',
      path: '/recordings',
      icon: Film,
    },
  ];

  const navItems = isAdmin ? teacherNavItems : studentNavItems;

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

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-l border-secondary/20 shadow-xs">

      {/* Brand Header */}
      <div className="p-6 border-b border-secondary/15 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2.5 bg-primary-dark rounded-2xl text-white shadow-xs group-hover:bg-primary-dark/90 transition-colors duration-300">
            <BookOpen size={24} />
          </div>
          <div>
            <span className="text-xl font-bold text-primary-dark tracking-wide block font-arabic leading-tight">
              منصة ورتل
            </span>
            <span className="text-[11px] text-text-main/60 font-semibold">
              {isAdmin ? 'بوابة المعلمة 🌿' : 'بوابة الطالبة 🌸'}
            </span>
          </div>
        </Link>

        {mobileOpen && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl text-text-main/60 hover:bg-neutral-bg lg:hidden"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Role / Welcome Banner */}
      <div className="px-5 pt-5 pb-2">
        <div className="p-3.5 rounded-2xl bg-neutral-bg border border-secondary/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary-dark flex items-center justify-center font-bold text-base shadow-xs">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-text-main truncate">{user?.name}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
              <Sparkles size={11} />
              {isAdmin ? 'معلمة معتمدة' : 'طالبة علم'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold text-text-main/40 uppercase tracking-wider">
          القائمة الرئيسية
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${isActive
                  ? 'bg-primary-dark text-white shadow-sm shadow-primary-dark/20'
                  : 'text-text-main/80 hover:bg-neutral-bg hover:text-primary-dark'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={19} className={isActive ? 'text-white' : 'text-primary'} />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary-dark'
                    }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Area */}
      <div className="p-4 border-t border-secondary/15 space-y-1.5">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-2xl text-text-main/70 hover:bg-neutral-bg hover:text-primary transition-colors text-sm font-bold"
        >
          <Globe size={18} />
          <span>الموقع الرئيسي</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-red-600 hover:bg-red-50 transition-colors text-sm font-bold cursor-pointer"
        >
          <LogOut size={18} />
          <span>تسجيل الخروج</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left in RTL -> Right in screen) */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-text-main/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 right-0 w-72 max-w-[85vw] shadow-2xl z-50 animate-in slide-in-from-right duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
