import express, { type Request, type Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import fs from 'fs';
import os from 'os';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import { storage } from './server/storage.ts';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH']
  }
});

const PORT = parseInt(process.env.PORT || '3000', 10);
const UPLOADS_DIR = path.resolve(process.cwd(), 'storage', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage configuration
const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const unique = `${Date.now()}_${sanitized}`;
    cb(null, unique);
  }
});
const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB max
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Allow iframe preview in AI Studio
app.use((_req, res, next) => {
  res.removeHeader('X-Frame-Options');
  next();
});

// Path Traversal Security Helper
function isSafeFilePath(targetFilename: string): boolean {
  if (!targetFilename || typeof targetFilename !== 'string') return false;
  if (targetFilename.includes('..') || targetFilename.includes('/') || targetFilename.includes('\\')) {
    return false;
  }
  const resolved = path.resolve(UPLOADS_DIR, targetFilename);
  return resolved.startsWith(UPLOADS_DIR);
}

// Helper to get client IP
function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

// Socket.IO real-time connection
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('join_user', (userId: string) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined user_${userId}`);
    }
  });

  socket.on('identify', (data: { userId: string }) => {
    if (data && data.userId) {
      socket.join(`user_${data.userId}`);
      console.log(`[Socket.IO] Socket ${socket.id} identified as user_${data.userId}`);
    }
  });

  socket.on('join_conversation', (convId: string) => {
    socket.join(`conv_${convId}`);
  });

  socket.on('leave_conversation', (convId: string) => {
    socket.leave(`conv_${convId}`);
  });

  socket.on('send_message', (data: { conversationId: string; senderId: string; text: string; attachmentName?: string }) => {
    const conv = storage.getConversationById(data.conversationId);
    const msg = storage.sendMessage(data.conversationId, data.senderId, data.text, data.attachmentName);
    
    if (conv && conv.participantIds) {
      conv.participantIds.forEach(pId => {
        io.to(`user_${pId}`).emit('new_message', msg);
        io.to(`user_${pId}`).emit('conversation_updated', {
          conversationId: data.conversationId,
          lastMessage: msg.text,
          timeAgo: 'Just now'
        });
      });
    }
    io.to(`conv_${data.conversationId}`).emit('new_message', msg);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// --- REST API ENDPOINTS ---

// Auth & Session Utilities
function getSessionUser(req: Request) {
  const headerToken = (req.headers['x-session-id'] as string) ||
    (typeof req.headers['authorization'] === 'string' && req.headers['authorization'].startsWith('Bearer ')
      ? req.headers['authorization'].slice(7)
      : null);
  const queryToken = (req.query.token as string) || (req.query.sessionId as string);
  const sessionId = req.cookies?.nya_session_id || headerToken || queryToken;
  if (!sessionId) return null;
  const session = storage.getSession(sessionId);
  if (!session) return null;
  const user = storage.getUserById(session.userId);
  if (!user || user.status === 'INACTIVE') return null;
  return user;
}

function requireAuth(req: Request, res: Response, next: () => void) {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }
  (req as any).user = user;
  next();
}

function getActorUser(req: Request) {
  return (req as any).user || getSessionUser(req);
}

// RBAC Role Verification Middleware
function requireAdmin(req: Request, res: Response, next: () => void) {
  const user = getSessionUser(req);
  if (!user || (user.role !== 'HR_ADMIN' && user.role !== 'HR_DIRECTOR' && user.role !== 'HR_MANAGER')) {
    return res.status(403).json({ error: 'Access denied: HR Administrator or Executive Management privileges required.' });
  }
  (req as any).user = user;
  next();
}

function requireHeadOfHr(req: Request, res: Response, next: () => void) {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication session required or expired. Please sign in.' });
  }
  if (user.role !== 'HR_ADMIN') {
    return res.status(403).json({ error: 'Access denied: Only the Head of HR is authorized to create, deactivate, or reset employee accounts.' });
  }
  (req as any).user = user;
  next();
}

// 1. Session verification / Current User
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getSessionUser(req);
  if (user) {
    return res.json({ authenticated: true, user });
  }
  return res.status(401).json({ authenticated: false, user: null });
});

// 2. Local Login (LAN Offline)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const identifier = req.body.identifier || req.body.emailOrUsername || req.body.email || req.body.username;
  const { password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Please enter both username/email and password.' });
  }

  const clientIp = getClientIp(req);
  const result = storage.verifyCredentials(identifier, password, clientIp);

  if (!result.success) {
    if (result.reason === 'LOCKED') {
      return res.status(423).json({
        error: `Account is temporarily locked due to repeated failed login attempts. Please wait ${result.minutesLeft} minute(s) or contact your HR System Administrator.`,
        locked: true,
        minutesLeft: result.minutesLeft
      });
    }

    if (result.reason === 'DEACTIVATED') {
      return res.status(403).json({
        error: 'Your account has been deactivated by the HR administrator. Please contact the HR department for assistance.',
        code: 'ACCOUNT_DEACTIVATED',
        deactivated: true
      });
    }

    return res.status(401).json({
      error: 'Invalid username/email or password.',
      remainingAttempts: result.remainingAttempts
    });
  }

  // Create secure session
  const user = result.user!;
  const session = storage.createSession(user.id, clientIp, req.headers['user-agent'] || '');

  // Set secure HTTP-only cookie (8 hours expiry)
  res.cookie('nya_session_id', session.id, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000,
    path: '/'
  });

  io.emit('user_switched', { user });

  res.json({
    success: true,
    user,
    sessionId: session.id,
    mustChangePassword: !!user.mustChangePassword
  });
});

// 3. Secure Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const sessionId = req.cookies?.nya_session_id;
  const clientIp = getClientIp(req);

  if (sessionId) {
    const session = storage.getSession(sessionId);
    if (session) {
      const u = storage.getUserById(session.userId);
      if (u) {
        storage.logAudit(u.name, 'AUTH_LOGOUT', u.email, 'SUCCESS', clientIp, 'User logged out and session destroyed');
      }
    }
    storage.invalidateSession(sessionId);
  }

  res.clearCookie('nya_session_id', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully' });
});

// 4. Change Password Functionality
app.post('/api/auth/change-password', (req: Request, res: Response) => {
  let user = getSessionUser(req);

  // Fallback if cross-site iframe stripped Authorization headers or cookies:
  // Identify user by userId or email/username from request body
  if (!user && (req.body.userId || req.body.email || req.body.username)) {
    const idKey = req.body.userId || req.body.email || req.body.username;
    user = storage.getUserById(idKey) || storage.findUserByUsernameOrEmail(idKey);
  }

  if (!user) {
    return res.status(401).json({ error: 'Authentication session required' });
  }

  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'New password and confirmation do not match' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long' });
  }

  const clientIp = getClientIp(req);
  const result = storage.changePassword(user.id, currentPassword, newPassword, clientIp);

  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }

  // Create a refreshed session for the user
  const session = storage.createSession(user.id, clientIp, req.headers['user-agent'] || '');
  res.cookie('nya_session_id', session.id, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000,
    path: '/'
  });

  res.json({
    success: true,
    message: 'Password updated successfully',
    sessionId: session.id,
    user: storage.getUserById(user.id)
  });
});

// 5. Offline LAN Password Reset Request
app.post('/api/auth/request-reset', (req: Request, res: Response) => {
  const { identifier, notes } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Please provide your official email or staff username' });
  }

  const clientIp = getClientIp(req);
  const ticket = storage.requestPasswordReset(identifier, notes, clientIp);

  io.emit('reset_ticket_created', ticket);

  res.json({
    success: true,
    message: 'Your password reset request has been securely registered with the Head of HR.',
    ticket
  });
});

// 6. Switch Active User (Controlled Administrator Access Only)
app.post('/api/auth/switch-user', requireAdmin, (req: Request, res: Response) => {
  const { userId } = req.body;
  const users = storage.getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const clientIp = getClientIp(req);
  const session = storage.createSession(user.id, clientIp, req.headers['user-agent'] || '');
  res.cookie('nya_session_id', session.id, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000,
    path: '/'
  });

  storage.logAudit(user.name, 'SWITCH_USER', user.email, 'SUCCESS', clientIp, `Switched active session to ${user.roleTitle}`);
  io.emit('user_switched', { user });
  res.json({ success: true, user, sessionId: session.id });
});

// Dashboard Data
app.get('/api/dashboard', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const data = storage.getDashboardData(user.id);
  res.json(data);
});

// Cases
app.get('/api/cases', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  if (user.role === 'HR_ADMIN' || user.role === 'HR_DIRECTOR') {
    return res.json(storage.getCases());
  }
  res.json(storage.getCases().filter(c => c.assignee?.id === user.id));
});

app.post('/api/cases', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const newCase = storage.createCase(req.body, user.name);
  io.emit('case_created', newCase);
  res.status(201).json(newCase);
});

app.patch('/api/cases/:id/status', requireAuth, (req: Request, res: Response) => {
  const { status } = req.body;
  const user = getActorUser(req)!;
  const updated = storage.updateCaseStatus(req.params.id, status, user.name);
  if (!updated) return res.status(404).json({ error: 'Case not found' });
  io.emit('case_updated', updated);
  res.json(updated);
});

// Notifications API
app.get('/api/notifications', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  res.json(storage.getNotifications(user.id));
});

app.patch('/api/notifications/:id/read', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const ok = storage.markNotificationRead(req.params.id, user.id);
  res.json({ success: ok });
});

app.post('/api/notifications/read-all', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const ok = storage.markAllNotificationsRead(user.id);
  res.json({ success: ok });
});

// Tasks
app.get('/api/tasks', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  res.json(storage.getTasks(user.id, user.role));
});

app.post('/api/tasks', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const task = storage.createTask(
    {
      ...req.body,
      creatorId: user.id,
      creatorName: user.name
    },
    user.name
  );

  // Trigger notification and targeted socket event if assigned to another user
  if (task.assigneeId && task.assigneeId !== user.id) {
    const notif = storage.createNotification({
      userId: task.assigneeId,
      type: 'TASK_ASSIGNED',
      title: 'New Assigned Task',
      message: `${user.name} assigned task: ${task.title}`,
      relatedEntityId: task.id,
      actionUrl: '/tasks'
    });
    io.to(`user_${task.assigneeId}`).emit('new_notification', notif);
    io.to(`user_${task.assigneeId}`).emit('task_created', { ...task, isMyTask: false });
  }

  io.to(`user_${user.id}`).emit('task_created', {
    ...task,
    isMyTask: task.assigneeId === user.id
  });
  res.status(201).json({
    ...task,
    isMyTask: task.assigneeId === user.id
  });
});

app.patch('/api/tasks/:id/status', requireAuth, (req: Request, res: Response) => {
  const { status } = req.body;
  const user = getActorUser(req)!;
  const updated = storage.updateTaskStatus(req.params.id, status, user.name);
  if (!updated) return res.status(404).json({ error: 'Task not found' });

  // Notify creator if assignee updated status
  if (updated.creatorId && updated.creatorId !== user.id) {
    const notif = storage.createNotification({
      userId: updated.creatorId,
      type: 'TASK_UPDATED',
      title: 'Task Status Updated',
      message: `${user.name} marked "${updated.title}" as ${status}`,
      relatedEntityId: updated.id,
      actionUrl: '/tasks'
    });
    io.to(`user_${updated.creatorId}`).emit('new_notification', notif);
    io.to(`user_${updated.creatorId}`).emit('task_updated', { ...updated, isMyTask: updated.assigneeId === updated.creatorId });
  }

  if (updated.assigneeId) {
    io.to(`user_${updated.assigneeId}`).emit('task_updated', {
      ...updated,
      isMyTask: updated.assigneeId === updated.creatorId
    });
  }
  res.json(updated);
});

app.post('/api/tasks/:id/acknowledge-reminder', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const { reminderKey } = req.body || {};
  const updated = storage.acknowledgeTaskReminder(req.params.id, user.id, reminderKey);
  if (!updated) return res.status(404).json({ error: 'Task not found' });
  res.json({ success: true, task: updated });
});

app.post('/api/tasks/clear', requireAdmin, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  storage.clearAllTasks(user.name);
  io.emit('tasks_cleared');
  res.json({ success: true, tasks: [] });
});

// Meetings
app.get('/api/meetings', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  res.json(storage.getMeetings(user.id));
});

app.post('/api/meetings', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const meeting = storage.createMeeting(req.body, user.name);

  // Send notifications to all active users
  const allUsers = storage.getUsers();
  allUsers.forEach(u => {
    if (u.id !== user.id) {
      const notif = storage.createNotification({
        userId: u.id,
        type: 'MEETING_REMINDER',
        title: 'New Meeting Scheduled',
        message: `${meeting.title} on ${meeting.date} at ${meeting.startTime}`,
        relatedEntityId: meeting.id,
        actionUrl: '/meetings'
      });
      io.to(`user_${u.id}`).emit('new_notification', notif);
    }
  });

  io.emit('meeting_created', meeting);
  res.status(201).json(meeting);
});

app.post('/api/meetings/clear', requireAdmin, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  storage.clearAllMeetings(user.name);
  io.emit('meetings_cleared');
  res.json({ success: true, meetings: [] });
});

// Conversations & Messages
app.get('/api/conversations', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  res.json(storage.getConversations(user.id));
});

app.post('/api/conversations', requireAuth, (req: Request, res: Response) => {
  const { name, isGroup, participantIds } = req.body;
  const user = getActorUser(req)!;
  const allIds = Array.from(new Set([user.id, ...(participantIds || [])]));
  const conv = storage.createConversation(name || 'New Conversation', isGroup ?? false, allIds, user.name);
  
  allIds.forEach(pId => {
    io.to(`user_${pId}`).emit('conversation_created', conv);
  });
  
  res.status(201).json(conv);
});

app.get('/api/conversations/:id/messages', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const conv = storage.getConversationById(req.params.id);
  if (conv && conv.participantIds && !conv.participantIds.includes(user.id)) {
    return res.status(403).json({ error: 'Access denied to conversation' });
  }
  
  // Mark conversation as read when messages are fetched
  storage.markConversationAsRead(req.params.id, user.id);
  
  res.json(storage.getMessages(req.params.id, user.id));
});

app.post('/api/conversations/:id/read', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const success = storage.markConversationAsRead(req.params.id, user.id);
  if (success) {
    io.to(`user_${user.id}`).emit('conversation_read', { conversationId: req.params.id });
  }
  res.json({ success });
});

app.post('/api/conversations/:id/messages', requireAuth, upload.single('attachment'), (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const conv = storage.getConversationById(req.params.id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  if (conv.participantIds && !conv.participantIds.includes(user.id)) {
    conv.participantIds.push(user.id);
    if (!conv.participantNames.includes(user.name)) {
      conv.participantNames.push(user.name);
    }
  }

  const file = req.file;
  const text = req.body.text || '';
  
  let replyTo = undefined;
  if (req.body.replyTo) {
    try {
      replyTo = typeof req.body.replyTo === 'string' ? JSON.parse(req.body.replyTo) : req.body.replyTo;
    } catch (e) {}
  }

  const attachmentName = file ? file.originalname : (req.body.attachmentName || undefined);
  const attachmentPath = file ? file.filename : undefined;
  
  let attachmentSize = undefined;
  if (file) {
    const sizeBytes = file.size;
    attachmentSize = sizeBytes > 1024 * 1024
      ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(sizeBytes / 1024)} KB`;
  }

  const msgText = (text && text.trim()) ? text.trim() : (attachmentName ? `📎 Attached: ${attachmentName}` : 'Sent a message');
  const msg = storage.sendMessage(
    req.params.id,
    user.id,
    msgText,
    attachmentName,
    attachmentPath,
    attachmentSize,
    file?.mimetype,
    replyTo
  );

  // When a document is sent in chat, save it to the Document Repository with submitter and time
  let finalAttachmentName = attachmentName;
  if (!finalAttachmentName && text) {
    const fileMatch = text.match(/([a-zA-Z0-9_\-.]+\.(pdf|docx|doc|xlsx|xls|pptx|png|jpg|jpeg|txt|csv))/i);
    if (fileMatch) {
      finalAttachmentName = fileMatch[1];
    }
  }

  let sentDoc = undefined;
  if (finalAttachmentName) {
    let category: 'Policy' | 'Onboarding' | 'Template' | 'Contract' | 'Grievance' | 'Form' = 'Form';
    const lower = finalAttachmentName.toLowerCase();
    if (lower.includes('policy') || lower.includes('act') || lower.includes('handbook')) category = 'Policy';
    else if (lower.includes('nssp') || lower.includes('onboard') || lower.includes('posting')) category = 'Onboarding';
    else if (lower.includes('contract') || lower.includes('agreement') || lower.includes('mou')) category = 'Contract';
    else if (lower.includes('template') || lower.includes('form') || lower.includes('schedule')) category = 'Template';

    sentDoc = storage.createDocument({
      name: finalAttachmentName,
      category,
      folder: 'Messages & Shared Files',
      fileSize: attachmentSize || '1.2 MB',
      fileType: file?.mimetype || 'application/pdf',
      uploadedBy: user.name,
      version: 'v1.0',
      accessRole: ['HR_ADMIN', 'HR_MANAGER', 'HR_SPECIALIST', 'HR_OFFICER', 'HR_DIRECTOR'],
      storageFilename: attachmentPath
    }, user.name);

    io.emit('document_uploaded', sentDoc);
  }

  // Notify all participants in real time
  conv.participantIds.forEach(pId => {
    io.to(`user_${pId}`).emit('new_message', msg);
    io.to(`user_${pId}`).emit('conversation_updated', {
      conversationId: req.params.id,
      lastMessage: msgText,
      timeAgo: 'Just now'
    });

    if (pId !== user.id) {
      const notif = storage.createNotification({
        userId: pId,
        type: 'MESSAGE',
        title: `New Message from ${user.name}`,
        message: msgText.length > 80 ? msgText.slice(0, 80) + '...' : msgText,
        relatedEntityId: req.params.id,
        actionUrl: `/messages`
      });
      io.to(`user_${pId}`).emit('new_notification', notif);
    }
  });

  io.to(`conv_${req.params.id}`).emit('new_message', msg);

  res.status(201).json({ ...msg, document: sentDoc });
});

app.get('/api/messages/:id/download', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const msg = storage.getMessageById(req.params.id);
  if (!msg) {
    return res.status(404).json({ error: 'Message not found' });
  }

  const conv = storage.getConversationById(msg.conversationId);
  if (conv && conv.participantIds && !conv.participantIds.includes(user.id)) {
    return res.status(403).json({ error: 'Unauthorized to download attachment from this private conversation.' });
  }

  if (msg.attachmentPath && isSafeFilePath(msg.attachmentPath)) {
    const filePath = path.join(UPLOADS_DIR, msg.attachmentPath);
    if (fs.existsSync(filePath)) {
      return res.download(filePath, msg.attachmentName || 'Attached_Document');
    }
  }

  // Fallback if simulated seed message
  const filename = msg.attachmentName || 'Attached_Document.pdf';
  const sampleContent = `NATIONAL YOUTH AUTHORITY - OFFICIAL MESSAGE ATTACHMENT\nFilename: ${filename}\nSender: ${msg.senderName}\nDownloaded By: ${user.name} (${user.roleTitle})\nTimestamp: ${new Date().toISOString()}\nClassification: RESTRICTED INTERNAL STAFF COMMUNICATION\n`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.send(sampleContent);
});

app.get('/api/messages/attachment/download', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const messageId = req.query.messageId as string;
  const filename = (req.query.filename as string) || 'Attached_Document.pdf';

  if (messageId) {
    const msg = storage.getMessageById(messageId);
    if (msg) {
      const conv = storage.getConversationById(msg.conversationId);
      if (conv && conv.participantIds && !conv.participantIds.includes(user.id)) {
        return res.status(403).json({ error: 'Unauthorized to download attachment from this private conversation.' });
      }
      if (msg.attachmentPath && isSafeFilePath(msg.attachmentPath)) {
        const filePath = path.join(UPLOADS_DIR, msg.attachmentPath);
        if (fs.existsSync(filePath)) {
          return res.download(filePath, msg.attachmentName || filename);
        }
      }
    }
  }

  const sampleContent = `NATIONAL YOUTH AUTHORITY - OFFICIAL MESSAGE ATTACHMENT\nFilename: ${filename}\nDownloaded By: ${user.name} (${user.roleTitle})\nTimestamp: ${new Date().toISOString()}\nClassification: RESTRICTED INTERNAL STAFF COMMUNICATION\n`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.send(sampleContent);
});

// Documents
app.get('/api/documents', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  res.json(storage.getDocuments(user.id, user.role, user.name));
});

app.post('/api/documents/upload', requireAuth, upload.single('file'), (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const file = req.file;
  const { name, category, folder } = req.body;

  const docName = name || (file ? file.originalname : 'Document.pdf');
  const sizeBytes = file ? file.size : 1024 * 500;
  const sizeFormatted = sizeBytes > 1024 * 1024
    ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(sizeBytes / 1024)} KB`;

  const doc = storage.createDocument({
    name: docName,
    category: category || 'Policy',
    folder: folder || 'NYA HR Policies & Circulars',
    fileSize: sizeFormatted,
    fileType: file ? file.mimetype : 'application/pdf',
    uploadedBy: user.name,
    version: 'v1.0',
    accessRole: ['HR_ADMIN', 'HR_MANAGER', 'HR_SPECIALIST', 'HR_OFFICER', 'HR_DIRECTOR'],
    storageFilename: file ? file.filename : undefined
  }, user.name);

  io.emit('document_uploaded', doc);
  res.status(201).json(doc);
});

app.delete('/api/documents/:id', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const ok = storage.archiveDocument(req.params.id, user.name);
  if (!ok) return res.status(404).json({ error: 'Document not found' });
  io.emit('document_archived', { id: req.params.id });
  res.json({ success: true });
});

app.patch('/api/documents/:id/rename', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const doc = storage.renameDocument(req.params.id, req.body.name, user.name);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  io.emit('document_updated', doc);
  res.json(doc);
});

app.get('/api/documents/:id/download', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const doc = storage.recordDownload(req.params.id, user.name);
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  if (doc.storageFilename && isSafeFilePath(doc.storageFilename)) {
    const filePath = path.join(UPLOADS_DIR, doc.storageFilename);
    if (fs.existsSync(filePath)) {
      return res.download(filePath, doc.name);
    }
  }

  // Provide synthetic downloaded file if simulated
  const sampleContent = `HR CENTRAL SECURE DOCUMENT REPOSITORY\nTitle: ${doc.name}\nCategory: ${doc.category}\nVersion: ${doc.version}\nDownloaded By: ${user.name} (${user.roleTitle})\nTimestamp: ${new Date().toISOString()}\nClassification: STRICTLY CONFIDENTIAL - INTERNAL LAN ONLY\n`;
  res.setHeader('Content-Disposition', `attachment; filename="${doc.name}"`);
  res.setHeader('Content-Type', 'text/plain');
  res.send(sampleContent);
});

// Announcements
app.get('/api/announcements', requireAuth, (_req: Request, res: Response) => {
  res.json(storage.getAnnouncements());
});

app.post('/api/announcements', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const ann = storage.createAnnouncement({
    ...req.body,
    authorName: user.name,
    authorRole: user.roleTitle
  }, user.name);
  io.emit('announcement_published', ann);
  res.status(201).json(ann);
});

app.patch('/api/announcements/:id', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const ann = storage.updateAnnouncement(req.params.id, req.body, user.name);
  if (!ann) return res.status(404).json({ error: 'Announcement not found' });
  io.emit('announcement_updated', ann);
  res.json(ann);
});

app.delete('/api/announcements/:id', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const ok = storage.deleteAnnouncement(req.params.id, user.name);
  if (!ok) return res.status(404).json({ error: 'Announcement not found' });
  io.emit('announcement_deleted', { id: req.params.id });
  res.json({ success: true });
});

app.post('/api/announcements/:id/acknowledge', requireAuth, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const ok = storage.acknowledgeAnnouncement(req.params.id, user.id);
  res.json({ success: ok });
});

// Users & Administrator Control
app.get('/api/users', (_req: Request, res: Response) => {
  res.json(storage.getUsers());
});

app.get('/api/admin/users-security', requireAdmin, (_req: Request, res: Response) => {
  res.json(storage.getUsersWithSecurityInfo());
});

app.post('/api/admin/users', requireHeadOfHr, (req: Request, res: Response) => {
  const actorUser = getSessionUser(req)!;
  try {
    const user = storage.adminCreateUser(req.body, actorUser.name);
    io.emit('user_created', user);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create employee account' });
  }
});

app.patch('/api/users/:id/status', requireHeadOfHr, (req: Request, res: Response) => {
  const actorUser = getActorUser(req)!;
  const targetId = req.params.id;
  const requestedStatus = req.body?.status;

  if (requestedStatus !== 'ACTIVE' && requestedStatus !== 'INACTIVE') {
    return res.status(400).json({ error: 'Invalid account status specified. Expected ACTIVE or INACTIVE.' });
  }
  if (targetId === actorUser.id && requestedStatus === 'INACTIVE') {
    return res.status(400).json({ error: 'Self-deactivation is prohibited. You cannot deactivate your own account.' });
  }

  const user = storage.updateUserStatus(targetId, requestedStatus, actorUser.name);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (requestedStatus === 'INACTIVE') {
    io.to(`user_${targetId}`).emit('session_revoked', {
      userId: targetId,
      reason: 'Your account has been deactivated by the HR administrator. Please contact the HR department for assistance.'
    });
  }

  io.emit('user_updated', user);
  res.json(user);
});

app.post('/api/admin/users/:id/reset-password', requireHeadOfHr, (req: Request, res: Response) => {
  const actorUser = getActorUser(req)!;
  const { temporaryPassword } = req.body;
  const temp = temporaryPassword || 'Staff@' + Math.floor(1000 + Math.random() * 9000);
  const result = storage.adminResetPassword(req.params.id, temp, actorUser.name);
  if (!result.success) return res.status(404).json({ error: 'User not found' });
  io.emit('user_updated', result.user);
  res.json(result);
});

app.post('/api/admin/users/:id/unlock', requireAdmin, (req: Request, res: Response) => {
  const actor = getSessionUser(req)?.name || 'HR Administrator';
  const ok = storage.adminUnlockAccount(req.params.id, actor);
  if (!ok) return res.status(404).json({ error: 'User not found' });
  const user = storage.getUserById(req.params.id);
  io.emit('user_updated', user);
  res.json({ success: true, user });
});

app.get('/api/admin/reset-tickets', requireAdmin, (_req: Request, res: Response) => {
  res.json(storage.getResetTickets());
});

app.patch('/api/admin/reset-tickets/:id/resolve', requireAdmin, (req: Request, res: Response) => {
  const actor = getSessionUser(req)?.name || 'HR Administrator';
  const ok = storage.resolveResetTicket(req.params.id, actor);
  res.json({ success: ok });
});

// Audit Logs
app.get('/api/audit-logs', (_req: Request, res: Response) => {
  res.json(storage.getAuditLogs());
});

// Admin LAN diagnostics & backup
app.get('/api/admin/lan-info', (_req: Request, res: Response) => {
  const nets = os.networkInterfaces();
  const localIps: string[] = [];
  for (const name of Object.keys(nets)) {
    const netList = nets[name];
    if (netList) {
      for (const net of netList) {
        if (net.family === 'IPv4' && !net.internal) {
          localIps.push(net.address);
        }
      }
    }
  }

  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    localIps,
    port: PORT,
    accessUrls: localIps.map(ip => `http://${ip}:${PORT}`),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version
  });
});

app.get('/api/admin/backup', requireAdmin, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  storage.logAudit(user.name, 'BACKUP_EXPORT', 'Full Database', 'SUCCESS', getClientIp(req));
  const backup = storage.exportBackup();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="hr_central_backup_${Date.now()}.json"`);
  res.send(backup);
});

app.post('/api/admin/restore', requireAdmin, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const { jsonContent } = req.body;
  const success = storage.restoreBackup(jsonContent, user.name);
  if (!success) {
    return res.status(400).json({ error: 'Invalid backup structure or failed to parse' });
  }
  io.emit('database_reloaded');
  res.json({ success: true, message: 'Database restored successfully' });
});

// Export CSV Reports
app.get('/api/reports/export-csv', (_req: Request, res: Response) => {
  const cases = storage.getCases();
  const headers = ['Case Number', 'Title', 'Category', 'Priority', 'Status', 'Dates', 'Country', 'Assignee'];
  const rows = cases.map(c => [
    `"${c.caseNumber}"`,
    `"${c.name.replace(/"/g, '""')}"`,
    `"${c.category}"`,
    `"${c.priority}"`,
    `"${c.status}"`,
    `"${c.dates}"`,
    `"${c.country || 'N/A'}"`,
    `"${c.assignee.name}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="hr_central_cases_report.csv"');
  res.send(csv);
});

app.get('/api/reports/export-audit-csv', (_req: Request, res: Response) => {
  const csv = storage.exportAuditLogsCsv();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="hr_central_audit_logs.csv"');
  res.send(csv);
});

app.get('/api/reports/export-tasks-csv', (_req: Request, res: Response) => {
  const csv = storage.exportTasksCsv();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="hr_central_tasks_report.csv"');
  res.send(csv);
});

// Admin System Settings
app.get('/api/admin/settings', (_req: Request, res: Response) => {
  res.json(storage.getSystemSettings());
});

app.patch('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const user = getActorUser(req)!;
  const updated = storage.updateSystemSettings(req.body, user.name);
  io.emit('settings_updated', updated);
  res.json(updated);
});

// --- Vite Middlewares Setup ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[HR Central] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
