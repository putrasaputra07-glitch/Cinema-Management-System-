export type UserRole = 'ADMIN' | 'SUPERVISOR' | 'CREW';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  position: string;
  department: string;
  employeeId: string;
  username?: string;
  password?: string;
  hasLoginAccount?: boolean;
  phone?: string;
}

export type EmployeeStatus = 'ACTIVE' | 'OFF' | 'LEAVE' | 'SICK' | 'INACTIVE';

export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  photo: string;
  position: string;
  department: string;
  role: UserRole;
  joinDate: string;
  status: EmployeeStatus;
  whatsapp: string;
  email: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  notes?: string;
  leaveBalance: number; // in days
  birthDate?: string; // YYYY-MM-DD
  birthDateLocked?: boolean;
  nameLocked?: boolean;
  address?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  hasAccount?: boolean;
  loginUsername?: string;
  loginPassword?: string;
}

export type InventoryCategory =
  | 'Food & Beverage'
  | 'Cleaning Supplies'
  | 'Operational Supplies'
  | 'Office Supplies'
  | 'Packaging'
  | 'Maintenance'
  | 'Other';

export type StockStatus = 'SAFE' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: InventoryCategory;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  location: string;
  storageLocation?: string;
  supplier: string;
  lastStockUpdate: string;
  status: StockStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export type TransactionType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'OPNAME';

export interface InventoryTransaction {
  id: string;
  date: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  transactionType: TransactionType;
  quantity: number;
  beforeStock: number;
  afterStock: number;
  user: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export type UtilityType = 'ELECTRICITY' | 'WATER';

export interface UtilityReport {
  id: string;
  type: UtilityType;
  date: string;
  meterStart: number;
  meterEnd: number;
  usage: number; // meterEnd - meterStart
  unit: string; // 'kWh' or 'm³'
  photoMeter: string;
  notes?: string;
  submittedBy: string;
  submittedByName: string;
  indicator: 'NORMAL' | 'HIGH' | 'LOW';
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface CleaningTaskItem {
  id: string;
  area: string;
  task: string;
  status: 'DONE' | 'NOT_DONE';
  time?: string;
  pic: string;
  picName: string;
  notes?: string;
  photoEvidence?: string;
  photoBefore?: string;
  photoAfter?: string;
}

export type CleaningStatus = 'COMPLETED' | 'INCOMPLETE';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DailyCleaningReport {
  id: string;
  date: string;
  shift: 'Pagi' | 'Siang' | 'Malam';
  supervisorReview?: {
    reviewedBy: string;
    reviewedByName: string;
    reviewDate: string;
    approvalStatus: ApprovalStatus;
    remarks?: string;
  };
  supervisorName?: string;
  supervisorApproval?: ApprovalStatus;
  tasks: CleaningTaskItem[];
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  status: CleaningStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface OffDayRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string;
  reason: string;
  notes?: string;
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewRemarks?: string;
  rejectionReason?: string;
  reviewDate?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export type LeaveType = 'Annual Leave' | 'Special Leave' | 'Other';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachment?: string;
  notes?: string;
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewRemarks?: string;
  rejectionReason?: string;
  reviewDate?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface SickLeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  dateStart: string;
  dateEnd: string;
  totalDays: number;
  reason: string;
  description: string;
  medicalCertificate: string; // PDF / JPG / PNG data URL or URL
  notes?: string;
  status: ApprovalStatus;
  reviewedBy?: string;
  reviewRemarks?: string;
  rejectionReason?: string;
  reviewDate?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  category: 'REQUEST' | 'INVENTORY' | 'UTILITY' | 'CLEANING' | 'SYSTEM';
  isRead: boolean;
  linkTab?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  userName: string;
  role: UserRole;
  action: string;
  module: string;
  dataAffected: string;
  timestamp: string;
  description?: string;
  target?: string;
  ipAddress?: string;
}

export type ScheduleCategory = 'CINEMA_CREW' | 'LEADER';

export type ScheduleDutyStatus = 'DUTY' | 'DAYOFF' | 'PH_OFF' | 'LEAVE' | 'SICK';

export interface DailySchedulePlotting {
  station: string; // e.g. 'USHER', 'POS REGULAR', 'BOX OFFICE', 'CONCESSION', 'FLOOR', 'MOD', 'SPV'
  startAt?: string; // e.g. '11', '15', '09:00', '15:00'
  breakAt?: string; // e.g. '15', '16', '14:00'
  durationHours?: number; // e.g. 9
  totalMh?: number; // e.g. 8
  statusType: ScheduleDutyStatus;
  offLabel?: string; // e.g. 'ADD DAYOFF', 'PH OFF TGL 25', 'PH OFF TGL 17', 'CUTI TAHUNAN', 'SAKIT'
  notes?: string;
}

export interface WeeklyScheduleEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  position?: string;
  role: UserRole;
  category: ScheduleCategory;
  totalMh: number; // e.g. 40
  totalWorkingDays: number; // e.g. 5
  dailyPlotting: Record<string, DailySchedulePlotting>; // date string 'YYYY-MM-DD' -> plotting
}

export interface WeeklyScheduleWeek {
  id: string;
  siteName: string; // '60-LIPPO PLAZA'
  weekNumber: number; // e.g. 36, 37
  referensiWeek: number; // e.g. 32
  referensiYear: number; // e.g. 2026
  startDate: string; // YYYY-MM-DD (Rabu)
  endDate: string; // YYYY-MM-DD (Selasa)
  dailyAdmits?: Record<string, number>; // dateStr -> daily admit count
  entries: WeeklyScheduleEntry[];
  updatedAt: string;
  updatedBy: string;
  sourceType?: 'EXCEL' | 'IMAGE' | 'MANUAL';
  attachmentUrl?: string;
}

