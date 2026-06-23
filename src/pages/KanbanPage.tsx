import { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { mockTasks, DEMO_USERS, type MockTask } from '@/lib/mockData';
import { emitTaskChange, useRealtimeSync } from '@/hooks/useRealtimeSync';
import { StatusBadge } from '@/components/StatusBadge';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GripVertical, Calendar, User, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const COLUMNS = [
  { key: 'pending', colorClass: 'bg-muted-foreground' },
  { key: 'in_progress', colorClass: 'bg-info' },
  { key: 'completed', colorClass: 'bg-success' },
] as const;

type ColumnKey = typeof COLUMNS[number]['key'];

export default function KanbanPage() {
  const { user, role } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const isEmployee = role === 'employee';

  const fetchData = useCallback(() => {
    let data = mockTasks.getAll();
    if (isEmployee && user) {
      data = data.filter(t => t.assigned_to === user.id);
    }
    setTasks(data);
  }, [isEmployee, user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time sync
  const realtimeSync = useRealtimeSync((detail) => {
    fetchData();
    toast({ title: t('taskSyncedRealtime'), description: `${detail.userName}` });
  });
  useEffect(() => {
    realtimeSync.subscribe();
    return () => realtimeSync.unsubscribe();
  }, []);

  const getAssigneeName = (id: string | null) => {
    if (!id) return null;
    return DEMO_USERS.find(p => p.id === id)?.full_name ?? null;
  };

  const getColumnTasks = (status: ColumnKey) =>
    tasks.filter(t => t.status === status);

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent, column: string) => {
    e.preventDefault();
    setDragOverColumn(column);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (newStatus: ColumnKey) => {
    if (draggedTask) {
      const task = tasks.find(t => t.id === draggedTask);
      if (task && task.status !== newStatus) {
        // Employee can only move forward: pending->in_progress->completed
        if (isEmployee) {
          const order = ['pending', 'in_progress', 'completed'];
          const fromIdx = order.indexOf(task.status);
          const toIdx = order.indexOf(newStatus);
          if (toIdx < fromIdx) {
            toast({ title: t('error'), description: 'Cannot move tasks backward', variant: 'destructive' });
            setDraggedTask(null);
            setDragOverColumn(null);
            return;
          }
        }
        mockTasks.update(draggedTask, { status: newStatus });
        const userName = DEMO_USERS.find(u => u.id === user?.id)?.full_name ?? 'User';
        emitTaskChange({ type: 'update', taskId: draggedTask, userId: user?.id ?? '', userName, timestamp: new Date().toISOString() });
        toast({ title: t('taskUpdated') });
        fetchData();
      }
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const priorityColor: Record<string, string> = {
    high: 'border-l-destructive',
    medium: 'border-l-warning',
    low: 'border-l-muted-foreground',
  };

  const statusLabel: Record<string, string> = {
    pending: t('pending'),
    in_progress: t('inProgress'),
    completed: t('completed'),
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{t('kanbanBoard')}</h1>
            <p className="text-muted-foreground mt-1">{t('kanbanDesc')}</p>
          </div>
          <Badge variant="outline" className="gap-1.5 text-xs border-success/30 text-success">
            <Wifi className="h-3 w-3" />
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            {t('liveUpdates')}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:h-[calc(100vh-220px)]">
          {COLUMNS.map(col => {
            const colTasks = getColumnTasks(col.key);
            const isDragOver = dragOverColumn === col.key;
            return (
              <div
                key={col.key}
                className={`flex flex-col rounded-xl border bg-card transition-colors ${isDragOver ? 'ring-2 ring-accent/50 bg-accent/5' : ''}`}
                onDragOver={(e) => handleDragOver(e, col.key)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(col.key)}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${col.colorClass}`} />
                    <h3 className="text-sm font-semibold">{statusLabel[col.key]}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs font-mono">
                    {colTasks.length}
                  </Badge>
                </div>

                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-2.5">
                    {colTasks.map(task => (
                      <Card
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        className={`p-3 cursor-grab active:cursor-grabbing border-l-[3px] ${priorityColor[task.priority] ?? ''} transition-all hover:shadow-md ${draggedTask === task.id ? 'opacity-50 scale-95' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0 opacity-40" />
                          <div className="flex-1 min-w-0 space-y-2">
                            <p className="text-sm font-medium leading-tight">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                            )}
                            <div className="flex items-center gap-3 flex-wrap">
                              <StatusBadge value={task.priority} />
                              {task.due_date && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {task.due_date}
                                </span>
                              )}
                            </div>
                            {getAssigneeName(task.assigned_to) && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                {getAssigneeName(task.assigned_to)}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                    {colTasks.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-8">{t('noTasks')}</p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
