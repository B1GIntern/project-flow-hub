import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectStatus } from '@/types/models';

interface Department {
  id: string;
  name: string;
}

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProjectId?: string;
  departments: Department[];
  onSuccess?: () => void;
}

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({ 
  open, 
  onOpenChange, 
  defaultProjectId,
  departments,
  onSuccess
}) => {
  const { getAccessToken, currentUser, currentRole } = useAuth();
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState<string | undefined>(defaultProjectId);
  const [status, setStatus] = useState<ProjectStatus>('PLANNING');
  const [loading, setLoading] = useState(false);

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
    if (!name.trim() || loading) {
      alert('Project name is required');
      return;
    }
    if (!departmentId) {
      alert('Department is required');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/projects', {
        method: 'POST',
        getAccessToken,
        body: JSON.stringify({
          name: name.trim(),
          departmentId,
          status,
        }),
      });

      if (res.ok) {
        setName('');
        setDepartmentId(undefined);
        setStatus('PLANNING');
        onOpenChange(false);
        onSuccess?.();
      } else {
        const err = await res.json();
        alert(`Failed to create project: ${err.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project: Network error');
    } finally {
      setLoading(false);
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
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={departmentId?.toString()} onValueChange={(value) => setDepartmentId(value || undefined)} disabled={loading}>
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
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)} disabled={loading}>
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
            <Button type="submit" className="bg-[#9333EA] hover:bg-[#7c3aed] text-white" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
            <Button variant="outline" className="border-violet-500 text-violet-500 hover:bg-violet-50" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
