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
    }, // ✅ FIXED: missing comma was here

    {
      id: 'EMP0012',
      name: 'angad12',
      email: 'angad12@gmail.com',
      password: '21',
      role: Role.EMPLOYEE,
      designation: 'Software Engineer',
      department: 'Engineering',
      status: 'Active',
      joinedDate: '2023-05-20',
      leaveBalance: 15,
      notificationSettings: { ...DEFAULT_NOTIFICATIONS }
    },
    {
      id: 'EMP003',
      name: 'angad3',
      email: 'angad3@gmail.com',
      password: '123',
      role: Role.EMPLOYEE,
      designation: 'Software Engineer',
      department: 'Engineering',
      status: 'Active',
      joinedDate: '2023-05-20',
      leaveBalance: 15,
      notificationSettings: { ...DEFAULT_NOTIFICATIONS }
    },
    {
      id: 'EMP004',
      name: 'angad4',
      email: 'angad4@gmail.com',
      password: '1234',
      role: Role.EMPLOYEE,
      designation: 'Software Engineer',
      department: 'Engineering',
      status: 'Active',
      joinedDate: '2023-05-20',
      leaveBalance: 15,
      notificationSettings: { ...DEFAULT_NOTIFICATIONS }
    },
    {
      id: 'EMP005',
      name: 'angad5',
      email: 'angad5@gmail.com',
      password: '12345',
      role: Role.EMPLOYEE,
      designation: 'Software Engineer',
      department: 'Engineering',
      status: 'Active',
      joinedDate: '2023-05-20',
      leaveBalance: 15,
      notificationSettings: { ...DEFAULT_NOTIFICATIONS }
    },
    {
      id: 'EMP006',
      name: 'angad6',
      email: 'angad6@gmail.com',
      password: '123456',
      role: Role.EMPLOYEE,
      designation: 'Software Engineer',
      department: 'Engineering',
      status: 'Active',
      joinedDate: '2023-05-20',
      leaveBalance: 15,
      notificationSettings: { ...DEFAULT_NOTIFICATIONS }
    },
    {
      id: 'EMP007',
      name: 'angad7',
      email: 'angad7@gmail.com',
      password: '1234567',
      role: Role.EMPLOYEE,
      designation: 'Software Engineer',
      department: 'Engineering',
      status: 'Active',
      joinedDate: '2023-05-20',
      leaveBalance: 15,
      notificationSettings: { ...DEFAULT_NOTIFICATIONS }
    },
    {
      id: 'EMP008',
      name: 'angad8',
      email: 'angad8@gmail.com',
      password: '12345678',
      role: Role.EMPLOYEE,
      designation: 'Software Engineer',
      department: 'Engineering',
      status: 'Active',
      joinedDate: '2023-05-20',
      leaveBalance: 15,
      notificationSettings: { ...DEFAULT_NOTIFICATIONS }
    },
    {
      id: 'EMP009',
      name: 'angad9',
      email: 'angad9@gmail.com',
      password: '123456789',
      role: Role.EMPLOYEE,
      designation: 'Software Engineer',
      department: 'Engineering',
      status: 'Active',
      joinedDate: '2023-05-20',
      leaveBalance: 15,
      notificationSettings: { ...DEFAULT_NOTIFICATIONS }
    },
    {
      id: 'EMP010',
      name: 'angad10',
      email: 'angad10@gmail.com',
      password: '1234567890',
      role: Role.EMPLOYEE,
      designation: 'Software Engineer',
      department: 'Engineering',
      status: 'Active',
      joinedDate: '2023-05-20',
      leaveBalance: 15,
      notificationSettings: { ...DEFAULT_NOTIFICATIONS }
    },
    {
      id: 'EMP011',
      name: 'angad11',
      email: 'angad11@gmail.com',
      password: '12345678901',
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
    latitude: 12.8961865, // Default to NYC for demo
    longitude: 77.5755428,
    radius: 500 // meters
  },

  theme: 'light'
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
