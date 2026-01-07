import { AttendanceRecord } from '../types';

const formatDisplayDateTime = (iso: string | null) => {
  if (!iso) return "N/A";
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
  if (!iso) return "N/A";
  const dateObj = new Date(iso);
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  const ss = String(dateObj.getSeconds()).padStart(2, '0');
  return `${hh}:${min}:${ss}`;
};

export function downloadAttendanceCSV(records: AttendanceRecord[], fileName: string) {
  const headers = ['Employee ID', 'Employee Name', 'Date & Time', 'Check In', 'Check Out', 'Total Hours'];
  const rows = records.map(r => [
    r.employeeId,
    r.employeeName,
    formatDisplayDateTime(r.checkInTime),
    r.checkInTime ? formatDisplayTime(r.checkInTime) : 'N/A',
    r.checkOutTime ? formatDisplayTime(r.checkOutTime) : 'N/A',
    r.totalWorkingHours.toFixed(2)
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
