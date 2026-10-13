import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  CaseItem,
  Task,
  Meeting,
  Message,
  Conversation,
  DocumentItem,
  Announcement,
  AuditLog,
  DashboardData
} from '../src/types.js';

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
  resetTickets?: PasswordResetTicket[];
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
      name: 'Christian Aboagye',
      email: 'christian.aboagye@nya.gov.gh',
      username: 'christian.aboagye',
      role: 'HR_ADMIN',
      roleTitle: 'HEAD OF HR & OPERATIONS',
      avatarText: 'CA',
      avatarBg: '#ea580c',
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
      name: 'Abena Oforiwaa',
      email: 'a.oforiwaa@nya.gov.gh',
      username: 'a.oforiwaa',
      role: 'HR_OFFICER',
      roleTitle: 'Senior Personnel Officer',
      avatarText: 'AO',
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
  cases: [
    {
      id: 'c1',
      name: 'NSSP 2026/2027 Cohort Deployment & Regional Postings',
      caseNumber: 'NYA-HR-2026-081',
      category: 'Postings & Deployment',
      dates: 'May 18, 2024 - May 25, 2024',
      priority: 'Low',
      attachment: {
        name: 'NSSP_Posting_Schedule_2026.doc',
        size: '1.4 MB'
      },
      assignee: {
        id: 'u3',
        name: 'Kwabena Osei',
        initials: 'KO',
        color: '#8b5cf6'
      },
      status: 'PENDING_ACCEPTANCE',
      description: 'Orientation, station allotment, and mentorship deployment of 140 National Service personnel to 16 NYA regional secretariats.',
      department: 'Regional Operations',
      country: 'Greater Accra',
      createdDate: '2024-05-18'
    },
    {
      id: 'c2',
      name: 'YLSTI Instructor Staffing Review - Afienya & Ajumako Centers',
      caseNumber: 'NYA-HR-2024-082',
      category: 'Training & Skills',
      dates: 'May 18, 2024 - May 25, 2024',
      priority: 'Medium',
      attachment: {
        name: 'YLSTI_Staffing_Assessment.doc',
        size: '2.8 MB'
      },
      assignee: {
        id: 'u1',
        name: 'Christian Aboagye',
        initials: 'CA',
        color: '#ea580c'
      },
      status: 'PENDING_ACCEPTANCE',
      description: 'Comprehensive audit of technical instructors and vocational training facilitators across 11 Youth Leadership and Skills Training Institutes.',
      department: 'Vocational Training',
      country: 'Ashanti',
      createdDate: '2024-05-18'
    },
    {
      id: 'c3',
      name: 'Civil Service Annual Promotion & PSC Evaluation Benchmarks',
      caseNumber: 'NYA-HR-2024-083',
      category: 'Promotions',
      dates: 'May 20, 2024 - Jun 02, 2024',
      priority: 'Low',
      attachment: {
        name: 'PSC_Promotion_Dossier_2026.doc',
        size: '4.1 MB'
      },
      assignee: {
        id: 'u2',
        name: 'Akosua Frimpong',
        initials: 'AF',
        color: '#0ea5e9'
      },
      status: 'PENDING_ACCEPTANCE',
      description: 'Verification of eligible Senior Youth Officers submitted to the Public Services Commission (PSC) for promotion interviews.',
      department: 'People & Culture',
      country: 'Western',
      createdDate: '2024-05-20'
    },
    {
      id: 'c4',
      name: 'Staff Health Scheme & Welfare Allowance Review',
      caseNumber: 'NYA-HR-2024-084',
      category: 'Staff Welfare',
      dates: 'May 22, 2024 - May 30, 2024',
      priority: 'High',
      attachment: {
        name: 'Welfare_Fund_Statement_Q2.xlsx',
        size: '890 KB'
      },
      assignee: {
        id: 'u4',
        name: 'Abena Oforiwaa',
        initials: 'AO',
        color: '#ec4899'
      },
      status: 'IN_PROGRESS',
      description: 'Restructuring of regional staff health insurance supplementary scheme and maternity support provisions.',
      department: 'Staff Welfare',
      country: 'Eastern',
      createdDate: '2024-05-22'
    },
    {
      id: 'c5',
      name: 'Ghana Labour Act (Act 651) Internal Policy Alignment',
      caseNumber: 'NYA-HR-2024-085',
      category: 'Policy & Compliance',
      dates: 'May 24, 2024 - Jun 05, 2024',
      priority: 'Medium',
      attachment: {
        name: 'Labour_Act_651_Compliance_Brief.pdf',
        size: '720 KB'
      },
      assignee: {
        id: 'u6',
        name: 'Hajia Amina Fuseini',
        initials: 'AF',
        color: '#f59e0b'
      },
      status: 'IN_PROGRESS',
      description: 'Harmonization of internal grievance procedures with National Youth Authority Act (Act 939) and Ghana Public Services standards.',
      department: 'Legal Affairs',
      country: 'Northern',
      createdDate: '2024-05-24'
    }
  ],
  tasks: [],
  meetings: [],
  conversations: [
    {
      id: 'conv1',
      name: 'Akosua Frimpong',
      isGroup: false,
      participantIds: ['u1', 'u2'],
      participantNames: ['Christian Aboagye', 'Akosua Frimpong'],
      lastMessage: 'The promotion interview schedules from Public Services Commission have arrived.',
      lastMessageTime: '2 days ago',
      unreadCount: 1,
      avatarText: 'AF',
      avatarBg: '#0ea5e9'
    },
    {
      id: 'conv2',
      name: 'Kwabena Osei',
      isGroup: false,
      participantIds: ['u1', 'u3'],
      participantNames: ['Christian Aboagye', 'Kwabena Osei'],
      lastMessage: 'All district youth officer postings for Ashanti region have been submitted for review.',
      lastMessageTime: '5 days ago',
      unreadCount: 1,
      avatarText: 'KO',
      avatarBg: '#8b5cf6'
    },
    {
      id: 'conv3',
      name: 'Abena Oforiwaa',
      isGroup: false,
      participantIds: ['u1', 'u4'],
      participantNames: ['Christian Aboagye', 'Abena Oforiwaa'],
      lastMessage: 'NSSP orientation materials are fully printed and ready for distribution.',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      avatarText: 'AO',
      avatarBg: '#ec4899'
    },
    {
      id: 'conv4',
      name: 'Kofi Boateng',
      isGroup: false,
      participantIds: ['u1', 'u5'],
      participantNames: ['Christian Aboagye', 'Kofi Boateng'],
      lastMessage: 'Afienya center instructors have completed their COTVET skill evaluations.',
      lastMessageTime: 'Yesterday',
      unreadCount: 0,
      avatarText: 'KB',
      avatarBg: '#10b981'
    },
    {
      id: 'conv5',
      name: 'Hajia Amina Fuseini',
      isGroup: false,
      participantIds: ['u1', 'u6'],
      participantNames: ['Christian Aboagye', 'Hajia Amina Fuseini'],
      lastMessage: 'The legal review of our updated Scheme of Service is complete.',
      lastMessageTime: '3 days ago',
      unreadCount: 0,
      avatarText: 'AF',
      avatarBg: '#f59e0b'
    },
    {
      id: 'conv_group1',
      name: 'NYA HR Directorate Executive Team',
      isGroup: true,
      participantIds: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7'],
      participantNames: ['Christian Aboagye', 'Akosua Frimpong', 'Kwabena Osei', 'Abena Oforiwaa', 'Kofi Boateng', 'Hajia Amina Fuseini', 'Dr. Emmanuel Mensah'],
      lastMessage: 'All regional deployment schedules are approved. Review commences Friday.',
      lastMessageTime: '4 hours ago',
      unreadCount: 0,
      avatarText: 'NYA',
      avatarBg: '#ea580c'
    }
  ],
  messages: [
    {
      id: 'msg1',
      conversationId: 'conv1',
      senderId: 'u2',
      senderName: 'Akosua Frimpong',
      senderInitials: 'AF',
      senderBg: '#0ea5e9',
      text: 'Good morning Christian, the Public Services Commission has confirmed the promotion interview dates for our Senior Youth Officers. All candidate dossiers are indexed in the repository.',
      timestamp: '2024-05-14T10:15:00Z',
      timeAgo: '2 days ago',
      unread: true
    },
    {
      id: 'msg2',
      conversationId: 'conv2',
      senderId: 'u3',
      senderName: 'Kwabena Osei',
      senderInitials: 'KO',
      senderBg: '#8b5cf6',
      text: 'Greetings Director, the Ashanti and Western regional secretariats have confirmed receipt of their NSSP cohort quotas. We are preparing the regional orientation itinerary.',
      timestamp: '2024-05-11T14:40:00Z',
      timeAgo: '5 days ago',
      unread: true
    },
    {
      id: 'msg3',
      conversationId: 'conv3',
      senderId: 'u4',
      senderName: 'Abena Oforiwaa',
      senderInitials: 'AO',
      senderBg: '#ec4899',
      text: 'Hello Christian, the welfare allowance calculations for Q2 have been finalized per the latest civil service circular.',
      timestamp: '2024-05-16T08:00:00Z',
      timeAgo: '2 hours ago',
      unread: false
    },
    {
      id: 'msg4',
      conversationId: 'conv3',
      senderId: 'u1',
      senderName: 'Christian Aboagye',
      senderInitials: 'CA',
      senderBg: '#ea580c',
      text: 'Thank you Abena. Please ensure all regional health scheme claims are reconciled before Friday.',
      timestamp: '2024-05-16T08:20:00Z',
      timeAgo: '1 hour ago',
      unread: false
    },
    {
      id: 'msg5',
      conversationId: 'conv_group1',
      senderId: 'u7',
      senderName: 'Dr. Emmanuel Mensah',
      senderInitials: 'EM',
      senderBg: '#6366f1',
      text: 'Colleagues, let us ensure all quarterly HR indicators are submitted ahead of the National Youth Authority Governing Board sitting.',
      timestamp: '2024-05-16T09:00:00Z',
      timeAgo: '4 hours ago',
      unread: false
    }
  ],
  documents: [
    {
      id: 'doc1',
      name: 'NYA_Scheme_of_Service_and_Staff_Handbook_Act939.pdf',
      category: 'Policy',
      folder: 'Statutory Regulations',
      fileSize: '3.8 MB',
      fileType: 'application/pdf',
      uploadedBy: 'Dr. Emmanuel Mensah',
      uploadedAt: '2024-01-15',
      version: 'v2026.1',
      accessRole: ['HR_ADMIN', 'HR_MANAGER', 'HR_SPECIALIST', 'HR_OFFICER', 'HR_DIRECTOR'],
      downloadCount: 142,
      isArchived: false
    },
    {
      id: 'doc2',
      name: 'Ghana_Labour_Act_651_Compliance_Manual.pdf',
      category: 'Policy',
      folder: 'Statutory Regulations',
      fileSize: '2.4 MB',
      fileType: 'application/pdf',
      uploadedBy: 'Hajia Amina Fuseini',
      uploadedAt: '2024-02-10',
      version: 'v3.2',
      accessRole: ['HR_ADMIN', 'HR_MANAGER', 'HR_SPECIALIST', 'HR_DIRECTOR'],
      downloadCount: 88,
      isArchived: false
    },
    {
      id: 'doc3',
      name: 'NSSP_Deployment_and_Mentorship_Guide_2026.docx',
      category: 'Onboarding',
      folder: 'National Service Personnel',
      fileSize: '1.2 MB',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedBy: 'Abena Oforiwaa',
      uploadedAt: '2024-05-18',
      version: 'v1.4',
      accessRole: ['HR_ADMIN', 'HR_MANAGER', 'HR_SPECIALIST', 'HR_OFFICER'],
      downloadCount: 65,
      isArchived: false
    },
    {
      id: 'doc4',
      name: 'YLSTI_Vocational_Staff_Deployment_Schedule.xlsx',
      category: 'Template',
      folder: 'Vocational Training Institutes',
      fileSize: '950 KB',
      fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      uploadedBy: 'Kofi Boateng',
      uploadedAt: '2024-04-05',
      version: 'v2.0',
      accessRole: ['HR_ADMIN', 'HR_MANAGER', 'HR_SPECIALIST'],
      downloadCount: 34,
      isArchived: false
    },
    {
      id: 'doc5',
      name: 'Public_Services_Commission_Promotion_Guidelines.pdf',
      category: 'Policy',
      folder: 'Promotions & Evaluations',
      fileSize: '2.1 MB',
      fileType: 'application/pdf',
      uploadedBy: 'Akosua Frimpong',
      uploadedAt: '2024-03-12',
      version: 'v1.1',
      accessRole: ['HR_ADMIN', 'HR_MANAGER', 'HR_SPECIALIST', 'HR_DIRECTOR'],
      downloadCount: 52,
      isArchived: false
    },
    {
      id: 'doc6',
      name: 'Staff_Medical_Welfare_Policy_NYA.pdf',
      category: 'Policy',
      folder: 'Staff Welfare & Healthcare',
      fileSize: '1.6 MB',
      fileType: 'application/pdf',
      uploadedBy: 'Abena Oforiwaa',
      uploadedAt: '2024-03-25',
      version: 'v2.2',
      accessRole: ['HR_ADMIN', 'HR_MANAGER', 'HR_SPECIALIST', 'HR_OFFICER'],
      downloadCount: 77,
      isArchived: false
    }
  ],
  announcements: [
    {
      id: 'ann1',
      title: 'Submission of Annual PSC Staff Performance Appraisals (SPER Form A)',
      content: 'All Regional Directors, District Youth Coordinators, and Unit Heads must submit completed staff performance evaluation forms for the 2025/2026 assessment year to the HR Directorate by May 31.',
      category: 'Policy Update',
      priority: 'High',
      authorName: 'Christian Aboagye',
      authorRole: 'Head of HR & Operations',
      publishedAt: '2024-05-15',
      expiryDate: '2024-05-31',
      pinned: true,
      isDraft: false,
      acknowledgedBy: ['u1', 'u2', 'u3']
    },
    {
      id: 'ann2',
      title: 'Deployment Notice: 2026/2027 National Service Personnel to NYA Secretariats',
      content: 'Official postings of newly assigned National Service Personnel to the Accra Head Office, Regional Secretariats, and YLSTI Vocational Training Institutes have been finalized and uploaded to the Document Repository.',
      category: 'General',
      priority: 'Medium',
      authorName: 'Abena Oforiwaa',
      authorRole: 'Senior Personnel Officer',
      publishedAt: '2024-05-12',
      expiryDate: '2024-06-30',
      pinned: true,
      isDraft: false,
      acknowledgedBy: ['u1', 'u3', 'u4']
    },
    {
      id: 'ann3',
      title: 'Special Capacity Building Workshop at National Youth Leadership Institute',
      content: 'A 3-day supervisory and youth project management workshop will be hosted at the Afienya Youth Institute for newly appointed District Youth Officers. Registration is open via HR.',
      category: 'Benefits',
      priority: 'Low',
      authorName: 'Kofi Boateng',
      authorRole: 'Vocational Training Lead',
      publishedAt: '2024-05-10',
      pinned: false,
      isDraft: false,
      acknowledgedBy: ['u1']
    }
  ],
  auditLogs: [
    {
      id: 'log1',
      actor: 'Christian Aboagye',
      action: 'LOGIN',
      target: 'HR Central Session',
      timestamp: '2024-05-18T08:14:22Z',
      status: 'SUCCESS',
      ipAddress: '192.168.1.15',
      details: 'Authenticated from NYA Head Office (Accra) workstation'
    },
    {
      id: 'log2',
      actor: 'Kwabena Osei',
      action: 'DOCUMENT_UPLOAD',
      target: 'NSSP_Posting_Schedule_2026.doc',
      timestamp: '2024-05-18T08:30:10Z',
      status: 'SUCCESS',
      ipAddress: '192.168.1.42',
      details: 'Uploaded regional deployment schedule (1.4 MB)'
    },
    {
      id: 'log3',
      actor: 'Christian Aboagye',
      action: 'CASE_STATUS_CHANGE',
      target: 'Case NYA-HR-2024-082',
      timestamp: '2024-05-18T09:12:00Z',
      status: 'SUCCESS',
      ipAddress: '192.168.1.15',
      details: 'YLSTI staffing review placed in pending queue'
    },
    {
      id: 'log4',
      actor: 'Dr. Emmanuel Mensah',
      action: 'ANNOUNCEMENT_PUBLISH',
      target: 'Submission of Annual PSC Staff Performance Appraisals',
      timestamp: '2024-05-15T11:00:00Z',
      status: 'SUCCESS',
      ipAddress: '192.168.1.10',
      details: 'Broadcasted to all 16 NYA regional directorates'
    },
    {
      id: 'log5',
      actor: 'Hajia Amina Fuseini',
      action: 'DOCUMENT_DOWNLOAD',
      target: 'Ghana_Labour_Act_651_Compliance_Manual.pdf',
      timestamp: '2024-05-18T10:45:00Z',
      status: 'SUCCESS',
      ipAddress: '192.168.1.28',
      details: 'Downloaded for legal review'
    }
  ],
  systemSettings: {
    orgName: 'Ghana Youth Authority',
    subTitle: 'National Youth Authority (NYA) - Human Resources Directorate',
    lanHost: '192.168.1.100',
    allowSelfRegistration: false,
    requireDocumentApproval: true,
    timezone: 'GMT',
    maintenanceMode: false
  }
};

class StorageManager {
  private db: AppDatabase;
  private sessions: Map<string, Session> = new Map();

  constructor() {
    this.db = this.loadDatabase();
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

  private loadDatabase(): AppDatabase {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content) as AppDatabase;
        if (parsed.users && Array.isArray(parsed.users)) {
          parsed.users = this.ensureUsersIntegrity(parsed.users);
          if (!parsed.resetTickets) parsed.resetTickets = [];
          this.saveDatabase(parsed);
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to load database file, creating fresh database with seeds:', err);
    }
    const fresh = JSON.parse(JSON.stringify(defaultSeedData));
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

  // Dashboard Aggregates calculated directly from real database items for Ghana Youth Authority
  public getDashboardData(currentUserId = 'u1'): DashboardData {
    const pendingCases = this.db.cases.filter(c => c.status === 'PENDING_ACCEPTANCE');
    const myTasks = this.db.tasks.filter(t => t.assigneeId === currentUserId);
    const tasksAssignedToOthers = this.db.tasks.filter(t => t.creatorId === currentUserId && t.assigneeId !== currentUserId);

    const categories = [
      { type: 'Postings & Deployment', color: '#f97316' },
      { type: 'Training & Skills', color: '#06b6d4' },
      { type: 'Promotions', color: '#8b5cf6' },
      { type: 'Staff Welfare', color: '#ef4444' },
      { type: 'Policy & Compliance', color: '#22c55e' }
    ];
    const caseTypeBreakdown = categories.map(cat => ({
      type: cat.type,
      count: this.db.cases.filter(c => c.category === cat.type).length,
      color: cat.color
    }));

    const regions = ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Northern'];
    const countryBreakdown = regions.map(region => {
      const activeCases = this.db.cases.filter(c => c.country === region).length;
      return {
        country: region,
        activeCases,
        trend: activeCases > 0 ? `+${activeCases}` : '0',
        trendPositive: activeCases > 0
      };
    });

    const unreadMessagesCount = this.db.messages.filter(m => m.unread).length;
    const activeAnnouncements = this.db.announcements.filter(a => !a.isDraft);
    const activeDocuments = this.db.documents.filter(d => !d.isArchived);

    return {
      stats: {
        newCasesCount: this.db.cases.length,
        newCasesTrend: `+${pendingCases.length} pending`,
        newCasesTrendPositive: true,
        newTasksCount: this.db.tasks.length,
        newTasksTrend: `${myTasks.filter(t => t.status !== 'COMPLETED').length} active`,
        newTasksTrendPositive: myTasks.filter(t => t.status !== 'COMPLETED').length > 0,
        totalOpenCases: this.db.cases.length,
        activeTeamMembers: this.db.users.filter(u => u.status === 'ACTIVE').length,
        unreadMessagesCount,
        publishedAnnouncementsCount: activeAnnouncements.length,
        upcomingMeetingsCount: this.db.meetings.filter(m => m.status === 'UPCOMING').length
      },
      casesToAccept: pendingCases.length > 0 ? pendingCases : this.db.cases.slice(0, 3),
      recentMessages: this.db.messages.slice(0, 2),
      recentDocuments: activeDocuments.slice(0, 3),
      recentAnnouncements: activeAnnouncements.slice(0, 2),
      recentActivity: this.db.auditLogs.slice(0, 4),
      caseTypeBreakdown,
      countryBreakdown,
      calendarEvents: this.db.meetings,
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
  public getTasks(): Task[] {
    return this.db.tasks;
  }

  public createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'commentsCount'>, actor: string): Task {
    const task: Task = {
      ...taskData,
      id: 't_' + Date.now(),
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

  public clearAllTasks(actor = 'Admin'): void {
    this.db.tasks = [];
    this.saveDatabase(this.db);
    this.logAudit(actor, 'TASK_CLEAR_ALL', 'All Tasks', 'SUCCESS', 'LAN', 'Cleared all tasks from system');
  }

  // Meetings
  public getMeetings(): Meeting[] {
    return this.db.meetings;
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
  public getConversations(): Conversation[] {
    return this.db.conversations;
  }

  public getMessages(conversationId?: string): Message[] {
    if (conversationId) {
      return this.db.messages.filter(m => m.conversationId === conversationId);
    }
    return this.db.messages;
  }

  public sendMessage(conversationId: string, senderId: string, text: string, attachmentName?: string, replyTo?: Message['replyTo']): Message {
    const sender = this.db.users.find(u => u.id === senderId) || this.db.users[0];
    const newMsg: Message = {
      id: 'msg_' + Date.now(),
      conversationId,
      senderId: sender.id,
      senderName: sender.name,
      senderInitials: sender.avatarText,
      senderBg: sender.avatarBg,
      text,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      unread: true,
      attachmentName,
      replyTo
    };
    this.db.messages.push(newMsg);

    // Update conversation last message
    const convIdx = this.db.conversations.findIndex(c => c.id === conversationId);
    if (convIdx !== -1) {
      this.db.conversations[convIdx].lastMessage = text;
      this.db.conversations[convIdx].lastMessageTime = 'Just now';
    }

    this.saveDatabase(this.db);
    return newMsg;
  }

  // Documents
  public getDocuments(): DocumentItem[] {
    return this.db.documents.filter(d => !d.isArchived);
  }

  public createDocument(doc: Omit<DocumentItem, 'id' | 'uploadedAt' | 'downloadCount' | 'isArchived'>, actor: string): DocumentItem {
    const newDoc: DocumentItem = {
      ...doc,
      id: 'doc_' + Date.now(),
      uploadedAt: new Date().toISOString().split('T')[0],
      downloadCount: 0,
      isArchived: false
    };
    this.db.documents.unshift(newDoc);
    this.saveDatabase(this.db);
    this.logAudit(actor, 'DOCUMENT_UPLOAD', newDoc.name, 'SUCCESS', 'LAN', `${newDoc.fileSize} - ${newDoc.category}`);
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
      avatarBg: isGroup ? '#6366f1' : (participants[0]?.avatarBg || '#ea580c')
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
    let username = userData.username?.trim();
    if (!username) {
      username = userData.email ? userData.email.split('@')[0] : 'user_' + Date.now();
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
    return session;
  }

  public getSession(sessionId: string): Session | null {
    if (!sessionId) return null;
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }
    return session;
  }

  public invalidateSession(sessionId: string): void {
    if (sessionId) {
      this.sessions.delete(sessionId);
    }
  }

  public invalidateUserSessions(userId: string): void {
    for (const [id, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(id);
      }
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
