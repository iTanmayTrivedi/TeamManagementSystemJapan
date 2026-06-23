import { useEffect, useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useLanguage } from '@/hooks/useLanguage';
import { mockActivity, DEMO_USERS, type MockActivityLog } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, FileEdit, UserPlus, CheckCircle2, Search, Filter } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ja as jaLocale, enUS } from 'date-fns/locale';

const actionIcons: Record<string, typeof Activity> = {
  task_created: FileEdit,
  task_assigned: UserPlus,
  status_changed: CheckCircle2,
};

const actionColors: Record<string, string> = {
  task_created: 'bg-info/15 text-info',
  task_assigned: 'bg-warning/15 text-warning',
  status_changed: 'bg-success/15 text-success',
};

export default function ActivityPage() {
  const { t, lang } = useLanguage();
  const dateLocale = lang === 'ja' ? jaLocale : enUS;
  const [logs, setLogs] = useState<MockActivityLog[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  useEffect(() => {
    setLogs(mockActivity.getRecent(50));
  }, []);

  const filtered = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = !search || (log.details ?? '').toLowerCase().includes(search.toLowerCase());
      const matchAction = actionFilter === 'all' || log.action === actionFilter;
      const matchUser = userFilter === 'all' || log.user_id === userFilter;
      return matchSearch && matchAction && matchUser;
    });
  }, [logs, search, actionFilter, userFilter]);

  // Group by date
  const groupedLogs = useMemo(() => {
    const groups = new Map<string, MockActivityLog[]>();
    for (const log of filtered) {
      const dateKey = format(new Date(log.created_at), 'yyyy-MM-dd');
      if (!groups.has(dateKey)) groups.set(dateKey, []);
      groups.get(dateKey)!.push(log);
    }
    return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const getUserName = (userId: string) => {
    return DEMO_USERS.find(u => u.id === userId)?.full_name ?? userId;
  };

  const actionLabels: Record<string, string> = {
    task_created: t('taskCreated'),
    task_assigned: t('taskAssigned'),
    status_changed: t('statusChanged'),
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t('activityTimeline')}</h1>
          <p className="text-muted-foreground mt-1">{t('activityTimelineDesc')}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t('searchActivity')} value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder={t('allActions')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allActions')}</SelectItem>
              <SelectItem value="task_created">{t('taskCreated')}</SelectItem>
              <SelectItem value="task_assigned">{t('taskAssigned')}</SelectItem>
              <SelectItem value="status_changed">{t('statusChanged')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('allEmployees')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allEmployees')}</SelectItem>
              {DEMO_USERS.map(u => (
                <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timeline */}
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="p-6 space-y-8">
                {groupedLogs.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">{t('noActivity')}</p>
                )}
                {groupedLogs.map(([dateKey, dayLogs]) => (
                  <div key={dateKey}>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge variant="outline" className="font-mono text-xs">
                        {format(new Date(dateKey), 'PPP', { locale: dateLocale })}
                      </Badge>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    <div className="relative ml-4 border-l-2 border-border pl-6 space-y-4">
                      {dayLogs.map(log => {
                        const Icon = actionIcons[log.action] ?? Activity;
                        const colorClass = actionColors[log.action] ?? 'bg-muted text-muted-foreground';
                        return (
                          <div key={log.id} className="relative">
                            {/* Timeline dot */}
                            <div className={`absolute -left-[31px] flex h-7 w-7 items-center justify-center rounded-full ${colorClass}`}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>

                            <div className="rounded-lg border bg-card p-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{getUserName(log.user_id)}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    {actionLabels[log.action] ?? log.action}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: dateLocale })}
                                </span>
                              </div>
                              {log.details && (
                                <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
