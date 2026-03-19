import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskPriority, TaskStatus } from '@/types/models';

interface CreateTaskDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTaskDrawer = ({ open, onOpenChange }: CreateTaskDrawerProps) => {
  const { addTask, projects, users, departments } = useData();
  const { currentUser, currentRole } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [dueDate, setDueDate] = useState('');

  // Scope projects based on role
  const scopedDeptIds = currentRole === 'ADMIN'
    ? departments.map(d => d.id)
    : currentUser.departmentId ? [currentUser.departmentId] : [];

  const scopedProjects = projects.filter(p => scopedDeptIds.includes(p.departmentId));

  // Scope assignable users based on selected project's department
  const selectedProject = projects.find(p => p.id === Number(projectId));
  const assignableUsers = selectedProject
    ? users.filter(u => u.departmentId === selectedProject.departmentId)
    : users;

  const reset = () => {
    setTitle(''); setDescription(''); setProjectId(''); setAssignedTo('');
    setPriority('MEDIUM'); setStatus('TODO'); setDueDate('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !projectId || !assignedTo || !dueDate) return;
    addTask({
      title,
      description,
      projectId: Number(projectId),
      assignedTo: Number(assignedTo),
      createdBy: currentUser.id,
      priority,
      status,
      dueDate,
      completedAt: null,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Task</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label className="text-xs">Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Details..." rows={3} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                {scopedProjects.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Assign To</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
              <SelectContent>
                {assignableUsers.map(u => (
                  <SelectItem key={u.id} value={String(u.id)}>{u.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Priority</Label>
              <Select value={priority} onValueChange={v => setPriority(v as TaskPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TaskPriority[]).map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={v => setStatus(v as TaskStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as TaskStatus[]).map(s => (
                    <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Due Date</Label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">Create Task</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
