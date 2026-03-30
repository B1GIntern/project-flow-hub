import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import { EditUserDialog } from '@/components/EditUserDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const UsersPage = () => {
  const { users, departments, getDepartment, getUser, getRoleName, getInitials, updateUser, deleteUser, setUsers } = useData();
  const { hasAccess } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Search and pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  // Show which departments a user heads
  const getDeptHeadOf = (userId: string) =>
    departments.filter(d => d.deptHeadId === userId).map(d => d.name);

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    const role = getRoleName(user.roleId);
    const dept = user.departmentId ? getDepartment(user.departmentId) : null;
    
    return (
      user.fullName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      role.toLowerCase().includes(query) ||
      (dept?.name.toLowerCase().includes(query) || false)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  // Reset pagination when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">User Directory</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{filteredUsers.length} users</p>
        </div>
        {hasAccess(['ADMIN']) && (
          <Button size="sm" className="bg-violet-500 hover:bg-violet-600 text-white h-9 min-h-[36px]" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> New User
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-md">
        <Input
          placeholder="Search by name, email, or role..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="border-violet-200 focus:border-violet-500 focus:ring-violet-500"
        />
      </div>

      <div className="surface-card overflow-x-auto">
        <div className="grid grid-cols-[1fr_120px_140px_140px_140px_80px] min-w-[700px] px-4 py-2 border-b border-border">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">User</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Role</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Department</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Reports To</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Heads Of</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">ACTIONS</span>
        </div>
        <div className="divide-y divide-border">
          {paginatedUsers.map(user => {
            const role = getRoleName(user.roleId);
            const dept = user.departmentId ? getDepartment(user.departmentId) : null;
            const manager = user.managerId ? getUser(user.managerId) : null;
            const headsOf = getDeptHeadOf(user.id);
            return (
              <div key={user.id} className="grid grid-cols-[1fr_120px_140px_140px_140px_80px] items-center px-4 py-3 hover:bg-accent transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">{getInitials(user.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="w-fit text-[11px]">{role}</Badge>
                <span className="text-xs text-muted-foreground">{dept?.name ?? '—'}</span>
                <span className="text-xs text-muted-foreground">{manager?.fullName ?? '—'}</span>
                <div className="flex flex-wrap gap-1">
                  {headsOf.length > 0
                    ? headsOf.map(d => <Badge key={d} variant="outline" className="text-[10px]">{d}</Badge>)
                    : <span className="text-xs text-muted-foreground">—</span>
                  }
                </div>
                {hasAccess(['ADMIN', 'DEPT_HEAD']) && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => {
                        setSelectedUser(user);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setUserToDelete(user);
                        setDeleteDialogOpen(true);
                      }}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <div className="w-3 h-3 animate-spin rounded-full border-2 border-red-300 border-t-transparent border-r-transparent" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-violet-500 text-violet-500 hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={
                    page === currentPage
                      ? "bg-violet-500 hover:bg-violet-600 text-white"
                      : "border-violet-500 text-violet-500 hover:bg-violet-50"
                  }
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-violet-500 text-violet-500 hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
          </p>
        </div>
      )}

      <CreateUserDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      
      <EditUserDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        user={selectedUser} 
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!userToDelete) return;
                
                console.log('UsersPage: Starting deletion for user:', userToDelete);
                setIsDeleting(true);
                const result = await deleteUser(userToDelete.id);
                setIsDeleting(false);
                console.log('UsersPage: Deletion result:', result);
                
                if (result.success) {
                  console.log('UsersPage: Deletion successful, closing dialog');
                  setDeleteDialogOpen(false);
                  setUserToDelete(null);
                } else {
                  console.log('UsersPage: Deletion failed, showing error:', result.error);
                  alert(`Failed to delete user: ${result.error}`);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersPage;
