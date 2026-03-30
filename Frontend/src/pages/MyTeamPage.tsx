import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Building2, Users, Shield } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateDepartmentDialog } from '@/components/CreateDepartmentDialog';
import { ReassignUsersDialog } from '@/components/ReassignUsersDialog';

const MyTeamPage = () => {
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

  if (!currentUser) return null;

  // Get all departments for current user (handle single departmentId)
  const userDepartmentIds = currentUser.departmentId 
    ? [currentUser.departmentId]
    : [];

  const userDepartments = departments.filter(dept => 
    userDepartmentIds.includes(dept.id)
  );

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

  // If user has no department assigned
  if (userDepartments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">My Team</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">You are not assigned to any department</p>
          </div>
        </div>

        <div className="surface-card-hover p-8 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Department Assigned</h3>
          <p className="text-sm text-muted-foreground">
            You haven't been assigned to any department yet. Please contact your administrator to get assigned to a department.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">My Team</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{userDepartments.length} department{userDepartments.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="space-y-6">
        {userDepartments.map(dept => {
          const head = dept.deptHeadId ? getUser(dept.deptHeadId) : null;
          const members = getUsersByDepartment(dept.id);
          const projs = getProjectsByDepartment(dept.id);
          const activeProjs = projs.filter(p => p.status === 'ACTIVE');

          // Filter out ADMIN users from member list
          const nonAdminMembers = members.filter(user => user.roleId !== '1'); // Assuming '1' is ADMIN role ID

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
                      <Shield className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(dept)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Shield className="w-3 h-3" />
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
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Team Members ({nonAdminMembers.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {nonAdminMembers.map(member => {
                    const memberRole = getRoleName(member.roleId);
                    return (
                      <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                            {getInitials(member.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-sm font-medium text-foreground">{member.fullName}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                                <Shield className="w-3 h-3 text-primary" />
                                <span className="text-xs font-medium text-primary">{memberRole}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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

export default MyTeamPage;
