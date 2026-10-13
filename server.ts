import express, { Request, Response } from 'express';
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

  socket.on('join_conversation', (convId: string) => {
    socket.join(`conv_${convId}`);
  });

  socket.on('leave_conversation', (convId: string) => {
    socket.leave(`conv_${convId}`);
  });

  socket.on('send_message', (data: { conversationId: string; senderId: string; text: string; attachmentName?: string }) => {
    const msg = storage.sendMessage(data.conversationId, data.senderId, data.text, data.attachmentName);
    io.to(`conv_${data.conversationId}`).emit('new_message', msg);
    io.emit('conversation_updated', {
      conversationId: data.conversationId,
      lastMessage: msg.text,
      timeAgo: 'Just now'
    });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// --- REST API ENDPOINTS ---

// Auth & Session Utilities
let currentActiveUserId = 'u1'; // Default fallback

function getSessionUser(req: Request) {
  const headerToken = (req.headers['x-session-id'] as string) ||
    (typeof req.headers['authorization'] === 'string' && req.headers['authorization'].startsWith('Bearer ')
      ? req.headers['authorization'].slice(7)
      : null);
  const sessionId = req.cookies?.nya_session_id || headerToken;
  if (!sessionId) return null;
  const session = storage.getSession(sessionId);
  if (!session) return null;
  const user = storage.getUserById(session.userId);
  if (!user || user.status === 'INACTIVE') return null;
  return user;
}

function getActorUser(req: Request) {
  return getSessionUser(req) || storage.getUserById(currentActiveUserId) || storage.getUsers()[0];
}

// 1. Session verification / Current User
app.get('/api/auth/me', (req: Request, res: Response) => {
  let user = getSessionUser(req);
  if (!user && currentActiveUserId) {
    user = storage.getUserById(currentActiveUserId);
  }
  if (!user) {
    user = storage.getUsers()[0];
  }
  if (user) {
    currentActiveUserId = user.id;
    return res.json({ authenticated: true, user });
  }
  return res.status(401).json({ authenticated: false, user: null });
});

// 2. Local Login (LAN Offline)
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;
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
        error: 'Your user account has been deactivated by the HR Administrator. Access to NYA HR Central is revoked.',
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
  currentActiveUserId = user.id;
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
  const user = getSessionUser(req);
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

  res.json({ success: true, message: 'Password updated successfully' });
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

// 6. Switch Active User (Testing & Administrative inspection)
app.post('/api/auth/switch-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  const users = storage.getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  currentActiveUserId = user.id;

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
app.get('/api/dashboard', (_req: Request, res: Response) => {
  const data = storage.getDashboardData(currentActiveUserId);
  res.json(data);
});

// Cases
app.get('/api/cases', (_req: Request, res: Response) => {
  res.json(storage.getCases());
});

app.post('/api/cases', (req: Request, res: Response) => {
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
  const newCase = storage.createCase(req.body, user.name);
  io.emit('case_created', newCase);
  res.status(201).json(newCase);
});

app.patch('/api/cases/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
  const updated = storage.updateCaseStatus(req.params.id, status, user.name);
  if (!updated) return res.status(404).json({ error: 'Case not found' });
  io.emit('case_updated', updated);
  res.json(updated);
});

// Tasks
app.get('/api/tasks', (_req: Request, res: Response) => {
  res.json(storage.getTasks());
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
  const task = storage.createTask(
    {
      ...req.body,
      creatorId: user.id,
      creatorName: user.name
    },
    user.name
  );
  io.emit('task_created', task);
  res.status(201).json(task);
});

app.patch('/api/tasks/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
  const updated = storage.updateTaskStatus(req.params.id, status, user.name);
  if (!updated) return res.status(404).json({ error: 'Task not found' });
  io.emit('task_updated', updated);
  res.json(updated);
});

app.post('/api/tasks/clear', (_req: Request, res: Response) => {
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
  storage.clearAllTasks(user.name);
  io.emit('tasks_cleared');
  res.json({ success: true, tasks: [] });
});

// Meetings
app.get('/api/meetings', (_req: Request, res: Response) => {
  res.json(storage.getMeetings());
});

app.post('/api/meetings', (req: Request, res: Response) => {
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
  const meeting = storage.createMeeting(req.body, user.name);
  io.emit('meeting_created', meeting);
  res.status(201).json(meeting);
});

app.post('/api/meetings/clear', (_req: Request, res: Response) => {
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
  storage.clearAllMeetings(user.name);
  io.emit('meetings_cleared');
  res.json({ success: true, meetings: [] });
});

// Conversations & Messages
app.get('/api/conversations', (_req: Request, res: Response) => {
  res.json(storage.getConversations());
});

app.post('/api/conversations', (req: Request, res: Response) => {
  const { name, isGroup, participantIds } = req.body;
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
  const allIds = Array.from(new Set([user.id, ...(participantIds || [])]));
  const conv = storage.createConversation(name || 'New Conversation', isGroup ?? false, allIds, user.name);
  io.emit('conversation_created', conv);
  res.status(201).json(conv);
});

app.get('/api/conversations/:id/messages', (req: Request, res: Response) => {
  res.json(storage.getMessages(req.params.id));
});

app.post('/api/conversations/:id/messages', (req: Request, res: Response) => {
  const { text, attachmentName, replyTo } = req.body;
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
  const msg = storage.sendMessage(req.params.id, user.id, text, attachmentName, replyTo);
  io.to(`conv_${req.params.id}`).emit('new_message', msg);
  io.emit('conversation_updated', {
    conversationId: req.params.id,
    lastMessage: text,
    timeAgo: 'Just now'
  });
  res.status(201).json(msg);
});

// Documents
app.get('/api/documents', (_req: Request, res: Response) => {
  res.json(storage.getDocuments());
});

app.post('/api/documents/upload', upload.single('file'), (req: Request, res: Response) => {
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
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
    folder: folder || 'General Documents',
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

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
  const ok = storage.archiveDocument(req.params.id, user.name);
  if (!ok) return res.status(404).json({ error: 'Document not found' });
  io.emit('document_archived', { id: req.params.id });
  res.json({ success: true });
});

app.patch('/api/documents/:id/rename', (req: Request, res: Response) => {
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
  const doc = storage.renameDocument(req.params.id, req.body.name, user.name);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  io.emit('document_updated', doc);
  res.json(doc);
});

app.get('/api/documents/:id/download', (req: Request, res: Response) => {
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
  const doc = storage.recordDownload(req.params.id, user.name);
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  if (doc.storageFilename) {
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
app.get('/api/announcements', (_req: Request, res: Response) => {
  res.json(storage.getAnnouncements());
});

app.post('/api/announcements', (req: Request, res: Response) => {
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
  const ann = storage.createAnnouncement({
    ...req.body,
    authorName: user.name,
    authorRole: user.roleTitle
  }, user.name);
  io.emit('announcement_published', ann);
  res.status(201).json(ann);
});

app.patch('/api/announcements/:id', (req: Request, res: Response) => {
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
  const ann = storage.updateAnnouncement(req.params.id, req.body, user.name);
  if (!ann) return res.status(404).json({ error: 'Announcement not found' });
  io.emit('announcement_updated', ann);
  res.json(ann);
});

app.delete('/api/announcements/:id', (req: Request, res: Response) => {
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
  const ok = storage.deleteAnnouncement(req.params.id, user.name);
  if (!ok) return res.status(404).json({ error: 'Announcement not found' });
  io.emit('announcement_deleted', { id: req.params.id });
  res.json({ success: true });
});

app.post('/api/announcements/:id/acknowledge', (req: Request, res: Response) => {
  const ok = storage.acknowledgeAnnouncement(req.params.id, currentActiveUserId);
  res.json({ success: ok });
});

// Users & Administrator Control
app.get('/api/users', (_req: Request, res: Response) => {
  res.json(storage.getUsers());
});

app.get('/api/admin/users-security', (_req: Request, res: Response) => {
  res.json(storage.getUsersWithSecurityInfo());
});

app.post('/api/users', (req: Request, res: Response) => {
  const actor = getSessionUser(req)?.name || 'HR Administrator';
  const user = storage.adminCreateUser(req.body, actor);
  io.emit('user_created', user);
  res.status(201).json(user);
});

app.post('/api/admin/users', (req: Request, res: Response) => {
  const actor = getSessionUser(req)?.name || 'HR Administrator';
  const user = storage.adminCreateUser(req.body, actor);
  io.emit('user_created', user);
  res.status(201).json(user);
});

app.patch('/api/users/:id/status', (req: Request, res: Response) => {
  const actor = getSessionUser(req)?.name || 'HR Administrator';
  const user = storage.updateUserStatus(req.params.id, req.body.status, actor);
  if (!user) return res.status(404).json({ error: 'User not found' });
  io.emit('user_updated', user);
  res.json(user);
});

app.post('/api/admin/users/:id/reset-password', (req: Request, res: Response) => {
  const actor = getSessionUser(req)?.name || 'HR Administrator';
  const { temporaryPassword } = req.body;
  const temp = temporaryPassword || 'Staff@' + Math.floor(1000 + Math.random() * 9000);
  const result = storage.adminResetPassword(req.params.id, temp, actor);
  if (!result.success) return res.status(404).json({ error: 'User not found' });
  io.emit('user_updated', result.user);
  res.json(result);
});

app.post('/api/admin/users/:id/unlock', (req: Request, res: Response) => {
  const actor = getSessionUser(req)?.name || 'HR Administrator';
  const ok = storage.adminUnlockAccount(req.params.id, actor);
  if (!ok) return res.status(404).json({ error: 'User not found' });
  const user = storage.getUserById(req.params.id);
  io.emit('user_updated', user);
  res.json({ success: true, user });
});

app.get('/api/admin/reset-tickets', (_req: Request, res: Response) => {
  res.json(storage.getResetTickets());
});

app.patch('/api/admin/reset-tickets/:id/resolve', (req: Request, res: Response) => {
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

app.get('/api/admin/backup', (req: Request, res: Response) => {
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
  storage.logAudit(user.name, 'BACKUP_EXPORT', 'Full Database', 'SUCCESS', getClientIp(req));
  const backup = storage.exportBackup();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="hr_central_backup_${Date.now()}.json"`);
  res.send(backup);
});

app.post('/api/admin/restore', (req: Request, res: Response) => {
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
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

app.patch('/api/admin/settings', (req: Request, res: Response) => {
  const user = storage.getUsers().find(u => u.id === currentActiveUserId) || storage.getUsers()[0];
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
