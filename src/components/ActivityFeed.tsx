import { useEffect, useState } from 'react';
import { mockActivity } from '@/lib/mockData';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, FileEdit, UserPlus, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';

interface Log {
  id: string;
  action: string;
  details: string | null;
  created_at: string;
}

const actionIcons: Record<string, typeof Activity> = {
  task_created: FileEdit,
  task_assigned: UserPlus,
  status_changed: CheckCircle2,
};

export function ActivityFeed() {
  const [logs, setLogs] = useState<Log[]>([]);
  const { t, lang } = useLanguage();
  const dateLocale = lang === 'ja' ? ja : enUS;

  useEffect(() => {
    setLogs(mockActivity.getRecent());
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-accent" />
          {t('recentActivity')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-72 px-6 pb-4">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">{t('noActivity')}</p>
          ) : (
            <div className="space-y-3">
              {logs.map(log => {
                const Icon = actionIcons[log.action] ?? Activity;
                return (
                  <div key={log.id} className="flex gap-3 text-sm">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground">{log.details}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: dateLocale })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
