
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Role, AppState, Employee, AttendanceRecord, LeaveStatus, LeaveRequest, GeofenceConfig, EmployeeStatus, ThemeMode, NotificationConfig } from './types';
import { INITIAL_STATE } from './constants';
import { getCurrentPosition, calculateDistance } from './utils/geo';
import { downloadAttendanceCSV } from './utils/csv';
import { emailService, SentMail } from './utils/email';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Settings,
  LogOut,
  CheckCircle,
  XCircle,
  MapPin,
  FileDown,
  Plus,
  Trash2,
  Bell,
  Edit2,
  Search,
  Key,
  Sun,
  Moon,
  Filter,
  Menu,
  X,
  FileText,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Printer,
  Mail,
  Smartphone,
  Info,
  ShieldAlert,
  Send,
  Save
} from 'lucide-react';

// --- Shared Helper Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const Card = ({ children, title, icon: Icon, extra, className = "" }: any) => (
  <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-gray-50 dark:border-gray-800 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
      <div className="flex items-center space-x-2 text-gray-800 dark:text-gray-100">
        {Icon && <Icon size={18} className="text-blue-500" />}
        <h3 className="font-semibold">{title}</h3>
      </div>
      {extra}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const PasswordStrengthMeter = ({ password }: { password: string }) => {
  const getStrength = (p: string) => {
    if (!p) return { score: 0, label: 'None', color: 'bg-gray-200' };
    let score = 0;
    if (p.length > 5) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = getStrength(password);
  return (
    <div className="mt-1 space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase font-bold text-gray-400">Security</span>
        <span className={`text-[10px] font-bold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${strength.color}`} 
          style={{ width: `${(strength.score / 4) * 100}%` }}
        />
      </div>
    </div>
  );
};

// --- Helper for Date Display ---
const formatDisplayDateTime = (iso: string | null) => {
  if (!iso) return "--:--:--";
  const dateObj = new Date(iso);
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  const ss = String(dateObj.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

const formatDisplayTime = (iso: string | null) => {
  if (!iso) return "--:--:--";
  const dateObj = new Date(iso);
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  const ss = String(dateObj.getSeconds()).padStart(2, '0');
  return `${hh}:${min}:${ss}`;
};

// --- View Sub-Components ---

const DashboardView = ({ currentUser, locationError, todayRecord, handlePunch, punching, notifications }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card title="Attendance status" icon={Clock}>
        <div className="text-center py-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-6 ${locationError ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 'bg-green-100 text-green-700 dark:bg-green-900/30'}`}>
            <MapPin size={12} className="mr-1" />
            {locationError ? 'Out of Range' : 'Office Zone Active'}
          </div>
          <div className="flex flex-col items-center space-y-4">
             <p className="text-2xl font-bold dark:text-white">
               {todayRecord?.checkInTime ? formatDisplayTime(todayRecord.checkInTime) : "--:--:--"}
             </p>
             <button onClick={handlePunch} disabled={punching} className={`w-full max-w-[180px] py-4 rounded-xl font-bold text-white shadow-xl transform active:scale-95 transition-all ${todayRecord?.checkInTime && !todayRecord?.checkOutTime ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
               {punching ? '...' : todayRecord?.checkInTime && !todayRecord?.checkOutTime ? 'Punch Out' : 'Punch In'}
             </button>
          </div>
        </div>
      </Card>

      <Card title="My Profile" icon={Users}>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">{currentUser?.name.charAt(0)}</div>
            <div><p className="font-bold dark:text-white">{currentUser?.name}</p><p className="text-sm text-gray-500">{currentUser?.designation}</p></div>
          </div>
          <div className="pt-4 border-t dark:border-gray-800 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Department</span><span className="font-medium dark:text-gray-200">{currentUser?.department}</span></div>
            <div className="flex justify-between text-sm bg-blue-50 dark:bg-blue-900/10 p-2 rounded-lg"><span className="text-blue-600 dark:text-blue-400 font-bold">Leave Balance</span><span className="font-bold text-blue-700 dark:text-blue-300">{currentUser?.leaveBalance} Days</span></div>
          </div>
        </div>
      </Card>

      <Card title="Recent Activity" icon={Bell}>
         <div className="space-y-3">
           {notifications.map((n: string, i: number) => (
             <div key={i} className="flex items-start space-x-2 text-sm p-2 bg-gray-50 dark:bg-gray-800/50 rounded"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" /><p className="text-gray-600 dark:text-gray-300">{n}</p></div>
           ))}
           {notifications.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">No recent activity</p>}
         </div>
      </Card>
    </div>
  </div>
);

const EmployeeFormModal = ({ isOpen, onClose, editingEmployee, saveEmployee, getTodayString }: any) => {
  const [localPassword, setLocalPassword] = useState("");
  useEffect(() => { setLocalPassword(editingEmployee?.password || ""); }, [editingEmployee]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden my-auto animate-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
          <h3 className="text-lg font-bold dark:text-white">{editingEmployee ? "Update Employee" : "Register New Employee"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={20} /></button>
        </div>
        <form className="p-6 space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as any;
          const employeeData: Employee = {
            id: editingEmployee?.id || `EMP${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            name: form.empName.value,
            email: form.email.value,
            password: localPassword,
            designation: form.designation.value,
            department: form.department.value,
            status: form.status.value as EmployeeStatus,
            role: form.role.value as Role,
            leaveBalance: editingEmployee?.leaveBalance ?? 20,
            joinedDate: editingEmployee?.joinedDate || getTodayString()
          };
          saveEmployee(employeeData);
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label><input name="empName" type="text" defaultValue={editingEmployee?.name} className="w-full border dark:border-gray-700 bg-transparent rounded-lg p-2 text-sm dark:text-white" placeholder="Jane Doe" required /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label><input name="email" type="email" defaultValue={editingEmployee?.email} className="w-full border dark:border-gray-700 bg-transparent rounded-lg p-2 text-sm dark:text-white" placeholder="jane@company.com" required /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label><input name="password" type="text" value={localPassword} className="w-full border dark:border-gray-700 bg-transparent rounded-lg p-2 text-sm dark:text-white" required onChange={(e) => setLocalPassword(e.target.value)} /><PasswordStrengthMeter password={localPassword} /></div>
            </div>
            <div className="space-y-4">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Designation</label><input name="designation" type="text" defaultValue={editingEmployee?.designation} className="w-full border dark:border-gray-700 bg-transparent rounded-lg p-2 text-sm dark:text-white" placeholder="UX Designer" required /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Department</label><select name="department" defaultValue={editingEmployee?.department || "IT"} className="w-full border dark:border-gray-700 bg-transparent rounded-lg p-2 text-sm dark:text-white"><option value="IT">IT</option><option value="Engineering">Engineering</option><option value="HR">HR</option><option value="Finance">Finance</option></select></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label><select name="status" defaultValue={editingEmployee?.status || "Active"} className="w-full border dark:border-gray-700 bg-transparent rounded-lg p-2 text-sm dark:text-white"><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label><select name="role" defaultValue={editingEmployee?.role || Role.EMPLOYEE} className="w-full border dark:border-gray-700 bg-transparent rounded-lg p-2 text-sm dark:text-white"><option value={Role.EMPLOYEE}>Employee</option><option value={Role.ADMIN}>Admin</option></select></div>
              </div>
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 dark:shadow-none transition-all">{editingEmployee ? "Update Record" : "Create Record"}</button>
        </form>
      </div>
    </div>
  );
};

const AttendanceReportView = ({ records, downloadCsv, monthId, attendanceSearch, setAttendanceSearch, attendanceDateFilter, setAttendanceDateFilter, isAdmin, onEdit, onDelete }: any) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editIn, setEditIn] = useState("");
  const [editOut, setEditOut] = useState("");

  const startEdit = (record: AttendanceRecord) => {
    setEditingId(record.id);
    setEditIn(record.checkInTime ? new Date(record.checkInTime).toISOString().slice(0, 16) : "");
    setEditOut(record.checkOutTime ? new Date(record.checkOutTime).toISOString().slice(0, 16) : "");
  };

  const handleSaveEdit = (id: string) => {
    onEdit(id, editIn, editOut);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <h3 className="text-xl font-bold dark:text-white">Attendance Logs</h3>
        <button onClick={() => downloadCsv(records, `Attendance_${monthId}`)} className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border dark:border-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"><FileDown size={18} /> <span>Export CSV</span></button>
      </div>
      <Card title="Movement Records" icon={Clock} extra={<div className="flex flex-col sm:flex-row items-start sm:items-center gap-2"><div className="relative w-full sm:w-auto"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Name or ID..." className="pl-9 pr-4 py-1.5 border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs outline-none dark:text-white w-full sm:w-32 md:w-48" value={attendanceSearch} onChange={(e) => setAttendanceSearch(e.target.value)} /></div><div className="relative w-full sm:w-auto"><Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="date" className="pl-9 pr-4 py-1.5 border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs outline-none dark:text-white w-full sm:w-auto" value={attendanceDateFilter} onChange={(e) => setAttendanceDateFilter(e.target.value)} /></div></div>}>
        <div className="overflow-x-auto -mx-6"><table className="w-full text-left min-w-[700px]"><thead><tr className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b dark:border-gray-800"><th className="pb-3 px-6">Employee</th><th className="pb-3 px-6">Date & Time</th><th className="pb-3 px-6">Check In</th><th className="pb-3 px-6">Check Out</th><th className="pb-3 px-6 text-right">Hours</th>{isAdmin && <th className="pb-3 px-6 text-right">Actions</th>}</tr></thead><tbody className="text-sm divide-y dark:divide-gray-800">{records.map((r: AttendanceRecord, i: number) => (
          <tr key={r.id || i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <td className="py-4 px-6"><p className="font-bold dark:text-gray-100">{r.employeeName}</p><p className="text-xs text-gray-500">{r.employeeId}</p></td>
            <td className="py-4 px-6 dark:text-gray-300 font-medium">{formatDisplayDateTime(r.checkInTime)}</td>
            <td className="py-4 px-6 text-green-600 dark:text-green-400 font-bold">
              {editingId === r.id ? (
                <input type="datetime-local" value={editIn} className="text-xs p-1 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded" onChange={(e) => setEditIn(e.target.value)} />
              ) : (
                <div className="flex items-center"><CheckCircle size={14} className="mr-1.5" />{r.checkInTime ? formatDisplayTime(r.checkInTime) : "--:--:--"}</div>
              )}
            </td>
            <td className="py-4 px-6 text-red-600 dark:text-red-400 font-bold">
              {editingId === r.id ? (
                <input type="datetime-local" value={editOut} className="text-xs p-1 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded" onChange={(e) => setEditOut(e.target.value)} />
              ) : (
                <div className="flex items-center"><LogOut size={14} className="mr-1.5" />{r.checkOutTime ? formatDisplayTime(r.checkOutTime) : "--:--:--"}</div>
              )}
            </td>
            <td className="py-4 px-6 text-right"><span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded font-bold">{r.totalWorkingHours.toFixed(2)}h</span></td>
            {isAdmin && (
              <td className="py-4 px-6 text-right">
                <div className="flex justify-end gap-2">
                  {editingId === r.id ? (
                    <>
                      <button onClick={() => handleSaveEdit(r.id)} className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors" title="Save"><Save size={14} /></button>
                      <button onClick={handleCancelEdit} className="p-1.5 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors" title="Cancel"><X size={14} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(r)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors" title="Edit"><Edit2 size={14} /></button>
                      <button onClick={() => onDelete(r.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Delete"><Trash2 size={14} /></button>
                    </>
                  )}
                </div>
              </td>
            )}
          </tr>
        ))}</tbody></table></div>
      </Card>
    </div>
  );
};

// --- Reports View Component ---
const ReportsView = ({ state }: { state: AppState }) => {
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'overtime' | 'absence' | 'late'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM

  const getMonthKey = (dateStr: string) => {
    const parts = dateStr.split('-');
    return `${parts[1]}_${parts[0]}`;
  };

  const monthKey = useMemo(() => {
    const baseDate = (reportType === 'daily' || reportType === 'absence') ? selectedDate : (selectedMonth + "-01");
    return getMonthKey(baseDate);
  }, [reportType, selectedDate, selectedMonth]);

  const allMonthRecords = state.attendance[monthKey] || [];

  const reportData = useMemo(() => {
    switch (reportType) {
      case 'daily':
        return allMonthRecords.filter(r => r.date === selectedDate);
      case 'monthly':
        const monthlyAgg: any[] = [];
        state.employees.forEach(emp => {
          const empRecs = allMonthRecords.filter(r => r.employeeId === emp.id);
          const totalHours = empRecs.reduce((acc, curr) => acc + curr.totalWorkingHours, 0);
          const presentDays = empRecs.length;
          monthlyAgg.push({ 
            employeeId: emp.id, 
            employeeName: emp.name, 
            totalHours, 
            presentDays,
            department: emp.department
          });
        });
        return monthlyAgg;
      case 'overtime':
        return allMonthRecords.filter(r => r.totalWorkingHours > 8);
      case 'late':
        return allMonthRecords.filter(r => {
          if (!r.checkInTime) return false;
          const checkInDate = new Date(r.checkInTime);
          const h = checkInDate.getHours();
          const m = checkInDate.getMinutes();
          return (h > 9 || (h === 9 && m > 30));
        });
      case 'absence':
        const day = new Date(selectedDate).getDay();
        if (day === 0 || day === 6) return []; 
        const presentIds = allMonthRecords.filter(r => r.date === selectedDate).map(r => r.employeeId);
        return state.employees.filter(emp => !presentIds.includes(emp.id) && emp.status === 'Active');
      default:
        return [];
    }
  }, [reportType, selectedDate, allMonthRecords, state.employees]);

  const analytics = useMemo(() => {
    const recordsToAnalyze = (reportType === 'daily' || reportType === 'absence') 
      ? allMonthRecords.filter(r => r.date === selectedDate) 
      : allMonthRecords;
    
    const totalWorkingHours = recordsToAnalyze.reduce((acc, curr) => acc + curr.totalWorkingHours, 0);
    const avgWorkingHours = recordsToAnalyze.length > 0 ? totalWorkingHours / recordsToAnalyze.length : 0;
    const overtimeCount = recordsToAnalyze.filter(r => r.totalWorkingHours > 8).length;
    
    return {
      totalWorkingHours: totalWorkingHours.toFixed(2),
      avgWorkingHours: avgWorkingHours.toFixed(2),
      overtimeCount,
      workforceCount: state.employees.filter(e => e.status === 'Active').length,
    };
  }, [reportType, selectedDate, allMonthRecords, state.employees]);

  const handlePrint = () => { window.print(); };
  const exportCSV = () => {
    const headers = reportType === 'monthly' ? ['ID', 'Name', 'Dept', 'Total Hours', 'Days Present'] :
                   reportType === 'absence' ? ['ID', 'Name', 'Dept', 'Status'] :
                   ['ID', 'Name', 'Date/Time', 'In', 'Out', 'Hours'];
    const rows = reportData.map((d: any) => {
      if (reportType === 'monthly') return [d.employeeId, d.employeeName, d.department, d.totalHours.toFixed(2), d.presentDays];
      if (reportType === 'absence') return [d.id, d.name, d.department, 'Absent'];
      return [d.employeeId, d.employeeName, formatDisplayDateTime(d.checkInTime), d.checkInTime ? formatDisplayTime(d.checkInTime) : '-', d.checkOutTime ? formatDisplayTime(d.checkOutTime) : '-', d.totalWorkingHours.toFixed(2)];
    });
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Report_${reportType}_${selectedDate}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Workforce', value: analytics.workforceCount, icon: Users, color: 'text-blue-500' },
          { label: 'Avg Shift Duration', value: `${analytics.avgWorkingHours}h`, icon: Clock, color: 'text-green-500' },
          { label: 'Overtime Cases', value: analytics.overtimeCount, icon: TrendingUp, color: 'text-amber-500' },
          { label: 'Period Workload', value: `${analytics.totalWorkingHours}h`, icon: BarChart3, color: 'text-indigo-500' },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border dark:border-gray-800 flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-800 ${item.color}`}><item.icon size={20} /></div>
            <div><p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">{item.label}</p><p className="text-lg font-bold dark:text-white">{item.value}</p></div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto whitespace-nowrap scrollbar-hide">
          {(['daily', 'monthly', 'overtime', 'absence', 'late'] as const).map(type => (
            <button key={type} onClick={() => setReportType(type)} className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${reportType === type ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{type} report</button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          {reportType === 'daily' || reportType === 'absence' ? (
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="px-3 py-1.5 border dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 dark:text-white" />
          ) : (
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-3 py-1.5 border dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 dark:text-white" />
          )}
        </div>
        <div className="flex items-center space-x-2 ml-auto">
          <button onClick={exportCSV} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-md transition-all" title="Export CSV"><FileDown size={18} /></button>
          <button onClick={handlePrint} className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow-md transition-all" title="Export PDF (Print View)"><Printer size={18} /></button>
        </div>
      </div>
      <Card title={`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Attendance Details`} icon={FileText} className="print:shadow-none print:border-none">
        <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b dark:border-gray-800"><th className="pb-3 px-4">Employee</th>{reportType === 'monthly' ? (<><th className="pb-3 px-4">Department</th><th className="pb-3 px-4">Days Present</th><th className="pb-3 px-4 text-right">Total Hours</th></>) : reportType === 'absence' ? (<><th className="pb-3 px-4">Department</th><th className="pb-3 px-4 text-right">Status</th></>) : (<><th className="pb-3 px-4">Date/Time</th><th className="pb-3 px-4">In</th><th className="pb-3 px-4">Out</th><th className="pb-3 px-4 text-right">Hours</th></>)}</tr></thead><tbody className="text-sm divide-y dark:divide-gray-800">{reportData.map((d: any, i: number) => (<tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"><td className="py-4 px-4 font-bold dark:text-gray-100">{d.employeeName || d.name}</td>{reportType === 'monthly' ? (<><td className="py-4 px-4 dark:text-gray-400">{d.department}</td><td className="py-4 px-4 dark:text-gray-300 font-medium">{d.presentDays} Days</td><td className="py-4 px-4 text-right font-bold text-blue-600 dark:text-blue-400">{d.totalHours.toFixed(2)}h</td></>) : reportType === 'absence' ? (<><td className="py-4 px-4 dark:text-gray-400">{d.department}</td><td className="py-4 px-4 text-right"><span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-[10px] font-bold uppercase">Absent</span></td></>) : (<><td className="py-4 px-4 dark:text-gray-400">{formatDisplayDateTime(d.checkInTime)}</td><td className="py-4 px-4 text-green-600 font-medium">{d.checkInTime ? formatDisplayTime(d.checkInTime) : '--:--:--'}</td><td className="py-4 px-4 text-red-600 font-medium">{d.checkOutTime ? formatDisplayTime(d.checkOutTime) : '--:--:--'}</td><td className="py-4 px-4 text-right font-bold text-blue-600 dark:text-blue-400">{d.totalWorkingHours.toFixed(2)}h</td></>)}</tr>))}{reportData.length === 0 && (<tr><td colSpan={6} className="py-12 text-center text-gray-400 italic">No matching records found for this period.</td></tr>)}</tbody></table></div>
      </Card>
    </div>
  );
};

const NotificationSettingsView = ({ currentUser, saveSettings }: { currentUser: Employee, saveSettings: (settings: NotificationConfig) => void }) => {
  const [localSettings, setLocalSettings] = useState<NotificationConfig>(currentUser.notificationSettings || {
    leaveRequests: true,
    attendanceUpdates: true,
    companyAnnouncements: true,
    performanceNotifications: true,
    emailDelivery: true,
    pushDelivery: false
  });

  const [mailHistory, setMailHistory] = useState<SentMail[]>(emailService.getHistory());

  useEffect(() => {
    const interval = setInterval(() => {
      setMailHistory(emailService.getHistory());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggle = (key: keyof NotificationConfig) => {
    setLocalSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    saveSettings(localSettings);
  };

  const SettingRow = ({ label, description, icon: Icon, active, onToggle }: any) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl">
      <div className="flex items-center space-x-4">
        <div className={`p-2 rounded-lg ${active ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm font-bold dark:text-white">{label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <button 
        onClick={onToggle}
        className={`w-12 h-6 rounded-full p-1 transition-colors relative ${active ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
      >
        <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${active ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
            <Bell className="text-blue-500" /> Notification Preferences
          </h3>
          <p className="text-sm text-gray-500 mt-1">Manage automated alerts and email correspondence.</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Alert Categories</p>
            <SettingRow label="Leave Requests" description="Status updates and administrative approvals." icon={CalendarDays} active={localSettings.leaveRequests} onToggle={() => toggle('leaveRequests')} />
            <SettingRow label="Attendance Updates" description="Clock-in/out and geofence alerts." icon={Clock} active={localSettings.attendanceUpdates} onToggle={() => toggle('attendanceUpdates')} />
            <SettingRow label="System Announcements" description="Important corporate news and events." icon={Info} active={localSettings.companyAnnouncements} onToggle={() => toggle('companyAnnouncements')} />
            <SettingRow label="Performance Digests" description="Automated monthly and weekly analytics." icon={TrendingUp} active={localSettings.performanceNotifications} onToggle={() => toggle('performanceNotifications')} />
          </div>

          <div className="space-y-3 pt-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Global Delivery Channels</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => toggle('emailDelivery')} className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${localSettings.emailDelivery ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400'}`}>
                <Mail size={24} /><span className="text-xs font-bold">Email Notifications</span>
              </button>
              <button onClick={() => toggle('pushDelivery')} className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${localSettings.pushDelivery ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400'}`}>
                <Smartphone size={24} /><span className="text-xs font-bold">Push Alerts</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t dark:border-gray-800 flex justify-end">
          <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 dark:shadow-none transition-all flex items-center gap-2">
            <CheckCircle size={18} /> Save Settings
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-bold dark:text-white flex items-center gap-2">
          <Send className="text-blue-500" size={16} /> Sent Mail Log (Real-time)
        </h4>
        <div className="bg-white dark:bg-gray-950 border dark:border-gray-800 rounded-2xl p-4 h-[600px] overflow-y-auto space-y-3 shadow-inner">
          {mailHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <Mail size={32} className="mb-2 text-gray-400" />
              <p className="text-xs text-gray-500 italic">No emails sent yet</p>
            </div>
          ) : (
            mailHistory.map((mail) => (
              <div key={mail.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border dark:border-gray-800 animate-in slide-in-from-right-2 duration-300">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{mail.type}</p>
                  <p className="text-[10px] text-gray-400">{mail.timestamp}</p>
                </div>
                <p className="text-xs font-bold dark:text-gray-100 truncate">To: {mail.to}</p>
                <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400 mt-1">{mail.subject}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const LoginView = ({ handleLogin, loginError }: any) => (
  <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50 dark:bg-black">
    <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 space-y-8 animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-gray-800">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-200 dark:shadow-none mb-4">
          <Clock size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">GeoAttend</h1>
        <p className="text-gray-500 dark:text-gray-400">Enterprise Geofencing Attendance</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Email Address</label>
            <input name="email" type="email" required className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" placeholder="admin@geoattend.com" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">Password</label>
            <input name="password" type="password" required className="w-full pl-4 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white" placeholder="••••••••" />
          </div>
        </div>
        {loginError && (<div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-xl flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm"><AlertCircle size={16} /><span className="font-medium">{loginError}</span></div>)}
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-100 dark:shadow-none transition-all transform active:scale-[0.98]">Sign In</button>
      </form>
    </div>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('geoattend_state');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    const savedUser = localStorage.getItem('geoattend_current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'attendance' | 'leaves' | 'settings' | 'reports' | 'notifications'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [punching, setPunching] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [attendanceDateFilter, setAttendanceDateFilter] = useState("");

  useEffect(() => {
    localStorage.setItem('geoattend_state', JSON.stringify(state));
    if (state.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [state]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('geoattend_current_user', JSON.stringify(currentUser));
      setState(prev => ({
        ...prev,
        employees: prev.employees.map(e => e.id === currentUser.id ? currentUser : e)
      }));
    } else {
      localStorage.removeItem('geoattend_current_user');
    }
  }, [currentUser]);

  const toggleTheme = () => setState(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  const addNotification = (msg: string) => setNotifications(prev => [msg, ...prev].slice(0, 5));
  const getTodayString = () => new Date().toISOString().split('T')[0];
  const getMonthId = (dateStr: string = getTodayString()) => {
    const d = new Date(dateStr);
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${m}_${d.getFullYear()}`;
  };

  const todayRecord = useMemo(() => {
    if (!currentUser) return null;
    const monthId = getMonthId();
    const records = state.attendance[monthId] || [];
    return records.find(r => r.employeeId === currentUser.id && r.date === getTodayString());
  }, [state.attendance, currentUser]);

  const filteredEmployees = useMemo(() => {
    return state.employees.filter(emp => 
      emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.id.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      emp.department.toLowerCase().includes(employeeSearch.toLowerCase())
    );
  }, [state.employees, employeeSearch]);

  const currentMonthRecords = useMemo(() => {
    const monthId = getMonthId();
    return (state.attendance[monthId] || [])
      .filter(record => {
        const matchesSearch = record.employeeName.toLowerCase().includes(attendanceSearch.toLowerCase()) || 
                             record.employeeId.toLowerCase().includes(attendanceSearch.toLowerCase());
        const matchesDate = attendanceDateFilter ? record.date === attendanceDateFilter : true;
        return matchesSearch && matchesDate;
      })
      .sort((a, b) => (b.checkInTime || '').localeCompare(a.checkInTime || ''));
  }, [state.attendance, attendanceSearch, attendanceDateFilter]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const user = state.employees.find(emp => emp.email === email && emp.password === password);
    if (user) {
      if (user.status === 'Inactive') {
        setLoginError('Your account is inactive.');
        return;
      }
      setCurrentUser(user);
      setLoginError(null);
      addNotification(`Welcome back, ${user.name}!`);
    } else {
      setLoginError('Invalid email or password.');
    }
  };

  const handleLogout = () => { setCurrentUser(null); setActiveTab('dashboard'); setIsSidebarOpen(false); };

  const handlePunch = async () => {
    if (!currentUser) return;
    setPunching(true); setLocationError(null);
    try {
      const pos = await getCurrentPosition();
      const dist = calculateDistance(pos.coords.latitude, pos.coords.longitude, state.config.latitude, state.config.longitude);
      
      if (dist > state.config.radius) {
        const err = `Out of bounds (${Math.round(dist)}m).`;
        setLocationError(err);
        if (currentUser.notificationSettings?.emailDelivery) {
          emailService.sendEmail(currentUser.email, 'Security Alert: Geo-Fence Breach', `An unsuccessful clock-in attempt was recorded outside the office zone. Distance: ${Math.round(dist)}m.`, 'system');
        }
        setPunching(false); 
        return;
      }

      const now = new Date();
      const isoStr = now.toISOString();
      const displayTime = formatDisplayTime(isoStr);
      const today = getTodayString();
      const monthId = getMonthId();
      
      setState(prev => {
        const records = prev.attendance[monthId] || [];
        const existingIdx = records.findIndex(r => r.employeeId === currentUser.id && r.date === today);
        let newRecords = [...records];
        
        if (existingIdx > -1) {
          const record = newRecords[existingIdx];
          if (!record.checkInTime || (record.checkInTime && record.checkOutTime)) {
             newRecords[existingIdx] = { ...record, id: Math.random().toString(36).substr(2, 9), checkInTime: isoStr, checkOutTime: null, totalWorkingHours: 0 };
             if (currentUser.notificationSettings?.attendanceUpdates && currentUser.notificationSettings?.emailDelivery) {
              emailService.sendEmail(currentUser.email, 'Attendance: Clocked In', `You have successfully clocked in at ${displayTime}.`, 'attendance');
             }
          } else {
             const start = new Date(record.checkInTime);
             const hours = (now.getTime() - start.getTime()) / (1000 * 60 * 60);
             newRecords[existingIdx] = { ...record, checkOutTime: isoStr, totalWorkingHours: hours };
             addNotification(`${currentUser.name} punched out.`);
             if (currentUser.notificationSettings?.attendanceUpdates && currentUser.notificationSettings?.emailDelivery) {
              emailService.sendEmail(currentUser.email, 'Attendance: Clocked Out', `You have successfully clocked out at ${displayTime}. Total hours: ${hours.toFixed(2)}h`, 'attendance');
             }
          }
        } else {
          newRecords.push({ id: Math.random().toString(36).substr(2, 9), employeeId: currentUser.id, employeeName: currentUser.name, date: today, checkInTime: isoStr, checkOutTime: null, totalWorkingHours: 0 });
          addNotification(`${currentUser.name} punched in.`);
          if (currentUser.notificationSettings?.attendanceUpdates && currentUser.notificationSettings?.emailDelivery) {
            emailService.sendEmail(currentUser.email, 'Attendance: Clocked In', `You have successfully clocked in at ${displayTime}.`, 'attendance');
          }
        }
        return { ...prev, attendance: { ...prev.attendance, [monthId]: newRecords } };
      });
    } catch (err: any) { setLocationError(err.message || "Geo access denied"); } finally { setPunching(false); }
  };

  const handleEditAttendance = (recordId: string, newIn: string, newOut: string) => {
    setState(prev => {
      const updatedAttendance = { ...prev.attendance };
      Object.keys(updatedAttendance).forEach(monthKey => {
        updatedAttendance[monthKey] = updatedAttendance[monthKey].map(record => {
          if (record.id === recordId) {
            const checkIn = new Date(newIn);
            const checkOut = newOut ? new Date(newOut) : null;
            let hours = 0;
            if (checkOut) {
              hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
            }
            return {
              ...record,
              checkInTime: checkIn.toISOString(),
              checkOutTime: checkOut ? checkOut.toISOString() : null,
              totalWorkingHours: hours,
              date: checkIn.toISOString().split('T')[0]
            };
          }
          return record;
        });
      });
      return { ...prev, attendance: updatedAttendance };
    });
    addNotification("Attendance record updated.");
  };

  const handleDeleteAttendance = (recordId: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    setState(prev => {
      const updatedAttendance = { ...prev.attendance };
      Object.keys(updatedAttendance).forEach(monthKey => {
        updatedAttendance[monthKey] = updatedAttendance[monthKey].filter(r => r.id !== recordId);
      });
      return { ...prev, attendance: updatedAttendance };
    });
    addNotification("Attendance record deleted.");
  };

  const saveEmployee = (emp: Employee) => {
    setState(prev => {
      const exists = prev.employees.some(e => e.id === emp.id);
      return { ...prev, employees: exists ? prev.employees.map(e => e.id === emp.id ? emp : e) : [...prev.employees, emp] };
    });
    setEditingEmployee(null); setIsFormModalOpen(false); addNotification(`Employee ${emp.name} saved.`);
  };

  const updateLeaveStatus = (id: string, status: LeaveStatus) => {
    setState(prev => {
      const leave = prev.leaves.find(l => l.id === id);
      if (!leave) return prev;
      
      const employee = prev.employees.find(e => e.id === leave.employeeId);
      if (employee?.notificationSettings?.leaveRequests && employee.notificationSettings?.emailDelivery) {
        emailService.sendEmail(employee.email, `Leave Application: ${status}`, `Your leave request for ${leave.startDate} to ${leave.endDate} has been ${status.toLowerCase()}.`, 'leave');
      }

      let updatedEmployees = [...prev.employees];
      if (status === LeaveStatus.APPROVED) {
        const diffDays = Math.ceil(Math.abs(new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        updatedEmployees = updatedEmployees.map(e => e.id === leave.employeeId ? { ...e, leaveBalance: Math.max(0, e.leaveBalance - diffDays) } : e);
        addNotification(`Approved ${diffDays} day(s) for ${leave.employeeName}.`);
      }
      return { ...prev, employees: updatedEmployees, leaves: prev.leaves.map(l => l.id === id ? { ...l, status } : l) };
    });
  };

  const handleSaveNotifications = (settings: NotificationConfig) => {
    if (!currentUser) return;
    setCurrentUser(prev => prev ? ({ ...prev, notificationSettings: settings }) : null);
    addNotification("Notification preferences updated.");
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${state.theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      {!currentUser ? (
        <LoginView handleLogin={handleLogin} loginError={loginError} />
      ) : (
        <>
          {/* Mobile Navigation Header */}
          <header className="md:hidden bg-white dark:bg-gray-950 border-b dark:border-gray-800 p-4 flex justify-between items-center sticky top-0 z-[60] print:hidden">
            <div className="flex items-center space-x-2 text-blue-600">
              <Clock size={20} />
              <h1 className="font-bold dark:text-white">GeoAttend</h1>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </header>

          {/* Desktop Sidebar (Fixed) */}
          <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-950 border-r dark:border-gray-800 flex-col print:hidden shadow-sm">
            <div className="p-6 flex items-center space-x-2 text-blue-600">
              <div className="bg-blue-600 text-white p-1 rounded-lg">
                <Clock size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">GeoAttend</h1>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
              {currentUser.role === Role.ADMIN && (
                <>
                  <SidebarItem icon={Users} label="Employees" active={activeTab === 'employees'} onClick={() => { setActiveTab('employees'); setIsSidebarOpen(false); }} />
                  <SidebarItem icon={BarChart3} label="Reports" active={activeTab === 'reports'} onClick={() => { setActiveTab('reports'); setIsSidebarOpen(false); }} />
                </>
              )}
              <SidebarItem icon={Clock} label="Attendance" active={activeTab === 'attendance'} onClick={() => { setActiveTab('attendance'); setIsSidebarOpen(false); }} />
              <SidebarItem icon={CalendarDays} label="Leaves" active={activeTab === 'leaves'} onClick={() => { setActiveTab('leaves'); setIsSidebarOpen(false); }} />
              <SidebarItem icon={Bell} label="Notifications" active={activeTab === 'notifications'} onClick={() => { setActiveTab('notifications'); setIsSidebarOpen(false); }} />
              {currentUser.role === Role.ADMIN && <SidebarItem icon={Settings} label="Admin Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} />}
            </nav>
            <div className="p-4 border-t dark:border-gray-800">
              <button onClick={toggleTheme} className="w-full flex items-center justify-center space-x-2 p-2 mb-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                {state.theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                <span>{state.theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md">{currentUser.name.charAt(0)}</div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-bold tracking-wider">{currentUser.role}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="mt-4 w-full flex items-center justify-center space-x-2 text-gray-500 hover:text-red-500 dark:hover:text-red-400 text-sm font-bold group transition-all">
                  <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Layout Wrapper */}
          <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
            
            {/* Mobile Expanded Menu (Pushes content down instead of overlay) */}
            <div className={`md:hidden bg-white dark:bg-gray-950 border-b dark:border-gray-800 overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? 'max-h-[600px] border-b' : 'max-h-0 border-b-0'}`}>
              <nav className="px-4 py-4 space-y-1">
                <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
                {currentUser.role === Role.ADMIN && (
                  <>
                    <SidebarItem icon={Users} label="Employees" active={activeTab === 'employees'} onClick={() => { setActiveTab('employees'); setIsSidebarOpen(false); }} />
                    <SidebarItem icon={BarChart3} label="Reports" active={activeTab === 'reports'} onClick={() => { setActiveTab('reports'); setIsSidebarOpen(false); }} />
                  </>
                )}
                <SidebarItem icon={Clock} label="Attendance" active={activeTab === 'attendance'} onClick={() => { setActiveTab('attendance'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={CalendarDays} label="Leaves" active={activeTab === 'leaves'} onClick={() => { setActiveTab('leaves'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={Bell} label="Notifications" active={activeTab === 'notifications'} onClick={() => { setActiveTab('notifications'); setIsSidebarOpen(false); }} />
                {currentUser.role === Role.ADMIN && <SidebarItem icon={Settings} label="Admin Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} />}
                
                {/* Mobile Bottom Profile Area within menu */}
                <div className="pt-4 mt-4 border-t dark:border-gray-800 space-y-3">
                  <button onClick={toggleTheme} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                    {state.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    <span>{state.theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10">
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Main Content Area */}
            <main className="p-4 md:p-8 flex-1">
              <header className="hidden md:flex justify-between items-center mb-8 print:hidden">
                <div>
                  <h2 className="text-2xl font-bold dark:text-white capitalize">{activeTab.replace('-', ' ')}</h2>
                  <p className="text-sm text-gray-500">Welcome, <span className="text-blue-600 font-semibold">{currentUser.name}</span></p>
                </div>
                <div className="px-4 py-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm border dark:border-gray-800 text-sm font-medium text-gray-600 dark:text-gray-300">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </header>

              {/* View Rendering Container */}
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === 'dashboard' && <DashboardView currentUser={currentUser} locationError={locationError} todayRecord={todayRecord} handlePunch={handlePunch} punching={punching} notifications={notifications} />}
                {activeTab === 'employees' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center gap-4 flex-wrap"><h3 className="text-xl font-bold dark:text-white">Active Workforce</h3><button onClick={() => { setEditingEmployee(null); setIsFormModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 shadow-md"><Plus size={18} /> <span>New Employee</span></button></div>
                    <Card title="Staff Directory" icon={Users} extra={<div className="relative w-full sm:w-64"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search..." className="pl-9 pr-4 py-1.5 border dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs outline-none dark:text-white w-full" value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)} /></div>}>
                      <div className="overflow-x-auto -mx-6"><table className="w-full text-left min-w-[600px]"><thead><tr className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b dark:border-gray-800"><th className="pb-3 px-6">Identity</th><th className="pb-3 px-6">Status/Balance</th><th className="pb-3 px-6">Dept</th><th className="pb-3 px-6 text-right">Actions</th></tr></thead><tbody className="text-sm divide-y dark:divide-gray-800">{filteredEmployees.map((emp) => (<tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-colors"><td className="py-4 px-6"><p className="font-bold dark:text-gray-100">{emp.name}</p><p className="text-xs text-gray-500">{emp.id} • {emp.email}</p></td><td className="py-4 px-6"><div className="flex items-center space-x-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${emp.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>{emp.status}</span><span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">{emp.leaveBalance} Days</span></div></td><td className="py-4 px-6 text-gray-600 dark:text-gray-300 font-medium">{emp.department}</td><td className="py-4 px-6 text-right"><div className="flex justify-end items-center space-x-2"><button onClick={() => { setEditingEmployee(emp); setIsFormModalOpen(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Edit2 size={16} /></button>{emp.id !== currentUser.id && <button onClick={() => { if(confirm("Remove?")) setState(prev => ({...prev, employees: prev.employees.filter(e => e.id !== emp.id)})); }} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"><Trash2 size={16} /></button>}</div></td></tr>))}</tbody></table></div></Card>
                  </div>
                )}
                {activeTab === 'reports' && <ReportsView state={state} />}
                {activeTab === 'notifications' && <NotificationSettingsView currentUser={currentUser} saveSettings={handleSaveNotifications} />}
                {activeTab === 'attendance' && <AttendanceReportView records={currentMonthRecords} downloadCsv={downloadAttendanceCSV} monthId={getMonthId()} attendanceSearch={attendanceSearch} setAttendanceSearch={setAttendanceSearch} attendanceDateFilter={attendanceDateFilter} setAttendanceDateFilter={setAttendanceDateFilter} isAdmin={currentUser.role === Role.ADMIN} onEdit={handleEditAttendance} onDelete={handleDeleteAttendance} />}
                {activeTab === 'leaves' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card title="New Leave Request" icon={Plus}><form className="space-y-4" onSubmit={(e) => { e.preventDefault(); const form = e.target as any; const newLeave: LeaveRequest = { id: Math.random().toString(36).substr(2, 9), employeeId: currentUser.id, employeeName: currentUser.name, startDate: form.startDate.value, endDate: form.endDate.value, reason: form.reason.value, status: LeaveStatus.PENDING, requestDate: getTodayString() }; 
                      setState(prev => ({ ...prev, leaves: [newLeave, ...prev.leaves] }));
                      const admins = state.employees.filter(e => e.role === Role.ADMIN);
                      admins.forEach(admin => {
                        if (admin.notificationSettings?.emailDelivery && admin.notificationSettings?.leaveRequests) {
                          emailService.sendEmail(admin.email, 'Action Required: New Leave Request', `${currentUser.name} has requested leave from ${form.startDate.value} to ${form.endDate.value}. Reason: ${form.reason.value}`, 'leave');
                        }
                      });
                      form.reset(); 
                      addNotification("Leave request submitted."); 
                      }}><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-xs font-bold text-gray-500 uppercase">Start</label><input name="startDate" type="date" required className="w-full border dark:border-gray-700 bg-transparent rounded-lg p-2 text-sm dark:text-white mt-1" /></div><div><label className="text-xs font-bold text-gray-500 uppercase">End</label><input name="endDate" type="date" required className="w-full border dark:border-gray-700 bg-transparent rounded-lg p-2 text-sm dark:text-white mt-1" /></div></div><textarea name="reason" rows={3} placeholder="Reason..." className="w-full border dark:border-gray-700 bg-transparent rounded-lg p-2 text-sm dark:text-white" required /><button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700">Submit</button></form></Card>
                      <Card title="Leave Tracking" icon={CalendarDays}><div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">{state.leaves.filter(l => currentUser.role === Role.ADMIN || l.employeeId === currentUser.id).map(l => (<div key={l.id} className="p-4 border dark:border-gray-800 rounded-xl space-y-2 bg-white dark:bg-gray-950 shadow-sm border-l-4 border-l-blue-500"><div className="flex justify-between items-start"><div><h4 className="font-bold dark:text-gray-100">{l.employeeName}</h4><p className="text-xs text-gray-500">{l.startDate} to {l.endDate}</p></div><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${l.status === LeaveStatus.APPROVED ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : l.status === LeaveStatus.REJECTED ? 'bg-red-100 text-red-700 dark:bg-red-900/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'}`}>{l.status}</span></div><p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border dark:border-gray-800 italic">"{l.reason}"</p>{currentUser.role === Role.ADMIN && l.status === LeaveStatus.PENDING && (<div className="flex gap-2 pt-2 border-t dark:border-gray-800 mt-2"><button onClick={() => updateLeaveStatus(l.id, LeaveStatus.APPROVED)} className="flex-1 bg-green-500 text-white text-xs py-2 rounded-lg font-bold">Approve</button><button onClick={() => updateLeaveStatus(l.id, LeaveStatus.REJECTED)} className="flex-1 bg-red-500 text-white text-xs py-2 rounded-lg font-bold">Reject</button></div>)}</div>))}{state.leaves.length === 0 && <p className="text-sm text-gray-400 text-center py-8 italic">No records</p>}</div></Card>
                    </div>
                  </div>
                )}
                {activeTab === 'settings' && (
                  <div className="max-w-2xl mx-auto space-y-6"><Card title="Geofence Configuration" icon={Settings}><p className="text-sm text-gray-500 mb-6">Office zone parameters.</p><form className="space-y-4" onSubmit={(e) => { e.preventDefault(); const form = e.target as any; setState(prev => ({ ...prev, config: { latitude: parseFloat(form.lat.value), longitude: parseFloat(form.lng.value), radius: parseFloat(form.radius.value) }})); addNotification("Geofence updated."); }}><div className="grid grid-cols-2 gap-4"><input name="lat" type="number" step="any" defaultValue={state.config.latitude} className="border dark:border-gray-700 bg-transparent rounded-lg p-2 text-sm dark:text-white" placeholder="Latitude" /><input name="lng" type="number" step="any" defaultValue={state.config.longitude} className="border dark:border-gray-700 bg-transparent rounded-lg p-2 text-sm dark:text-white" placeholder="Longitude" /></div><input name="radius" type="number" defaultValue={state.config.radius} className="w-full border dark:border-gray-700 bg-transparent rounded-lg p-2 text-sm dark:text-white" placeholder="Radius" /><button type="submit" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-blue-700">Apply Settings</button></form></Card></div>
                )}
              </div>
            </main>
          </div>
          
          <EmployeeFormModal isOpen={isFormModalOpen} onClose={() => { setIsFormModalOpen(false); setEditingEmployee(null); }} editingEmployee={editingEmployee} saveEmployee={saveEmployee} getTodayString={getTodayString} />
        </>
      )}
    </div>
  );
};

export default App;
