import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  roleId: string;
  departmentId: string | null;
  managerId: string | null;
}

interface Role {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  roles: Role[];
  departments: Department[];
  users: User[];
  onSuccess?: () => void;
}

export const EditUserDialog = ({ open, onOpenChange, user, roles, departments, users, onSuccess }: EditUserDialogProps) => {
  const { getAccessToken } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [managerId, setManagerId] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper function to get role name
  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'UNKNOWN';
  };

  // Reset form when user changes or dialog opens/closes
  useEffect(() => {
    if (user && open) {
      setFullName(user.fullName);
      setEmail(user.email);
      setRoleId(String(user.roleId));
      setDepartmentId(user.departmentId ? String(user.departmentId) : 'none');
      setManagerId(user.managerId ? String(user.managerId) : 'none');
    } else {
      setFullName('');
      setEmail('');
      setRoleId('');
      setDepartmentId('');
      setManagerId('');
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !roleId || !user || loading) return;
    
    setLoading(true);
    try {
      const res = await apiFetch(`/users/${user.id}`, {
        method: 'PUT',
        getAccessToken,
        body: JSON.stringify({
          fullName,
          email,
          roleId,
          departmentId: departmentId && departmentId !== 'none' ? departmentId : null,
          managerId: managerId && managerId !== 'none' ? managerId : null,
        }),
      });

      if (res.ok) {
        onOpenChange(false);
        onSuccess?.();
      } else {
        const err = await res.json();
        alert(`Failed to update user: ${err.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Failed to update user: Network error');
    } finally {
      setLoading(false);
    }
  };

  const potentialManagers = departmentId && departmentId !== 'none'
    ? users.filter(u => u.departmentId === departmentId && ['MANAGER', 'SUPERVISOR', 'DEPT_HEAD'].includes(getRoleName(u.roleId)) && u.id !== user?.id)
    : users.filter(u => ['MANAGER', 'SUPERVISOR', 'DEPT_HEAD'].includes(getRoleName(u.roleId)) && u.id !== user?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-xs">Full Name</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Smith" disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@corp.com" disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Role</Label>
            <Select value={roleId} onValueChange={setRoleId} disabled={loading}>
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
            <Select value={departmentId} onValueChange={setDepartmentId} disabled={loading}>
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
            <Select value={managerId} onValueChange={setManagerId} disabled={loading}>
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
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
