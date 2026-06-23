import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { mockTasks, DEMO_USERS } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ListTodo, Users, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { ActivityFeed } from '@/components/ActivityFeed';
import { AiInsights } from '@/components/AiInsights';
import { DashboardCharts } from '@/components/DashboardCharts';

interface Stats {
  totalTasks: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  totalEmployees: number;
  completionPercent: number;
}

interface EmployeeStat {
  userId: string;
  name: string;
  total: number;
  completed: number;
  percent: number;
}

export default function DashboardPage() {
  const { profile, role } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<Stats>({ totalTasks: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0, totalEmployees: 0, completionPercent: 0 });
  const [employeeStats, setEmployeeStats] = useState<EmployeeStat[]>([]);

  const isManagerOrAdmin = role === 'admin' || role === 'manager';

  useEffect(() => {
    const tasks = mockTasks.getAll();
    const profiles = DEMO_USERS;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t =>
      t.status !== 'completed' && t.due_date && new Date(t.due_date) < now
    ).length;

    setStats({
      totalTasks: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed,
      overdue,
      totalEmployees: profiles.length,
      completionPercent: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
    });

    const empMap = new Map<string, { name: string; total: number; completed: number }>();
    for (const p of profiles) {
      empMap.set(p.id, { name: p.full_name, total: 0, completed: 0 });
    }
    for (const t of tasks) {
      if (t.assigned_to && empMap.has(t.assigned_to)) {
        const entry = empMap.get(t.assigned_to)!;
        entry.total++;
        if (t.status === 'completed') entry.completed++;
      }
    }
    const empStats: EmployeeStat[] = [];
    empMap.forEach((v, k) => {
      if (v.total > 0) {
        empStats.push({ userId: k, name: v.name, total: v.total, completed: v.completed, percent: Math.round((v.completed / v.total) * 100) });
      }
    });
    empStats.sort((a, b) => b.total - a.total);
    setEmployeeStats(empStats);
  }, []);

  const summaryCards = [
    { label: t('totalTasks'), value: stats.totalTasks, icon: ListTodo, color: 'text-accent' },
    { label: t('completed'), value: stats.completed, icon: CheckCircle, color: 'text-success' },
    { label: t('overdue'), value: stats.overdue, icon: AlertCircle, color: 'text-destructive' },
    { label: t('inProgress'), value: stats.inProgress, icon: Clock, color: 'text-info' },
    ...(isManagerOrAdmin ? [{ label: t('employeesLabel'), value: stats.totalEmployees, icon: Users, color: 'text-muted-foreground' }] : []),
  ];

  const statusChartData = [
    { name: t('pending'), value: stats.pending, color: 'hsl(215, 14%, 46%)' },
    { name: t('inProgress'), value: stats.inProgress, color: 'hsl(217, 91%, 60%)' },
    { name: t('completed'), value: stats.completed, color: 'hsl(142, 71%, 45%)' },
    { name: t('overdue'), value: stats.overdue, color: 'hsl(0, 72%, 51%)' },
  ].filter(d => d.value > 0);

  const priorityChartData = [
    { name: t('low'), value: mockTasks.getAll().filter(t => t.priority === 'low').length, color: 'hsl(215, 14%, 46%)' },
    { name: t('medium'), value: mockTasks.getAll().filter(t => t.priority === 'medium').length, color: 'hsl(38, 92%, 50%)' },
    { name: t('high'), value: mockTasks.getAll().filter(t => t.priority === 'high').length, color: 'hsl(0, 72%, 51%)' },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t('welcomeBack')} {profile?.full_name}</h1>
          <p className="text-muted-foreground mt-1">{t('overviewDesc')}</p>
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-5">
          {summaryCards.map(card => (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl sm:text-3xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {isManagerOrAdmin && (
          <DashboardCharts statusData={statusChartData} priorityData={priorityChartData} />
        )}

        {isManagerOrAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">{t('overallCompletion')}</CardTitle>
              <TrendingUp className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{stats.completed} {t('of')} {stats.totalTasks} {t('tasksCompleted')}</span>
                <span className="font-mono font-semibold">{stats.completionPercent}%</span>
              </div>
              <Progress value={stats.completionPercent} className="h-2" />
            </CardContent>
          </Card>
        )}

        {isManagerOrAdmin && employeeStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t('tasksPerEmployee')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeeStats.map(emp => (
                  <div key={emp.userId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{emp.name}</span>
                      <span className="text-muted-foreground font-mono">
                        {emp.total} {t('tasksCount')} ({emp.percent}% {t('complete')})
                      </span>
                    </div>
                    <Progress value={emp.percent} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <AiInsights />
          <ActivityFeed />
        </div>
      </div>
    </AppLayout>
  );
}
