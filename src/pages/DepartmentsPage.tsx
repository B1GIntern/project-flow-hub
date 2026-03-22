import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Building2, Plus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CreateDepartmentDialog } from '@/components/CreateDepartmentDialog';

const DepartmentsPage = () => {
  const { currentUser, currentRole, hasAccess } = useAuth();
  const { departments, getUser, getUsersByDepartment, getProjectsByDepartment, getInitials } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);

  const scopedDepts = currentRole === 'ADMIN'
    ? departments
    : currentRole === 'DEPT_HEAD'
      ? departments.filter(d => d.deptHeadId === currentUser!.id)
      : departments.filter(d => d.id === currentUser!.departmentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Departments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{scopedDepts.length} departments</p>
        </div>
        {hasAccess(['ADMIN']) && (
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Department
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  );
};

export default DepartmentsPage;
