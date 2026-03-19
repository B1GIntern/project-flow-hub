import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateUserDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateUserDrawer = ({ open, onOpenChange }: CreateUserDrawerProps) => {
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
      roleId: Number(roleId),
      departmentId: departmentId ? Number(departmentId) : null,
      managerId: managerId ? Number(managerId) : null,
    });
    reset();
    onOpenChange(false);
  };

  const potentialManagers = departmentId
    ? users.filter(u => u.departmentId === Number(departmentId) && [2, 3, 4].includes(u.roleId))
    : users.filter(u => [2, 3, 4].includes(u.roleId));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Create User</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label className="text-xs">Full Name</Label>
            <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Smith" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@corp.com" />
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
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">Create User</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
