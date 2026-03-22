import { TaskStatus } from '@/types/models';

const styleMap: Record<TaskStatus, string> = {
  BACKLOG: 'bg-muted text-muted-foreground',
  TODO: 'bg-muted text-muted-foreground',
  IN_PROGRESS: 'bg-primary/10 text-primary',
  REVIEW: 'bg-warning/10 text-warning',
  DONE: 'bg-success/10 text-success',
};

const labelMap: Record<TaskStatus, string> = {
  BACKLOG: 'Backlog',
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  DONE: 'Done',
};

export const StatusBadge = ({ status }: { status: TaskStatus }) => (
  <span className={`status-badge ${styleMap[status]}`}>
    {labelMap[status]}
  </span>
);
