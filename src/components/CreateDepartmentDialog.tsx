import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateDepartmentDialog = ({ open, onOpenChange }: CreateDepartmentDialogProps) => {
  const { addDepartment, users } = useData();
  const [name, setName] = useState('');
  const [deptHeadId, setDeptHeadId] = useState('');

  // Any user with DEPT_HEAD role can head multiple departments
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
            <p className="text-[11px] text-muted-foreground">A user can be department head of multiple departments</p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">Create Department</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
