import { TaskPriority } from '@/types/models';

const colorMap: Record<TaskPriority, string> = {
  URGENT: 'bg-destructive',
  HIGH: 'bg-warning',
  MEDIUM: 'bg-primary',
  LOW: 'bg-muted-foreground',
};

export const PriorityDot = ({ priority }: { priority: TaskPriority }) => (
  <span className={`priority-dot ${colorMap[priority]}`} />
);
