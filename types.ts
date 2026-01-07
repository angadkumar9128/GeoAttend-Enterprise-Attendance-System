export enum Role {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export type EmployeeStatus = 'Active' | 'Inactive';
export type ThemeMode = 'light' | 'dark';

export interface NotificationConfig {
  leaveRequests: boolean;
  attendanceUpdates: boolean;
  companyAnnouncements: boolean;
  performanceNotifications: boolean;
  emailDelivery: boolean;
  pushDelivery: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  designation: string;
  department: string;
  status: EmployeeStatus;
  joinedDate: string;
  leaveBalance: number;
  notificationSettings?: NotificationConfig; // Per-user settings
}

export interface AttendanceRecord {
  id: string; // Added for record management
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD (Used for grouping)
  checkInTime: string | null; // Full ISO 8601 string
  checkOutTime: string | null; // Full ISO 8601 string
  totalWorkingHours: number; // In decimal
  location?: {
    lat: number;
    lng: number;
  };
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  requestDate: string;
}

export interface GeofenceConfig {
  latitude: number;
  longitude: number;
  radius: number; // in meters
}

export interface AppState {
  employees: Employee[];
  attendance: Record<string, AttendanceRecord[]>; // Key is month-year like "06_2026"
  leaves: LeaveRequest[];
  config: GeofenceConfig;
  theme: ThemeMode;
}
