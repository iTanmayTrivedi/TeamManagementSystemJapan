// Real-time sync hook using CustomEvent for cross-component task updates
// In a production app this would use Supabase Realtime channels

const TASK_CHANGE_EVENT = 'realtime:task-change';

export interface TaskChangeDetail {
  type: 'insert' | 'update' | 'delete';
  taskId: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export function emitTaskChange(detail: TaskChangeDetail) {
  window.dispatchEvent(new CustomEvent(TASK_CHANGE_EVENT, { detail }));
}

export function useRealtimeSync(onTaskChange: (detail: TaskChangeDetail) => void) {
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<TaskChangeDetail>).detail;
    onTaskChange(detail);
  };

  // Use useEffect in consumer — this just returns subscribe/unsubscribe
  return {
    subscribe: () => window.addEventListener(TASK_CHANGE_EVENT, handler),
    unsubscribe: () => window.removeEventListener(TASK_CHANGE_EVENT, handler),
  };
}
