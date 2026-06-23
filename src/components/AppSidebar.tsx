import { LayoutDashboard, Users, ListTodo, LogOut, Shield, Building2, Settings, Kanban, CalendarDays, BarChart3, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { NotificationBell } from './NotificationBell';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { OnlinePresence } from './OnlinePresence';
import type { AppRole } from '@/lib/mockData';

const AVATAR_STORAGE_KEY = 'user_avatar_';

const navItems: { labelKey: string; icon: typeof LayoutDashboard; path: string; roles: AppRole[] }[] = [
  { labelKey: 'dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'manager', 'employee'] },
  { labelKey: 'kanbanBoard', icon: Kanban, path: '/kanban', roles: ['admin', 'manager', 'employee'] },
  { labelKey: 'taskCalendar', icon: CalendarDays, path: '/calendar', roles: ['admin', 'manager', 'employee'] },
  { labelKey: 'tasks', icon: ListTodo, path: '/tasks', roles: ['admin', 'manager', 'employee'] },
  { labelKey: 'employees', icon: Users, path: '/employees', roles: ['admin', 'manager'] },
  { labelKey: 'departments', icon: Building2, path: '/departments', roles: ['admin'] },
  { labelKey: 'performanceAnalytics', icon: BarChart3, path: '/analytics', roles: ['admin', 'manager'] },
  { labelKey: 'activityTimeline', icon: Activity, path: '/activity', roles: ['admin', 'manager'] },
];

interface AppSidebarProps {
  onNavigate?: () => void;
}

export function AppSidebar({ onNavigate }: AppSidebarProps) {
  const { profile, role, signOut } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <aside className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex items-center justify-between px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src="/favicon.png" alt="TeamHub" className="h-9 w-9 rounded-lg" />
          <div>
            <h1 className="text-sm font-semibold text-sidebar-accent-foreground">{t('teamHub')}</h1>
            <p className="text-xs text-sidebar-muted capitalize">{role ?? 'loading...'}</p>
          </div>
        </div>
        <NotificationBell />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <nav className="px-3 py-4 space-y-1">
          {navItems
            .filter(item => role && item.roles.includes(role))
            .map(item => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {t(item.labelKey as any)}
                </button>
              );
            })}
        </nav>

        <div className="border-t border-sidebar-border px-4 py-3">
          <OnlinePresence />
        </div>
      </div>

      <div className="border-t border-sidebar-border px-3 py-4 space-y-2">
        <ThemeToggle variant="sidebar" />
        <LanguageSwitcher variant="sidebar" />
        <button
          onClick={() => handleNav('/profile')}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors',
            location.pathname === '/profile'
              ? 'bg-sidebar-accent'
              : 'hover:bg-sidebar-accent'
          )}
        >
          {(() => {
            const avatarUrl = profile?.id ? localStorage.getItem(AVATAR_STORAGE_KEY + profile.id) : null;
            return avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold text-sidebar-accent-foreground">
                {profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
            );
          })()}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-accent-foreground truncate">{profile?.full_name}</p>
            <p className="text-xs text-sidebar-muted truncate">{profile?.email}</p>
          </div>
          <Settings className="h-3.5 w-3.5 text-sidebar-muted" />
        </button>
        <button
          onClick={() => { signOut(); onNavigate?.(); }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {t('signOut')}
        </button>
      </div>
    </aside>
  );
}
