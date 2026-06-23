import { useEffect, useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { mockTasks, DEMO_USERS, type MockTask } from '@/lib/mockData';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, getDay, isToday } from 'date-fns';
import { ja as jaLocale, enUS } from 'date-fns/locale';

export default function CalendarPage() {
  const { user, role } = useAuth();
  const { t, lang } = useLanguage();
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const isEmployee = role === 'employee';
  const dateLocale = lang === 'ja' ? jaLocale : enUS;

  useEffect(() => {
    let data = mockTasks.getAll();
    if (isEmployee && user) {
      data = data.filter(t => t.assigned_to === user.id);
    }
    setTasks(data);
  }, [isEmployee, user]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start of month to align with weekday
  const startPadding = getDay(monthStart); // 0=Sun

  const tasksByDate = useMemo(() => {
    const map = new Map<string, MockTask[]>();
    for (const task of tasks) {
      if (task.due_date) {
        const key = task.due_date;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(task);
      }
    }
    return map;
  }, [tasks]);

  const selectedTasks = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, 'yyyy-MM-dd');
    return tasksByDate.get(key) ?? [];
  }, [selectedDate, tasksByDate]);

  const weekDays = lang === 'ja'
    ? ['日', '月', '火', '水', '木', '金', '土']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getAssigneeName = (id: string | null) => {
    if (!id) return '—';
    return DEMO_USERS.find(p => p.id === id)?.full_name ?? '—';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t('taskCalendar')}</h1>
          <p className="text-muted-foreground mt-1">{t('calendarDesc')}</p>
        </div>

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-base font-semibold">
                {format(currentMonth, 'MMMM yyyy', { locale: dateLocale })}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-px">
                {weekDays.map(day => (
                  <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}

                {/* Empty cells for padding */}
                {Array.from({ length: startPadding }).map((_, i) => (
                  <div key={`pad-${i}`} className="aspect-square p-1" />
                ))}

                {daysInMonth.map(day => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const dayTasks = tasksByDate.get(dateKey) ?? [];
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentDay = isToday(day);
                  const hasOverdue = dayTasks.some(t => t.status !== 'completed' && new Date(t.due_date!) < new Date() && !isCurrentDay);

                  return (
                    <button
                      key={dateKey}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square p-1 rounded-lg text-sm transition-colors relative flex flex-col items-center
                        ${isSelected ? 'bg-accent text-accent-foreground ring-2 ring-accent' : ''}
                        ${isCurrentDay && !isSelected ? 'bg-primary/10 font-bold' : ''}
                        ${!isSelected && !isCurrentDay ? 'hover:bg-muted' : ''}
                      `}
                    >
                      <span className={`${!isSameMonth(day, currentMonth) ? 'text-muted-foreground/40' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {dayTasks.length > 0 && (
                        <div className="flex gap-0.5 mt-0.5">
                          {dayTasks.length <= 3 ? (
                            dayTasks.map(t => (
                              <div
                                key={t.id}
                                className={`h-1.5 w-1.5 rounded-full ${
                                  t.status === 'completed' ? 'bg-success'
                                  : hasOverdue ? 'bg-destructive'
                                  : 'bg-info'
                                }`}
                              />
                            ))
                          ) : (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 font-mono">
                              {dayTasks.length}
                            </Badge>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected date detail */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-accent" />
                {selectedDate
                  ? format(selectedDate, 'PPP', { locale: dateLocale })
                  : t('selectDate')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!selectedDate && (
                <p className="text-sm text-muted-foreground text-center py-4">{t('clickDateToView')}</p>
              )}
              {selectedDate && selectedTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">{t('noTasksOnDate')}</p>
              )}
              {selectedTasks.map(task => (
                <div key={task.id} className="rounded-lg border p-3 space-y-1.5">
                  <p className="text-sm font-medium">{task.title}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge value={task.priority} />
                    <StatusBadge value={task.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('assignedTo')}: {getAssigneeName(task.assigned_to)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
