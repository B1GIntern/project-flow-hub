import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { ProjectStatus, Task, TaskPriority, TaskStatus } from '@/types/models';
import { PriorityDot } from '@/components/PriorityDot';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderKanban, ChevronRight, ChevronDown, Plus, Edit, Trash2, Pencil } from 'lucide-react';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';

const statusStyle: Record<ProjectStatus, string> = {
  ACTIVE: 'bg-success/10 text-success',
  PLANNING: 'bg-primary/10 text-primary',
  COMPLETED: 'bg-muted text-muted-foreground',
  ON_HOLD: 'bg-warning/10 text-warning',
};

const ProjectsPage = () => {
  const { currentUser, currentRole, hasAccess } = useAuth();
  const { departments, projects, tasks, users, getDepartment, getUser, getInitials, addProject, updateProject, deleteProject, updateTask, deleteTask } = useData();
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createTaskProjectId, setCreateTaskProjectId] = useState<string | undefined>();
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [editProject, setEditProject] = useState<string | undefined>();
  const [editProjectData, setEditProjectData] = useState<{ name: string; departmentId: string; status: ProjectStatus } | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | undefined>();
  const [deleteProjectName, setDeleteProjectName] = useState<string>('');
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [deleteTaskName, setDeleteTaskName] = useState<string>('');

  const scopedDeptIds = currentRole === 'ADMIN'
    ? departments.map(d => d.id)
    : currentRole === 'DEPT_HEAD'
      ? currentUser!.departmentId ? [currentUser!.departmentId] : []
      : currentUser!.departmentId ? [currentUser!.departmentId] : [];

  const scopedProjects = projects.filter(p => scopedDeptIds.includes(p.departmentId));

  const toggleProject = (id: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateProject = async (projectData: { name: string; departmentId: string; status?: ProjectStatus }) => {
    try {
      await addProject({
        name: projectData.name,
        departmentId: projectData.departmentId,
        status: projectData.status || 'PLANNING',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleUpdateProject = async (id: string, updates: { name?: string; departmentId?: string; status?: ProjectStatus }) => {
    try {
      await updateProject(id, updates);
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const canCreateTask = hasAccess(['ADMIN', 'DEPT_HEAD', 'MANAGER', 'SUPERVISOR']);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">Projects</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{scopedProjects.length} projects</p>
        </div>
        {hasAccess(['ADMIN', 'DEPT_HEAD', 'MANAGER']) && (
          <Button size="sm" className="bg-violet-500 hover:bg-violet-600 text-white h-9 min-h-[36px]" onClick={() => { setCreateProjectOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> New Project
          </Button>
        )}
      </div>

      <div className="surface-card overflow-x-auto">
        <div className="grid grid-cols-[1fr_140px_100px_80px_80px] min-w-[600px] px-4 py-2 border-b border-border">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Project</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Department</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-right">Tasks</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</span>
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
                  className="grid grid-cols-[1fr_120px_100px_80px_80px] items-center px-4 pl-14 py-3 hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => toggleProject(project.id)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                    <FolderKanban className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{project.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{dept?.name}</span>
                  <span className={`status-badge w-fit ${statusStyle[project.status]}`}>{project.status.replace('_', ' ')}</span>
                  <span className="text-xs font-mono tabular-nums text-muted-foreground text-right">{doneTasks.length}/{projectTasks.length}</span>
                  {hasAccess(['ADMIN', 'DEPT_HEAD', 'MANAGER']) && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setEditProject(project.id); setEditProjectData({ name: project.name, departmentId: project.departmentId, status: project.status }); }}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setDeleteProjectId(project.id); setDeleteProjectName(project.name); }}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>

                {isExpanded && projectTasks.length > 0 && (
                  <div className="bg-muted/30 border-t border-border">
                    <div className="grid grid-cols-[1fr_120px_100px_80px_40px_80px] px-4 pl-14 py-1.5 border-b border-border/50">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Task</span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Due</span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Priority</span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Assignee</span>
                    </div>
                    {projectTasks.map(task => {
                      const assignee = getUser(task.assignedTo);
                      return (
                        <div
                          key={task.id}
                          className="grid grid-cols-[1fr_120px_100px_80px_40px_80px] items-start px-4 pl-14 py-2 hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                        >
                          <div className="flex flex-col gap-2">
                            <span className="text-sm truncate">{task.title}</span>
                            {hasAccess(['ADMIN', 'DEPT_HEAD', 'MANAGER', 'SUPERVISOR']) && (
                              <div className="flex gap-2">
                                <Pencil 
                                  className="h-4 w-4 cursor-pointer hover:text-violet-600" 
                                  onClick={(e) => { e.stopPropagation(); setEditTask(task); }}
                                />
                                <Trash2 
                                  className="h-4 w-4 cursor-pointer hover:text-red-700 text-red-600" 
                                  onClick={(e) => { e.stopPropagation(); setDeleteTaskId(task.id); setDeleteTaskName(task.title); }}
                                />
                              </div>
                            )}
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
                          className="text-xs text-violet-500 hover:text-violet-600 hover:bg-violet-50 h-7"
                          onClick={(e) => { e.stopPropagation(); setCreateTaskProjectId(project.id); setCreateTaskOpen(true); }}
                        >
                          <Plus className="w-3 h-3 mr-1" /> Add Task
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {isExpanded && projectTasks.length === 0 && (
                  <div className="bg-muted/30 border-t border-border">
                    <div className="grid grid-cols-[1fr_120px_100px_80px_40px_80px] px-4 pl-14 py-1.5 border-b border-border/50">
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Task</span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Status</span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Due</span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Priority</span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Assignee</span>
                    </div>
                    <div className="px-4 pl-14 py-4">
                      <p className="text-xs text-muted-foreground">No tasks yet</p>
                    </div>
                    {canCreateTask && (
                      <div className="px-4 pl-14 py-2 border-t border-border/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-violet-500 hover:text-violet-600 hover:bg-violet-50 h-7"
                          onClick={(e) => { e.stopPropagation(); setCreateTaskProjectId(project.id); setCreateTaskOpen(true); }}
                        >
                          <Plus className="w-3 h-3 mr-1" /> Add Task
                        </Button>
                      </div>
                    )}
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

      <CreateProjectDialog open={createProjectOpen} onOpenChange={setCreateProjectOpen} />

      {/* Edit Project Modal */}
      <Dialog open={!!editProject} onOpenChange={(open) => { if (!open) { setEditProject(undefined); setEditProjectData(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {editProjectData && (
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-xs">Project Name</Label>
                <Input 
                  value={editProjectData.name} 
                  onChange={(e) => setEditProjectData(prev => prev ? { ...prev, name: e.target.value } : null)} 
                  placeholder="Project name" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Department</Label>
                <Select 
                  value={editProjectData.departmentId.toString()} 
                  onValueChange={(value) => setEditProjectData(prev => prev ? { ...prev, departmentId: value } : null)}
                >
                  <SelectTrigger className="w-full">
                    {departments.find(d => d.id === editProjectData.departmentId)?.name || 'Select department...'}
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <Select 
                  value={editProjectData.status} 
                  onValueChange={(value) => setEditProjectData(prev => prev ? { ...prev, status: value as ProjectStatus } : null)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLANNING">Planning</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button onClick={() => { if (editProjectData) { handleUpdateProject(editProject, editProjectData); setEditProject(undefined); setEditProjectData(null); } }} className="bg-violet-500 hover:bg-violet-600 text-white">
                  Save
                </Button>
                <Button variant="outline" className="border-violet-500 text-violet-500 hover:bg-violet-50" onClick={() => { setEditProject(undefined); setEditProjectData(null); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Project Warning Dialog */}
      <Dialog open={!!deleteProjectId} onOpenChange={(open) => { if (!open) { setDeleteProjectId(undefined); setDeleteProjectName(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <span className="font-semibold text-foreground">{deleteProjectName}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" className="border-violet-500 text-violet-500 hover:bg-violet-50" onClick={() => { setDeleteProjectId(undefined); setDeleteProjectName(''); }}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => { if (deleteProjectId) { handleDeleteProject(deleteProjectId); setDeleteProjectId(undefined); setDeleteProjectName(''); } }}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={!!editTask} onOpenChange={(open) => { if (!open) { setEditTask(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editTask && (
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label className="text-xs">Task Name</Label>
                <Input 
                  value={editTask.title} 
                  onChange={(e) => setEditTask(prev => prev ? { ...prev, title: e.target.value } : null)} 
                  placeholder="Task name" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <Select 
                  value={editTask.status} 
                  onValueChange={(value) => setEditTask(prev => prev ? { ...prev, status: value as TaskStatus } : null)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BACKLOG">Backlog</SelectItem>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="REVIEW">Review</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Due Date</Label>
                <Input 
                  type="date"
                  value={editTask.dueDate} 
                  onChange={(e) => setEditTask(prev => prev ? { ...prev, dueDate: e.target.value } : null)} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Priority</Label>
                <Select 
                  value={editTask.priority} 
                  onValueChange={(value) => setEditTask(prev => prev ? { ...prev, priority: value as TaskPriority } : null)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Assigned To</Label>
                <Select 
                  value={editTask.assignedTo.toString()} 
                  onValueChange={(value) => setEditTask(prev => prev ? { ...prev, assignedTo: value } : null)}
                >
                  <SelectTrigger className="w-full">
                    {getUser(editTask.assignedTo)?.fullName || 'Select assignee...'}
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button onClick={() => { if (editTask) { updateTask(editTask.id, editTask); setEditTask(null); } }} className="bg-violet-500 hover:bg-violet-600 text-white">
                  Save
                </Button>
                <Button variant="outline" className="border-violet-500 text-violet-500 hover:bg-violet-50" onClick={() => { setEditTask(null); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Task Warning Dialog */}
      <Dialog open={!!deleteTaskId} onOpenChange={(open) => { if (!open) { setDeleteTaskId(null); setDeleteTaskName(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <span className="font-semibold text-foreground">{deleteTaskName}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" className="border-violet-500 text-violet-500 hover:bg-violet-50" onClick={() => { setDeleteTaskId(null); setDeleteTaskName(''); }}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => { if (deleteTaskId) { deleteTask(deleteTaskId); setDeleteTaskId(null); setDeleteTaskName(''); } }}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsPage;
