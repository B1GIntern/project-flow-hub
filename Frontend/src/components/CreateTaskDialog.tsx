import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskPriority, TaskStatus } from '@/types/models';

interface User {
  id: string;
  fullName: string;
  departmentId: string;
}

interface Department {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  departmentId: string;
}

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProjectId?: string;
  projects: Project[];
  users: User[];
  departments: Department[];
  onSuccess?: () => void;
}

export const CreateTaskDialog = ({ 
  open, 
  onOpenChange, 
  defaultProjectId,
  projects,
  users,
  departments,
  onSuccess
}: CreateTaskDialogProps) => {
  const { getAccessToken, currentUser, currentRole } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && defaultProjectId) setProjectId(defaultProjectId);
  }, [open, defaultProjectId]);

  const scopedDeptIds = currentRole === 'ADMIN'
    ? departments.map(d => d.id)
    : currentUser!.departmentId ? [currentUser!.departmentId] : [];

  const scopedProjects = projects.filter(p => scopedDeptIds.includes(p.departmentId));

  const selectedProject = projects.find(p => p.id === projectId);
  const assignableUsers = selectedProject
    ? users.filter(u => u.departmentId === selectedProject.departmentId)
    : users;

  const reset = () => {
    setTitle(''); setDescription(''); setProjectId(''); setAssignedTo('');
    setPriority('MEDIUM'); setStatus('TODO'); setDueDate('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !projectId || !assignedTo || !dueDate || loading) {
      alert('Task title, project, assigned user, and due date are required');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/tasks', {
        method: 'POST',
        getAccessToken,
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          projectId: projectId,
          assignedTo: assignedTo,
          priority,
          status,
          dueDate: dueDate || null,
          createdBy: String(currentUser!.id),
        }),
      });

      if (res.ok) {
        reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        const err = await res.json();
        alert(`Failed to create task: ${err.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task: Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-xs">Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Details..." rows={3} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Project</Label>
            <Select value={projectId} onValueChange={setProjectId} disabled={loading}>
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
            <Select value={assignedTo} onValueChange={setAssignedTo} disabled={loading}>
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
              <Select value={priority} onValueChange={v => setPriority(v as TaskPriority)} disabled={loading}>
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
              <Select value={status} onValueChange={v => setStatus(v as TaskStatus)} disabled={loading}>
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
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} disabled={loading} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1 bg-violet-500 hover:bg-violet-600 text-white" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
            <Button type="button" variant="outline" className="border-violet-500 text-violet-500 hover:bg-violet-50" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
