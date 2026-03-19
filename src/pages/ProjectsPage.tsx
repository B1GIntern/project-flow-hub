import { useAuth } from '@/contexts/AuthContext';
import { projects, departments, tasks, getDepartment } from '@/data/mockData';
import { ProjectStatus } from '@/types/models';
import { FolderKanban } from 'lucide-react';

const statusStyle: Record<ProjectStatus, string> = {
  ACTIVE: 'bg-success/10 text-success',
  PLANNING: 'bg-primary/10 text-primary',
  COMPLETED: 'bg-muted text-muted-foreground',
  ON_HOLD: 'bg-warning/10 text-warning',
};

const ProjectsPage = () => {
  const { currentUser, currentRole } = useAuth();

  const scopedDeptIds = currentRole === 'ADMIN'
    ? departments.map(d => d.id)
    : currentRole === 'DEPT_HEAD'
      ? departments.filter(d => d.deptHeadId === currentUser.id).map(d => d.id)
      : currentUser.departmentId ? [currentUser.departmentId] : [];

  const scopedProjects = projects.filter(p => scopedDeptIds.includes(p.departmentId));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Projects</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{scopedProjects.length} projects</p>
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
            return (
              <div key={project.id} className="grid grid-cols-[1fr_140px_100px_80px] items-center px-4 py-3 hover:bg-accent transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FolderKanban className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{project.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{dept?.name}</span>
                <span className={`status-badge w-fit ${statusStyle[project.status]}`}>{project.status.replace('_', ' ')}</span>
                <span className="text-xs font-mono tabular-nums text-muted-foreground text-right">
                  {doneTasks.length}/{projectTasks.length}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
