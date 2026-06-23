import { useEffect, useState, useCallback } from 'react';
import { Bell, UserPlus, Clock, CheckCircle2, Settings, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { mockNotifications, startNotificationSimulation, stopNotificationSimulation, type MockNotification } from '@/lib/mockData';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';
import { toast } from 'sonner';

const categoryConfig = {
  assignment: { icon: UserPlus, color: 'text-info', bg: 'bg-info/10', label: 'Assignment' },
  deadline: { icon: Clock, color: 'text-warning', bg: 'bg-warning/10', label: 'Deadline' },
  completion: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', label: 'Completed' },
  system: { icon: Settings, color: 'text-muted-foreground', bg: 'bg-muted', label: 'System' },
};

export function NotificationBell() {
  const { user, isDemo } = useAuth();
  const { t, lang } = useLanguage();
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const dateLocale = lang === 'ja' ? ja : enUS;

  const handleNewNotification = useCallback((n: MockNotification) => {
    setNotifications(prev => [n, ...prev]);
    toast(n.title, { description: n.message });
  }, []);

  useEffect(() => {
    if (!user) return;
    setNotifications(mockNotifications.getForUser(user.id));

    // Start real-time simulation for demo users
    if (isDemo) {
      startNotificationSimulation(user.id, handleNewNotification);
      return () => stopNotificationSimulation();
    }
  }, [user, isDemo, handleNewNotification]);

  const markAllRead = () => {
    if (unreadCount === 0) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    mockNotifications.markRead(unreadIds);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const dismissNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    mockNotifications.dismiss(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) markAllRead();
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
          <Bell className="h-4 w-4 text-sidebar-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" side="right">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="text-sm font-semibold">{t('notifications')}</h4>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-muted-foreground hover:text-foreground">
              {t('markAllRead')}
            </button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground py-8">
              {t('noNotifications')}
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(n => {
                const config = categoryConfig[n.category] || categoryConfig.system;
                const Icon = config.icon;
                return (
                  <div key={n.id} className={cn('px-4 py-3 text-sm transition-colors group relative', !n.read && 'bg-accent/10')}>
                    <div className="flex gap-3">
                      <div className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full', config.bg)}>
                        <Icon className={cn('h-3.5 w-3.5', config.color)} />
                      </div>
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{n.title}</p>
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', config.bg, config.color)}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs mt-0.5">{n.message}</p>
                        <p className="text-muted-foreground text-xs mt-1">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: dateLocale })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => dismissNotification(e, n.id)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
