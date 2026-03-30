import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectStatus } from '@/types/models';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProjectId?: string;
}

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({ 
  open, 
  onOpenChange, 
  defaultProjectId 
}) => {
  const { departments, addProject } = useData();
  const { currentUser, currentRole } = useAuth();
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState<string | undefined>(defaultProjectId);
  const [status, setStatus] = useState<ProjectStatus>('PLANNING');

  // Filter departments based on user role
  const availableDepartments = currentRole === 'ADMIN' 
    ? departments 
    : currentRole === 'DEPT_HEAD' 
      ? departments.filter(d => d.id === currentUser?.departmentId)
      : departments.filter(d => d.id === currentUser?.departmentId);

  useEffect(() => {
    if (open) {
      setName('');
      // For DEPT_HEAD, default to their department
      if (currentRole === 'DEPT_HEAD' && currentUser?.departmentId) {
        setDepartmentId(currentUser.departmentId);
      } else {
        setDepartmentId(defaultProjectId ? String(defaultProjectId) : undefined);
      }
      setStatus('PLANNING');
    } else {
      setName('');
      setDepartmentId(undefined);
      setStatus('PLANNING');
    }
  }, [open, defaultProjectId, currentRole, currentUser?.departmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Project name is required');
      return;
    }
    if (!departmentId) {
      alert('Department is required');
      return;
    }

    try {
      await addProject({
        name: name.trim(),
        departmentId,
        status,
        createdAt: new Date().toISOString()
      });
      setName('');
      setDepartmentId(undefined);
      setStatus('PLANNING');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <div>
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={departmentId?.toString()} onValueChange={(value) => setDepartmentId(value || undefined)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department..." />
                </SelectTrigger>
                <SelectContent>
                  {availableDepartments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="submit" className="bg-[#9333EA] hover:bg-[#7c3aed] text-white" onClick={handleSubmit}>
              Create
            </Button>
            <Button variant="outline" className="border-violet-500 text-violet-500 hover:bg-violet-50" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
