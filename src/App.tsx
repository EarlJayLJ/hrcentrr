/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  User,
  CaseItem,
  Task,
  Meeting,
  Conversation,
  Message,
  DocumentItem,
  Announcement,
  AuditLog,
  DashboardData
} from './types.ts';
import { Sidebar, ActiveTab } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { RightCalendarRail } from './components/RightCalendarRail.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { TasksView } from './components/TasksView.tsx';
import { MessagesView } from './components/MessagesView.tsx';
import { DocumentsView } from './components/DocumentsView.tsx';
import { AnnouncementsView } from './components/AnnouncementsView.tsx';
import { MeetingsView } from './components/MeetingsView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { AuthSwitch } from './components/ui/auth-switch.tsx';
import {
  NewCaseModal,
  NewTaskModal,
  NewMeetingModal,
  UploadDocumentModal,
  LanInfoModal,
  NewAnnouncementModal,
  NewUserModal,
  NewConversationModal,
  DocumentPreviewModal,
  ChangePasswordModal,
  AdminResetPasswordModal
} from './components/Modals.tsx';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'u1',
    name: 'Christian Aboagye',
    email: 'christian.aboagye@nya.gov.gh',
    username: 'christian.aboagye',
    role: 'HR_ADMIN',
    roleTitle: 'HEAD OF HR & OPERATIONS',
    avatarText: 'CA',
    avatarBg: '#006b3f',
    status: 'ACTIVE',
    department: 'Human Resources Directorate',
    joinedDate: '2022-03-01'
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Core Data States
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [lanInfo, setLanInfo] = useState<any>(null);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv1');

  // Modals State
  const [modalNewCase, setModalNewCase] = useState(false);
  const [modalNewTask, setModalNewTask] = useState(false);
  const [modalNewTaskIsMyTask, setModalNewTaskIsMyTask] = useState(true);
  const [modalNewMeeting, setModalNewMeeting] = useState(false);
  const [modalUploadDoc, setModalUploadDoc] = useState(false);
  const [modalLanInfo, setModalLanInfo] = useState(false);
  const [modalNewAnnouncement, setModalNewAnnouncement] = useState(false);
  const [modalNewUser, setModalNewUser] = useState(false);
  const [modalNewConversation, setModalNewConversation] = useState(false);
  const [previewingDoc, setPreviewingDoc] = useState<DocumentItem | null>(null);
  const [modalChangePassword, setModalChangePassword] = useState(false);
  const [modalAdminResetPassword, setModalAdminResetPassword] = useState<User | null>(null);

  // Toast / Status notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Socket.IO Setup
  useEffect(() => {
    const socket: Socket = io();

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to LAN Hub:', socket.id);
    });

    socket.on('new_message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      setDashboardData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          recentMessages: [msg, ...prev.recentMessages.slice(0, 2)]
        };
      });
      showToast(`New message from ${msg.senderName}`);
    });

    socket.on('case_created', (newCase: CaseItem) => {
      setCases((prev) => [newCase, ...prev]);
      refreshDashboard();
      showToast(`New case ${newCase.caseNumber} registered`);
    });

    socket.on('case_updated', (updatedCase: CaseItem) => {
      setCases((prev) => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
      refreshDashboard();
    });

    socket.on('task_created', (newTask: Task) => {
      setTasks((prev) => [newTask, ...prev]);
      refreshDashboard();
      showToast(`Task assigned: ${newTask.title}`);
    });

    socket.on('task_updated', (updatedTask: Task) => {
      setTasks((prev) => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      refreshDashboard();
    });

    socket.on('tasks_cleared', () => {
      setTasks([]);
      refreshDashboard();
      showToast('Departmental tasks cleared');
    });

    socket.on('meeting_created', (newMeeting: Meeting) => {
      setMeetings((prev) => [...prev, newMeeting]);
      refreshDashboard();
      showToast(`Meeting scheduled: ${newMeeting.title}`);
    });

    socket.on('meetings_cleared', () => {
      setMeetings([]);
      refreshDashboard();
      showToast('Departmental meetings cleared');
    });

    socket.on('document_uploaded', (doc: DocumentItem) => {
      setDocuments((prev) => [doc, ...prev]);
      refreshDashboard();
      showToast(`Document uploaded: ${doc.name}`);
    });

    socket.on('document_archived', ({ id }: { id: string }) => {
      setDocuments((prev) => prev.filter(d => d.id !== id));
      refreshDashboard();
    });

    socket.on('document_updated', (doc: DocumentItem) => {
      setDocuments((prev) => prev.map(d => d.id === doc.id ? doc : d));
      refreshDashboard();
    });

    socket.on('announcement_published', (ann: Announcement) => {
      setAnnouncements((prev) => [ann, ...prev]);
      refreshDashboard();
      showToast(`Notice published: ${ann.title}`);
    });

    socket.on('announcement_deleted', ({ id }: { id: string }) => {
      setAnnouncements((prev) => prev.filter(a => a.id !== id));
      refreshDashboard();
    });

    socket.on('announcement_updated', (ann: Announcement) => {
      setAnnouncements((prev) => prev.map(a => a.id === ann.id ? ann : a));
      refreshDashboard();
    });

    socket.on('conversation_created', (conv: Conversation) => {
      setConversations((prev) => [conv, ...prev]);
      showToast(`Conversation started: ${conv.name}`);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch initial data
  const refreshDashboard = () => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setDashboardData(data))
      .catch(console.error);
  };

  const fetchAllData = () => {
    const token = localStorage.getItem('nya_session_id');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['X-Session-ID'] = token;
    }

    const checkFallbackUser = () => {
      const savedUser = localStorage.getItem('nya_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          setIsAuthenticated(true);
          return;
        } catch (e) {}
      }
      setIsAuthenticated(false);
    };

    // Current user & session verification
    fetch('/api/auth/me', { headers })
      .then(res => {
        if (!res.ok) {
          checkFallbackUser();
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.user) {
          setCurrentUser(data.user);
          setIsAuthenticated(true);
          localStorage.setItem('nya_user', JSON.stringify(data.user));
          if (data.user.mustChangePassword) {
            setModalChangePassword(true);
          }
        } else if (data) {
          checkFallbackUser();
        }
      })
      .catch(() => checkFallbackUser());

    // All Users
    fetch('/api/users')
      .then(res => res.json())
      .then(data => Array.isArray(data) && setAllUsers(data))
      .catch(console.error);

    // Dashboard Data
    refreshDashboard();

    // Cases
    fetch('/api/cases')
      .then(res => res.json())
      .then(data => Array.isArray(data) && setCases(data))
      .catch(console.error);

    // Tasks
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => Array.isArray(data) && setTasks(data))
      .catch(console.error);

    // Meetings
    fetch('/api/meetings')
      .then(res => res.json())
      .then(data => Array.isArray(data) && setMeetings(data))
      .catch(console.error);

    // Conversations & Messages
    fetch('/api/conversations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setConversations(data);
          if (data.length > 0 && !activeConversationId) {
            setActiveConversationId(data[0].id);
          }
        }
      })
      .catch(console.error);

    fetch('/api/conversations/conv1/messages')
      .then(res => res.json())
      .then(data => Array.isArray(data) && setMessages(data))
      .catch(console.error);

    // Documents
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => Array.isArray(data) && setDocuments(data))
      .catch(console.error);

    // Announcements
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => Array.isArray(data) && setAnnouncements(data))
      .catch(console.error);

    // Audit logs
    fetch('/api/audit-logs')
      .then(res => res.json())
      .then(data => Array.isArray(data) && setAuditLogs(data))
      .catch(console.error);

    // LAN info
    fetch('/api/admin/lan-info')
      .then(res => res.json())
      .then(data => setLanInfo(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // User switcher
  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        refreshDashboard();
        showToast(`Switched active profile to ${data.user.name}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Case Actions
  const handleCreateCase = async (caseData: any) => {
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caseData)
      });
      if (res.ok) {
        setModalNewCase(false);
        showToast('Case successfully registered');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptCase = async (caseId: string) => {
    try {
      const res = await fetch(`/api/cases/${caseId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' })
      });
      if (res.ok) {
        showToast('Case accepted into active processing');
        setCases((prev) =>
          prev.map((c) => (c.id === caseId ? { ...c, status: 'IN_PROGRESS' } : c))
        );
        refreshDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Task Actions
  const handleCreateTask = async (taskData: any) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        setModalNewTask(false);
        showToast('Task added successfully');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: Task['status']) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Task status updated to ${status.replace('_', ' ')}`);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status } : t))
        );
        refreshDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearTasks = async () => {
    try {
      const res = await fetch('/api/tasks/clear', { method: 'POST' });
      if (res.ok) {
        setTasks([]);
        refreshDashboard();
        showToast('All tasks cleared successfully');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Meeting Actions
  const handleScheduleMeeting = async (meetingData: any) => {
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meetingData)
      });
      if (res.ok) {
        setModalNewMeeting(false);
        showToast('Meeting successfully scheduled');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearMeetings = async () => {
    try {
      const res = await fetch('/api/meetings/clear', { method: 'POST' });
      if (res.ok) {
        setMeetings([]);
        refreshDashboard();
        showToast('All meetings cleared successfully');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Message Actions
  const handleSendMessage = async (text: string, attachmentName?: string, replyTo?: Message['replyTo']) => {
    try {
      await fetch(`/api/conversations/${activeConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, attachmentName, replyTo })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectConversation = (convId: string) => {
    setActiveConversationId(convId);
    fetch(`/api/conversations/${convId}/messages`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(console.error);
    setActiveTab('messages');
  };

  const handleCreateConversation = async (data: { name: string; isGroup: boolean; participantIds: string[] }) => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const conv = await res.json();
        setActiveConversationId(conv.id);
        setActiveTab('messages');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Document Actions
  const handleUploadDocument = async (formData: FormData) => {
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        showToast('Document uploaded to secure archive');
        fetch('/api/documents').then(r => r.json()).then(setDocuments);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadDocument = (doc: DocumentItem) => {
    window.location.href = `/api/documents/${doc.id}/download`;
    showToast(`Downloading: ${doc.name}`);
  };

  const handleRenameDocument = async (id: string, newName: string) => {
    try {
      const res = await fetch(`/api/documents/${id}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      });
      if (res.ok) {
        const updated = await res.json();
        setDocuments(prev => prev.map(d => d.id === id ? updated : d));
        showToast(`Document renamed to ${newName}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id));
        showToast('Document archived from active repository');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Announcement Actions
  const handleCreateAnnouncement = async (data: any) => {
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        showToast('Notice published successfully');
        fetch('/api/announcements').then(r => r.json()).then(setAnnouncements);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        showToast('Notice removed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcknowledgeAnnouncement = async (annId: string) => {
    try {
      const res = await fetch(`/api/announcements/${annId}/acknowledge`, {
        method: 'POST'
      });
      if (res.ok) {
        setAnnouncements(prev =>
          prev.map(a =>
            a.id === annId
              ? { ...a, acknowledgedBy: [...a.acknowledgedBy, currentUser.id] }
              : a
          )
        );
        showToast('Announcement acknowledged');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // User & Access Control Actions
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('nya_session_id');
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}`, 'X-Session-ID': token } : {}
      });
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('nya_user');
    localStorage.removeItem('nya_session_id');
    setIsAuthenticated(false);
    showToast('Session terminated. Signed out safely.');
  };

  const handleUnlockAccount = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/unlock`, { method: 'POST' });
      if (res.ok) {
        showToast('Account lockout and failed attempts cleared.');
        fetch('/api/users').then(r => r.json()).then(setAllUsers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const created = await res.json();
        setAllUsers(prev => [...prev, created]);
        showToast(`User account created for ${created.name} (Assigned password)`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: User['status']) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
        showToast(`User status updated to ${nextStatus}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CSV Exports
  const handleExportCsv = () => {
    window.location.href = '/api/reports/export-csv';
    showToast('Exporting cases report to CSV...');
  };

  const handleExportAuditCsv = () => {
    window.location.href = '/api/reports/export-audit-csv';
    showToast('Exporting security audit log to CSV...');
  };

  const handleExportTasksCsv = () => {
    window.location.href = '/api/reports/export-tasks-csv';
    showToast('Exporting departmental tasks report to CSV...');
  };

  const handleExportBackup = () => {
    window.location.href = '/api/admin/backup';
    showToast('Downloading full database backup JSON...');
  };

  // Quick Action dispatcher
  const handleQuickAction = (action: 'meeting' | 'task' | 'document' | 'announcement' | 'message') => {
    if (action === 'meeting') setModalNewMeeting(true);
    else if (action === 'task') {
      setModalNewTaskIsMyTask(true);
      setModalNewTask(true);
    }
    else if (action === 'document') setModalUploadDoc(true);
    else if (action === 'announcement') setModalNewAnnouncement(true);
    else if (action === 'message') setModalNewConversation(true);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen w-full bg-[#064e3b] flex flex-col items-center justify-center text-white space-y-4 font-sans p-6 text-center">
        <div className="w-12 h-12 rounded-full border-3 border-white/20 border-t-emerald-400 animate-spin"></div>
        <div>
          <div className="text-sm font-bold tracking-wider uppercase text-emerald-300">National Youth Authority · Ghana</div>
          <div className="text-xs text-emerald-200 mt-1">Connecting to Local Area Network Security Engine...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <AuthSwitch
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          fetchAllData();
          showToast(`Authenticated session established: ${user.name}`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-2 sm:p-4 lg:p-6 relative overflow-x-hidden">
      {/* Main Dashboard Window: Inner White with crisp dark outer boundary */}
      <div className="w-full max-w-[1440px] bg-white rounded-3xl lg:rounded-[32px] border border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col min-h-[920px] relative z-10 overflow-hidden">
        {/* Top Header */}
        <Header
          currentUser={currentUser}
          allUsers={allUsers}
          announcements={announcements}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSwitchUser={handleSwitchUser}
          onOpenLanModal={() => setModalLanInfo(true)}
          onOpenChangePassword={() => setModalChangePassword(true)}
          onLogout={handleLogout}
        />

        {/* Content Layout Split: Sidebar | Main Content Viewport | Right Rail */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            recentConversations={conversations}
            onOpenConversation={handleSelectConversation}
            tasksCount={tasks.filter(t => t.isMyTask && t.status !== 'COMPLETED').length || 0}
          />

          {/* Main Content Area */}
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto bg-slate-50/70">
            {activeTab === 'dashboard' || activeTab === 'performance_cases' || activeTab === 'statistic' || activeTab === 'activity' ? (
              dashboardData ? (
                <DashboardView
                  data={dashboardData}
                  currentUser={currentUser}
                  tasks={tasks}
                  meetings={meetings}
                  onOpenMessages={() => setActiveTab('messages')}
                  onOpenTasks={() => setActiveTab('tasks')}
                  onOpenMeetings={() => setActiveTab('meetings')}
                  onOpenDocuments={() => setActiveTab('libraries')}
                  onOpenAnnouncements={() => setActiveTab('saved')}
                  onDownloadAttachment={(name) => {
                    const found = documents.find(d => d.name === name);
                    if (found) handleDownloadDocument(found);
                    else showToast(`Downloading: ${name}`);
                  }}
                  onQuickAction={handleQuickAction}
                  onAcknowledgeAnnouncement={handleAcknowledgeAnnouncement}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-slate-400 text-xs">
                  Loading HR Central Data...
                </div>
              )
            ) : activeTab === 'tasks' ? (
              <TasksView
                tasks={tasks}
                onAddTask={() => {
                  setModalNewTaskIsMyTask(true);
                  setModalNewTask(true);
                }}
                onUpdateStatus={handleUpdateTaskStatus}
                onClearTasks={handleClearTasks}
              />
            ) : activeTab === 'messages' ? (
              <MessagesView
                conversations={conversations}
                activeConversationId={activeConversationId}
                messages={messages}
                currentUser={currentUser}
                onSelectConversation={handleSelectConversation}
                onSendMessage={handleSendMessage}
                onOpenNewConversation={() => setModalNewConversation(true)}
              />
            ) : activeTab === 'libraries' ? (
              <DocumentsView
                documents={documents}
                onUploadDocument={() => setModalUploadDoc(true)}
                onDownloadDocument={handleDownloadDocument}
                onPreviewDocument={(doc) => setPreviewingDoc(doc)}
                onRenameDocument={handleRenameDocument}
                onArchiveDocument={handleArchiveDocument}
              />
            ) : activeTab === 'saved' ? (
              <AnnouncementsView
                announcements={announcements}
                currentUser={currentUser}
                onNewAnnouncement={() => setModalNewAnnouncement(true)}
                onAcknowledge={handleAcknowledgeAnnouncement}
                onDeleteAnnouncement={handleDeleteAnnouncement}
              />
            ) : activeTab === 'meetings' ? (
              <MeetingsView
                meetings={meetings}
                onScheduleMeeting={() => setModalNewMeeting(true)}
                onClearMeetings={handleClearMeetings}
              />
            ) : activeTab === 'reports' ? (
              dashboardData && (
                <ReportsView
                  auditLogs={auditLogs}
                  dashboardData={dashboardData}
                  cases={cases}
                  onExportCsv={handleExportCsv}
                  onExportAuditCsv={handleExportAuditCsv}
                  onExportTasksCsv={handleExportTasksCsv}
                />
              )
            ) : activeTab === 'admin' ? (
              <AdminView
                users={allUsers}
                lanInfo={lanInfo}
                onAddUser={() => setModalNewUser(true)}
                onToggleUserStatus={handleToggleUserStatus}
                onResetPassword={(u) => setModalAdminResetPassword(u)}
                onUnlockAccount={handleUnlockAccount}
                onExportBackup={handleExportBackup}
              />
            ) : null}
          </main>

          {/* Right Calendar & Task Rail matching reference */}
          <RightCalendarRail
            meetings={meetings}
            myTasks={tasks.filter(t => t.isMyTask)}
            tasksAssignedToOthers={tasks.filter(t => !t.isMyTask)}
            onAddMeeting={() => setModalNewMeeting(true)}
            onAddMyTask={() => {
              setModalNewTaskIsMyTask(true);
              setModalNewTask(true);
            }}
            onAddTaskToOthers={() => {
              setModalNewTaskIsMyTask(false);
              setModalNewTask(true);
            }}
            onToggleTaskStatus={(id) => {
              const current = tasks.find(t => t.id === id);
              if (current) {
                handleUpdateTaskStatus(
                  id,
                  current.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED'
                );
              }
            }}
          />
        </div>
      </div>

      {/* Floating Action Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <NewCaseModal
        isOpen={modalNewCase}
        onClose={() => setModalNewCase(false)}
        onSubmit={handleCreateCase}
        users={allUsers}
      />

      <NewTaskModal
        isOpen={modalNewTask}
        onClose={() => setModalNewTask(false)}
        onSubmit={handleCreateTask}
        users={allUsers}
        defaultIsMyTask={modalNewTaskIsMyTask}
      />

      <NewMeetingModal
        isOpen={modalNewMeeting}
        onClose={() => setModalNewMeeting(false)}
        onSubmit={handleScheduleMeeting}
        users={allUsers}
      />

      <UploadDocumentModal
        isOpen={modalUploadDoc}
        onClose={() => setModalUploadDoc(false)}
        onSubmit={handleUploadDocument}
      />

      <LanInfoModal
        isOpen={modalLanInfo}
        onClose={() => setModalLanInfo(false)}
        lanInfo={lanInfo}
      />

      <NewAnnouncementModal
        isOpen={modalNewAnnouncement}
        onClose={() => setModalNewAnnouncement(false)}
        onSubmit={handleCreateAnnouncement}
      />

      <NewUserModal
        isOpen={modalNewUser}
        onClose={() => setModalNewUser(false)}
        onSubmit={handleCreateUser}
      />

      <NewConversationModal
        isOpen={modalNewConversation}
        onClose={() => setModalNewConversation(false)}
        onSubmit={handleCreateConversation}
        users={allUsers}
        currentUserId={currentUser.id}
      />

      <DocumentPreviewModal
        isOpen={!!previewingDoc}
        onClose={() => setPreviewingDoc(null)}
        document={previewingDoc}
        onDownload={handleDownloadDocument}
      />

      <ChangePasswordModal
        isOpen={modalChangePassword}
        onClose={() => setModalChangePassword(false)}
        onSuccess={() => {
          showToast("Password updated successfully.");
          fetch('/api/auth/me').then(r => r.json()).then(d => d.user && setCurrentUser(d.user));
        }}
      />

      <AdminResetPasswordModal
        isOpen={!!modalAdminResetPassword}
        targetUser={modalAdminResetPassword}
        onClose={() => setModalAdminResetPassword(null)}
        onResetComplete={(temp) => {
          showToast(`Temporary password issued: ${temp}`);
          fetch('/api/users').then(r => r.json()).then(setAllUsers);
        }}
      />
    </div>
  );
}
