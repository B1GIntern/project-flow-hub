import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Role {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
}

interface User {
  id: string;
  fullName: string;
  departmentId: string;
  roleId: string;
}

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Role[];
  departments: Department[];
  users: User[];
  onSuccess?: () => void;
}

export const CreateUserDialog = ({ open, onOpenChange, roles, departments, users, onSuccess }: CreateUserDialogProps) => {
  const { getAccessToken } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [managerId, setManagerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setFullName(''); setEmail(''); setRoleId(''); setDepartmentId(''); setManagerId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !roleId || roleId === '' || isSubmitting) {
      alert('Please fill in all required fields including Role');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await apiFetch('/users/register', {
        method: 'POST',
        // Don't pass getAccessToken for public endpoint
        body: JSON.stringify({
          fullName,
          email,
          password: 'tempPassword123!',
          roleId: roleId,
          departmentId: departmentId && departmentId !== 'none' ? departmentId : null,
          managerId: managerId && managerId !== 'none' ? managerId : null,
          createdAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        const err = await res.json();
        alert(`Failed to create user: ${err.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create user: Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const potentialManagers = departmentId && departmentId !== 'none'
    ? users.filter(u => u.departmentId === departmentId && ['DEPT_HEAD', 'MANAGER', 'SUPERVISOR'].includes(u.roleId))
    : users.filter(u => ['DEPT_HEAD', 'MANAGER', 'SUPERVISOR'].includes(u.roleId));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-xs">Full Name</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Smith" disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@corp.com" disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Password</Label>
            <Input value="tempPassword123!" disabled className="bg-muted" />
            <p className="text-[11px] text-muted-foreground">Default password assigned to new users</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Role</Label>
            <Select value={roleId} onValueChange={setRoleId} disabled={isSubmitting}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Department</Label>
            <Select value={departmentId} onValueChange={setDepartmentId} disabled={isSubmitting}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {departments.map(d => (
                  <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Reports To</Label>
            <Select value={managerId} onValueChange={setManagerId} disabled={isSubmitting}>
              <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {potentialManagers.map(u => (
                  <SelectItem key={u.id} value={String(u.id)}>{u.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};