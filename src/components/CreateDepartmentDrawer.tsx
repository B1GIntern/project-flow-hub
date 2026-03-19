import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateDepartmentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateDepartmentDrawer = ({ open, onOpenChange }: CreateDepartmentDrawerProps) => {
  const { addDepartment, users } = useData();
  const [name, setName] = useState('');
  const [deptHeadId, setDeptHeadId] = useState('');

  const deptHeadCandidates = users.filter(u => u.roleId === 2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addDepartment({
      name,
      deptHeadId: deptHeadId && deptHeadId !== 'none' ? Number(deptHeadId) : null,
    });
    setName(''); setDeptHeadId('');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Create Department</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label className="text-xs">Department Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Finance" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Department Head</Label>
            <Select value={deptHeadId} onValueChange={setDeptHeadId}>
              <SelectTrigger><SelectValue placeholder="Select head" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {deptHeadCandidates.map(u => (
                  <SelectItem key={u.id} value={String(u.id)}>{u.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">Create Department</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};
