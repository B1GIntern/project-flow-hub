import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Shield } from 'lucide-react';

const RolesPage = () => {
  const { roles, addRole, updateRole, deleteRole, users } = useData();
  const { hasAccess } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null); 
  const [roleName, setRoleName] = useState('');
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [deleteRoleName, setDeleteRoleName] = useState<string>('');

  const isAdmin = hasAccess(['ADMIN']);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    addRole({ name: roleName.trim().toUpperCase().replace(/\s+/g, '_') });
    setRoleName('');
    setCreateOpen(false);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim() || !editId) return;
    updateRole(editId, { name: roleName.trim().toUpperCase().replace(/\s+/g, '_') });
    setRoleName('');
    setEditOpen(false);
    setEditId(null);
  };

  const openEdit = (id: string, name: string) => { 
    setEditId(id);
    setRoleName(name);
    setEditOpen(true);
  };

  const handleDelete = (id: string) => { 
    const usersWithRole = users.filter(u => u.roleId === id); 
    if (usersWithRole.length > 0) return; 
    const role = roles.find(r => r.id === id);
    if (role) {
      setDeleteRoleId(id);
      setDeleteRoleName(role.name);
    }
  };

  const confirmDelete = () => {
    if (deleteRoleId) {
      deleteRole(deleteRoleId);
      setDeleteRoleId(null);
      setDeleteRoleName('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">Roles</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{roles.length} roles</p>
        </div>
        {isAdmin && (
          <Button size="sm" className="bg-violet-500 hover:bg-violet-600 text-white h-9 min-h-[36px]" onClick={() => { setRoleName(''); setCreateOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> New Role
          </Button>
        )}
      </div>

      <div className="surface-card">
        <div className="grid grid-cols-[1fr_100px_80px] px-4 py-2 border-b border-border">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Role Name</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Users</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</span>
        </div>
        <div className="divide-y divide-border">
          {roles.map(role => {
            const usersWithRole = users.filter(u => u.roleId === role.id);
            return (
              <div key={role.id} className="grid grid-cols-[1fr_100px_80px] items-center px-4 py-3 hover:bg-accent transition-colors">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{role.name}</span>
                </div>
                <span className="text-xs font-mono tabular-nums text-muted-foreground">{usersWithRole.length}</span>
                {isAdmin && (
                  <div className="flex items-center gap-1 justify-end">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(role.id, role.name)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-600 hover:text-red-800 hover:bg-red-50 cursor-pointer"
                      onClick={() => handleDelete(role.id)}
                      disabled={usersWithRole.length > 0}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Create Role</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-xs">Role Name</Label>
              <Input value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="e.g. TEAM_LEAD" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-violet-500 hover:bg-violet-600 text-white">Create</Button>
              <Button type="button" variant="outline" className="border-violet-500 text-violet-500 hover:bg-violet-50" onClick={() => setCreateOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Edit Role</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label className="text-xs">Role Name</Label>
              <Input value={roleName} onChange={e => setRoleName(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-violet-500 hover:bg-violet-600 text-white">Save</Button>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Role Warning Dialog */}
      <Dialog open={!!deleteRoleId} onOpenChange={(open) => { if (!open) { setDeleteRoleId(null); setDeleteRoleName(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the role <span className="font-semibold text-foreground">{deleteRoleName}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" className="border-violet-500 text-violet-500 hover:bg-violet-50" onClick={() => { setDeleteRoleId(null); setDeleteRoleName(''); }}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete}
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

export default RolesPage;