import { useAuth } from '@/contexts/AuthContext';
import { useKPIs } from '@/hooks/useKPIs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { KPIBadge } from '@/components/KPIBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { TrendingUp, TrendingDown, Users, CheckCircle, Clock, AlertCircle, Edit } from 'lucide-react';

interface KPIData {
  id: string;
  userId: string;
  full_name: string;
  department_id: string;
  department_name: string;
  periodMonth: number;
  periodYear: number;
  tasksCompleted: number;
  on_time_percentage: number;
  managerRating: number;
}

const KPIsPage = () => {
  const { currentUser, currentRole, hasAccess, getAccessToken } = useAuth();
  const { departments, users, getDepartment, getInitials, loading: dataLoading, error: dataError, refreshData } = useKPIs();
  
  // Set current month and year as defaults
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(currentDate.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(currentDate.getFullYear()));
  
  // State for KPI data
  const [kpiData, setKpiData] = useState<KPIData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for rating edit
  const [editingRating, setEditingRating] = useState<KPIData | null>(null);
  const [ratingValue, setRatingValue] = useState<string>('');
  const [ratingLoading, setRatingLoading] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Calculate KPIs based on tasks
  const calculateKPIs = async () => {
    setCalculating(true);
    setError(null);
    try {
      const res = await apiFetch(
        `/kpis/calculate?month=${selectedMonth}&year=${selectedYear}`,
        { getAccessToken }
      );
      
      if (res.ok) {
        const data = await res.json();
        console.log('KPIs calculated:', data);
        // Refresh the data after calculation
        await fetchKpiData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || 'Failed to calculate KPIs');
      }
    } catch (err) {
      setError('Failed to calculate KPIs');
    } finally {
      setCalculating(false);
    }
  };

  // Generate year options (current year and 2 years back)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 3 }, (_, i) => currentYear - i);
  };

  // Fetch KPI data with better error handling
  const fetchKpiData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(
        `/kpis?month=${selectedMonth}&year=${selectedYear}`,
        { getAccessToken }
      );
      
      if (res.ok) {
        const data = await res.json();
        console.log('KPI data received from backend:', data);
        if (data.length > 0) {
          console.log('First employee data:', {
            id: data[0].id,
            userId: data[0].userId,
            full_name: data[0].full_name,
            on_time_percentage: data[0].on_time_percentage,
            on_time_percentage_type: typeof data[0].on_time_percentage
          });
        }
        setKpiData(data || []);
        
        // If no data, provide helpful message
        if (data.length === 0) {
          setError(`No KPI data found for ${getMonthName(parseInt(selectedMonth))} ${selectedYear}`);
        }
      } else if (res.status === 500) {
        setError('Server error calculating KPIs. This might indicate missing employee or task data.');
      } else {
        setError('Failed to fetch KPI data');
      }
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Get month name from number
  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || 'Unknown';
  };

  // Update manager rating
  const updateRating = async (kpi: KPIData, newRating: string) => {
    if (!newRating || isNaN(Number(newRating))) return;
    
    const rating = Number(newRating);
    if (rating < 0 || rating > 5) return;

    setRatingLoading(kpi.id);
    try {
      const response = await apiFetch(`/kpis/${kpi.id}`, {
        method: 'PUT',
        getAccessToken,
        body: JSON.stringify({
          userId: kpi.userId,
          periodMonth: kpi.periodMonth,
          periodYear: kpi.periodYear,
          tasksCompleted: kpi.tasksCompleted,
          onTimePercentage: kpi.on_time_percentage,
          managerRating: rating
        })
      });

      if (response.ok) {
        const updatedKPI = await response.json();
        
        // Update local state with the new ID from the database
        setKpiData(prev => prev.map(k => 
          k.id === kpi.id ? { 
            ...k, 
            managerRating: rating,
            on_time_percentage: updatedKPI.onTimePercentage || updatedKPI.on_time_percentage,
            id: updatedKPI.id // Update the ID to the real database ID
          } : k
        ));
        setEditingRating(null);
        setRatingValue('');
        
        // Optionally refresh the data to ensure consistency
        await fetchKpiData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to update rating');
      }
    } catch (err) {
      setError('Failed to update rating');
    } finally {
      setRatingLoading(null);
    }
  };

  // Open rating edit dialog
  const openRatingEdit = (kpi: KPIData) => {
    setEditingRating(kpi);
    setRatingValue(kpi.managerRating?.toString() || '0');
  };

  // Department filtering based on user role
  const getScopedDepartments = () => {
    if (currentRole === 'ADMIN') {
      return departments;
    } else if (currentRole === 'DEPT_HEAD') {
      return departments.filter(d => d.deptHeadId === currentUser?.id);
    } else if (currentUser?.departmentId) {
      return departments.filter(d => d.id === currentUser.departmentId);
    }
    return [];
  };

  // Filter KPI data based on department access
  const filteredKpiData = kpiData.filter(k => {
    const scopedDeptIds = getScopedDepartments().map(d => d.id);
    return scopedDeptIds.includes(k.department_id);
  });

  // Calculate statistics
  const calculateStats = () => {
    if (filteredKpiData.length === 0) {
      return {
        avgOnTime: '—',
        totalCompleted: 0,
        avgRating: '—',
        totalEmployees: 0
      };
    }

    const avgOnTime = (filteredKpiData.reduce((sum, k) => sum + (typeof k.on_time_percentage === 'number' ? k.on_time_percentage : 0), 0) / filteredKpiData.length).toFixed(1);
    const totalCompleted = filteredKpiData.reduce((sum, k) => sum + (typeof k.tasksCompleted === 'number' ? k.tasksCompleted : 0), 0);
    const avgRating = (filteredKpiData.reduce((sum, k) => {
      const rating = typeof k.managerRating === 'number' 
        ? k.managerRating 
        : typeof k.managerRating === 'string' && k.managerRating !== ''
          ? parseFloat(k.managerRating)
          : 0;
      return sum + rating;
    }, 0) / filteredKpiData.length).toFixed(1);

    return {
      avgOnTime,
      totalCompleted,
      avgRating,
      totalEmployees: filteredKpiData.length
    };
  };

  const stats = calculateStats();

  // Fetch on load and when filters change
  useEffect(() => {
    fetchKpiData();
  }, [selectedMonth, selectedYear]);

  // Combined loading state
  const isLoading = dataLoading || loading;
  const hasError = dataError || error;

  // Get performance level
  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { level: 'Excellent', color: 'bg-green-500' };
    if (percentage >= 75) return { level: 'Good', color: 'bg-blue-500' };
    if (percentage >= 60) return { level: 'Average', color: 'bg-yellow-500' };
    return { level: 'Needs Improvement', color: 'bg-red-500' };
  };

  return (
    <div className="space-y-6">
      {/* Header with enhanced selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">KPI Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Employee performance metrics for {getMonthName(parseInt(selectedMonth))} {selectedYear}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="h-8 text-xs w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {getMonthName(i + 1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="h-8 text-xs w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {generateYearOptions().map(year => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={calculateKPIs}
            disabled={calculating}
            size="sm"
            variant="outline"
            className="h-8 text-xs"
          >
            {calculating ? 'Calculating...' : 'Calculate KPIs'}
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              <p className="text-muted-foreground">Calculating KPI metrics...</p>
            </div>
          </CardContent>
        </Card>
      ) : hasError ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{dataError || error}</p>
            <div className="flex gap-2 justify-center">
              {dataError && (
                <Button onClick={refreshData} variant="outline" size="sm">
                  Refresh Departments/Users
                </Button>
              )}
              {error && (
                <Button onClick={fetchKpiData} variant="outline" size="sm">
                  Retry KPI Calculation
                </Button>
              )}
            </div>
            
          </CardContent>
        </Card>
      ) : filteredKpiData.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No KPI Data Available</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No employee performance data found for {getMonthName(parseInt(selectedMonth))} {selectedYear}.
            </p>
            <p className="text-xs text-muted-foreground">
              Try selecting a different month/year or ensure employees have completed tasks in this period.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg On-Time</p>
                </div>
                <p className="text-xl sm:text-2xl font-semibold font-mono tabular-nums">{stats.avgOnTime}%</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Completed</p>
                </div>
                <p className="text-xl sm:text-2xl font-semibold font-mono tabular-nums">{stats.totalCompleted}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Employees</p>
                </div>
                <p className="text-xl sm:text-2xl font-semibold font-mono tabular-nums">{stats.totalEmployees}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Rating</p>
                </div>
                <p className="text-xl sm:text-2xl font-semibold font-mono tabular-nums">{stats.avgRating}</p>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Employee Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Employee Performance Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] min-w-[600px] px-4 py-2 border-b border-border">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Employee</span>
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Department</span>
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Completed</span>
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">On-Time</span>
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Rating</span>
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Performance</span>
                </div>
                <div className="divide-y divide-border">
                  {filteredKpiData
                    .sort((a, b) => b.on_time_percentage - a.on_time_percentage)
                    .map(employee => {
                      const performance = getPerformanceLevel(employee.on_time_percentage);
                      return (
                        <div key={employee.userId} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] items-center px-4 py-3 hover:bg-accent transition-colors min-w-[600px]">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                                {getInitials(employee.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <span className="text-sm font-medium truncate block">{employee.full_name}</span>
                              <span className="text-xs text-muted-foreground">ID: {employee.userId}</span>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">{employee.department_name}</span>
                          <span className="font-mono text-xs tabular-nums text-center">{employee.tasksCompleted}</span>
                          <div className="text-center">
                            <KPIBadge value={employee.on_time_percentage} suffix="%" />
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-xs">★</span>
                              <span className="font-mono text-xs">
                                {typeof employee.managerRating === 'number' 
                                  ? employee.managerRating.toFixed(1) 
                                  : typeof employee.managerRating === 'string' && employee.managerRating !== ''
                                    ? parseFloat(employee.managerRating).toFixed(1)
                                    : '0.0'
                                }
                              </span>
                              {hasAccess(['ADMIN', 'DEPT_HEAD', 'MANAGER']) && (
                                <Dialog open={editingRating?.id === employee.id} onOpenChange={(open) => !open && setEditingRating(null)}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-6 w-6 p-0 hover:bg-muted"
                                      onClick={() => openRatingEdit(employee)}
                                      disabled={ratingLoading === employee.id}
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Update Rating</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="rating">Rating (0-5)</Label>
                                        <Input
                                          id="rating"
                                          type="number"
                                          min="0"
                                          max="5"
                                          step="0.5"
                                          value={ratingValue}
                                          onChange={(e) => setRatingValue(e.target.value)}
                                          placeholder="Enter rating (0-5)"
                                        />
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <Button 
                                          variant="outline" 
                                          onClick={() => setEditingRating(null)}
                                          disabled={ratingLoading === employee.id}
                                        >
                                          Cancel
                                        </Button>
                                        <Button 
                                          onClick={() => updateRating(employee, ratingValue)}
                                          disabled={ratingLoading === employee.id}
                                        >
                                          {ratingLoading === employee.id ? 'Updating...' : 'Update'}
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                          <div className="text-center">
                            <Badge variant="secondary" className="text-xs">
                              {performance.level}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default KPIsPage;

