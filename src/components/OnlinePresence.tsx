import { usePresence, type PresenceUser } from '@/hooks/usePresence';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { formatDistanceToNow } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

export function OnlinePresence() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const presenceList = usePresence(user?.id);
  const dateLocale = lang === 'ja' ? ja : enUS;

  const online = presenceList.filter(p => p.isOnline);
  const offline = presenceList.filter(p => !p.isOnline);

  const roleColor: Record<string, string> = {
    admin: 'bg-destructive/15 text-destructive border-destructive/20',
    manager: 'bg-info/15 text-info border-info/20',
    employee: 'bg-muted text-muted-foreground border-border',
  };

  const renderUser = (p: PresenceUser) => (
    <div key={p.id} className="flex items-center gap-2.5 py-1.5">
      <div className="relative">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          {p.name.charAt(0).toUpperCase()}
        </div>
        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card ${p.isOnline ? 'bg-success' : 'bg-muted-foreground/40'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium truncate">{p.name}</span>
          {p.isTyping && (
            <span className="text-[10px] text-accent animate-pulse">
              {t('typing')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className={`text-[9px] px-1 py-0 h-3.5 font-normal border ${roleColor[p.role] ?? ''}`}>
            {t(p.role as any)}
          </Badge>
          {!p.isOnline && (
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(p.lastSeen, { addSuffix: true, locale: dateLocale })}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-sidebar-muted uppercase tracking-wider">{t('teamPresence')}</h4>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] text-sidebar-muted font-mono">{online.length}</span>
        </div>
      </div>
      <ScrollArea className="max-h-[180px]">
        <div className="space-y-0.5">
          {online.map(renderUser)}
          {offline.length > 0 && (
            <div className="flex items-center gap-2 pt-2 pb-1">
              <WifiOff className="h-3 w-3 text-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">{t('offline')}</span>
            </div>
          )}
          {offline.map(renderUser)}
        </div>
      </ScrollArea>
    </div>
  );
}
