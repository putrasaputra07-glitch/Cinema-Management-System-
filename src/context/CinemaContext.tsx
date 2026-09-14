import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  UserRole,
  Employee,
  InventoryItem,
  InventoryTransaction,
  UtilityReport,
  DailyCleaningReport,
  CleaningTaskItem,
  OffDayRequest,
  LeaveRequest,
  SickLeaveRequest,
  NotificationItem,
  ActivityLog,
  ApprovalStatus,
  TransactionType,
  InventoryCategory,
  WeeklyScheduleWeek,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_EMPLOYEES,
  INITIAL_INVENTORY,
  INITIAL_TRANSACTIONS,
  INITIAL_UTILITY_REPORTS,
  INITIAL_CLEANING_REPORTS,
  INITIAL_OFF_DAY_REQUESTS,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_SICK_LEAVE_REQUESTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACTIVITY_LOGS,
} from '../data/initialData';
import { INITIAL_SCHEDULE_WEEKS } from '../data/initialSchedule';
import { safeLocalStorage } from '../utils/safeStorage';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

export interface ConfirmDialogOptions {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
}

interface CinemaContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  availableUsers: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  currentTab: string;
  setCurrentTab: (tab: string) => void;

  // Authentication & Login Gate
  isLoggedIn: boolean;
  login: (userOrIdentifier?: User | string, pin?: string) => boolean | void;
  logout: () => void;

  // Employees
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  updateEmployeePhoto: (id: string, newPhoto: string) => void;
  deleteEmployee: (id: string) => void;

  // Inventory
  inventory: InventoryItem[];
  addInventoryItem: (item: any) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  recordStockTransaction: (params: {
    itemId: string;
    type: TransactionType;
    quantity: number;
    notes?: string;
  }) => void;
  transactions: InventoryTransaction[];

  // Utility
  utilityReports: UtilityReport[];
  addUtilityReport: (report: Omit<UtilityReport, 'id' | 'usage' | 'indicator' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => void;
  deleteUtilityReport: (id: string) => void;

  // Cleaning
  cleaningReports: DailyCleaningReport[];
  addCleaningReport: (report: Omit<DailyCleaningReport, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => void;
  updateCleaningTask: (reportId: string, taskId: string, updates: Partial<CleaningTaskItem>) => void;
  reviewCleaningReport: (reportId: string, status: ApprovalStatus, remarks?: string) => void;

  // Request Operations
  offDayRequests: OffDayRequest[];
  addOffDayRequest: (req: { date: string; reason: string; notes?: string }) => void;
  reviewOffDayRequest: (id: string, status: ApprovalStatus, remarks?: string) => void;
  updateOffDayStatus: (id: string, status: ApprovalStatus, remarks?: string) => void;

  leaveRequests: LeaveRequest[];
  addLeaveRequest: (req: { leaveType: any; startDate: string; endDate: string; reason: string; notes?: string; attachment?: string }) => void;
  reviewLeaveRequest: (id: string, status: ApprovalStatus, remarks?: string) => void;
  updateLeaveStatus: (id: string, status: ApprovalStatus, remarks?: string) => void;

  sickLeaveRequests: SickLeaveRequest[];
  addSickLeaveRequest: (req: { dateStart: string; dateEnd: string; reason: string; description: string; medicalCertificate: string; notes?: string }) => void;
  reviewSickLeaveRequest: (id: string, status: ApprovalStatus, remarks?: string) => void;
  updateSickLeaveStatus: (id: string, status: ApprovalStatus, remarks?: string) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;

  // Activity Log
  activityLogs: ActivityLog[];
  logActivity: (action: string, module: string, dataAffected?: string) => void;

  // Cleaning helper
  updateCleaningReportStatus: (reportId: string, status: ApprovalStatus, remarks?: string) => void;

  // Settings & Simulation
  switchUserRole: (role: UserRole) => void;
  resetToInitialData: () => void;
  updateAdminLoginSettings: (settings: {
    employeeId: string;
    password: string;
    username?: string;
    email?: string;
  }) => boolean;

  // Account & Data Management (Restore / Backup)
  users: User[];
  syncUserAccount: (emp: Employee, username?: string, password?: string) => void;
  createBackupSnapshot: () => boolean;
  restoreData: (customData?: any) => boolean;
  hasBackupSnapshot: boolean;
  clearAllMenuData: () => void;

  // Toasts & Confirmation
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning', title?: string) => void;
  addToast: (messageOrTitle: string, type?: 'success' | 'error' | 'info' | 'warning' | string, maybeType?: any) => void;
  dismissToast: (id: string) => void;
  confirmDialog: ConfirmDialogOptions;
  askConfirm: (options: Omit<ConfirmDialogOptions, 'isOpen'>) => void;
  closeConfirm: () => void;

  // Quick Action trigger
  activeQuickAction: string | null;
  setActiveQuickAction: (action: string | null) => void;

  // Schedule Management & Synchronization
  scheduleWeeks: WeeklyScheduleWeek[];
  activeScheduleWeekId: string;
  setActiveScheduleWeekId: (id: string) => void;
  addScheduleWeek: (week: WeeklyScheduleWeek) => void;
  updateScheduleWeek: (week: WeeklyScheduleWeek) => void;
  deleteScheduleWeek: (id: string) => void;
  refreshSchedule: () => Promise<void>;
  isRefreshingSchedule: boolean;
  scheduleLastRefreshedTime: string;
  scheduleLastSync: { date: string; time: string };
  getEmployeeTodayStatus: (employeeNameOrId: string) => {
    status: string;
    station?: string;
    shift?: string;
    badgeColor: string;
    isOff: boolean;
    type?: string;
    detail?: string;
  };

  // Birthday Recognition
  birthdayEmployeesToday: Employee[];
}

const CinemaContext = createContext<CinemaContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'cinema_ops_v1_';

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = safeLocalStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error('Error loading storage key:', key, e);
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    safeLocalStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving storage key:', key, e);
  }
}

export const CinemaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() =>
    loadStorage<boolean>('isLoggedIn', false)
  );
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const saved = loadStorage<User>('currentUser', INITIAL_USERS[0]);
    if (saved && (saved.role === 'ADMIN' || saved.id === 'usr-1')) {
      const updatedAdmin: User = {
        ...saved,
        employeeId: (!saved.employeeId || saved.employeeId === 'EMP-001') ? '10102092' : saved.employeeId,
        username: saved.username || 'admin',
        password: (!saved.password || saved.password === 'admin123') ? '150215' : saved.password,
        hasLoginAccount: true,
      };
      return updatedAdmin;
    }
    return saved || INITIAL_USERS[0];
  });
  const [currentTab, setCurrentTab] = useState<string>('home');

  const [users, setUsers] = useState<User[]>(() => {
    const saved = loadStorage<User[]>('users', INITIAL_USERS);
    const list = saved && saved.length > 0 ? saved : INITIAL_USERS;
    return list.map((u) => {
      if (u.role === 'ADMIN' || u.id === 'usr-1') {
        return {
          ...u,
          employeeId: (!u.employeeId || u.employeeId === 'EMP-001') ? '10102092' : u.employeeId,
          username: u.username || 'admin',
          password: (!u.password || u.password === 'admin123') ? '150215' : u.password,
          hasLoginAccount: true,
        };
      }
      return u;
    });
  });

  const [hasBackupSnapshot, setHasBackupSnapshot] = useState<boolean>(() => {
    return Boolean(safeLocalStorage.getItem(LOCAL_STORAGE_PREFIX + 'backup_snapshot'));
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = loadStorage<Employee[]>('employees', INITIAL_EMPLOYEES);
    const list = saved && saved.length > 0 ? saved : INITIAL_EMPLOYEES;
    return list.map((e) => {
      if (e.role === 'ADMIN' || e.employeeId === 'EMP-001' || e.employeeId === '10102092' || e.id === 'emp-1') {
        return {
          ...e,
          employeeId: (!e.employeeId || e.employeeId === 'EMP-001') ? '10102092' : e.employeeId,
          hasAccount: true,
          loginUsername: e.loginUsername || 'admin',
          loginPassword: (!e.loginPassword || e.loginPassword === 'admin123') ? '150215' : e.loginPassword,
        };
      }
      return e;
    });
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    loadStorage<InventoryItem[]>('inventory', INITIAL_INVENTORY)
  );

  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() =>
    loadStorage<InventoryTransaction[]>('transactions', INITIAL_TRANSACTIONS)
  );

  const [utilityReports, setUtilityReports] = useState<UtilityReport[]>(() =>
    loadStorage<UtilityReport[]>('utilityReports', INITIAL_UTILITY_REPORTS)
  );

  const [cleaningReports, setCleaningReports] = useState<DailyCleaningReport[]>(() =>
    loadStorage<DailyCleaningReport[]>('cleaningReports', INITIAL_CLEANING_REPORTS)
  );

  const [offDayRequests, setOffDayRequests] = useState<OffDayRequest[]>(() =>
    loadStorage<OffDayRequest[]>('offDayRequests', INITIAL_OFF_DAY_REQUESTS)
  );

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() =>
    loadStorage<LeaveRequest[]>('leaveRequests', INITIAL_LEAVE_REQUESTS)
  );

  const [sickLeaveRequests, setSickLeaveRequests] = useState<SickLeaveRequest[]>(() =>
    loadStorage<SickLeaveRequest[]>('sickLeaveRequests', INITIAL_SICK_LEAVE_REQUESTS)
  );

  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadStorage<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS)
  );

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    loadStorage<ActivityLog[]>('activityLogs', INITIAL_ACTIVITY_LOGS)
  );

  // Weekly Operational Schedule State
  const [scheduleWeeks, setScheduleWeeks] = useState<WeeklyScheduleWeek[]>(() => {
    const saved = loadStorage<WeeklyScheduleWeek[]>('scheduleWeeks', INITIAL_SCHEDULE_WEEKS);
    return saved && saved.length > 0 ? saved : INITIAL_SCHEDULE_WEEKS;
  });

  const [activeScheduleWeekId, setActiveScheduleWeekId] = useState<string>(() => {
    return scheduleWeeks[0]?.id || 'week-37';
  });

  const formatWibSyncTimestamp = (date: Date = new Date()) => {
    const parts = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date);

    const day = parts.find((p) => p.type === 'day')?.value || '14';
    const month = parts.find((p) => p.type === 'month')?.value || '09';
    const year = parts.find((p) => p.type === 'year')?.value || '2026';
    const hour = parts.find((p) => p.type === 'hour')?.value || '13';
    const minute = parts.find((p) => p.type === 'minute')?.value || '07';

    return {
      date: `${day}/${month}/${year}`,
      time: `${hour}:${minute} WIB`,
    };
  };

  const [isRefreshingSchedule, setIsRefreshingSchedule] = useState(false);
  const [scheduleLastSync, setScheduleLastSync] = useState<{ date: string; time: string }>(() =>
    formatWibSyncTimestamp(new Date())
  );
  const [scheduleLastRefreshedTime, setScheduleLastRefreshedTime] = useState<string>(() => {
    const ts = formatWibSyncTimestamp(new Date());
    return `${ts.date} ${ts.time}`;
  });

  const refreshSchedule = async () => {
    setIsRefreshingSchedule(true);
    // Re-read directly from local storage to guarantee 100% sync
    const reloaded = loadStorage<WeeklyScheduleWeek[]>('scheduleWeeks', INITIAL_SCHEDULE_WEEKS);
    if (reloaded && reloaded.length > 0) {
      setScheduleWeeks(reloaded);
    }
    const ts = formatWibSyncTimestamp(new Date());
    setScheduleLastSync(ts);
    setScheduleLastRefreshedTime(`${ts.date} ${ts.time}`);

    await new Promise((res) => setTimeout(res, 500));
    setIsRefreshingSchedule(false);
    showToast('Data schedule berhasil diperbarui dan disinkronkan.', 'success', 'Schedule Updated');
  };

  useEffect(() => saveStorage('scheduleWeeks', scheduleWeeks), [scheduleWeeks]);

  const addScheduleWeek = (week: WeeklyScheduleWeek) => {
    setScheduleWeeks((prev) => [week, ...prev]);
    setActiveScheduleWeekId(week.id);
    logActivity('Tambah Periode Schedule', 'Schedule', `Periode Week ${week.weekNumber} (${week.startDate} s/d ${week.endDate})`);
    showToast(`Schedule periode Week ${week.weekNumber} berhasil ditambahkan.`, 'success');
  };

  const updateScheduleWeek = (week: WeeklyScheduleWeek) => {
    setScheduleWeeks((prev) => prev.map((w) => (w.id === week.id ? week : w)));
    logActivity('Update Schedule Kerja', 'Schedule', `Perubahan schedule Week ${week.weekNumber} disimpan`);
    showToast(`Perubahan schedule Week ${week.weekNumber} berhasil disimpan.`, 'success');
  };

  const deleteScheduleWeek = (id: string) => {
    setScheduleWeeks((prev) => prev.filter((w) => w.id !== id));
    logActivity('Hapus Periode Schedule', 'Schedule', `Jadwal ${id} dihapus`);
    showToast(`Periode jadwal telah dihapus.`, 'info');
  };

  // Helper to determine today's schedule status for any user/employee
  const getEmployeeTodayStatus = (employeeNameOrId: string) => {
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    const defaultStatus = {
      status: 'ON DUTY',
      type: 'DUTY',
      detail: 'Operational Shift Aktif',
      station: 'OPERATIONS',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      isOff: false,
    };

    if (!employeeNameOrId || !scheduleWeeks || scheduleWeeks.length === 0) {
      return defaultStatus;
    }

    const currentWeek = scheduleWeeks.find((w) => w.id === activeScheduleWeekId) || scheduleWeeks[0];
    if (!currentWeek || !currentWeek.entries || !Array.isArray(currentWeek.entries)) {
      return defaultStatus;
    }

    const query = String(employeeNameOrId).toLowerCase().trim();
    const entry = currentWeek.entries.find((e) => {
      const eName = (e.employeeName || '').toLowerCase();
      const eId = (e.employeeId || '').toLowerCase();
      return eName.includes(query) || eId === query || query.includes(eName);
    });

    if (!entry || !entry.dailyPlotting) {
      return defaultStatus;
    }

    // Try finding plotting for todayStr or fallback to matching day of week
    let plotting = entry.dailyPlotting[todayStr];
    if (!plotting) {
      const dateKeys = Object.keys(entry.dailyPlotting).sort();
      if (dateKeys.length > 0) {
        const targetDay = today.getDay();
        const matchedKey = dateKeys.find((dk) => new Date(dk).getDay() === targetDay) || dateKeys[0];
        plotting = entry.dailyPlotting[matchedKey];
      }
    }

    if (!plotting) {
      return defaultStatus;
    }

    const station = plotting.station || '';
    const stUpper = station.toUpperCase();

    if (
      plotting.statusType === 'DAYOFF' ||
      plotting.statusType === 'PH_OFF' ||
      stUpper.includes('OFF') ||
      stUpper.includes('DAYOFF')
    ) {
      return {
        status: 'OFF',
        type: 'DAYOFF',
        detail: plotting.offLabel || station || 'Jadwal Libur Operasional',
        station: plotting.offLabel || station || 'OFF DAY',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        isOff: true,
      };
    }

    if (plotting.statusType === 'LEAVE' || (plotting.statusType as string) === 'CUTI' || stUpper.includes('CUTI')) {
      return {
        status: 'CUTI',
        type: 'LEAVE',
        detail: plotting.offLabel || 'Cuti Tahunan',
        station: plotting.offLabel || 'CUTI TAHUNAN',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        isOff: true,
      };
    }

    if (plotting.statusType === 'SICK' || (plotting.statusType as string) === 'SAKIT' || stUpper.includes('SAKIT')) {
      return {
        status: 'SAKIT',
        type: 'SICK',
        detail: 'Izin Sakit',
        station: 'IZIN SAKIT',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        isOff: true,
      };
    }

    return {
      status: 'ON DUTY',
      type: 'DUTY',
      detail: `${station || 'Floor'} (${plotting.startAt ? `Jam ${plotting.startAt}:00` : 'Shift Aktif'})`,
      station: station || 'OPERATIONS',
      shift: plotting.startAt ? `Jam ${plotting.startAt}` : 'Normal',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      isOff: false,
    };
  };

  // Helper for birthday employees today
  const birthdayEmployeesToday = employees.filter((emp) => {
    if (!emp.birthDate) return false;
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const parts = emp.birthDate.split('-');
    if (parts.length >= 3) {
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      return m === currentMonth && d === currentDay;
    }
    return false;
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', title?: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const askConfirm = (options: Omit<ConfirmDialogOptions, 'isOpen'>) => {
    setConfirmDialog({ ...options, isOpen: true });
  };

  const closeConfirm = () => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  };

  // Quick action modal
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);

  // Sync to LocalStorage
  useEffect(() => saveStorage('isLoggedIn', isLoggedIn), [isLoggedIn]);
  useEffect(() => saveStorage('currentUser', currentUser), [currentUser]);
  useEffect(() => saveStorage('users', users), [users]);
  useEffect(() => saveStorage('employees', employees), [employees]);
  useEffect(() => saveStorage('inventory', inventory), [inventory]);
  useEffect(() => saveStorage('transactions', transactions), [transactions]);
  useEffect(() => saveStorage('utilityReports', utilityReports), [utilityReports]);
  useEffect(() => saveStorage('cleaningReports', cleaningReports), [cleaningReports]);
  useEffect(() => saveStorage('offDayRequests', offDayRequests), [offDayRequests]);
  useEffect(() => saveStorage('leaveRequests', leaveRequests), [leaveRequests]);
  useEffect(() => saveStorage('sickLeaveRequests', sickLeaveRequests), [sickLeaveRequests]);
  useEffect(() => saveStorage('notifications', notifications), [notifications]);
  useEffect(() => saveStorage('activityLogs', activityLogs), [activityLogs]);

  // Logging helper
  const logActivity = (action: string, module: string, dataAffected: string = '') => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const newLog: ActivityLog = {
      id: 'log-' + Date.now(),
      user: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role,
      action,
      module,
      dataAffected: dataAffected || action,
      timestamp,
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  // Auth Operations (Login Gate & Session)
  const login = (userOrIdentifier?: User | string, pin?: string): boolean => {
    try {
      let targetUser: User | undefined;
      if (typeof userOrIdentifier === 'object' && userOrIdentifier !== null) {
        targetUser = userOrIdentifier;
      } else if (typeof userOrIdentifier === 'string') {
        const trimmed = userOrIdentifier.trim().toLowerCase();

        // 1. Search in users list
        targetUser = users.find(
          (u) =>
            (u.id && u.id.toLowerCase() === trimmed) ||
            (u.employeeId && u.employeeId.toLowerCase() === trimmed) ||
            (u.email && u.email.toLowerCase() === trimmed) ||
            (u.username && u.username.toLowerCase() === trimmed)
        );

        // 2. Search in employees list (for every employee who filled ID & password in profile)
        const matchedEmp = employees.find(
          (e) =>
            (e.employeeId && e.employeeId.toLowerCase() === trimmed) ||
            (e.email && e.email.toLowerCase() === trimmed) ||
            (e.loginUsername && e.loginUsername.toLowerCase() === trimmed) ||
            (e.id && e.id.toLowerCase() === trimmed)
        );

        // If input is '10102092', ensure it resolves to Admin user
        if (!targetUser && trimmed === '10102092') {
          targetUser = users.find((u) => u.role === 'ADMIN' || u.id === 'usr-1');
        }

        // If not in users but exists in employees
        if (!targetUser && matchedEmp) {
          targetUser = {
            id: 'usr-' + matchedEmp.id,
            name: matchedEmp.fullName,
            email: matchedEmp.email,
            role: matchedEmp.role,
            avatar: matchedEmp.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
            position: matchedEmp.position,
            department: matchedEmp.department,
            employeeId: matchedEmp.employeeId,
            username: matchedEmp.loginUsername || matchedEmp.employeeId,
            password: matchedEmp.loginPassword,
            hasLoginAccount: true,
          };
          // Persist targetUser into users
          setUsers((prev) => {
            const next = [...prev, targetUser!];
            saveStorage('users', next);
            return next;
          });
        }

        if (!targetUser && !matchedEmp) {
          return false;
        }

        // Check password matching for the employee/user
        if (pin !== undefined && pin !== null) {
          const trimmedPin = pin.trim();
          const userPass = targetUser?.password?.trim();
          const empPass = matchedEmp?.loginPassword?.trim();
          const isAdmin = targetUser?.role === 'ADMIN' || matchedEmp?.role === 'ADMIN' || trimmed === '10102092';

          const validPasswords: string[] = [];
          if (userPass) validPasswords.push(userPass);
          if (empPass && !validPasswords.includes(empPass)) validPasswords.push(empPass);
          if (isAdmin) {
            if (!validPasswords.includes('150215')) validPasswords.push('150215');
            if (!validPasswords.includes('admin123')) validPasswords.push('admin123');
          }

          // If no password configured yet for this employee/user, access cannot be granted yet
          if (validPasswords.length === 0) {
            return false;
          }

          if (!validPasswords.includes(trimmedPin)) {
            return false;
          }
        }
      } else {
        targetUser = currentUser;
      }

      if (!targetUser) {
        return false;
      }

      setCurrentUserState(targetUser);
      saveStorage('currentUser', targetUser);
      setIsLoggedIn(true);
      saveStorage('isLoggedIn', true);
      setCurrentTab('home');
      showToast(`Selamat datang kembali, ${targetUser.name}!`, 'success', 'Login Berhasil');
      logActivity('Login ke Sistem Bioskop', 'Authentication', `User: ${targetUser.name} (${targetUser.role})`);
      return true;
    } catch (e) {
      console.error('Login error:', e);
      return false;
    }
  };

  // Auto Logout after 60 minutes of inactivity (Requirement #14)
  useEffect(() => {
    if (!isLoggedIn) return;

    const INACTIVITY_LIMIT_MS = 60 * 60 * 1000; // 60 minutes (1 hour)
    const STORAGE_KEY = LOCAL_STORAGE_PREFIX + 'last_activity_timestamp';

    const markActive = () => {
      try {
        safeLocalStorage.setItem(STORAGE_KEY, Date.now().toString());
      } catch {
        // ignore
      }
    };

    // Mark initial active timestamp
    markActive();

    // Throttle listener for user interactions (click, tap, keyboard, mouse, scroll)
    let throttleTimer: any = null;
    const handleUserActivity = () => {
      if (!throttleTimer) {
        markActive();
        throttleTimer = setTimeout(() => {
          throttleTimer = null;
        }, 3000);
      }
    };

    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click', 'wheel'];
    activityEvents.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    // Periodic check for 60-minute inactivity
    const intervalId = setInterval(() => {
      const raw = safeLocalStorage.getItem(STORAGE_KEY);
      const lastActive = raw ? parseInt(raw, 10) : Date.now();
      const elapsed = Date.now() - lastActive;

      if (elapsed >= INACTIVITY_LIMIT_MS) {
        setIsLoggedIn(false);
        saveStorage('isLoggedIn', false);
        setCurrentTab('home');
        showToast('Sesi Anda telah berakhir otomatis karena tidak ada aktivitas selama 1 jam. Silakan login kembali.', 'warning', 'Sesi Berakhir');
        logActivity('Auto Logout Sesi (60 Menit Inaktif)', 'Authentication', `User: ${currentUser.name}`);
      }
    }, 15000);

    return () => {
      activityEvents.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      clearInterval(intervalId);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [isLoggedIn, currentUser]);

  const logout = () => {
    setIsLoggedIn(false);
    saveStorage('isLoggedIn', false);
    setCurrentTab('home');
    showToast('Anda telah berhasil keluar dari sesi sistem.', 'info', 'Logout');
    logActivity('Keluar dari Sesi Sistem', 'Authentication', `User: ${currentUser.name}`);
  };

  // Synchronize Employee Login Account with Users database
  const syncUserAccount = (emp: Employee, customUsername?: string, customPassword?: string) => {
    setUsers((prev) => {
      const existingIdx = prev.findIndex(
        (u) =>
          (u.employeeId && emp.employeeId && u.employeeId === emp.employeeId) ||
          (u.email && emp.email && u.email.toLowerCase() === emp.email.toLowerCase())
      );
      const userObj: User = {
        id: existingIdx >= 0 ? prev[existingIdx].id : 'usr-' + Date.now(),
        name: emp.fullName,
        email: emp.email,
        role: emp.role,
        avatar: emp.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        position: emp.position,
        department: emp.department,
        employeeId: emp.employeeId,
        username: customUsername || emp.loginUsername || emp.employeeId,
        password: customPassword || emp.loginPassword || '123456',
        hasLoginAccount: true,
      };

      let nextList: User[];
      if (existingIdx >= 0) {
        nextList = [...prev];
        nextList[existingIdx] = { ...nextList[existingIdx], ...userObj };
      } else {
        nextList = [...prev, userObj];
      }
      saveStorage('users', nextList);
      return nextList;
    });
  };

  // Role Switcher
  const switchRole = (role: UserRole) => {
    const matched = users.find((u) => u.role === role) || users[0];
    setCurrentUserState(matched);
    showToast(`Beralih ke peran ${role} (${matched.name})`, 'info', 'Peran Pengguna Diubah');
    logActivity(`Beralih Peran ke ${role}`, 'Authentication', `User: ${matched.name}`);
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    showToast(`Aktif sebagai ${user.name} (${user.position})`, 'info');
  };

  const updateAdminLoginSettings = (settings: {
    employeeId: string;
    password: string;
    username?: string;
    email?: string;
  }): boolean => {
    const cleanId = settings.employeeId.trim();
    const cleanPass = settings.password.trim();
    const cleanUsername = settings.username?.trim() || 'admin';
    const cleanEmail = settings.email?.trim();

    if (!cleanId) {
      showToast('ID Karyawan admin tidak boleh kosong.', 'error', 'Validasi Gagal');
      return false;
    }
    if (!cleanPass) {
      showToast('Password admin tidak boleh kosong.', 'error', 'Validasi Gagal');
      return false;
    }

    // 1. Update Users state & storage
    setUsers((prev) => {
      const updated = prev.map((u) => {
        if (u.role === 'ADMIN' || u.id === 'usr-1') {
          return {
            ...u,
            employeeId: cleanId,
            password: cleanPass,
            username: cleanUsername,
            ...(cleanEmail ? { email: cleanEmail } : {}),
            hasLoginAccount: true,
          };
        }
        return u;
      });
      saveStorage('users', updated);
      return updated;
    });

    // 2. Update Employees state & storage
    setEmployees((prev) => {
      const updated = prev.map((e) => {
        if (e.role === 'ADMIN' || e.employeeId === cleanId || e.id === 'emp-1' || e.fullName === 'Ajeng Banu') {
          return {
            ...e,
            employeeId: cleanId,
            loginPassword: cleanPass,
            loginUsername: cleanUsername,
            ...(cleanEmail ? { email: cleanEmail } : {}),
            hasAccount: true,
          };
        }
        return e;
      });
      saveStorage('employees', updated);
      return updated;
    });

    // 3. Update active currentUser if role is ADMIN
    if (currentUser.role === 'ADMIN' || currentUser.id === 'usr-1') {
      setCurrentUserState((prev) => {
        const updated = {
          ...prev,
          employeeId: cleanId,
          password: cleanPass,
          username: cleanUsername,
          ...(cleanEmail ? { email: cleanEmail } : {}),
          hasLoginAccount: true,
        };
        saveStorage('currentUser', updated);
        return updated;
      });
    }

    logActivity(
      'Pembaruan Kredensial Login Admin',
      'Settings',
      `ID Karyawan: ${cleanId}, Password telah diperbarui`
    );
    showToast(
      `Pengaturan login admin berhasil diperbarui! Gunakan ID Karyawan "${cleanId}" dan password baru Anda untuk login manual.`,
      'success',
      'Kredensial Admin Disimpan'
    );
    return true;
  };

  // Employee Operations
  // Employee Operations
  const addEmployee = (empData: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => {
    const now = new Date().toISOString();
    const newEmp: Employee = {
      ...empData,
      id: 'emp-' + Date.now(),
      created_at: now,
      updated_at: now,
      created_by: currentUser.name,
      updated_by: currentUser.name,
    };
    setEmployees((prev) => [newEmp, ...prev]);

    // Automatically sync login account if enabled
    if (newEmp.hasAccount) {
      syncUserAccount(newEmp);
    }

    logActivity('Menambah Karyawan Baru', 'Employee Management', `${newEmp.fullName} (${newEmp.employeeId})`);
    showToast(`Karyawan ${newEmp.fullName} berhasil ditambahkan.`, 'success');
  };

  const updateEmployee = (id: string, empUpdates: Partial<Employee>) => {
    const now = new Date().toISOString();
    const existingEmp = employees.find((e) => e.id === id || e.employeeId === id);
    if (!existingEmp) return;

    // Security & Data Locking rule (Requirement #11):
    // Name and Birth Date can only be set once. Once filled, they become permanently LOCKED.
    const safeUpdates: Partial<Employee> = { ...empUpdates };

    if (existingEmp.nameLocked && safeUpdates.fullName && safeUpdates.fullName !== existingEmp.fullName) {
      showToast('Nama lengkap sudah terkunci secara permanen dan tidak dapat diubah.', 'warning', 'Field Terkunci');
      delete safeUpdates.fullName;
    } else if (safeUpdates.fullName && safeUpdates.fullName.trim().length > 0) {
      safeUpdates.nameLocked = true;
    }

    if (existingEmp.birthDateLocked && safeUpdates.birthDate && safeUpdates.birthDate !== existingEmp.birthDate) {
      showToast('Tanggal lahir sudah terkunci secara permanen dan tidak dapat diubah.', 'warning', 'Field Terkunci');
      delete safeUpdates.birthDate;
    } else if (safeUpdates.birthDate && safeUpdates.birthDate.trim().length > 0) {
      safeUpdates.birthDateLocked = true;
    }

    let updatedEmp: Employee | null = null;
    setEmployees((prev) =>
      prev.map((item) => {
        if (item.id === existingEmp.id) {
          updatedEmp = { ...item, ...safeUpdates, updated_at: now, updated_by: currentUser.name };
          return updatedEmp;
        }
        return item;
      })
    );

    // Sync login account if credentials or hasAccount is present
    const hasCredentials = Boolean(
      (safeUpdates.employeeId || existingEmp.employeeId) &&
      (safeUpdates.loginPassword || existingEmp.loginPassword)
    );

    if (safeUpdates.hasAccount || existingEmp.hasAccount || hasCredentials) {
      const merged: Employee = {
        ...existingEmp,
        ...safeUpdates,
        hasAccount: true,
      } as Employee;
      syncUserAccount(
        merged,
        safeUpdates.loginUsername || existingEmp.loginUsername,
        safeUpdates.loginPassword || existingEmp.loginPassword
      );
    } else if (safeUpdates.hasAccount === false) {
      setUsers((prev) => prev.filter((u) => u.employeeId !== existingEmp.employeeId && u.email.toLowerCase() !== existingEmp.email.toLowerCase()));
    }

    // Single Source of Truth Synchronization (Requirement #10):
    // 1. Sync currentUser if matching active user
    if (
      existingEmp.employeeId === currentUser.employeeId ||
      currentUser.id === existingEmp.id ||
      currentUser.name === existingEmp.fullName
    ) {
      setCurrentUserState((prev) => {
        const syncedUser: User = {
          ...prev,
          name: safeUpdates.fullName || prev.name,
          avatar: safeUpdates.photo || prev.avatar,
          email: safeUpdates.email || prev.email,
          phone: safeUpdates.phone || safeUpdates.whatsapp || prev.phone,
          employeeId: safeUpdates.employeeId || prev.employeeId,
          password: safeUpdates.loginPassword || prev.password,
          hasLoginAccount: true,
        };
        saveStorage('currentUser', syncedUser);
        return syncedUser;
      });
    }

    // 2. Sync in users list
    setUsers((prev) =>
      prev.map((u) => {
        if (u.employeeId === existingEmp.employeeId || u.email.toLowerCase() === existingEmp.email.toLowerCase()) {
          return {
            ...u,
            name: safeUpdates.fullName || u.name,
            avatar: safeUpdates.photo || u.avatar,
            email: safeUpdates.email || u.email,
            phone: safeUpdates.phone || safeUpdates.whatsapp || u.phone,
            employeeId: safeUpdates.employeeId || u.employeeId,
            password: safeUpdates.loginPassword || u.password,
            hasLoginAccount: true,
          };
        }
        return u;
      })
    );

    // 3. Sync into Weekly Schedules so employee name is 100% synchronized across all schedules
    if (safeUpdates.fullName && safeUpdates.fullName !== existingEmp.fullName) {
      setScheduleWeeks((prevWeeks) =>
        prevWeeks.map((week) => ({
          ...week,
          entries: week.entries.map((entry) =>
            entry.employeeId === existingEmp.employeeId || entry.employeeName === existingEmp.fullName
              ? { ...entry, employeeName: safeUpdates.fullName! }
              : entry
          ),
        }))
      );
    }

    logActivity('Memperbarui Data Karyawan', 'Employee Management', `${safeUpdates.fullName || existingEmp.fullName} (${existingEmp.employeeId})`);
    showToast('Data profil karyawan berhasil disimpan dan tersinkronisasi ke seluruh sistem.', 'success');
  };

  const updateEmployeePhoto = (id: string, newPhoto: string) => {
    const now = new Date().toISOString();
    const targetEmp = employees.find((e) => e.id === id || e.employeeId === id);
    if (!targetEmp) return;

    setEmployees((prev) =>
      prev.map((item) =>
        item.id === targetEmp.id
          ? { ...item, photo: newPhoto, updated_at: now, updated_by: currentUser.name }
          : item
      )
    );

    // Also sync photo in user account
    setUsers((prev) =>
      prev.map((u) =>
        u.employeeId === targetEmp.employeeId || u.email.toLowerCase() === targetEmp.email.toLowerCase()
          ? { ...u, avatar: newPhoto }
          : u
      )
    );

    // If target employee is current active user, update currentUser avatar
    if (
      targetEmp.employeeId === currentUser.employeeId ||
      currentUser.id === targetEmp.id ||
      currentUser.name === targetEmp.fullName
    ) {
      setCurrentUserState((prev) => ({ ...prev, avatar: newPhoto }));
    }

    logActivity('Ganti Foto Profil Karyawan', 'Employee Management', `${targetEmp.fullName} (${targetEmp.employeeId})`);
    showToast(`Foto profil ${targetEmp.fullName} berhasil diperbarui dari storage perangkat.`, 'success');
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    if (emp) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      setUsers((prev) => prev.filter((u) => u.employeeId !== emp.employeeId && u.email.toLowerCase() !== emp.email.toLowerCase()));
      logActivity('Menghapus Karyawan', 'Employee Management', `${emp.fullName} (${emp.employeeId})`);
      showToast('Karyawan telah berhasil dihapus dari sistem.', 'info');
    }
  };

  // Calculate stock status helper
  const calcStockStatus = (current: number, min: number) => {
    if (current <= 0) return 'OUT_OF_STOCK';
    if (current <= min) return 'LOW_STOCK';
    return 'SAFE';
  };

  // Inventory Operations
  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'status' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => {
    const now = new Date().toISOString();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const d = new Date();
    const lastUpdate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const status = calcStockStatus(itemData.currentStock, itemData.minimumStock);
    const newItem: InventoryItem = {
      ...itemData,
      id: 'inv-' + Date.now(),
      status,
      lastStockUpdate: lastUpdate,
      created_at: now,
      updated_at: now,
      created_by: currentUser.name,
      updated_by: currentUser.name,
    };
    setInventory((prev) => [newItem, ...prev]);
    logActivity('Menambah Item Inventory Baru', 'Inventory', `${newItem.itemName} (${newItem.itemCode})`);
    showToast(`Item ${newItem.itemName} berhasil ditambahkan ke inventaris.`, 'success');

    if (status === 'LOW_STOCK' || status === 'OUT_OF_STOCK') {
      const newNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        title: status === 'OUT_OF_STOCK' ? 'Stok Habis' : 'Stok Menipis',
        message: `Item ${newItem.itemName} memiliki stok ${newItem.currentStock} ${newItem.unit}`,
        type: status === 'OUT_OF_STOCK' ? 'ALERT' : 'WARNING',
        category: 'INVENTORY',
        isRead: false,
        linkTab: 'inventory',
        created_at: lastUpdate,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const updateInventoryItem = (id: string, itemUpdates: Partial<InventoryItem>) => {
    const now = new Date().toISOString();
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...itemUpdates, updated_at: now, updated_by: currentUser.name };
          if (updated.currentStock !== undefined && updated.minimumStock !== undefined) {
            updated.status = calcStockStatus(updated.currentStock, updated.minimumStock);
          }
          return updated;
        }
        return item;
      })
    );
    const itm = inventory.find((i) => i.id === id);
    logActivity('Memperbarui Data Item', 'Inventory', `${itm?.itemName || id}`);
    showToast('Data barang inventaris berhasil diubah.', 'success');
  };

  const deleteInventoryItem = (id: string) => {
    const itm = inventory.find((i) => i.id === id);
    setInventory((prev) => prev.filter((i) => i.id !== id));
    logActivity('Menghapus Item Inventory', 'Inventory', `${itm?.itemName || id}`);
    showToast('Item telah dihapus dari inventaris.', 'info');
  };

  const recordStockTransaction = ({
    itemId,
    type,
    quantity,
    notes,
  }: {
    itemId: string;
    type: TransactionType;
    quantity: number;
    notes?: string;
  }) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    const beforeStock = item.currentStock;
    let afterStock = beforeStock;
    if (type === 'STOCK_IN') {
      afterStock = beforeStock + quantity;
    } else if (type === 'STOCK_OUT') {
      afterStock = Math.max(0, beforeStock - quantity);
    } else if (type === 'ADJUSTMENT' || type === 'OPNAME') {
      afterStock = quantity; // quantity becomes new actual stock
    }

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const isoNow = now.toISOString();

    const newStatus = calcStockStatus(afterStock, item.minimumStock);

    // Update inventory item
    setInventory((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              currentStock: afterStock,
              status: newStatus,
              lastStockUpdate: formattedDate,
              updated_at: isoNow,
              updated_by: currentUser.name,
            }
          : i
      )
    );

    // Add transaction record
    const newTx: InventoryTransaction = {
      id: 'tx-' + Date.now(),
      date: formattedDate,
      itemId: item.id,
      itemCode: item.itemCode,
      itemName: item.itemName,
      transactionType: type,
      quantity: type === 'ADJUSTMENT' || type === 'OPNAME' ? Math.abs(afterStock - beforeStock) : quantity,
      beforeStock,
      afterStock,
      user: currentUser.name,
      notes: notes || '',
      created_at: isoNow,
      updated_at: isoNow,
      created_by: currentUser.name,
      updated_by: currentUser.name,
    };
    setTransactions((prev) => [newTx, ...prev]);

    logActivity(
      `Transaksi ${type} (${item.itemName})`,
      'Inventory',
      `Jumlah: ${quantity} ${item.unit}. Stok: ${beforeStock} -> ${afterStock}`
    );

    // Check alerts
    if (newStatus === 'OUT_OF_STOCK' || newStatus === 'LOW_STOCK') {
      const newNotif: NotificationItem = {
        id: 'notif-' + Date.now(),
        title: newStatus === 'OUT_OF_STOCK' ? `Peringatan: Stok ${item.itemName} Habis!` : `Stok ${item.itemName} Menipis`,
        message: `Sisa stok: ${afterStock} ${item.unit}. Batas minimum: ${item.minimumStock} ${item.unit}.`,
        type: newStatus === 'OUT_OF_STOCK' ? 'ALERT' : 'WARNING',
        category: 'INVENTORY',
        isRead: false,
        linkTab: 'inventory',
        created_at: formattedDate,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    showToast(`Transaksi ${type.replace('_', ' ')} untuk ${item.itemName} berhasil dicatat.`, 'success');
  };

  // Utility Operations
  const addUtilityReport = (reportData: Omit<UtilityReport, 'id' | 'usage' | 'indicator' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => {
    const usage = Math.max(0, reportData.meterEnd - reportData.meterStart);
    // Determine indicator based on historical average
    const sameTypeReports = utilityReports.filter((r) => r.type === reportData.type);
    const avg = sameTypeReports.length > 0 ? sameTypeReports.reduce((acc, curr) => acc + curr.usage, 0) / sameTypeReports.length : usage;

    let indicator: 'NORMAL' | 'HIGH' | 'LOW' = 'NORMAL';
    if (usage > avg * 1.15) {
      indicator = 'HIGH';
    } else if (usage < avg * 0.85) {
      indicator = 'LOW';
    }

    const now = new Date().toISOString();
    const newReport: UtilityReport = {
      ...reportData,
      id: 'util-' + Date.now(),
      usage,
      indicator,
      created_at: now,
      updated_at: now,
      created_by: currentUser.name,
      updated_by: currentUser.name,
    };
    setUtilityReports((prev) => [newReport, ...prev]);

    logActivity(
      `Input Laporan Meter ${reportData.type}`,
      'Utility Monitoring',
      `Tanggal: ${reportData.date}, Pemakaian: ${usage.toLocaleString()} ${reportData.unit}`
    );
    showToast(`Laporan ${reportData.type === 'ELECTRICITY' ? 'Listrik' : 'Air'} berhasil dicatat. Pemakaian: ${usage} ${reportData.unit}.`, 'success');
  };

  const deleteUtilityReport = (id: string) => {
    const item = utilityReports.find((r) => r.id === id);
    setUtilityReports((prev) => prev.filter((r) => r.id !== id));
    showToast(`Laporan utilitas berhasil dihapus.`, 'info');
    logActivity('Hapus Laporan Utilitas', 'Utility Monitoring', `ID: ${id} (${item?.type || ''})`);
  };

  // Cleaning Operations
  const addCleaningReport = (reportData: Omit<DailyCleaningReport, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => {
    const now = new Date().toISOString();
    const newReport: DailyCleaningReport = {
      ...reportData,
      id: 'clean-' + Date.now(),
      created_at: now,
      updated_at: now,
      created_by: currentUser.name,
      updated_by: currentUser.name,
    };
    setCleaningReports((prev) => [newReport, ...prev]);
    logActivity('Membuat Daily Cleaning Report', 'Daily Cleaning', `Tanggal: ${newReport.date} (${newReport.shift})`);
    showToast('Laporan kebersihan harian berhasil dibuat.', 'success');
  };

  const updateCleaningTask = (reportId: string, taskId: string, updates: Partial<CleaningTaskItem>) => {
    const now = new Date().toISOString();
    setCleaningReports((prev) =>
      prev.map((rep) => {
        if (rep.id === reportId) {
          const updatedTasks = rep.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task));
          const completedCount = updatedTasks.filter((t) => t.status === 'DONE').length;
          const totalCount = updatedTasks.length;
          const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          return {
            ...rep,
            tasks: updatedTasks,
            totalTasks: totalCount,
            completedTasks: completedCount,
            completionPercentage: pct,
            status: pct === 100 ? 'COMPLETED' : 'INCOMPLETE',
            updated_at: now,
            updated_by: currentUser.name,
          };
        }
        return rep;
      })
    );
    showToast('Status task kebersihan diperbarui.', 'success');
  };

  const reviewCleaningReport = (reportId: string, status: ApprovalStatus, remarks?: string) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const isoNow = now.toISOString();

    setCleaningReports((prev) =>
      prev.map((rep) => {
        if (rep.id === reportId) {
          return {
            ...rep,
            supervisorReview: {
              reviewedBy: currentUser.id,
              reviewedByName: currentUser.name,
              reviewDate: formattedDate,
              approvalStatus: status,
              remarks: remarks || '',
            },
            updated_at: isoNow,
            updated_by: currentUser.name,
          };
        }
        return rep;
      })
    );

    logActivity(`Review Laporan Kebersihan (${status})`, 'Daily Cleaning', `Report ID: ${reportId}`);
    showToast(`Laporan kebersihan berhasil di-${status === 'APPROVED' ? 'setujui' : 'tolak'}.`, 'success');
  };

  // Request Operations
  const addOffDayRequest = (req: { date: string; reason: string; notes?: string }) => {
    const now = new Date().toISOString();
    const newReq: OffDayRequest = {
      id: 'off-' + Date.now(),
      employeeId: currentUser.employeeId,
      employeeName: currentUser.name,
      department: currentUser.department,
      date: req.date,
      reason: req.reason,
      notes: req.notes,
      status: 'PENDING',
      created_at: now,
      updated_at: now,
      created_by: currentUser.name,
      updated_by: currentUser.name,
    };
    setOffDayRequests((prev) => [newReq, ...prev]);

    // Create Notification for Managers & Supervisors
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: 'Pengajuan Off Day Baru',
      message: `${currentUser.name} mengajukan Off Day untuk tanggal ${req.date}.`,
      type: 'INFO',
      category: 'REQUEST',
      isRead: false,
      linkTab: 'off-day',
      created_at: new Date().toLocaleDateString('id-ID'),
    };
    setNotifications((prev) => [notif, ...prev]);

    logActivity('Mengajukan Off Day', 'Off Day', `Tanggal: ${req.date}, Alasan: ${req.reason}`);
    showToast('Pengajuan Off Day Anda berhasil dikirimkan.', 'success');
  };

  const reviewOffDayRequest = (id: string, status: ApprovalStatus, remarks?: string) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const isoNow = now.toISOString();

    const targetReq = offDayRequests.find((r) => r.id === id);

    setOffDayRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              reviewedBy: currentUser.name,
              reviewRemarks: remarks || '',
              reviewDate: formattedDate,
              updated_at: isoNow,
              updated_by: currentUser.name,
            }
          : r
      )
    );

    // If approved, update employee status to OFF if date is today
    if (status === 'APPROVED' && targetReq) {
      const today = new Date().toISOString().split('T')[0];
      if (targetReq.date === today) {
        setEmployees((prev) =>
          prev.map((e) => (e.employeeId === targetReq.employeeId ? { ...e, status: 'OFF' } : e))
        );
      }
    }

    logActivity(
      `${status === 'APPROVED' ? 'Menyetujui' : 'Menolak'} Pengajuan Off Day`,
      'Off Day',
      `${targetReq?.employeeName} (${targetReq?.date})`
    );
    showToast(`Pengajuan Off Day telah di-${status === 'APPROVED' ? 'setujui' : 'tolak'}.`, 'success');
  };

  const addLeaveRequest = (req: {
    leaveType: any;
    startDate: string;
    endDate: string;
    reason: string;
    notes?: string;
    attachment?: string;
  }) => {
    const now = new Date().toISOString();
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newReq: LeaveRequest = {
      id: 'leave-' + Date.now(),
      employeeId: currentUser.employeeId,
      employeeName: currentUser.name,
      department: currentUser.department,
      leaveType: req.leaveType,
      startDate: req.startDate,
      endDate: req.endDate,
      totalDays: isNaN(totalDays) ? 1 : totalDays,
      reason: req.reason,
      attachment: req.attachment,
      notes: req.notes,
      status: 'PENDING',
      created_at: now,
      updated_at: now,
      created_by: currentUser.name,
      updated_by: currentUser.name,
    };
    setLeaveRequests((prev) => [newReq, ...prev]);

    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: 'Pengajuan Cuti Baru',
      message: `${currentUser.name} mengajukan Cuti (${totalDays} hari: ${req.startDate} s/d ${req.endDate}).`,
      type: 'INFO',
      category: 'REQUEST',
      isRead: false,
      linkTab: 'leave',
      created_at: new Date().toLocaleDateString('id-ID'),
    };
    setNotifications((prev) => [notif, ...prev]);

    logActivity('Mengajukan Permohonan Cuti', 'Leave', `${totalDays} Hari (${req.startDate} s/d ${req.endDate})`);
    showToast('Pengajuan Cuti Anda berhasil diserahkan.', 'success');
  };

  const reviewLeaveRequest = (id: string, status: ApprovalStatus, remarks?: string) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const isoNow = now.toISOString();

    const targetReq = leaveRequests.find((r) => r.id === id);

    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              reviewedBy: currentUser.name,
              reviewRemarks: remarks || '',
              reviewDate: formattedDate,
              updated_at: isoNow,
              updated_by: currentUser.name,
            }
          : r
      )
    );

    // If approved, deduct leave balance and update employee status
    if (status === 'APPROVED' && targetReq) {
      setEmployees((prev) =>
        prev.map((e) => {
          if (e.employeeId === targetReq.employeeId) {
            return {
              ...e,
              leaveBalance: Math.max(0, e.leaveBalance - targetReq.totalDays),
              status: 'LEAVE',
            };
          }
          return e;
        })
      );
    }

    logActivity(
      `${status === 'APPROVED' ? 'Menyetujui' : 'Menolak'} Pengajuan Cuti`,
      'Leave',
      `${targetReq?.employeeName} (${targetReq?.totalDays} Hari)`
    );
    showToast(`Pengajuan Cuti telah di-${status === 'APPROVED' ? 'setujui' : 'tolak'}.`, 'success');
  };

  const addSickLeaveRequest = (req: {
    dateStart: string;
    dateEnd: string;
    reason: string;
    description: string;
    medicalCertificate: string;
    notes?: string;
  }) => {
    const now = new Date().toISOString();
    const start = new Date(req.dateStart);
    const end = new Date(req.dateEnd);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newReq: SickLeaveRequest = {
      id: 'sick-' + Date.now(),
      employeeId: currentUser.employeeId,
      employeeName: currentUser.name,
      department: currentUser.department,
      dateStart: req.dateStart,
      dateEnd: req.dateEnd,
      totalDays: isNaN(totalDays) ? 1 : totalDays,
      reason: req.reason,
      description: req.description,
      medicalCertificate: req.medicalCertificate,
      notes: req.notes,
      status: 'PENDING',
      created_at: now,
      updated_at: now,
      created_by: currentUser.name,
      updated_by: currentUser.name,
    };
    setSickLeaveRequests((prev) => [newReq, ...prev]);

    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title: 'Pengajuan Izin Sakit',
      message: `${currentUser.name} mengajukan Izin Sakit (${totalDays} hari). Surat dokter terlampir.`,
      type: 'WARNING',
      category: 'REQUEST',
      isRead: false,
      linkTab: 'sick-leave',
      created_at: new Date().toLocaleDateString('id-ID'),
    };
    setNotifications((prev) => [notif, ...prev]);

    logActivity('Mengajukan Izin Sakit', 'Sick Leave', `Alasan: ${req.reason} (${req.dateStart} s/d ${req.dateEnd})`);
    showToast('Pengajuan Izin Sakit dan Surat Dokter berhasil diunggah.', 'success');
  };

  const reviewSickLeaveRequest = (id: string, status: ApprovalStatus, remarks?: string) => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const isoNow = now.toISOString();

    const targetReq = sickLeaveRequests.find((r) => r.id === id);

    setSickLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              reviewedBy: currentUser.name,
              reviewRemarks: remarks || '',
              reviewDate: formattedDate,
              updated_at: isoNow,
              updated_by: currentUser.name,
            }
          : r
      )
    );

    if (status === 'APPROVED' && targetReq) {
      setEmployees((prev) =>
        prev.map((e) => (e.employeeId === targetReq.employeeId ? { ...e, status: 'SICK' } : e))
      );
    }

    logActivity(
      `${status === 'APPROVED' ? 'Menyetujui' : 'Menolak'} Izin Sakit`,
      'Sick Leave',
      `${targetReq?.employeeName} (${targetReq?.reason})`
    );
    showToast(`Pengajuan Izin Sakit telah di-${status === 'APPROVED' ? 'setujui' : 'tolak'}.`, 'success');
  };

  // Notification Operations
  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('Semua notifikasi ditandai telah dibaca.', 'info');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    showToast('Seluruh notifikasi telah dibersihkan.', 'info');
  };

  // Data Backup & Restore Operations
  const createBackupSnapshot = (): boolean => {
    try {
      const snapshot = {
        timestamp: new Date().toISOString(),
        currentUser,
        users,
        employees,
        inventory,
        transactions,
        utilityReports,
        cleaningReports,
        offDayRequests,
        leaveRequests,
        sickLeaveRequests,
        notifications,
        activityLogs,
      };
      safeLocalStorage.setItem(LOCAL_STORAGE_PREFIX + 'backup_snapshot', JSON.stringify(snapshot));
      setHasBackupSnapshot(true);
      logActivity('Membuat Snapshot Backup Data', 'Data Management', 'Cadangan data seluruh menu berhasil disimpan');
      showToast('Cadangan (Backup Snapshot) data seluruh menu berhasil disimpan.', 'success');
      return true;
    } catch (e) {
      console.error(e);
      showToast('Gagal membuat snapshot cadangan data.', 'error');
      return false;
    }
  };

  const restoreData = (customData?: any): boolean => {
    try {
      let dataToRestore = customData;
      if (!dataToRestore) {
        const raw = safeLocalStorage.getItem(LOCAL_STORAGE_PREFIX + 'backup_snapshot');
        if (!raw) {
          showToast('Tidak ada file cadangan (backup snapshot) tersimpan untuk dipulihkan.', 'warning');
          return false;
        }
        dataToRestore = JSON.parse(raw);
      }

      if (dataToRestore.users) setUsers(dataToRestore.users);
      if (dataToRestore.currentUser) setCurrentUserState(dataToRestore.currentUser);
      if (dataToRestore.employees) setEmployees(dataToRestore.employees);
      if (dataToRestore.inventory) setInventory(dataToRestore.inventory);
      if (dataToRestore.transactions) setTransactions(dataToRestore.transactions);
      if (dataToRestore.utilityReports) setUtilityReports(dataToRestore.utilityReports);
      if (dataToRestore.cleaningReports) setCleaningReports(dataToRestore.cleaningReports);
      if (dataToRestore.offDayRequests) setOffDayRequests(dataToRestore.offDayRequests);
      if (dataToRestore.leaveRequests) setLeaveRequests(dataToRestore.leaveRequests);
      if (dataToRestore.sickLeaveRequests) setSickLeaveRequests(dataToRestore.sickLeaveRequests);
      if (dataToRestore.notifications) setNotifications(dataToRestore.notifications);
      if (dataToRestore.activityLogs) setActivityLogs(dataToRestore.activityLogs);

      logActivity('Memulihkan (Restore) Data', 'Data Management', 'Seluruh menu berhasil dipulihkan dari cadangan');
      showToast('Seluruh menu berhasil dipulihkan (Restore) dari cadangan.', 'success');
      return true;
    } catch (err) {
      console.error(err);
      showToast('Gagal memulihkan data dari cadangan.', 'error');
      return false;
    }
  };

  // Synchronized Reset strictly for 4 operational menus (Manager only)
  const clearAllMenuData = () => {
    try {
      createBackupSnapshot();

      // Only delete history on the 4 requested operational modules:
      // 1. Inventory / Stock Management (Transactions history)
      setTransactions([]);
      // 2. Utility Monitoring (Utility reports history)
      setUtilityReports([]);
      // 3. Daily Cleaning (Daily cleaning reports history)
      setCleaningReports([]);
      // 4. Manajemen Izin & Cuti Karyawan (Off day, leave, and sick leave requests history)
      setOffDayRequests([]);
      setLeaveRequests([]);
      setSickLeaveRequests([]);

      logActivity(
        'Reset Riwayat Operasional (4 Menu)',
        'Data Management',
        'Riwayat data pada 4 menu (Inventory, Utility, Daily Cleaning, Izin & Cuti) telah dibersihkan.'
      );
      showToast(
        'Riwayat data pada 4 menu (Inventory, Utility, Cleaning, Izin & Cuti) berhasil disinkronkan & dibersihkan.',
        'success'
      );
    } catch (e) {
      console.error(e);
      showToast('Gagal mereset data 4 menu.', 'error');
    }
  };

  const resetToInitialData = () => {
    try {
      createBackupSnapshot();

      safeLocalStorage.removeItem(LOCAL_STORAGE_PREFIX + 'currentUser');
      safeLocalStorage.removeItem(LOCAL_STORAGE_PREFIX + 'users');
      safeLocalStorage.removeItem(LOCAL_STORAGE_PREFIX + 'employees');
      safeLocalStorage.removeItem(LOCAL_STORAGE_PREFIX + 'inventory');
      safeLocalStorage.removeItem(LOCAL_STORAGE_PREFIX + 'transactions');
      safeLocalStorage.removeItem(LOCAL_STORAGE_PREFIX + 'utilityReports');
      safeLocalStorage.removeItem(LOCAL_STORAGE_PREFIX + 'cleaningReports');
      safeLocalStorage.removeItem(LOCAL_STORAGE_PREFIX + 'offDayRequests');
      safeLocalStorage.removeItem(LOCAL_STORAGE_PREFIX + 'leaveRequests');
      safeLocalStorage.removeItem(LOCAL_STORAGE_PREFIX + 'sickLeaveRequests');
      safeLocalStorage.removeItem(LOCAL_STORAGE_PREFIX + 'notifications');
      safeLocalStorage.removeItem(LOCAL_STORAGE_PREFIX + 'activityLogs');

      setCurrentUserState(INITIAL_USERS[0]);
      setUsers(INITIAL_USERS);
      setEmployees(INITIAL_EMPLOYEES);
      setInventory(INITIAL_INVENTORY);
      setTransactions(INITIAL_TRANSACTIONS);
      setUtilityReports(INITIAL_UTILITY_REPORTS);
      setCleaningReports(INITIAL_CLEANING_REPORTS);
      setOffDayRequests(INITIAL_OFF_DAY_REQUESTS);
      setLeaveRequests(INITIAL_LEAVE_REQUESTS);
      setSickLeaveRequests(INITIAL_SICK_LEAVE_REQUESTS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setActivityLogs(INITIAL_ACTIVITY_LOGS);

      showToast('Database berhasil di-reset ke data bawaan demo.', 'success');
    } catch (e) {
      console.error(e);
      showToast('Gagal mereset data.', 'error');
    }
  };

  return (
    <CinemaContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        switchUserRole: switchRole,
        availableUsers: users,
        users,
        setUsers,
        currentTab,
        setCurrentTab,
        isLoggedIn,
        login,
        logout,
        employees,
        addEmployee,
        updateEmployee,
        updateEmployeePhoto,
        deleteEmployee,
        inventory,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        recordStockTransaction,
        transactions,
        utilityReports,
        addUtilityReport,
        deleteUtilityReport,
        cleaningReports,
        addCleaningReport,
        updateCleaningTask,
        reviewCleaningReport,
        updateCleaningReportStatus: (repId, status, remarks) => reviewCleaningReport(repId, status, remarks),
        offDayRequests,
        addOffDayRequest,
        reviewOffDayRequest,
        updateOffDayStatus: (id, status, remarks) => reviewOffDayRequest(id, status, remarks),
        leaveRequests,
        addLeaveRequest,
        reviewLeaveRequest,
        updateLeaveStatus: (id, status, remarks) => reviewLeaveRequest(id, status, remarks),
        sickLeaveRequests,
        addSickLeaveRequest,
        reviewSickLeaveRequest,
        updateSickLeaveStatus: (id, status, remarks) => reviewSickLeaveRequest(id, status, remarks),
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        activityLogs,
        logActivity,
        resetToInitialData,
        updateAdminLoginSettings,
        syncUserAccount,
        createBackupSnapshot,
        restoreData,
        hasBackupSnapshot,
        clearAllMenuData,
        toasts,
        showToast,
        addToast: (msgOrTitle: string, type?: any, maybeType?: any) => {
          let t: any = 'info';
          if (['success', 'error', 'info', 'warning'].includes(type)) t = type;
          else if (['success', 'error', 'info', 'warning'].includes(maybeType)) t = maybeType;
          showToast(msgOrTitle, t);
        },
        dismissToast,
        confirmDialog,
        askConfirm,
        closeConfirm,
        activeQuickAction,
        setActiveQuickAction,
        scheduleWeeks,
        activeScheduleWeekId,
        setActiveScheduleWeekId,
        addScheduleWeek,
        updateScheduleWeek,
        deleteScheduleWeek,
        refreshSchedule,
        isRefreshingSchedule,
        scheduleLastRefreshedTime,
        scheduleLastSync,
        getEmployeeTodayStatus,
        birthdayEmployeesToday,
      }}
    >
      {children}
    </CinemaContext.Provider>
  );
};

export const useCinema = () => {
  const context = useContext(CinemaContext);
  if (!context) {
    throw new Error('useCinema must be used within a CinemaProvider');
  }
  return context;
};
