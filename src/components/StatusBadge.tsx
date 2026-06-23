import { cn } from '@/lib/utils';

const variants: Record<string, string> = {
  active: 'bg-success/10 text-success',
  inactive: 'bg-muted text-muted-foreground',
  pending: 'bg-warning/10 text-warning',
  in_progress: 'bg-info/10 text-info',
  completed: 'bg-success/10 text-success',
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-destructive/10 text-destructive',
  admin: 'bg-accent/10 text-accent',
  manager: 'bg-info/10 text-info',
  employee: 'bg-muted text-muted-foreground',
};

const labels: Record<string, string> = {
  in_progress: 'In Progress',
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', variants[value] ?? 'bg-muted text-muted-foreground')}>
      {labels[value] ?? value}
    </span>
  );
}
