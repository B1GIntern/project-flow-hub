import { users, departments, getRoleName, getDepartment, getUser, getInitials } from '@/data/mockData';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const UsersPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">User Directory</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{users.length} users</p>
      </div>

      <div className="surface-card">
        <div className="grid grid-cols-[1fr_120px_140px_140px] px-4 py-2 border-b border-border">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">User</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Role</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Department</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Reports To</span>
        </div>
        <div className="divide-y divide-border">
          {users.map(user => {
            const role = getRoleName(user.roleId);
            const dept = user.departmentId ? getDepartment(user.departmentId) : null;
            const manager = user.managerId ? getUser(user.managerId) : null;
            return (
              <div key={user.id} className="grid grid-cols-[1fr_120px_140px_140px] items-center px-4 py-3 hover:bg-accent transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="w-fit text-[11px]">{role}</Badge>
                <span className="text-xs text-muted-foreground">{dept?.name ?? '—'}</span>
                <span className="text-xs text-muted-foreground">{manager?.fullName ?? '—'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
