import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/hooks/useDashboard';
import { CheckSquare, FolderKanban, Users, Building2, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { KPIBadge } from '@/components/KPIBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityDot } from '@/components/PriorityDot';

const StatCard = ({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) => (
  <div className="surface-card p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="text-muted-foreground">{icon}</span>
    </div>
    <p className="text-2xl font-semibold font-mono tabular-nums">{value}</p>
  </div>
);

const DashboardPage = () => {
  const { currentUser, currentRole } = useAuth();
  const { 
    departments, 
    users, 
    projects, 
    tasks, 
    kpis, 
    getUser, 
    getDepartment, 
    getInitials,
    loading,
    error,
    refreshDashboard
  } = useDashboard();

  const scopedDepartments = currentRole === 'ADMIN'
    ? departments
    : currentRole === 'DEPT_HEAD'
      ? departments.filter(d => d.deptHeadId === currentUser!.id)
      : currentUser!.departmentId
        ? departments.filter(d => d.id === currentUser.departmentId)
        : [];

  const scopedDeptIds = scopedDepartments.map(d => d.id);
  const scopedProjects = projects.filter(p => scopedDeptIds.includes(p.departmentId));
  const scopedProjectIds = scopedProjects.map(p => p.id);

  const scopedTasks = currentRole === 'EMPLOYEE'
    ? tasks.filter(t => t.assignedTo === currentUser!.id)
    : tasks.filter(t => scopedProjectIds.includes(t.projectId));

  const scopedUsers = currentRole === 'ADMIN'
    ? users.filter(u => u.roleId === '5')
    : users.filter(u => scopedDeptIds.includes(u.departmentId ?? '') && u.roleId === '5');

  const activeTasks = scopedTasks.filter(t => t.status !== 'DONE');
  const completedTasks = scopedTasks.filter(t => t.status === 'DONE');

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Loading...</p>
        </div>
        <div className="surface-card p-8 text-center">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Error loading data</p>
        </div>
        <div className="surface-card p-8 text-center">
          <p className="text-red-600 mb-4">Failed to load dashboard: {error}</p>
          <Button onClick={refreshDashboard} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold">Dashboard</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          {currentRole === 'EMPLOYEE' ? 'Your workspace overview' : `${scopedDepartments.map(d => d.name).join(', ')} overview`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentRole !== 'EMPLOYEE' && (
          <StatCard label="Departments" value={scopedDepartments.length} icon={<Building2 className="w-4 h-4" />} />
        )}
        <StatCard label="Projects" value={scopedProjects.length} icon={<FolderKanban className="w-4 h-4" />} />
        <StatCard label="Active Tasks" value={activeTasks.length} icon={<CheckSquare className="w-4 h-4" />} />
        <StatCard label="Completed" value={completedTasks.length} icon={<TrendingUp className="w-4 h-4" />} />
        {currentRole !== 'EMPLOYEE' && (
          <StatCard label="Team Members" value={scopedUsers.length} icon={<Users className="w-4 h-4" />} />
        )}
      </div>

      <div className="surface-card">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">{currentRole === 'EMPLOYEE' ? 'My Tasks' : 'Recent Tasks'}</h2>
        </div>
        <div className="divide-y divide-border">
          {scopedTasks.slice(0, 8).map(task => {
            const assignee = getUser(task.assignedTo);
            const project = projects.find(p => p.id === task.projectId);
            return (
              <div key={task.id} className="data-table-row">
                <PriorityDot priority={task.priority} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{getDepartment(project?.departmentId ?? '')?.name} · {project?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={task.status} />
                  <span className="font-mono text-xs tabular-nums text-muted-foreground whitespace-nowrap">
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                  </span>
                  {assignee && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">{getInitials(assignee.fullName)}</AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{assignee.fullName}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
