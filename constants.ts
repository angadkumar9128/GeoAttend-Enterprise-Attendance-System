import { Role, AppState, NotificationConfig } from './types';

const DEFAULT_NOTIFICATIONS: NotificationConfig = {
  leaveRequests: true,
  attendanceUpdates: true,
  companyAnnouncements: true,
  performanceNotifications: true,
  emailDelivery: true,
  pushDelivery: false
};

export const INITIAL_STATE: AppState = {
  employees: [
    {
      id: 'EMP001',
      name: 'Admin User',
      email: 'admin@geoattend.com',
      password: 'admin',
      role: Role.ADMIN,
      designation: 'System Administrator',
      department: 'IT',
      status: 'Active',
      joinedDate: '2023-01-01',
      leaveBalance: 20,
      notificationSettings: { ...DEFAULT_NOTIFICATIONS }
    },
    {
      id: 'EMP002',
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      password: 'password123',
      role: Role.EMPLOYEE,
      designation: 'Software Engineer',
      department: 'Engineering',
      status: 'Active',
      joinedDate: '2023-05-20',
      leaveBalance: 15,
      notificationSettings: { ...DEFAULT_NOTIFICATIONS }
    }
  ],
  attendance: {},
  leaves: [],
  config: {
    latitude: 40.7128, // Default to NYC for demo
    longitude: -74.0060,
    radius: 500 // 500 meters
  },
  theme: 'light'
};

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];