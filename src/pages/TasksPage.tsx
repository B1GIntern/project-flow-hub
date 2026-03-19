import { useAuth } from '@/contexts/AuthContext';
import { tasks, projects, departments, getUser, getDepartment } from '@/data/mockData';
import { getInitials } from '@/data/mockData';
import { PriorityDot } from '@/components/PriorityDot';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import { TaskStatus, TaskPriority } from '@/types/models';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TasksPage = () => {
  const { currentUser, currentRole } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  const scopedDeptIds = currentRole === 'ADMIN'
    ? departments.map(d => d.id)
    : currentRole === 'DEPT_HEAD'
      ? departments.filter(d => d.deptHeadId === currentUser.id).map(d => d.id)
      : currentUser.departmentId ? [currentUser.departmentId] : [];

  const scopedProjectIds = projects.filter(p => scopedDeptIds.includes(p.departmentId)).map(p => p.id);

  let scopedTasks = currentRole === 'EMPLOYEE'
    ? tasks.filter(t => t.assignedTo === currentUser.id)
    : tasks.filter(t => scopedProjectIds.includes(t.projectId));

  if (statusFilter !== 'ALL') scopedTasks = scopedTasks.filter(t => t.status === statusFilter);
  if (priorityFilter !== 'ALL') scopedTasks = scopedTasks.filter(t => t.priority === priorityFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{scopedTasks.length} tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-xs w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              {(['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as TaskStatus[]).map(s => (
                <SelectItem key={s} value={s} className="text-xs">{s.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-8 text-xs w-[120px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priority</SelectItem>
              {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TaskPriority[]).map(p => (
                <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="surface-card">
        <div className="grid grid-cols-[1fr_120px_100px_80px_40px] px-4 py-2 border-b border-border">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Task</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Due</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Priority</span>
          <span></span>
        </div>
        <div className="divide-y divide-border">
          {scopedTasks.map(task => {
            const assignee = getUser(task.assignedTo);
            const project = projects.find(p => p.id === task.projectId);
            const dept = getDepartment(project?.departmentId ?? 0);
            return (
              <div key={task.id} className="grid grid-cols-[1fr_120px_100px_80px_40px] items-center px-4 py-2.5 hover:bg-accent transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <PriorityDot priority={task.priority} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{dept?.name} · {project?.name}</p>
                  </div>
                </div>
                <StatusBadge status={task.status} />
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                </span>
                <span className="text-xs text-muted-foreground capitalize">{task.priority.toLowerCase()}</span>
                {assignee && (
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">
                      {getInitials(assignee.fullName)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
