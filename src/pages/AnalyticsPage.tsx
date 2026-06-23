import { useEffect, useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useLanguage } from '@/hooks/useLanguage';
import { mockTasks, DEMO_USERS, mockActivity } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Award, AlertTriangle, Clock, Target } from 'lucide-react';

const COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 51%)',
  'hsl(280, 67%, 55%)',
];

export default function AnalyticsPage() {
  const { t } = useLanguage();

  const tasks = mockTasks.getAll();
  const profiles = DEMO_USERS;
  const activity = mockActivity.getRecent(50);

  // Per-employee performance
  const employeePerformance = useMemo(() => {
    return profiles
      .filter(p => p.role !== 'admin')
      .map(p => {
        const empTasks = tasks.filter(t => t.assigned_to === p.id);
        const completed = empTasks.filter(t => t.status === 'completed').length;
        const overdue = empTasks.filter(t =>
          t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date()
        ).length;
        const total = empTasks.length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { name: p.full_name.split(' ')[0], total, completed, overdue, inProgress: empTasks.filter(t => t.status === 'in_progress').length, rate, department: p.department };
      })
      .filter(e => e.total > 0)
      .sort((a, b) => b.rate - a.rate);
  }, [tasks, profiles]);

  // Department breakdown
  const departmentData = useMemo(() => {
    const deptMap = new Map<string, { total: number; completed: number }>();
    for (const task of tasks) {
      const assignee = profiles.find(p => p.id === task.assigned_to);
      const dept = assignee?.department ?? 'Unassigned';
      if (!deptMap.has(dept)) deptMap.set(dept, { total: 0, completed: 0 });
      const entry = deptMap.get(dept)!;
      entry.total++;
      if (task.status === 'completed') entry.completed++;
    }
    return Array.from(deptMap.entries()).map(([name, v]) => ({
      name,
      total: v.total,
      completed: v.completed,
      rate: v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0,
    }));
  }, [tasks, profiles]);

  // Weekly trend (simulated from task created_at dates)
  const weeklyTrend = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((name, i) => ({
      name,
      created: Math.floor(Math.random() * 3) + 1,
      completed: Math.floor(Math.random() * 3),
    }));
  }, []);

  // Priority distribution pie
  const priorityData = useMemo(() => [
    { name: t('high'), value: tasks.filter(t => t.priority === 'high').length, color: 'hsl(0, 72%, 51%)' },
    { name: t('medium'), value: tasks.filter(t => t.priority === 'medium').length, color: 'hsl(38, 92%, 50%)' },
    { name: t('low'), value: tasks.filter(t => t.priority === 'low').length, color: 'hsl(215, 14%, 46%)' },
  ], [tasks, t]);

  // KPIs
  const totalCompleted = tasks.filter(t => t.status === 'completed').length;
  const totalOverdue = tasks.filter(t => t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date()).length;
  const avgCompletionRate = employeePerformance.length > 0
    ? Math.round(employeePerformance.reduce((sum, e) => sum + e.rate, 0) / employeePerformance.length)
    : 0;
  const topPerformer = employeePerformance[0];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{t('performanceAnalytics')}</h1>
          <p className="text-muted-foreground mt-1">{t('analyticsDesc')}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('avgCompletion')}</CardTitle>
              <Target className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{avgCompletionRate}%</p>
              <Progress value={avgCompletionRate} className="h-1.5 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('totalCompleted')}</CardTitle>
              <TrendingUp className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalCompleted}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('of')} {tasks.length} {t('tasksCount')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('overdueItems')}</CardTitle>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-destructive">{totalOverdue}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('requiresAttention')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t('topPerformer')}</CardTitle>
              <Award className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{topPerformer?.name ?? '—'}</p>
              <p className="text-xs text-muted-foreground mt-1">{topPerformer?.rate ?? 0}% {t('completionRate')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Employee performance bar chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t('employeePerformance')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employeePerformance} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="completed" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name={t('completed')} />
                    <Bar dataKey="inProgress" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} name={t('inProgress')} />
                    <Bar dataKey="overdue" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} name={t('overdue')} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t('weeklyTrend')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                    <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: 12,
                      }}
                    />
                    <Line type="monotone" dataKey="created" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={{ fill: 'hsl(217, 91%, 60%)' }} name={t('created')} />
                    <Line type="monotone" dataKey="completed" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ fill: 'hsl(142, 71%, 45%)' }} name={t('completed')} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Priority distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t('priorityDistribution')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={priorityData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {priorityData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Department breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">{t('departmentBreakdown')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {departmentData.map((dept, i) => (
                <div key={dept.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="font-medium">{dept.name}</span>
                    </div>
                    <span className="text-muted-foreground font-mono text-xs">
                      {dept.completed}/{dept.total} ({dept.rate}%)
                    </span>
                  </div>
                  <Progress value={dept.rate} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Employee ranking table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">{t('employeeRanking')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employeePerformance.map((emp, i) => (
                <div key={emp.name} className="flex items-center gap-4 rounded-lg border p-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    i === 0 ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.department}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs flex-wrap sm:flex-nowrap">
                    <Badge variant="secondary" className="font-mono">{emp.total} {t('tasksCount')}</Badge>
                    <div className="w-16 sm:w-24">
                      <Progress value={emp.rate} className="h-1.5" />
                    </div>
                    <span className="font-mono font-semibold w-10 text-right">{emp.rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
