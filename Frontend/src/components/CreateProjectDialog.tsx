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
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState<string | undefined>(defaultProjectId);
  const [status, setStatus] = useState<ProjectStatus>('PLANNING');

  useEffect(() => {
    if (open) {
      setName('');
      setDepartmentId(defaultProjectId ? String(defaultProjectId) : undefined);
      setStatus('PLANNING');
    } else {
      setName('');
      setDepartmentId(undefined);
      setStatus('PLANNING');
    }
  }, [open, defaultProjectId]);

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
          <DialogTitle>Create New Project</DialogTitle>
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
                  {departmentId ? departments.find(d => d.id === departmentId)?.name : 'Select department...'}
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
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                <SelectTrigger className="w-full">
                  <SelectItem value="PLANNING">Planning</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
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
            <Button type="submit" className="bg-violet-500 hover:bg-violet-600 text-white" onClick={handleSubmit}>
              Create Project
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
