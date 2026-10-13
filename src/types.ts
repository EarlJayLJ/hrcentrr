export type UserRole = 'HR_ADMIN' | 'HR_MANAGER' | 'HR_SPECIALIST' | 'HR_OFFICER' | 'HR_DIRECTOR';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: UserRole;
  roleTitle: string;
  avatarText: string;
  avatarBg: string;
  status: 'ACTIVE' | 'INACTIVE';
  department: string;
  joinedDate: string;
  mustChangePassword?: boolean;
  lastLogin?: string;
}

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface CaseItem {
  id: string;
  name: string;
  caseNumber: string;
  category: 'Postings & Deployment' | 'Training & Skills' | 'Staff Welfare' | 'Promotions' | 'Policy & Compliance' | 'Disciplinary' | string;
  dates: string;
  priority: Priority;
  attachment?: {
    name: string;
    size?: string;
    url?: string;
  };
  assignee: {
    id: string;
    name: string;
    initials: string;
    color: string;
  };
  status: 'PENDING_ACCEPTANCE' | 'IN_PROGRESS' | 'REVIEW' | 'CLOSED';
  description?: string;
  department?: string;
  country?: string;
  createdDate: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate: string;
  assigneeId: string;
  assigneeName: string;
  creatorId: string;
  creatorName: string;
  category: string;
  createdAt: string;
  commentsCount: number;
  isMyTask?: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  date: string; // e.g. "2026-10-16"
  dayLabel: string; // e.g. "MON 16"
  startTime: string; // e.g. "07:00"
  endTime: string; // e.g. "08:30"
  location: string;
  colorBar: string; // green, blue, yellow, orange
  participants: string[];
  minutes?: string;
  actionItems?: string[];
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  senderBg: string;
  text: string;
  timestamp: string;
  timeAgo: string;
  unread: boolean;
  attachmentName?: string;
  attachmentSize?: string;
  replyTo?: {
    senderName: string;
    text: string;
  };
}

export interface Conversation {
  id: string;
  name: string;
  isGroup: boolean;
  participantIds: string[];
  participantNames: string[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatarText: string;
  avatarBg: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  category: 'Policy' | 'Onboarding' | 'Template' | 'Contract' | 'Grievance' | 'Form';
  folder: string;
  fileSize: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  version: string;
  accessRole: UserRole[];
  downloadCount: number;
  isArchived: boolean;
  storageFilename?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'General' | 'Policy Update' | 'Emergency' | 'Holiday' | 'Benefits';
  priority: Priority;
  authorName: string;
  authorRole: string;
  publishedAt: string;
  expiryDate?: string;
  pinned: boolean;
  isDraft: boolean;
  acknowledgedBy: string[]; // user IDs
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  ipAddress: string;
  details?: string;
}

export interface DashboardData {
  stats: {
    newCasesCount: number;
    newCasesTrend: string;
    newCasesTrendPositive: boolean;
    newTasksCount: number;
    newTasksTrend: string;
    newTasksTrendPositive: boolean;
    totalOpenCases: number;
    activeTeamMembers: number;
    unreadMessagesCount?: number;
    publishedAnnouncementsCount?: number;
    upcomingMeetingsCount?: number;
  };
  casesToAccept: CaseItem[];
  recentMessages: Message[];
  recentDocuments?: DocumentItem[];
  recentAnnouncements?: Announcement[];
  recentActivity?: AuditLog[];
  upcomingMeetingsCount?: number;
  caseTypeBreakdown: {
    type: string;
    count: number;
    color: string;
  }[];
  countryBreakdown: {
    country: string;
    activeCases: number;
    trend: string;
    trendPositive: boolean;
  }[];
  calendarEvents: Meeting[];
  myTasks: Task[];
  tasksAssignedToOthers: Task[];
}

