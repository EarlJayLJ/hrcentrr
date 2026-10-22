import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  User,
  CaseItem,
  Task,
  Meeting,
  Message,
  Conversation,
  DocumentItem,
  Announcement,
  AuditLog,
  DashboardData,
  NotificationItem,
  UserRole
} from '../src/types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'hr_central_database.json');
const STORAGE_UPLOADS_DIR = path.resolve(process.cwd(), 'storage', 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(STORAGE_UPLOADS_DIR)) {
  fs.mkdirSync(STORAGE_UPLOADS_DIR, { recursive: true });
}

export interface UserRecord extends User {
  username: string;
  passwordHash: string;
  passwordSalt: string;
  failedLoginAttempts: number;
  lockUntil: number | null;
  mustChangePassword?: boolean;
}

export interface PasswordResetTicket {
  id: string;
  userId?: string;
  identifier: string;
  staffName?: string;
  department?: string;
  requestedAt: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  ipAddress: string;
  notes?: string;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
  ip: string;
  userAgent: string;
}

export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const h = crypto.pbkdf2Sync(password, s, 10000, 64, 'sha512').toString('hex');
  return { hash: h, salt: s };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const calculated = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(calculated, 'hex'), Buffer.from(hash, 'hex'));
  } catch (err) {
    return false;
  }
}

export interface AppDatabase {
  users: UserRecord[];
  cases: CaseItem[];
  tasks: Task[];
  meetings: Meeting[];
  messages: Message[];
  conversations: Conversation[];
  documents: DocumentItem[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  notifications?: NotificationItem[];
  resetTickets?: PasswordResetTicket[];
  sessions?: Session[];
  systemSettings: {
    orgName: string;
    subTitle: string;
    lanHost: string;
    allowSelfRegistration: boolean;
    requireDocumentApproval: boolean;
    timezone: string;
    maintenanceMode: boolean;
  };
}

const defaultSeedData: AppDatabase = {
  users: [
    {
      id: 'u1',
      name: 'Ekow Eshun',
      email: 'ekow.eshun@nya.gov.gh',
      username: 'ekow.eshun',
      role: 'HR_ADMIN',
      roleTitle: 'HEAD OF HR & OPERATIONS',
      avatarText: 'EE',
      avatarBg: '#006b3f',
      status: 'ACTIVE',
      department: 'Human Resources Directorate',
      joinedDate: '2022-03-01',
      passwordHash: '48eed5e070ba99de0de1e11cacbd19fb57c656372b30175789075ab1fc88eaafffa07b2ac66a09d0baf0d58be0ed9d8f6325ad4574c02e2efadf918dce4e7156',
      passwordSalt: '31c54106346b405defde5ba2f303a52e',
      failedLoginAttempts: 0,
      lockUntil: null,
      mustChangePassword: false
    },
    {
      id: 'u2',
      name: 'Akosua Frimpong',
      email: 'a.frimpong@nya.gov.gh',
      username: 'a.frimpong',
      role: 'HR_MANAGER',
      roleTitle: 'Principal HR Officer',
      avatarText: 'AF',
      avatarBg: '#0ea5e9',
      status: 'ACTIVE',
      department: 'Talent & Youth Development',
      joinedDate: '2021-08-15',
      passwordHash: '8eae2d27dc8706db3cc4183559907f35186d6e2fce160fc00ce9c639f0489bb933b72d86c502c0bdb70f675e10d0b59f45d5231fb996a83a8e98b8085c7574b4',
      passwordSalt: 'ca6cff9e9a63c60efc317dfefcadcf40',
      failedLoginAttempts: 0,
      lockUntil: null,
      mustChangePassword: false
    },
    {
      id: 'u3',
      name: 'Kwabena Osei',
      email: 'k.osei@nya.gov.gh',
      username: 'k.osei',
      role: 'HR_SPECIALIST',
      roleTitle: 'Regional HR Coordinator',
      avatarText: 'KO',
      avatarBg: '#8b5cf6',
      status: 'ACTIVE',
      department: 'Regional Operations Directorate',
      joinedDate: '2023-01-10',
      passwordHash: '8eae2d27dc8706db3cc4183559907f35186d6e2fce160fc00ce9c639f0489bb933b72d86c502c0bdb70f675e10d0b59f45d5231fb996a83a8e98b8085c7574b4',
      passwordSalt: 'ca6cff9e9a63c60efc317dfefcadcf40',
      failedLoginAttempts: 0,
      lockUntil: null,
      mustChangePassword: false
    },
    {
      id: 'u4',
      name: 'Miss Gloria',
      email: 'miss.gloria@nya.gov.gh',
      username: 'miss.gloria',
      role: 'HR_OFFICER',
      roleTitle: 'Senior Personnel Officer',
      avatarText: 'MG',
      avatarBg: '#ec4899',
      status: 'ACTIVE',
      department: 'Staff Welfare & NSSP Coordination',
      joinedDate: '2024-02-01',
      passwordHash: '8eae2d27dc8706db3cc4183559907f35186d6e2fce160fc00ce9c639f0489bb933b72d86c502c0bdb70f675e10d0b59f45d5231fb996a83a8e98b8085c7574b4',
      passwordSalt: 'ca6cff9e9a63c60efc317dfefcadcf40',
      failedLoginAttempts: 0,
      lockUntil: null,
      mustChangePassword: false
    },
    {
      id: 'u5',
      name: 'Kofi Boateng',
      email: 'k.boateng@nya.gov.gh',
      username: 'k.boateng',
      role: 'HR_SPECIALIST',
      roleTitle: 'Vocational Training Lead',
      avatarText: 'KB',
      avatarBg: '#10b981',
      status: 'ACTIVE',
      department: 'YLSTI Training Centers',
      joinedDate: '2022-11-20',
      passwordHash: '8eae2d27dc8706db3cc4183559907f35186d6e2fce160fc00ce9c639f0489bb933b72d86c502c0bdb70f675e10d0b59f45d5231fb996a83a8e98b8085c7574b4',
      passwordSalt: 'ca6cff9e9a63c60efc317dfefcadcf40',
      failedLoginAttempts: 0,
      lockUntil: null,
      mustChangePassword: false
    },
    {
      id: 'u6',
      name: 'Hajia Amina Fuseini',
      email: 'a.fuseini@nya.gov.gh',
      username: 'a.fuseini',
      role: 'HR_DIRECTOR',
      roleTitle: 'Staff & Labor Relations Lead',
      avatarText: 'AF',
      avatarBg: '#f59e0b',
      status: 'ACTIVE',
      department: 'Employee Relations Directorate',
      joinedDate: '2020-07-15',
      passwordHash: '8eae2d27dc8706db3cc4183559907f35186d6e2fce160fc00ce9c639f0489bb933b72d86c502c0bdb70f675e10d0b59f45d5231fb996a83a8e98b8085c7574b4',
      passwordSalt: 'ca6cff9e9a63c60efc317dfefcadcf40',
      failedLoginAttempts: 0,
      lockUntil: null,
      mustChangePassword: false
    },
    {
      id: 'u7',
      name: 'Dr. Emmanuel Mensah',
      email: 'e.mensah@nya.gov.gh',
      username: 'e.mensah',
      role: 'HR_MANAGER',
      roleTitle: 'Director of Administration',
      avatarText: 'EM',
      avatarBg: '#6366f1',
      status: 'ACTIVE',
      department: 'Executive Secretariat',
      joinedDate: '2019-05-10',
      passwordHash: '8eae2d27dc8706db3cc4183559907f35186d6e2fce160fc00ce9c639f0489bb933b72d86c502c0bdb70f675e10d0b59f45d5231fb996a83a8e98b8085c7574b4',
      passwordSalt: 'ca6cff9e9a63c60efc317dfefcadcf40',
      failedLoginAttempts: 0,
      lockUntil: null,
      mustChangePassword: false
    }
  ],
  cases: [],
  tasks: [],
  meetings: [],
  notifications: [],
  conversations: [],
  messages: [],
  documents: [],
  announcements: [],
  auditLogs: [],
  systemSettings: {
    orgName: "Ghana Youth Authority",
    subTitle: "National Youth Authority (NYA) - Human Resources Directorate",
    lanHost: "192.168.1.100",
    allowSelfRegistration: false,
    requireDocumentApproval: true,
    timezone: "GMT",
    maintenanceMode: false
  }
};

class StorageManager {
  private db: AppDatabase;
  private sessions: Map<string, Session> = new Map();

  constructor() {
    this.db = this.loadDatabase();
    if (Array.isArray(this.db.sessions)) {
      const now = Date.now();
      for (const s of this.db.sessions) {
        if (s && s.id && s.userId && s.expiresAt > now) {
          this.sessions.set(s.id, s);
        }
      }
    }
  }

  private syncSessionsToDb(): void {
    const now = Date.now();
    for (const [id, s] of this.sessions.entries()) {
      if (now > s.expiresAt) {
        this.sessions.delete(id);
      }
    }
    this.db.sessions = Array.from(this.sessions.values());
    this.saveDatabase(this.db);
  }

  private ensureUsersIntegrity(rawUsers: any[]): UserRecord[] {
    const hasNyaUsers = rawUsers.some(u => u.email && u.email.endsWith('@nya.gov.gh'));
    let usersList = rawUsers;
    if (!hasNyaUsers || usersList.length === 0) {
      usersList = defaultSeedData.users;
    }

    return usersList.map((u: any) => {
      let username = u.username;
      if (!username) {
        if (u.email && u.email.includes('@')) {
          username = u.email.split('@')[0];
        } else {
          username = u.name ? u.name.toLowerCase().replace(/\s+/g, '.') : 'user';
        }
      }

      let passwordHash = u.passwordHash;
      let passwordSalt = u.passwordSalt;
      if (!passwordHash || !passwordSalt) {
        const defaultPlain = u.role === 'HR_ADMIN' ? 'Admin@2026!NYA' : 'Staff@2026!NYA';
        const hashed = hashPassword(defaultPlain);
        passwordHash = hashed.hash;
        passwordSalt = hashed.salt;
      }

      return {
        id: u.id || 'u_' + Math.random().toString(36).substring(2, 9),
        name: u.name,
        email: u.email,
        username,
        role: u.role || 'HR_OFFICER',
        roleTitle: u.roleTitle || 'Personnel Officer',
        avatarText: u.avatarText || 'NY',
        avatarBg: u.avatarBg || '#006B3F',
        status: u.status || 'ACTIVE',
        department: u.department || 'Human Resources Directorate',
        joinedDate: u.joinedDate || '2024-01-01',
        passwordHash,
        passwordSalt,
        failedLoginAttempts: typeof u.failedLoginAttempts === 'number' ? u.failedLoginAttempts : 0,
        lockUntil: u.lockUntil || null,
        mustChangePassword: !!u.mustChangePassword,
        lastLogin: u.lastLogin || undefined
      };
    });
  }

  private migrateLegacyNames(db: AppDatabase): AppDatabase {
    const raw = JSON.stringify(db);
    const migrated = raw
      .replace(/Christian Aboagye/g, 'Ekow Eshun')
      .replace(/christian\.aboagye/g, 'ekow.eshun')
      .replace(/Abena Oforiwaa/g, 'Miss Gloria')
      .replace(/a\.oforiwaa/g, 'miss.gloria')
      .replace(/Good morning Christian/g, 'Good morning Ekow')
      .replace(/Hello Christian/g, 'Hello Ekow')
      .replace(/Thank you Abena/g, 'Thank you Gloria');

    const result = JSON.parse(migrated) as AppDatabase;

    if (result.users) {
      result.users.forEach(u => {
        if (u.id === 'u1') {
          u.name = 'Ekow Eshun';
          u.email = 'ekow.eshun@nya.gov.gh';
          u.username = 'ekow.eshun';
          u.avatarText = 'EE';
          u.avatarBg = '#006b3f';
        }
        if (u.id === 'u4') {
          u.name = 'Miss Gloria';
          u.email = 'miss.gloria@nya.gov.gh';
          u.username = 'miss.gloria';
          u.avatarText = 'MG';
        }
      });
    }

    return result;
  }

  private loadDatabase(): AppDatabase {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        let parsed = JSON.parse(content) as AppDatabase;
        if (parsed.users && Array.isArray(parsed.users)) {
          parsed = this.migrateLegacyNames(parsed);
          parsed.users = this.ensureUsersIntegrity(parsed.users);
          if (!parsed.resetTickets) parsed.resetTickets = [];
          if (!parsed.sessions) parsed.sessions = [];
          this.saveDatabase(parsed);
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to load database file, creating fresh database with seeds:', err);
    }
    let fresh = JSON.parse(JSON.stringify(defaultSeedData));
    fresh = this.migrateLegacyNames(fresh);
    fresh.users = this.ensureUsersIntegrity(fresh.users);
    fresh.resetTickets = [];
    this.saveDatabase(fresh);
    return fresh;
  }

  private saveDatabase(data: AppDatabase): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database to file:', err);
    }
  }

  public sanitizeUser(u: UserRecord): User {
    const { passwordHash, passwordSalt, ...safe } = u;
    return safe;
  }

  public getDatabase(): AppDatabase {
    return this.db;
  }

  public logAudit(actor: string, action: string, target: string, status: 'SUCCESS' | 'WARNING' | 'FAILED', ipAddress = '127.0.0.1', details?: string): void {
    const newLog: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      actor,
      action,
      target,
      timestamp: new Date().toISOString(),
      status,
      ipAddress,
      details
    };
    this.db.auditLogs.unshift(newLog);
    if (this.db.auditLogs.length > 500) {
      this.db.auditLogs = this.db.auditLogs.slice(0, 500);
    }
    this.saveDatabase(this.db);
  }

  // Notifications
  public getNotifications(userId: string): NotificationItem[] {
    if (!this.db.notifications) this.db.notifications = [];
    return this.db.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(data: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): NotificationItem {
    if (!this.db.notifications) this.db.notifications = [];
    const notif: NotificationItem = {
      ...data,
      id: 'notif_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      read: false
    };
    this.db.notifications.unshift(notif);
    this.saveDatabase(this.db);
    return notif;
  }

  public markNotificationRead(id: string, userId: string): boolean {
    if (!this.db.notifications) return false;
    const n = this.db.notifications.find(item => item.id === id && item.userId === userId);
    if (!n) return false;
    n.read = true;
    n.readAt = new Date().toISOString();
    this.saveDatabase(this.db);
    return true;
  }

  public markAllNotificationsRead(userId: string): boolean {
    if (!this.db.notifications) return false;
    let updated = false;
    const now = new Date().toISOString();
    this.db.notifications.forEach(n => {
      if (n.userId === userId && !n.read) {
        n.read = true;
        n.readAt = now;
        updated = true;
      }
    });
    if (updated) this.saveDatabase(this.db);
    return updated;
  }

  // Dashboard Aggregates calculated directly from real database items for Ghana Youth Authority
  public getDashboardData(currentUserId?: string): DashboardData {
    if (!currentUserId) {
      return {
        stats: {
          newCasesCount: 0,
          newCasesTrend: '0 pending',
          newCasesTrendPositive: false,
          newTasksCount: 0,
          newTasksTrend: '0 active',
          newTasksTrendPositive: false,
          totalOpenCases: 0,
          activeTeamMembers: this.db.users.filter(u => u.status === 'ACTIVE').length,
          unreadMessagesCount: 0,
          publishedAnnouncementsCount: 0,
          upcomingMeetingsCount: 0
        },
        casesToAccept: [],
        recentMessages: [],
        recentDocuments: [],
        recentAnnouncements: [],
        recentActivity: [],
        caseTypeBreakdown: [],
        countryBreakdown: [],
        calendarEvents: [],
        myTasks: [],
        tasksAssignedToOthers: []
      };
    }

    const user = this.db.users.find(u => u.id === currentUserId);
    const isHrHead = user?.role === 'HR_ADMIN';

    // Cases
    const userCases = isHrHead
      ? this.db.cases
      : this.db.cases.filter(c => c.assignee?.id === currentUserId);
    const pendingCases = userCases.filter(c => c.status === 'PENDING_ACCEPTANCE');
    
    // My Personal Tasks: assigned to me AND created by me (or marked isMyTask)
    const myTasks = this.db.tasks.filter(t => t.assigneeId === currentUserId && (t.creatorId === currentUserId || t.isMyTask));
    
    // Assigned Tasks:
    // For ordinary staff: tasks assigned to them by HR Head/others (creatorId !== currentUserId)
    // For HR Head: tasks created by HR Head and assigned to others (creatorId === currentUserId && assigneeId !== currentUserId)
    const tasksAssignedToOthers = isHrHead
      ? this.db.tasks.filter(t => t.creatorId === currentUserId && t.assigneeId !== currentUserId)
      : this.db.tasks.filter(t => t.assigneeId === currentUserId && t.creatorId !== currentUserId);

    const categories = [
      { type: 'Postings & Deployment', color: '#f97316' },
      { type: 'Training & Skills', color: '#06b6d4' },
      { type: 'Promotions', color: '#8b5cf6' },
      { type: 'Staff Welfare', color: '#ef4444' },
      { type: 'Policy & Compliance', color: '#22c55e' }
    ];
    const caseTypeBreakdown = categories.map(cat => ({
      type: cat.type,
      count: userCases.filter(c => c.category === cat.type).length,
      color: cat.color
    }));

    const regions = ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Northern'];
    const countryBreakdown = regions.map(region => {
      const activeCases = userCases.filter(c => c.country === region).length;
      return {
        country: region,
        activeCases,
        trend: activeCases > 0 ? `+${activeCases}` : '0',
        trendPositive: activeCases > 0
      };
    });

    // Conversations & Messages authorized for this user
    const userConversations = this.getConversations(currentUserId);
    const userConvIds = userConversations.map(c => c.id);
    const userMessages = this.db.messages.filter(m => userConvIds.includes(m.conversationId));
    const unreadMessagesCount = userMessages.filter(m =>
      m.senderId !== currentUserId && (!m.readBy || !m.readBy.includes(currentUserId))
    ).length;

    const activeAnnouncements = (this.db.announcements || []).filter(a => !a.isDraft);
    const activeDocuments = this.getDocuments(currentUserId, user?.role, user?.name);
    const userMeetings = this.getMeetings(currentUserId);
    const upcomingMeetings = userMeetings.filter(m => m.status === 'UPCOMING');

    const recentActivity = isHrHead
      ? (this.db.auditLogs || []).slice(0, 4)
      : (this.db.auditLogs || []).filter(l => l.actor === user?.name || (l.target && l.target.includes(user?.name || ''))).slice(0, 4);

    const activeTasksCount = myTasks.filter(t => t.status !== 'COMPLETED').length + tasksAssignedToOthers.filter(t => t.status !== 'COMPLETED').length;

    return {
      stats: {
        newCasesCount: userCases.length,
        newCasesTrend: `${pendingCases.length} pending`,
        newCasesTrendPositive: pendingCases.length > 0,
        newTasksCount: myTasks.length + tasksAssignedToOthers.length,
        newTasksTrend: `${activeTasksCount} active`,
        newTasksTrendPositive: activeTasksCount > 0,
        totalOpenCases: userCases.length,
        activeTeamMembers: this.db.users.filter(u => u.status === 'ACTIVE').length,
        unreadMessagesCount,
        publishedAnnouncementsCount: activeAnnouncements.length,
        upcomingMeetingsCount: upcomingMeetings.length
      },
      casesToAccept: pendingCases,
      recentMessages: userMessages.slice(0, 2),
      recentDocuments: activeDocuments.slice(0, 3),
      recentAnnouncements: activeAnnouncements.slice(0, 2),
      recentActivity,
      caseTypeBreakdown,
      countryBreakdown,
      calendarEvents: userMeetings,
      myTasks,
      tasksAssignedToOthers
    };
  }

  // Cases
  public getCases(): CaseItem[] {
    return this.db.cases;
  }

  public createCase(newCase: Omit<CaseItem, 'id' | 'createdDate'>, actor: string): CaseItem {
    const item: CaseItem = {
      ...newCase,
      id: 'c_' + Date.now(),
      createdDate: new Date().toISOString().split('T')[0]
    };
    this.db.cases.unshift(item);
    this.saveDatabase(this.db);
    this.logAudit(actor, 'CASE_CREATE', item.name, 'SUCCESS', 'LAN', `Case number: ${item.caseNumber}`);
    return item;
  }

  public updateCaseStatus(id: string, status: CaseItem['status'], actor: string): CaseItem | null {
    const index = this.db.cases.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.db.cases[index].status = status;
    this.saveDatabase(this.db);
    this.logAudit(actor, 'CASE_STATUS_UPDATE', this.db.cases[index].name, 'SUCCESS', 'LAN', `Status updated to ${status}`);
    return this.db.cases[index];
  }

  // Tasks
  public getTasks(userId?: string, userRole?: string): Task[] {
    if (!userId) return [];
    const visible = userRole === 'HR_ADMIN'
      ? this.db.tasks.filter(t =>
          t.creatorId === userId ||
          t.assigneeId === userId ||
          (t.creatorId !== t.assigneeId)
        )
      : this.db.tasks.filter(t => t.assigneeId === userId || t.creatorId === userId);

    return visible.map(t => ({
      ...t,
      isMyTask: t.assigneeId === userId && (!t.creatorId || t.creatorId === userId)
    }));
  }

  public createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'commentsCount'>, actor: string): Task {
    const isPersonal = !taskData.creatorId || taskData.assigneeId === taskData.creatorId;
    const task: Task = {
      ...taskData,
      isMyTask: isPersonal,
      reminderAcknowledgedBy: taskData.reminderAcknowledgedBy || [],
      id: 't_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString().split('T')[0],
      commentsCount: 0
    };
    this.db.tasks.unshift(task);
    this.saveDatabase(this.db);
    this.logAudit(actor, 'TASK_CREATE', task.title, 'SUCCESS', 'LAN', `Assigned to ${task.assigneeName}`);
    return task;
  }

  public updateTaskStatus(id: string, status: Task['status'], actor: string): Task | null {
    const idx = this.db.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.db.tasks[idx].status = status;
    this.saveDatabase(this.db);
    this.logAudit(actor, 'TASK_STATUS_UPDATE', this.db.tasks[idx].title, 'SUCCESS', 'LAN', `Status: ${status}`);
    return this.db.tasks[idx];
  }

  public acknowledgeTaskReminder(id: string, userId: string, reminderKey?: string): Task | null {
    const idx = this.db.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    const task = this.db.tasks[idx];
    if (!Array.isArray(task.reminderAcknowledgedBy)) {
      task.reminderAcknowledgedBy = [];
    }
    const tokenKey = reminderKey || `${task.id}__${task.dueDate}__${task.dueTime || '17:00'}`;
    const userEntry = `${userId}:${tokenKey}`;
    if (!task.reminderAcknowledgedBy.includes(userEntry)) {
      task.reminderAcknowledgedBy.push(userEntry);
    }
    if (!task.reminderAcknowledgedBy.includes(userId)) {
      task.reminderAcknowledgedBy.push(userId);
    }
    this.saveDatabase(this.db);
    return task;
  }

  public clearAllTasks(actor = 'Admin'): void {
    this.db.tasks = [];
    this.saveDatabase(this.db);
    this.logAudit(actor, 'TASK_CLEAR_ALL', 'All Tasks', 'SUCCESS', 'LAN', 'Cleared all tasks from system');
  }

  // Meetings
  public getMeetings(userId?: string): Meeting[] {
    if (!this.db.meetings) return [];
    if (!userId) return this.db.meetings;
    return this.db.meetings.filter(m => 
      !m.attendeeIds || m.attendeeIds.length === 0 || m.attendeeIds.includes(userId) || m.organizerId === userId || !m.status || m.status === 'UPCOMING'
    );
  }

  public createMeeting(data: Omit<Meeting, 'id'>, actor: string): Meeting {
    const meeting: Meeting = {
      ...data,
      id: 'm_' + Date.now()
    };
    this.db.meetings.push(meeting);
    this.saveDatabase(this.db);
    this.logAudit(actor, 'MEETING_CREATE', meeting.title, 'SUCCESS', 'LAN', `${meeting.date} at ${meeting.startTime}`);
    return meeting;
  }

  public clearAllMeetings(actor = 'Admin'): void {
    this.db.meetings = [];
    this.saveDatabase(this.db);
    this.logAudit(actor, 'MEETING_CLEAR_ALL', 'All Meetings', 'SUCCESS', 'LAN', 'Cleared all meetings from calendar');
  }

  // Messages & Conversations
  public getConversations(userId?: string): Conversation[] {
    if (!userId) return this.db.conversations;

    const userConvs = this.db.conversations.filter(c =>
      c.participantIds && c.participantIds.includes(userId)
    );

    return userConvs.map(conv => {
      let displayName = conv.name;
      let avatarText = conv.avatarText;
      let avatarBg = conv.avatarBg;

      if (!conv.isGroup) {
        const otherId = conv.participantIds.find(id => id !== userId);
        const otherUser = this.db.users.find(u => u.id === otherId);
        if (otherUser) {
          displayName = otherUser.name;
          avatarText = otherUser.avatarText;
          avatarBg = otherUser.avatarBg;
        }
      }

      const unreadCount = this.db.messages.filter(m =>
        m.conversationId === conv.id &&
        m.senderId !== userId &&
        (!m.readBy || !m.readBy.includes(userId)) &&
        m.unread !== false
      ).length;

      return {
        ...conv,
        name: displayName,
        avatarText,
        avatarBg,
        unreadCount
      };
    });
  }

  public getConversationById(id: string): Conversation | null {
    return this.db.conversations.find(c => c.id === id) || null;
  }

  public getMessages(conversationId?: string, userId?: string): Message[] {
    if (conversationId) {
      if (userId) {
        const conv = this.getConversationById(conversationId);
        if (conv && conv.participantIds && !conv.participantIds.includes(userId)) {
          return [];
        }
      }
      return this.db.messages.filter(m => m.conversationId === conversationId);
    }
    return this.db.messages;
  }

  public getMessageById(id: string): Message | null {
    return this.db.messages.find(m => m.id === id) || null;
  }

  public markConversationAsRead(conversationId: string, userId: string): boolean {
    const conv = this.getConversationById(conversationId);
    if (!conv) return false;
    if (conv.participantIds && !conv.participantIds.includes(userId)) return false;

    let modified = false;
    for (const msg of this.db.messages) {
      if (msg.conversationId === conversationId && msg.senderId !== userId) {
        if (!msg.readBy) msg.readBy = [];
        if (!msg.readBy.includes(userId)) {
          msg.readBy.push(userId);
          modified = true;
        }
        if (msg.unread) {
          msg.unread = false;
          modified = true;
        }
      }
    }

    if (modified) {
      this.saveDatabase(this.db);
    }
    return true;
  }

  public sendMessage(
    conversationId: string,
    senderId: string,
    text: string,
    attachmentName?: string,
    attachmentPath?: string,
    attachmentSize?: string,
    attachmentMime?: string,
    replyTo?: Message['replyTo']
  ): Message {
    const sender = this.db.users.find(u => u.id === senderId) || this.db.users[0];
    const msgText = (text && text.trim()) ? text.trim() : (attachmentName ? `📎 Attached: ${attachmentName}` : 'Sent a message');
    const newMsg: Message = {
      id: 'msg_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      conversationId,
      senderId: sender.id,
      senderName: sender.name,
      senderInitials: sender.avatarText,
      senderBg: sender.avatarBg,
      text: msgText,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      unread: true,
      readBy: [sender.id],
      attachmentName,
      attachmentPath,
      attachmentSize,
      attachmentMime,
      replyTo
    };
    this.db.messages.push(newMsg);

    // Update conversation last message
    const convIdx = this.db.conversations.findIndex(c => c.id === conversationId);
    if (convIdx !== -1) {
      this.db.conversations[convIdx].lastMessage = msgText;
      this.db.conversations[convIdx].lastMessageTime = 'Just now';
    }

    this.saveDatabase(this.db);
    return newMsg;
  }

  // Documents
  public getDocuments(userId?: string, userRole?: string, userName?: string): DocumentItem[] {
    if (!this.db.documents) return [];
    const active = this.db.documents.filter(d => !d.isArchived);
    if (!userRole) return active;
    if (userRole === 'HR_ADMIN' || userRole === 'HR_DIRECTOR') return active;
    return active.filter(d => 
      (d.accessRole && d.accessRole.includes(userRole as UserRole)) ||
      (userName && d.uploadedBy === userName)
    );
  }

  public createDocument(doc: Omit<DocumentItem, 'id' | 'uploadedAt' | 'downloadCount' | 'isArchived'>, actor: string): DocumentItem {
    const now = new Date();
    const datePart = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const timePart = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const formattedTimestamp = `${datePart} at ${timePart}`;

    const newDoc: DocumentItem = {
      ...doc,
      id: 'doc_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      uploadedAt: formattedTimestamp,
      downloadCount: 0,
      isArchived: false
    };
    this.db.documents.unshift(newDoc);
    this.saveDatabase(this.db);
    this.logAudit(actor, 'DOCUMENT_UPLOAD', newDoc.name, 'SUCCESS', 'LAN', `${newDoc.fileSize} - ${newDoc.category} by ${actor}`);
    return newDoc;
  }

  public recordDownload(id: string, actor: string): DocumentItem | null {
    const doc = this.db.documents.find(d => d.id === id);
    if (!doc) return null;
    doc.downloadCount += 1;
    this.saveDatabase(this.db);
    this.logAudit(actor, 'DOCUMENT_DOWNLOAD', doc.name, 'SUCCESS', 'LAN');
    return doc;
  }

  // Announcements
  public getAnnouncements(): Announcement[] {
    return this.db.announcements;
  }

  public createAnnouncement(announcement: Omit<Announcement, 'id' | 'publishedAt' | 'acknowledgedBy'>, actor: string): Announcement {
    const item: Announcement = {
      ...announcement,
      id: 'ann_' + Date.now(),
      publishedAt: new Date().toISOString().split('T')[0],
      acknowledgedBy: []
    };
    this.db.announcements.unshift(item);
    this.saveDatabase(this.db);
    this.logAudit(actor, 'ANNOUNCEMENT_PUBLISH', item.title, 'SUCCESS', 'LAN', `Priority: ${item.priority}`);
    return item;
  }

  public acknowledgeAnnouncement(id: string, userId: string): boolean {
    const item = this.db.announcements.find(a => a.id === id);
    if (!item) return false;
    if (!item.acknowledgedBy.includes(userId)) {
      item.acknowledgedBy.push(userId);
      this.saveDatabase(this.db);
    }
    return true;
  }

  public createConversation(name: string, isGroup: boolean, participantIds: string[], actor: string): Conversation {
    if (!isGroup && participantIds.length === 2) {
      const existing = this.db.conversations.find(c =>
        !c.isGroup &&
        c.participantIds &&
        c.participantIds.length === 2 &&
        c.participantIds.includes(participantIds[0]) &&
        c.participantIds.includes(participantIds[1])
      );
      if (existing) {
        return existing;
      }
    }

    const participants = this.db.users.filter(u => participantIds.includes(u.id));
    const newConv: Conversation = {
      id: 'conv_' + Date.now(),
      name,
      isGroup,
      participantIds,
      participantNames: participants.map(p => p.name),
      lastMessage: 'Conversation opened',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      avatarText: isGroup ? 'GP' : (participants[0]?.avatarText || 'DM'),
      avatarBg: isGroup ? '#6366f1' : (participants[0]?.avatarBg || '#006b3f')
    };
    this.db.conversations.unshift(newConv);
    this.saveDatabase(this.db);
    this.logAudit(actor, 'CONVERSATION_CREATE', newConv.name, 'SUCCESS', 'LAN', `Participants: ${participantIds.length}`);
    return newConv;
  }

  public archiveDocument(id: string, actor: string): boolean {
    const doc = this.db.documents.find(d => d.id === id);
    if (!doc) return false;
    doc.isArchived = true;
    this.saveDatabase(this.db);
    this.logAudit(actor, 'DOCUMENT_ARCHIVE', doc.name, 'SUCCESS', 'LAN');
    return true;
  }

  public renameDocument(id: string, newName: string, actor: string): DocumentItem | null {
    const doc = this.db.documents.find(d => d.id === id);
    if (!doc) return null;
    const oldName = doc.name;
    doc.name = newName;
    this.saveDatabase(this.db);
    this.logAudit(actor, 'DOCUMENT_RENAME', `${oldName} -> ${newName}`, 'SUCCESS', 'LAN');
    return doc;
  }

  public deleteAnnouncement(id: string, actor: string): boolean {
    const idx = this.db.announcements.findIndex(a => a.id === id);
    if (idx === -1) return false;
    const removed = this.db.announcements.splice(idx, 1)[0];
    this.saveDatabase(this.db);
    this.logAudit(actor, 'ANNOUNCEMENT_DELETE', removed.title, 'SUCCESS', 'LAN');
    return true;
  }

  public updateAnnouncement(id: string, data: Partial<Announcement>, actor: string): Announcement | null {
    const ann = this.db.announcements.find(a => a.id === id);
    if (!ann) return null;
    Object.assign(ann, data);
    this.saveDatabase(this.db);
    this.logAudit(actor, 'ANNOUNCEMENT_UPDATE', ann.title, 'SUCCESS', 'LAN');
    return ann;
  }

  public getSystemSettings() {
    return this.db.systemSettings || {
      orgName: 'Ghana Youth Authority',
      subTitle: 'HR Department Central Portal',
      lanHost: 'nya-ghana-hr-lan',
      allowSelfRegistration: false,
      requireDocumentApproval: true,
      timezone: 'GMT (UTC+0)',
      maintenanceMode: false
    };
  }

  public updateSystemSettings(settings: Partial<AppDatabase['systemSettings']>, actor: string) {
    this.db.systemSettings = {
      ...this.getSystemSettings(),
      ...settings
    };
    this.saveDatabase(this.db);
    this.logAudit(actor, 'SETTINGS_UPDATE', 'System Configuration', 'SUCCESS', 'LAN');
    return this.db.systemSettings;
  }

  public exportAuditLogsCsv(): string {
    const headers = ['Timestamp', 'Actor', 'Action', 'Target', 'Status', 'IP Address', 'Details'];
    const rows = this.db.auditLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.actor.replace(/"/g, '""')}"`,
      `"${l.action}"`,
      `"${l.target.replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${l.ipAddress}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  public exportTasksCsv(): string {
    const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Due Date', 'Assignee', 'Creator'];
    const rows = this.db.tasks.map(t => [
      `"${t.id}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      `"${t.priority}"`,
      `"${t.status}"`,
      `"${t.dueDate}"`,
      `"${t.assigneeName}"`,
      `"${t.creatorName}"`
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // Users & Access Control
  public getUsers(): User[] {
    return this.db.users.map(u => this.sanitizeUser(u));
  }

  public getRawUsers(): UserRecord[] {
    return this.db.users;
  }

  public getUserById(id: string): User | null {
    const user = this.db.users.find(u => u.id === id);
    return user ? this.sanitizeUser(user) : null;
  }

  public getRawUserById(id: string): UserRecord | null {
    return this.db.users.find(u => u.id === id) || null;
  }

  public findUserByUsernameOrEmail(identifier: string): UserRecord | null {
    if (!identifier) return null;
    const trimmed = identifier.trim().toLowerCase();
    return this.db.users.find(u =>
      (u.email && u.email.toLowerCase() === trimmed) ||
      (u.username && u.username.toLowerCase() === trimmed)
    ) || null;
  }

  public getUsersWithSecurityInfo(): any[] {
    return this.db.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      username: u.username,
      role: u.role,
      roleTitle: u.roleTitle,
      department: u.department,
      status: u.status,
      failedLoginAttempts: u.failedLoginAttempts || 0,
      isLocked: !!(u.lockUntil && Date.now() < u.lockUntil),
      lockUntil: u.lockUntil,
      mustChangePassword: !!u.mustChangePassword,
      lastLogin: u.lastLogin,
      avatarText: u.avatarText,
      avatarBg: u.avatarBg
    }));
  }

  public verifyCredentials(identifier: string, plainText: string, ip = '127.0.0.1'): {
    success: boolean;
    reason?: 'NOT_FOUND' | 'DEACTIVATED' | 'LOCKED' | 'INVALID_CREDENTIALS';
    lockUntil?: number | null;
    minutesLeft?: number;
    remainingAttempts?: number;
    user?: User;
  } {
    const user = this.findUserByUsernameOrEmail(identifier);
    if (!user) {
      this.logAudit('Anonymous', 'AUTH_LOGIN_FAILED', identifier, 'FAILED', ip, 'Identifier not registered in local directory');
      return { success: false, reason: 'INVALID_CREDENTIALS' };
    }

    if (user.status === 'INACTIVE') {
      this.logAudit(user.name, 'AUTH_LOGIN_BLOCKED', user.email, 'FAILED', ip, 'Account is deactivated by HR Administrator');
      return { success: false, reason: 'DEACTIVATED' };
    }

    // Check account lockout
    if (user.lockUntil) {
      if (Date.now() < user.lockUntil) {
        const msLeft = user.lockUntil - Date.now();
        const minutesLeft = Math.max(1, Math.ceil(msLeft / (60 * 1000)));
        this.logAudit(user.name, 'AUTH_LOGIN_LOCKED', user.email, 'FAILED', ip, `Account locked. ${minutesLeft}m remaining`);
        return { success: false, reason: 'LOCKED', lockUntil: user.lockUntil, minutesLeft };
      } else {
        // Lock period has expired: reset
        user.lockUntil = null;
        user.failedLoginAttempts = 0;
      }
    }

    const isMatch = verifyPassword(plainText, user.passwordHash, user.passwordSalt);
    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      const remaining = Math.max(0, 5 - user.failedLoginAttempts);

      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
        this.saveDatabase(this.db);
        this.logAudit(user.name, 'ACCOUNT_LOCKOUT', user.email, 'FAILED', ip, 'Locked after 5 consecutive failed login attempts');
        return {
          success: false,
          reason: 'LOCKED',
          lockUntil: user.lockUntil,
          minutesLeft: 15
        };
      }

      this.saveDatabase(this.db);
      this.logAudit(user.name, 'AUTH_PASSWORD_MISMATCH', user.email, 'FAILED', ip, `Failed attempt ${user.failedLoginAttempts} of 5`);
      return {
        success: false,
        reason: 'INVALID_CREDENTIALS',
        remainingAttempts: remaining
      };
    }

    // Login Successful
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date().toISOString();
    this.saveDatabase(this.db);
    this.logAudit(user.name, 'AUTH_LOGIN_SUCCESS', user.email, 'SUCCESS', ip, 'User session authenticated locally');

    return { success: true, user: this.sanitizeUser(user) };
  }

  public changePassword(userId: string, currentPlain: string, newPlain: string, ip = '127.0.0.1'): { success: boolean; error?: string } {
    const user = this.db.users.find(u => u.id === userId);
    if (!user) return { success: false, error: 'User not found' };

    if (!verifyPassword(currentPlain, user.passwordHash, user.passwordSalt)) {
      this.logAudit(user.name, 'PASSWORD_CHANGE_FAILED', user.email, 'FAILED', ip, 'Current password verification failed');
      return { success: false, error: 'Current password is incorrect' };
    }

    if (newPlain.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters long' };
    }

    const { hash, salt } = hashPassword(newPlain);
    user.passwordHash = hash;
    user.passwordSalt = salt;
    user.mustChangePassword = false;
    this.saveDatabase(this.db);
    this.logAudit(user.name, 'PASSWORD_CHANGE_SUCCESS', user.email, 'SUCCESS', ip, 'Security password successfully updated');
    return { success: true };
  }

  public adminCreateUser(
    userData: Omit<User, 'id' | 'joinedDate'> & { username?: string; initialPassword?: string; mustChangePassword?: boolean },
    actor: string
  ): User {
    if (!userData.name || !userData.name.trim()) {
      throw new Error('Full official name is required.');
    }
    if (!userData.email || !userData.email.trim()) {
      throw new Error('Official email address is required.');
    }

    const emailTrimmed = userData.email.trim().toLowerCase();
    const existingEmail = this.db.users.find(u => u.email && u.email.toLowerCase() === emailTrimmed);
    if (existingEmail) {
      throw new Error(`An account with email address '${userData.email}' already exists.`);
    }

    let username = userData.username?.trim();
    if (!username) {
      username = userData.email ? userData.email.split('@')[0] : 'user_' + Date.now();
    }

    const existingUsername = this.db.users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());
    if (existingUsername) {
      throw new Error(`Username '${username}' is already assigned to another staff member.`);
    }

    const initialPlain = userData.initialPassword || 'Staff@2026!NYA';
    const { hash, salt } = hashPassword(initialPlain);

    const newUser: UserRecord = {
      ...userData,
      id: 'u_' + Date.now(),
      username,
      passwordHash: hash,
      passwordSalt: salt,
      failedLoginAttempts: 0,
      lockUntil: null,
      mustChangePassword: userData.mustChangePassword !== false,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    this.db.users.push(newUser);
    this.saveDatabase(this.db);
    this.logAudit(actor, 'ADMIN_USER_CREATE', `${newUser.name} (${newUser.email})`, 'SUCCESS', 'LAN', `Initial password assigned for ${newUser.roleTitle}`);
    return this.sanitizeUser(newUser);
  }

  public createUser(userData: Omit<User, 'id' | 'joinedDate'>, actor: string): User {
    return this.adminCreateUser(userData, actor);
  }

  public adminResetPassword(userId: string, newPlain: string, actor: string): { success: boolean; user?: User; temporaryPassword?: string } {
    const user = this.db.users.find(u => u.id === userId);
    if (!user) return { success: false };

    const { hash, salt } = hashPassword(newPlain);
    user.passwordHash = hash;
    user.passwordSalt = salt;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    user.mustChangePassword = true;
    this.saveDatabase(this.db);
    this.logAudit(actor, 'ADMIN_PASSWORD_RESET', user.email, 'SUCCESS', 'LAN', 'Administrative password reset performed');
    return { success: true, user: this.sanitizeUser(user), temporaryPassword: newPlain };
  }

  public adminUnlockAccount(userId: string, actor: string): boolean {
    const user = this.db.users.find(u => u.id === userId);
    if (!user) return false;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    this.saveDatabase(this.db);
    this.logAudit(actor, 'ADMIN_ACCOUNT_UNLOCK', user.email, 'SUCCESS', 'LAN', 'Account lockout cleared by administrator');
    return true;
  }

  public updateUserStatus(id: string, status: User['status'], actor: string): User | null {
    if (status !== 'ACTIVE' && status !== 'INACTIVE') return null;
    const user = this.db.users.find(u => u.id === id);
    if (!user) return null;
    user.status = status;
    if (status === 'INACTIVE') {
      this.invalidateUserSessions(id);
    }
    this.saveDatabase(this.db);
    this.logAudit(actor, 'USER_STATUS_CHANGE', user.name, 'SUCCESS', 'LAN', `Account status set to ${status}`);
    return this.sanitizeUser(user);
  }

  // Session Management
  public createSession(userId: string, ip = '127.0.0.1', userAgent = ''): Session {
    const id = crypto.randomBytes(32).toString('hex');
    const session: Session = {
      id,
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 8 * 60 * 60 * 1000, // 8 hours duration
      ip,
      userAgent
    };
    this.sessions.set(id, session);
    this.syncSessionsToDb();
    return session;
  }

  public getSession(sessionId: string): Session | null {
    if (!sessionId) return null;
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      this.syncSessionsToDb();
      return null;
    }
    return session;
  }

  public invalidateSession(sessionId: string): void {
    if (sessionId && this.sessions.has(sessionId)) {
      this.sessions.delete(sessionId);
      this.syncSessionsToDb();
    }
  }

  public invalidateUserSessions(userId: string): void {
    let changed = false;
    for (const [id, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(id);
        changed = true;
      }
    }
    if (changed) {
      this.syncSessionsToDb();
    }
  }

  // Administrative Password Recovery Tickets (Offline LAN)
  public requestPasswordReset(identifier: string, notes?: string, ip = 'LAN'): PasswordResetTicket {
    const user = this.findUserByUsernameOrEmail(identifier);
    const ticket: PasswordResetTicket = {
      id: 'rst_' + Date.now(),
      userId: user?.id,
      identifier,
      staffName: user?.name || identifier,
      department: user?.department || 'Unassigned',
      requestedAt: new Date().toISOString(),
      status: 'PENDING',
      ipAddress: ip,
      notes
    };
    if (!this.db.resetTickets) this.db.resetTickets = [];
    this.db.resetTickets.unshift(ticket);
    this.saveDatabase(this.db);
    this.logAudit(user?.name || identifier, 'PASSWORD_RESET_TICKET', identifier, 'WARNING', ip, notes || 'Staff requested password recovery');
    return ticket;
  }

  public getResetTickets(): PasswordResetTicket[] {
    return this.db.resetTickets || [];
  }

  public resolveResetTicket(ticketId: string, actor: string): boolean {
    if (!this.db.resetTickets) return false;
    const t = this.db.resetTickets.find(ticket => ticket.id === ticketId);
    if (!t) return false;
    t.status = 'RESOLVED';
    this.saveDatabase(this.db);
    this.logAudit(actor, 'RESET_TICKET_RESOLVED', t.identifier, 'SUCCESS', 'LAN', 'Ticket marked resolved');
    return true;
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.db.auditLogs;
  }

  // Export / Backup
  public exportBackup(): string {
    return JSON.stringify(this.db, null, 2);
  }

  public restoreBackup(jsonContent: string, actor: string): boolean {
    try {
      const parsed = JSON.parse(jsonContent) as AppDatabase;
      if (parsed.users && parsed.cases) {
        this.db = parsed;
        this.saveDatabase(this.db);
        this.logAudit(actor, 'DATABASE_RESTORE', 'All collections', 'SUCCESS', 'LAN');
        return true;
      }
    } catch (err) {
      console.error('Failed to restore backup:', err);
    }
    return false;
  }
}

export const storage = new StorageManager();
