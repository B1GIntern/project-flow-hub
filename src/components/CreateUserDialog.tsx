import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateUserDialog = ({ open, onOpenChange }: CreateUserDialogProps) => {
  const { addUser, roles, departments, users } = useData();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [managerId, setManagerId] = useState('');

  const reset = () => {
    setFullName(''); setEmail(''); setRoleId(''); setDepartmentId(''); setManagerId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !roleId) return;
    addUser({
      fullName,
      email,
      password: 'tempPassword123!',
      roleId: Number(roleId),
      departmentId: departmentId && departmentId !== 'none' ? Number(departmentId) : null,
      managerId: managerId && managerId !== 'none' ? Number(managerId) : null,
    });
    reset();
    onOpenChange(false);
  };

  const potentialManagers = departmentId && departmentId !== 'none'
    ? users.filter(u => u.departmentId === Number(departmentId) && [2, 3, 4].includes(u.roleId))
    : users.filter(u => [2, 3, 4].includes(u.roleId));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-xs">Full Name</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Smith" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@corp.com" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Password</Label>
            <Input value="tempPassword123!" disabled className="bg-muted" />
            <p className="text-[11px] text-muted-foreground">Default password assigned to new users</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Role</Label>
            <Select value={roleId} onValueChange={setRoleId}>
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
            <Select value={departmentId} onValueChange={setDepartmentId}>
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
            <Select value={managerId} onValueChange={setManagerId}>
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
            <Button type="submit" className="flex-1">Create User</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
