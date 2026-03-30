export const MANAGER_ROLES = ['ADMIN', 'DEPT_HEAD', 'MANAGER', 'SUPERVISOR'] as const;
export type ManagerRole = typeof MANAGER_ROLES[number];
export const SUPERVISOR_ROLES = ['ADMIN', 'DEPT_HEAD', 'MANAGER', 'SUPERVISOR'] as const;
