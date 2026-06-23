import { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { mockTasks, DEMO_USERS, type MockTask } from '@/lib/mockData';
import { emitTaskChange, useRealtimeSync } from '@/hooks/useRealtimeSync';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { TaskComments } from '@/components/TaskComments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Trash2, Play, CheckCircle, Download, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { downloadCSV } from '@/lib/csvExport';
import { Separator } from '@/components/ui/separator';

export default function TasksPage() {
  const { user, role } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [dueDateFilter, setDueDateFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<MockTask | null>(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', assigned_to: '', due_date: '', status: 'pending' });

  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isEmployee = role === 'employee';
  const canManage = isAdmin || isManager;

  const profiles = DEMO_USERS;

  const fetchData = () => {
    let taskData = mockTasks.getAll();
    if (isEmployee && user) {
      taskData = taskData.filter(t => t.assigned_to === user.id);
    }
    setTasks(taskData);
  };

  useEffect(() => { fetchData(); }, [role, user]);

  // Real-time sync: listen for task changes from other components
  const realtimeSync = useRealtimeSync((detail) => {
    fetchData();
    toast({ title: t('taskSyncedRealtime'), description: `${detail.userName} ${detail.type}d a task` });
  });

  useEffect(() => {
    realtimeSync.subscribe();
    return () => realtimeSync.unsubscribe();
  }, []);

  const getAssigneeName = (id: string | null) => {
    if (!id) return '—';
    return profiles.find(p => p.id === id)?.full_name ?? 'Unknown';
  };

  const openCreate = () => {
    setEditingTask(null);
    setForm({ title: '', description: '', priority: 'medium', assigned_to: '', due_date: '', status: 'pending' });
    setDialogOpen(true);
  };

  const openEdit = (task: MockTask) => {
    if (isEmployee) return;
    setEditingTask(task);
    setForm({ title: task.title, description: task.description ?? '', priority: task.priority, assigned_to: task.assigned_to ?? '', due_date: task.due_date ?? '', status: task.status });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingTask) {
      const updateData: Partial<MockTask> = {};
      if (canManage) {
        updateData.title = form.title;
        updateData.description = form.description || null;
        updateData.priority = form.priority;
        updateData.assigned_to = form.assigned_to || null;
        updateData.due_date = form.due_date || null;
        updateData.status = form.status;
      } else {
        updateData.status = form.status;
      }
      mockTasks.update(editingTask.id, updateData);
      emitTaskChange({ type: 'update', taskId: editingTask.id, userId: user?.id ?? '', userName: DEMO_USERS.find(u => u.id === user?.id)?.full_name ?? 'User', timestamp: new Date().toISOString() });
      toast({ title: t('taskUpdated') });
    } else {
      const newTask = mockTasks.insert({
        title: form.title,
        description: form.description || null,
        priority: form.priority,
        assigned_to: form.assigned_to || null,
        assigned_by: user?.id ?? null,
        due_date: form.due_date || null,
        status: form.status,
      });
      emitTaskChange({ type: 'insert', taskId: newTask.id, userId: user?.id ?? '', userName: DEMO_USERS.find(u => u.id === user?.id)?.full_name ?? 'User', timestamp: new Date().toISOString() });
      toast({ title: t('taskCreated') });
    }
    setDialogOpen(false);
    fetchData();
  };

  const handleDelete = (task: MockTask) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    mockTasks.delete(task.id);
    toast({ title: t('taskDeleted') });
    fetchData();
  };

  const handleQuickStatus = (task: MockTask, newStatus: string) => {
    mockTasks.update(task.id, { status: newStatus });
    toast({ title: newStatus === 'completed' ? t('completed') + '!' : t('taskUpdated') });
    fetchData();
  };

  const handleExportCSV = () => {
    const csvData = filtered.map(t => ({
      Title: t.title,
      Description: t.description,
      Priority: t.priority,
      Status: t.status,
      'Assigned To': getAssigneeName(t.assigned_to),
      'Due Date': t.due_date,
      'Created At': t.created_at,
    }));
    downloadCSV(csvData, 'tasks');
  };

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchEmployee = employeeFilter === 'all' || t.assigned_to === employeeFilter;
    let matchDue = true;
    if (dueDateFilter === 'overdue') {
      const now = new Date(); now.setHours(0,0,0,0);
      matchDue = !!t.due_date && new Date(t.due_date) < now && t.status !== 'completed';
    } else if (dueDateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      matchDue = t.due_date === today;
    } else if (dueDateFilter === 'week') {
      if (!t.due_date) { matchDue = false; } else {
        const now = new Date(); const week = new Date(); week.setDate(now.getDate() + 7);
        const d = new Date(t.due_date);
        matchDue = d >= now && d <= week;
      }
    }
    return matchSearch && matchStatus && matchPriority && matchEmployee && matchDue;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{isEmployee ? t('myTasks') : t('tasks')}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{tasks.length} {isEmployee ? t('tasksAssigned') : t('totalTasksLabel')}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="gap-1.5 text-xs border-success/30 text-success">
              <Wifi className="h-3 w-3" />
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              {t('liveUpdates')}
            </Badge>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">{t('exportCSV')}</span>
            </Button>
            {canManage && (
              <Button size="sm" onClick={openCreate} className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">{t('newTask')}</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t('searchTasks')} value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder={t('status')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="pending">{t('pending')}</SelectItem>
              <SelectItem value="in_progress">{t('inProgress')}</SelectItem>
              <SelectItem value="completed">{t('completed')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder={t('priority')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allPriority')}</SelectItem>
              <SelectItem value="low">{t('low')}</SelectItem>
              <SelectItem value="medium">{t('medium')}</SelectItem>
              <SelectItem value="high">{t('high')}</SelectItem>
            </SelectContent>
          </Select>
          {!isEmployee && (
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder={t('employees')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allEmployees')}</SelectItem>
                {profiles.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={dueDateFilter} onValueChange={setDueDateFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder={t('dueDate')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allDates')}</SelectItem>
              <SelectItem value="overdue">{t('overdue')}</SelectItem>
              <SelectItem value="today">{t('today')}</SelectItem>
              <SelectItem value="week">{t('thisWeek')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead>{t('title')}</TableHead>
                {!isEmployee && <TableHead>{t('assignedTo')}</TableHead>}
                <TableHead>{t('priority')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('dueDate')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(task => (
                <TableRow key={task.id} className={canManage ? 'cursor-pointer hover:bg-muted/50' : ''} onClick={() => canManage && openEdit(task)}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  {!isEmployee && <TableCell className="text-muted-foreground">{getAssigneeName(task.assigned_to)}</TableCell>}
                  <TableCell><StatusBadge value={task.priority} /></TableCell>
                  <TableCell><StatusBadge value={task.status} /></TableCell>
                  <TableCell className="text-muted-foreground">{task.due_date ?? '—'}</TableCell>
                  <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      {isEmployee && task.status === 'pending' && (
                        <Button variant="outline" size="sm" onClick={() => handleQuickStatus(task, 'in_progress')}>
                          <Play className="h-3.5 w-3.5 mr-1" /> {t('start')}
                        </Button>
                      )}
                      {isEmployee && task.status === 'in_progress' && (
                        <Button variant="outline" size="sm" className="border-success/30 text-success hover:bg-success/10" onClick={() => handleQuickStatus(task, 'completed')}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> {t('completed')}
                        </Button>
                      )}
                      {isAdmin && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(task)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isEmployee ? 5 : 6} className="text-center py-8 text-muted-foreground">{t('noTasks')}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTask ? t('editTask') : t('newTask')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>{t('title')}</Label>
                <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('description')}</Label>
                <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('priority')}</Label>
                  <Select value={form.priority} onValueChange={v => setForm(p => ({ ...p, priority: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{t('low')}</SelectItem>
                      <SelectItem value="medium">{t('medium')}</SelectItem>
                      <SelectItem value="high">{t('high')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('dueDate')}</Label>
                  <Input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('assignTo')}</Label>
                <Select value={form.assigned_to} onValueChange={v => setForm(p => ({ ...p, assigned_to: v }))}>
                  <SelectTrigger><SelectValue placeholder={t('selectEmployee')} /></SelectTrigger>
                  <SelectContent>
                    {profiles.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('status')}</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('pending')}</SelectItem>
                    <SelectItem value="in_progress">{t('inProgress')}</SelectItem>
                    <SelectItem value="completed">{t('completed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingTask && (
                <>
                  <Separator />
                  <TaskComments taskId={editingTask.id} />
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('cancel')}</Button>
                <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
                  {editingTask ? t('saveChanges') : t('createTask')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
