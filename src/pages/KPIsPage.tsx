import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { KPIBadge } from '@/components/KPIBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

const KPIsPage = () => {
  const { currentUser, currentRole } = useAuth();
  const { departments, users, kpis, getDepartment, getInitials } = useData();
  const [selectedMonth, setSelectedMonth] = useState('10');

  const scopedDeptIds = currentRole === 'ADMIN'
    ? departments.map(d => d.id)
    : currentRole === 'DEPT_HEAD'
      ? departments.filter(d => d.deptHeadId === currentUser.id).map(d => d.id)
      : currentUser.departmentId ? [currentUser.departmentId] : [];

  const scopedUsers = users.filter(u => scopedDeptIds.includes(u.departmentId ?? -1) && u.roleId === 5);
  const monthKpis = kpis.filter(k => k.periodMonth === Number(selectedMonth));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">KPI Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Employee performance metrics</p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="h-8 text-xs w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">October 2024</SelectItem>
            <SelectItem value="9">September 2024</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(() => {
          const relevantKpis = monthKpis.filter(k => scopedUsers.some(u => u.id === k.userId));
          const avgOnTime = relevantKpis.length
            ? (relevantKpis.reduce((s, k) => s + k.onTimePercentage, 0) / relevantKpis.length).toFixed(1)
            : '—';
          const avgRating = relevantKpis.length
            ? (relevantKpis.reduce((s, k) => s + k.managerRating, 0) / relevantKpis.length).toFixed(1)
            : '—';
          const totalCompleted = relevantKpis.reduce((s, k) => s + k.tasksCompleted, 0);
          return (
            <>
              <div className="surface-card p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Avg On-Time</p>
                <p className="text-2xl font-semibold font-mono tabular-nums">{avgOnTime}%</p>
              </div>
              <div className="surface-card p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Avg Rating</p>
                <p className="text-2xl font-semibold font-mono tabular-nums">★ {avgRating}</p>
              </div>
              <div className="surface-card p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Completed</p>
                <p className="text-2xl font-semibold font-mono tabular-nums">{totalCompleted}</p>
              </div>
            </>
          );
        })()}
      </div>

      <div className="surface-card">
        <div className="grid grid-cols-[1fr_120px_100px_100px_80px] px-4 py-2 border-b border-border">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Employee</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Department</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">On-Time %</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Completed</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Rating</span>
        </div>
        <div className="divide-y divide-border">
          {scopedUsers.map(user => {
            const kpi = monthKpis.find(k => k.userId === user.id);
            const dept = getDepartment(user.departmentId ?? 0);
            return (
              <div key={user.id} className="grid grid-cols-[1fr_120px_100px_100px_80px] items-center px-4 py-3 hover:bg-accent transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-muted text-muted-foreground">{getInitials(user.fullName)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium truncate">{user.fullName}</span>
                </div>
                <span className="text-xs text-muted-foreground">{dept?.name}</span>
                {kpi ? (
                  <>
                    <KPIBadge value={kpi.onTimePercentage} suffix="%" />
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">{kpi.tasksCompleted}</span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">★ {kpi.managerRating}</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-muted-foreground">—</span>
                    <span className="text-xs text-muted-foreground">—</span>
                    <span className="text-xs text-muted-foreground">—</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KPIsPage;
