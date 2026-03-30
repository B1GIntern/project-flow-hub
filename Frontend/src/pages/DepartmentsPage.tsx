import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Building2, Plus, Pencil, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateDepartmentDialog } from '@/components/CreateDepartmentDialog';
import { ReassignUsersDialog } from '@/components/ReassignUsersDialog';

const DepartmentsPage = () => {
  const { currentUser, currentRole, hasAccess } = useAuth();
  const { departments, users, getUser, getUsersByDepartment, getProjectsByDepartment, getInitials, updateDepartment, deleteDepartment, getRoleName, reassignUsers } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [editName, setEditName] = useState('');
  const [editHeadId, setEditHeadId] = useState('');

  const scopedDepts = currentRole === 'ADMIN'
    ? departments
    : currentRole === 'DEPT_HEAD'
      ? departments.filter(d => d.deptHeadId === currentUser!.id)
      : departments.filter(d => d.id === currentUser!.departmentId);

  // Handler functions
  const openEditDialog = (dept: any) => {
    setSelectedDept(dept);
    setEditName(dept.name);
    setEditHeadId(dept.deptHeadId || '');
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept || !editName.trim()) return;
    
    const payload = {
      name: editName.trim(),
      deptHeadId: editHeadId || null
    };
    
    console.log('Frontend handleEditSubmit - Payload being sent:', payload);
    console.log('Frontend handleEditSubmit - Department ID:', selectedDept.id);
    console.log('Frontend handleEditSubmit - Payload JSON:', JSON.stringify(payload));
    
    try {
      await updateDepartment(selectedDept.id, payload);
      setEditDialogOpen(false);
      setSelectedDept(null);
    } catch (error) {
      console.error('Failed to update department:', error);
      alert('Failed to update department. Please try again.');
    }
  };

  const openDeleteDialog = (dept: any) => {
    setDeptToDelete(dept);
    
    // Check if department has users
    const deptUsers = getUsersByDepartment(dept.id);
    if (deptUsers.length > 0) {
      // Has users - show reassignment modal
      setReassignDialogOpen(true);
    } else {
      // No users - show regular delete confirmation
      setDeleteDialogOpen(true);
    }
  };

  const handleReassignAndDelete = async (newDepartmentId: string | null) => {
    if (!deptToDelete) return;
    
    try {
      // First reassign users
      await reassignUsers(deptToDelete.id, newDepartmentId);
      
      // Then delete the department
      await deleteDepartment(deptToDelete.id);
      
      setReassignDialogOpen(false);
      setDeptToDelete(null);
    } catch (error) {
      console.error('Failed to reassign users and delete department:', error);
      alert('Failed to reassign users and delete department. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!deptToDelete) return;
    
    try {
      await deleteDepartment(deptToDelete.id);
      setDeleteDialogOpen(false);
      setDeptToDelete(null);
    } catch (error) {
      console.error('Failed to delete department:', error);
      alert('Failed to delete department. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">Departments</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{scopedDepts.length} departments</p>
        </div>
        {hasAccess(['ADMIN']) && (
          <Button size="sm" className="bg-violet-500 hover:bg-violet-600 text-white h-9 min-h-[36px]" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Department
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {scopedDepts.map(dept => {
          const head = dept.deptHeadId ? getUser(dept.deptHeadId) : null;
          const members = getUsersByDepartment(dept.id);
          const projs = getProjectsByDepartment(dept.id);
          const activeProjs = projs.filter(p => p.status === 'ACTIVE');

          return (
            <div key={dept.id} className="surface-card-hover p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">{dept.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{projs.length} projects · {activeProjs.length} active</p>
                </div>
                {hasAccess(['ADMIN']) && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(dept)}
                      className="h-8 w-8 p-0 hover:bg-violet-50"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(dept)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              {head && (
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">{getInitials(head.fullName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-medium">{head.fullName}</p>
                    <p className="text-[11px] text-muted-foreground">Dept Head</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-1">
                {members.slice(0, 5).map(m => (
                  <Avatar key={m.id} className="w-6 h-6 -ml-1 first:ml-0 border-2 border-card">
                    <AvatarFallback className="text-[10px] bg-muted text-muted-foreground">{getInitials(m.fullName)}</AvatarFallback>
                  </Avatar>
                ))}
                {members.length > 5 && <span className="text-[11px] text-muted-foreground ml-1">+{members.length - 5}</span>}
                <span className="text-[11px] text-muted-foreground ml-auto">{members.length} members</span>
              </div>
            </div>
          );
        })}
      </div>

      <CreateDepartmentDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <ReassignUsersDialog 
        open={reassignDialogOpen} 
        onOpenChange={setReassignDialogOpen}
        department={deptToDelete}
        onReassignAndDelete={handleReassignAndDelete}
      />

      {/* Edit Department Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) { setSelectedDept(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-xs">Department Name</Label>
              <Input 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                placeholder="Department name" 
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="submit" className="bg-violet-500 hover:bg-violet-600 text-white">
                Save
              </Button>
              <Button type="button" variant="outline" className="border-violet-500 text-violet-500 hover:bg-violet-50" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Department Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => { if (!open) { setDeptToDelete(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <span className="font-semibold text-foreground">{deptToDelete?.name}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" className="border-violet-500 text-violet-500 hover:bg-violet-50" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white" 
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentsPage;
