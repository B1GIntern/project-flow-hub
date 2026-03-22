import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { ProjectStatus, Task } from '@/types/models';
import { PriorityDot } from '@/components/PriorityDot';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FolderKanban, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';

const statusStyle: Record<ProjectStatus, string> = {
  ACTIVE: 'bg-success/10 text-success',
  PLANNING: 'bg-primary/10 text-primary',
  COMPLETED: 'bg-muted text-muted-foreground',
  ON_HOLD: 'bg-warning/10 text-warning',
};

const ProjectsPage = () => {
  const { currentUser, currentRole, hasAccess } = useAuth();
  const { departments, projects, tasks, getDepartment, getUser, getInitials } = useData();
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createTaskProjectId, setCreateTaskProjectId] = useState<number | undefined>();

  const scopedDeptIds = currentRole === 'ADMIN'
    ? departments.map(d => d.id)
    : currentRole === 'DEPT_HEAD'
      ? departments.filter(d => d.deptHeadId === currentUser!.id).map(d => d.id)
      : currentUser!.departmentId ? [currentUser!.departmentId] : [];

  const scopedProjects = projects.filter(p => scopedDeptIds.includes(p.departmentId));

  const toggleProject = (id: number) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canCreateTask = hasAccess(['ADMIN', 'DEPT_HEAD', 'MANAGER', 'SUPERVISOR']);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{scopedProjects.length} projects</p>
        </div>
        {canCreateTask && (
          <Button size="sm" onClick={() => { setCreateTaskProjectId(undefined); setCreateTaskOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> New Task
          </Button>
        )}
      </div>

      <div className="surface-card">
        <div className="grid grid-cols-[1fr_140px_100px_80px] px-4 py-2 border-b border-border">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Project</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Department</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-right">Tasks</span>
        </div>
        <div className="divide-y divide-border">
          {scopedProjects.map(project => {
            const dept = getDepartment(project.departmentId);
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const doneTasks = projectTasks.filter(t => t.status === 'DONE');
            const isExpanded = expandedProjects.has(project.id);

            return (
              <div key={project.id}>
                <div
                  className="grid grid-cols-[1fr_140px_100px_80px] items-center px-4 py-3 hover:bg-accent transition-colors cursor-pointer select-none"
                  onClick={() => toggleProject(project.id)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                    <FolderKanban className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{project.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{dept?.name}</span>
                  <span className={`status-badge w-fit ${statusStyle[project.status]}`}>{project.status.replace('_', ' ')}</span>
                  <span className="text-xs font-mono tabular-nums text-muted-foreground text-right">{doneTasks.length}/{projectTasks.length}</span>
                </div>

                {isExpanded && projectTasks.length > 0 && (
                  <div className="bg-muted/30 border-t border-border">
                    <div className="grid grid-cols-[1fr_120px_100px_80px_40px] px-4 pl-14 py-1.5 border-b border-border/50">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Task</span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Due</span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Priority</span>
                      <span></span>
                    </div>
                    {projectTasks.map(task => {
                      const assignee = getUser(task.assignedTo);
                      return (
                        <div
                          key={task.id}
                          className="grid grid-cols-[1fr_120px_100px_80px_40px] items-center px-4 pl-14 py-2 hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <PriorityDot priority={task.priority} />
                            <span className="text-sm truncate">{task.title}</span>
                          </div>
                          <StatusBadge status={task.status} />
                          <span className="font-mono text-xs tabular-nums text-muted-foreground">
                            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">{task.priority.toLowerCase()}</span>
                          {assignee && (
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">{getInitials(assignee.fullName)}</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })}
                    {canCreateTask && (
                      <div className="px-4 pl-14 py-2 border-t border-border/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground h-7"
                          onClick={(e) => { e.stopPropagation(); setCreateTaskProjectId(project.id); setCreateTaskOpen(true); }}
                        >
                          <Plus className="w-3 h-3 mr-1" /> Add Task
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {isExpanded && projectTasks.length === 0 && (
                  <div className="bg-muted/30 border-t border-border px-4 pl-14 py-4">
                    <p className="text-xs text-muted-foreground">No tasks yet</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => { if (!open) setSelectedTask(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTask && <PriorityDot priority={selectedTask.priority} />}
              {selectedTask?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <StatusBadge status={selectedTask.status} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  <span className="text-sm capitalize">{selectedTask.priority.toLowerCase()}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
                  <span className="text-sm">{getUser(selectedTask.assignedTo)?.fullName ?? '—'}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created By</p>
                  <span className="text-sm">{getUser(selectedTask.createdBy)?.fullName ?? '—'}</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                  <span className="text-sm font-mono">{new Date(selectedTask.dueDate).toLocaleDateString()}</span>
                </div>
                {selectedTask.completedAt && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Completed</p>
                    <span className="text-sm font-mono">{new Date(selectedTask.completedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{selectedTask.description || 'No description'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Project</p>
                <span className="text-sm">{projects.find(p => p.id === selectedTask.projectId)?.name}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CreateTaskDialog open={createTaskOpen} onOpenChange={setCreateTaskOpen} defaultProjectId={createTaskProjectId} />
    </div>
  );
};

export default ProjectsPage;
