export const KPIBadge = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
  const cls = value >= 90 ? 'kpi-success' : value >= 70 ? 'kpi-neutral' : 'kpi-warning';
  return (
    <span className={`${cls} px-2 py-0.5 rounded text-xs font-medium`}>
      {value}{suffix}
    </span>
  );
};
