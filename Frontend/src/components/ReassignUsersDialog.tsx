import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReassignUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: any;
  onReassignAndDelete: (newDepartmentId: string | null) => Promise<void>;
}

export const ReassignUsersDialog = ({ 
  open, 
  onOpenChange, 
  department, 
  onReassignAndDelete 
}: ReassignUsersDialogProps) => {
  const { departments, users, getUsersByDepartment } = useData();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get users in the department being deleted
  const departmentUsers = getUsersByDepartment(department?.id || '');
  const userCount = departmentUsers.length;

  // Get available departments for reassignment (exclude the one being deleted)
  const availableDepartments = departments.filter(d => d.id !== department?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onReassignAndDelete(selectedDepartmentId === 'none' ? null : selectedDepartmentId);
      onOpenChange(false);
      setSelectedDepartmentId('');
    } catch (error) {
      console.error('Failed to reassign users and delete department:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign Users Before Deleting</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">
            The department <span className="font-semibold text-foreground">{department?.name}</span> has{' '}
            <span className="font-semibold text-foreground">{userCount}</span> user{userCount !== 1 ? 's' : ''}. 
            Please reassign them before deleting.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Reassign users to department</Label>
              <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Leave users unassigned</SelectItem>
                  {availableDepartments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isSubmitting || !selectedDepartmentId}
              >
                {isSubmitting ? 'Processing...' : 'Reassign & Delete'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
