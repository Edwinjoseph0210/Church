import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db';
import {
  authenticateToken,
  optionalAuthenticateToken,
  requireRole,
  isStaffOrAdmin,
  generateToken,
  sanitizeUser,
  AuthenticatedRequest,
} from './auth';
import {
  UserRole,
  Member,
  Family,
  Announcement,
  ParishEvent,
  GalleryAlbum,
  GalleryImage,
  ParishDocument,
  HolyQurbanaTiming,
  PrayerRequest,
  AppointmentRequest,
  NotificationItem,
  ContactMessage,
  SacramentalRecord,
  Organization,
  OrganizationMember,
} from '../types';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

// Member Registration: "Create Parish Member Account"
apiRouter.post('/auth/register', (req, res) => {
  const { fullName, mobileNumber, email, password, confirmPassword } = req.body;

  if (!fullName || !mobileNumber || !email || !password) {
    res.status(400).json({ error: 'All fields (Full Name, Mobile Number, Email, Password) are required.' });
    return;
  }

  if (password !== confirmPassword) {
    res.status(400).json({ error: 'Passwords do not match. Please verify your password confirmation.' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const existingUser = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existingUser) {
    res.status(400).json({ error: 'An account with this email address already exists. Please sign in or use another email.' });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const now = new Date().toISOString();
  const newUser = {
    id: `USR-${Date.now()}`,
    email: cleanEmail,
    name: fullName.trim(),
    phone: mobileNumber.trim(),
    role: 'MEMBER' as const,
    status: 'PENDING' as const,
    passwordHash: bcrypt.hashSync(password, salt),
    createdAt: now,
  };

  db.users.push(newUser);

  // Requirement 3: Immediately create a notification for the Priest
  const priestNotif: NotificationItem = {
    id: `NOTIF-REG-${Date.now()}`,
    recipientUserId: 'USR-PRIEST',
    title: 'New Parish Member Registration',
    message: `${newUser.name} has requested access to the parish member portal.`,
    type: 'GENERAL',
    link: '/priest/dashboard',
    isRead: false,
    createdAt: now,
  };
  db.notifications.unshift(priestNotif);
  db.save();

  db.addAuditLog({
    userId: newUser.id,
    userName: newUser.name,
    userRole: newUser.role,
    action: 'MEMBER_REGISTRATION_SUBMITTED',
    resource: 'AUTH',
    resourceId: newUser.id,
    details: `New registration submitted by ${newUser.name} (${cleanEmail}, ${mobileNumber}). Status set to PENDING.`,
  });

  res.status(201).json({
    message: 'Your parish member account has been created and submitted to the Parish Priest for verification. Once approved, you will be able to sign in.',
    status: 'PENDING',
    applicant: {
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      status: newUser.status,
      createdAt: newUser.createdAt,
    },
  });
});

apiRouter.post('/auth/login', (req, res) => {
  const { identifier, password } = req.body; // email or memberId
  if (!identifier || !password) {
    res.status(400).json({ error: 'Please provide identifier (email or Member ID) and password.' });
    return;
  }

  const trimmed = identifier.trim().toLowerCase();
  let user = db.users.find(
    (u) =>
      u.email.toLowerCase() === trimmed ||
      (u.memberId && u.memberId.toLowerCase() === trimmed)
  );

  // Fast resolution for simple IDs requested by user
  if (!user) {
    if (trimmed === 'admin' || trimmed === 'admin@church.org') {
      user = db.users.find((u) => u.id === 'USR-SUPER' || u.id === 'USR-PRIEST' || u.role === 'PRIEST');
    } else if (trimmed === 'member1' || trimmed === 'demo1') {
      user = db.users.find((u) => u.id === 'USR-MEMBER-1' || u.memberId === 'DEMO-001');
    } else if (trimmed === 'member2' || trimmed === 'demo2') {
      user = db.users.find((u) => u.id === 'USR-MEMBER-2' || u.memberId === 'DEMO-002' || u.id === 'USR-MEMBER-OTHER');
    }
  }

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials. User not found.' });
    return;
  }

  // Requirement 2 & 4: Only APPROVED members can log in.
  // Statuses: PENDING, APPROVED, REJECTED, SUSPENDED
  if (user.status === 'PENDING') {
    res.status(403).json({
      error: 'Your registration is currently pending approval by the Parish Priest. You will be able to log in once your account has been approved.',
      status: 'PENDING',
    });
    return;
  }

  if (user.status === 'REJECTED') {
    res.status(403).json({
      error: 'Your parish account request was declined. Please contact the parish vicar/office.',
      status: 'REJECTED',
    });
    return;
  }

  if (user.status === 'SUSPENDED' || (user.status as string) === 'INACTIVE') {
    res.status(403).json({
      error: 'Your account is suspended. Please contact the parish administration.',
      status: 'SUSPENDED',
    });
    return;
  }

  if (user.status !== 'APPROVED' && (user.status as string) !== 'ACTIVE') {
    res.status(403).json({
      error: 'Account is not authorized for portal access. Please contact the Parish Priest.',
    });
    return;
  }

  let validPassword = false;
  // Seamless check for requested simple credentials
  if (
    (trimmed === 'admin' || trimmed === 'admin@church.org' || user.id === 'USR-PRIEST' || user.id === 'USR-SUPER') &&
    (password === 'admin123' || password === 'admin' || password === 'priest123')
  ) {
    validPassword = true;
  } else if (
    (trimmed === 'member1' || user.id === 'USR-MEMBER-1') &&
    (password === 'member123' || password === 'member1')
  ) {
    validPassword = true;
  } else if (
    (trimmed === 'member2' || user.id === 'USR-MEMBER-2' || user.id === 'USR-MEMBER-OTHER') &&
    (password === 'member123' || password === 'member2')
  ) {
    validPassword = true;
  } else {
    validPassword = bcrypt.compareSync(password, user.passwordHash);
  }

  if (!validPassword) {
    res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
    return;
  }

  user.lastLoginAt = new Date().toISOString();
  db.save();

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'USER_LOGIN',
    resource: 'AUTH',
    details: `User logged in from identifier: ${identifier}`,
  });

  const safe = sanitizeUser(user);
  const token = generateToken(safe);

  res.json({
    token,
    user: safe,
  });
});

apiRouter.get('/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

apiRouter.post('/auth/change-password', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    return;
  }

  const user = db.users.find((u) => u.id === req.user?.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const valid = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!valid) {
    res.status(400).json({ error: 'Current password does not match.' });
    return;
  }

  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  db.save();

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'PASSWORD_CHANGE',
    resource: 'AUTH',
    details: 'User changed their password.',
  });

  res.json({ message: 'Password successfully updated.' });
});

apiRouter.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = db.users.find((u) => u.email.toLowerCase() === (email || '').trim().toLowerCase());
  if (user) {
    db.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'PASSWORD_RESET_REQUESTED',
      resource: 'AUTH',
      details: `Password reset link requested for ${email}`,
    });
  }
  // Generic safe response
  res.json({ message: 'If an account exists with that email, password reset instructions have been generated.' });
});

// ==========================================
// 2. PARISH SETTINGS
// ==========================================

apiRouter.get('/parish-settings', (_req, res) => {
  res.json(db.parish_settings);
});

apiRouter.put(
  '/parish-settings',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN']),
  (req: AuthenticatedRequest, res: Response) => {
    const updated = {
      ...db.parish_settings,
      ...req.body,
      // Ensure church name and tradition remain pristine unless intentionally configured
      churchName: req.body.churchName || 'St. Mariam Thresia Church',
      tradition: req.body.tradition || 'Syro-Malabar Catholic Church',
    };
    db.parish_settings = updated;

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'PARISH_SETTINGS_UPDATED',
      resource: 'SETTINGS',
      details: 'Parish configuration and identity updated.',
    });

    res.json(db.parish_settings);
  }
);

// ==========================================
// 3. HOLY QURBANA TIMINGS
// ==========================================

apiRouter.get('/holy-qurbana', (_req, res) => {
  const active = db.holy_qurbana_timings
    .filter((t) => t.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  res.json(active);
});

apiRouter.get(
  '/holy-qurbana/all',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (_req, res) => {
    res.json(db.holy_qurbana_timings.sort((a, b) => a.displayOrder - b.displayOrder));
  }
);

apiRouter.post(
  '/holy-qurbana',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    const { dayType, dayName, time, language, description, notes, isActive, displayOrder } = req.body;
    if (!dayName || !time || !language) {
      res.status(400).json({ error: 'Missing required timing details.' });
      return;
    }

    const newTiming: HolyQurbanaTiming = {
      id: `HQ-${Date.now()}`,
      dayType: dayType || 'WEEKDAY',
      dayName,
      time,
      language,
      description,
      notes,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      displayOrder: displayOrder || db.holy_qurbana_timings.length + 1,
    };

    db.holy_qurbana_timings.push(newTiming);
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'QURBANA_TIMING_CREATED',
      resource: 'HOLY_QURBANA',
      resourceId: newTiming.id,
      details: `Created Holy Qurbana timing: ${dayName} at ${time}`,
    });

    res.status(201).json(newTiming);
  }
);

apiRouter.put(
  '/holy-qurbana/:id',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    const timing = db.holy_qurbana_timings.find((t) => t.id === req.params.id);
    if (!timing) {
      res.status(404).json({ error: 'Holy Qurbana timing not found.' });
      return;
    }

    Object.assign(timing, req.body);
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'QURBANA_TIMING_UPDATED',
      resource: 'HOLY_QURBANA',
      resourceId: timing.id,
      details: `Updated timing for ${timing.dayName}`,
    });

    res.json(timing);
  }
);

apiRouter.delete(
  '/holy-qurbana/:id',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    const index = db.holy_qurbana_timings.findIndex((t) => t.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Timing not found.' });
      return;
    }
    const removed = db.holy_qurbana_timings.splice(index, 1)[0];
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'QURBANA_TIMING_DELETED',
      resource: 'HOLY_QURBANA',
      resourceId: removed.id,
      details: `Deleted timing: ${removed.dayName}`,
    });

    res.json({ message: 'Timing deleted successfully.' });
  }
);

// ==========================================
// 4. ANNOUNCEMENTS
// ==========================================

apiRouter.get('/announcements', optionalAuthenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { category, search, priority, status } = req.query;
  const user = req.user;
  const isStaff = isStaffOrAdmin(user?.role);

  let list = [...db.announcements];

  if (!isStaff) {
    list = list.filter((a) => {
      if (a.status !== 'PUBLISHED') return false;
      if (a.audience === 'PUBLIC') return true;
      if (user && a.audience === 'MEMBERS') return true;
      if (user && a.audience === 'SPECIFIC_ORGANIZATION' && user.assignedOrganizationId === a.organizationId) {
        return true;
      }
      return false;
    });
  } else if (status) {
    list = list.filter((a) => a.status === status);
  }

  if (category && category !== 'ALL') {
    list = list.filter((a) => a.category === category);
  }

  if (priority && priority !== 'ALL') {
    list = list.filter((a) => a.priority === priority);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter((a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q));
  }

  // Sort: Important first, then newest
  list.sort((a, b) => {
    if (a.isImportant && !b.isImportant) return -1;
    if (!a.isImportant && b.isImportant) return 1;
    return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
  });

  res.json(list);
});

apiRouter.get('/announcements/:id', optionalAuthenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const item = db.announcements.find((a) => a.id === req.params.id);
  if (!item) {
    res.status(404).json({ error: 'Announcement not found.' });
    return;
  }

  const isStaff = isStaffOrAdmin(req.user?.role);
  if (!isStaff) {
    if (item.status !== 'PUBLISHED') {
      res.status(403).json({ error: 'Announcement is not published.' });
      return;
    }
    if (item.audience === 'MEMBERS' && !req.user) {
      res.status(403).json({ error: 'Announcement reserved for parish members.' });
      return;
    }
  }

  res.json(item);
});

apiRouter.post(
  '/announcements',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST', 'ORGANIZATION_COORDINATOR']),
  (req: AuthenticatedRequest, res: Response) => {
    const { title, content, category, priority, isImportant, publishDate, expiryDate, audience, organizationId, status, imageUrl } = req.body;
    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required.' });
      return;
    }

    const isCoord = req.user!.role === 'ORGANIZATION_COORDINATOR';
    const targetOrg = isCoord ? req.user!.assignedOrganizationId : organizationId;

    const newAnn: Announcement = {
      id: `ANN-${Date.now()}`,
      title,
      content,
      imageUrl: imageUrl || undefined,
      category: category || 'GENERAL',
      priority: priority || 'NORMAL',
      isImportant: Boolean(isImportant),
      publishDate: publishDate || new Date().toISOString().split('T')[0],
      expiryDate,
      author: req.user!.name,
      audience: isCoord ? 'SPECIFIC_ORGANIZATION' : (audience || 'PUBLIC'),
      organizationId: targetOrg,
      status: status || 'PUBLISHED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.announcements.unshift(newAnn);

    // Create system notification if published & important
    if (newAnn.status === 'PUBLISHED' && newAnn.isImportant) {
      db.notifications.unshift({
        id: `NOTIF-${Date.now()}`,
        title: `Important: ${newAnn.title}`,
        message: newAnn.content.slice(0, 120) + '...',
        type: 'ANNOUNCEMENT',
        link: `/announcements/${newAnn.id}`,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'ANNOUNCEMENT_CREATED',
      resource: 'ANNOUNCEMENT',
      resourceId: newAnn.id,
      details: `Created announcement: ${newAnn.title}`,
    });

    res.status(201).json(newAnn);
  }
);

apiRouter.put(
  '/announcements/:id',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST', 'ORGANIZATION_COORDINATOR']),
  (req: AuthenticatedRequest, res: Response) => {
    const item = db.announcements.find((a) => a.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Announcement not found.' });
      return;
    }

    if (req.user!.role === 'ORGANIZATION_COORDINATOR' && item.organizationId !== req.user!.assignedOrganizationId) {
      res.status(403).json({ error: 'Forbidden. You may only edit announcements for your organization.' });
      return;
    }

    Object.assign(item, req.body, { updatedAt: new Date().toISOString() });
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'ANNOUNCEMENT_UPDATED',
      resource: 'ANNOUNCEMENT',
      resourceId: item.id,
      details: `Updated announcement: ${item.title}`,
    });

    res.json(item);
  }
);

apiRouter.delete(
  '/announcements/:id',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    const index = db.announcements.findIndex((a) => a.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Announcement not found.' });
      return;
    }
    const removed = db.announcements.splice(index, 1)[0];
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'ANNOUNCEMENT_DELETED',
      resource: 'ANNOUNCEMENT',
      resourceId: removed.id,
      details: `Deleted announcement: ${removed.title}`,
    });

    res.json({ message: 'Announcement deleted.' });
  }
);

// ==========================================
// 5. EVENTS
// ==========================================

apiRouter.get('/events', optionalAuthenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { status, search } = req.query;
  const isStaff = isStaffOrAdmin(req.user?.role);

  let list = [...db.events];
  if (!isStaff) {
    list = list.filter((e) => e.status === 'UPCOMING' || e.status === 'ONGOING');
  } else if (status && status !== 'ALL') {
    list = list.filter((e) => e.status === status);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter((e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
  }

  list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  res.json(list);
});

apiRouter.get('/events/:id', (req, res) => {
  const evt = db.events.find((e) => e.id === req.params.id);
  if (!evt) {
    res.status(404).json({ error: 'Event not found.' });
    return;
  }
  res.json(evt);
});

apiRouter.post(
  '/events',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST', 'ORGANIZATION_COORDINATOR']),
  (req: AuthenticatedRequest, res: Response) => {
    const { title, description, date, startTime, endTime, location, imageUrl, organizer, registrationInfo, contactInfo, status } = req.body;
    if (!title || !date || !startTime || !location) {
      res.status(400).json({ error: 'Title, date, start time, and location are required.' });
      return;
    }

    const newEvt: ParishEvent = {
      id: `EVT-${Date.now()}`,
      title,
      description: description || '',
      date,
      startTime,
      endTime: endTime || '',
      location,
      imageUrl,
      organizer: organizer || req.user!.name,
      organizationId: req.user!.role === 'ORGANIZATION_COORDINATOR' ? req.user!.assignedOrganizationId : req.body.organizationId,
      registrationInfo,
      contactInfo: contactInfo || '[PARISH OFFICE CONTACT]',
      status: status || 'UPCOMING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.events.push(newEvt);

    db.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: `New Parish Event: ${newEvt.title}`,
      message: `Scheduled for ${newEvt.date} at ${newEvt.startTime}. Location: ${newEvt.location}`,
      type: 'EVENT',
      link: `/events/${newEvt.id}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'EVENT_CREATED',
      resource: 'EVENT',
      resourceId: newEvt.id,
      details: `Created event: ${newEvt.title}`,
    });

    res.status(201).json(newEvt);
  }
);

apiRouter.put(
  '/events/:id',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    const evt = db.events.find((e) => e.id === req.params.id);
    if (!evt) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }

    Object.assign(evt, req.body, { updatedAt: new Date().toISOString() });
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'EVENT_UPDATED',
      resource: 'EVENT',
      resourceId: evt.id,
      details: `Updated event: ${evt.title}`,
    });

    res.json(evt);
  }
);

apiRouter.delete(
  '/events/:id',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN']),
  (req: AuthenticatedRequest, res: Response) => {
    const index = db.events.findIndex((e) => e.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Event not found.' });
      return;
    }
    const removed = db.events.splice(index, 1)[0];
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'EVENT_DELETED',
      resource: 'EVENT',
      resourceId: removed.id,
      details: `Deleted event: ${removed.title}`,
    });

    res.json({ message: 'Event deleted.' });
  }
);

// ==========================================
// 6. GALLERY & ALBUMS
// ==========================================

apiRouter.get('/gallery', optionalAuthenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const isMember = Boolean(req.user);
  let albums = [...db.gallery_albums];

  if (!isMember) {
    albums = albums.filter((a) => a.isPublic && a.isPublished);
  } else if (!isStaffOrAdmin(req.user?.role)) {
    albums = albums.filter((a) => a.isPublished);
  }

  const enriched = albums.map((a) => {
    const images = db.gallery_images.filter((img) => img.albumId === a.id);
    return {
      ...a,
      imageCount: images.length,
    };
  });

  res.json(enriched);
});

apiRouter.get('/gallery/:id', optionalAuthenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const album = db.gallery_albums.find((a) => a.id === req.params.id);
  if (!album) {
    res.status(404).json({ error: 'Album not found.' });
    return;
  }

  if (!album.isPublic && !req.user) {
    res.status(403).json({ error: 'Sign in to access parish member gallery.' });
    return;
  }

  const images = db.gallery_images
    .filter((img) => img.albumId === album.id)
    .sort((a, b) => a.order - b.order);

  res.json({ ...album, images });
});

apiRouter.post(
  '/gallery',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    const { title, description, category, coverImageUrl, isPublic, isPublished } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Album title is required.' });
      return;
    }

    const newAlbum: GalleryAlbum = {
      id: `ALB-${Date.now()}`,
      title,
      description: description || '',
      category: category || 'General',
      coverImageUrl: coverImageUrl || '/src/assets/images/hero_church_facade_1790490137085.jpg',
      isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
      createdAt: new Date().toISOString(),
    };

    db.gallery_albums.unshift(newAlbum);
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'GALLERY_ALBUM_CREATED',
      resource: 'GALLERY',
      resourceId: newAlbum.id,
      details: `Created gallery album: ${newAlbum.title}`,
    });

    res.status(201).json(newAlbum);
  }
);

apiRouter.post(
  '/gallery/:id/images',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    const album = db.gallery_albums.find((a) => a.id === req.params.id);
    if (!album) {
      res.status(404).json({ error: 'Album not found.' });
      return;
    }

    const { imageUrl, caption, order } = req.body;
    if (!imageUrl) {
      res.status(400).json({ error: 'Image URL is required.' });
      return;
    }

    const newImage: GalleryImage = {
      id: `IMG-${Date.now()}`,
      albumId: album.id,
      imageUrl,
      caption: caption || '',
      order: order || db.gallery_images.filter((i) => i.albumId === album.id).length + 1,
      createdAt: new Date().toISOString(),
    };

    db.gallery_images.push(newImage);
    db.save();

    res.status(201).json(newImage);
  }
);

apiRouter.delete(
  '/gallery/:id',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN']),
  (req: AuthenticatedRequest, res: Response) => {
    const albumIndex = db.gallery_albums.findIndex((a) => a.id === req.params.id);
    if (albumIndex === -1) {
      res.status(404).json({ error: 'Album not found.' });
      return;
    }
    const removed = db.gallery_albums.splice(albumIndex, 1)[0];
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'GALLERY_ALBUM_DELETED',
      resource: 'GALLERY',
      resourceId: removed.id,
      details: `Deleted album: ${removed.title}`,
    });

    res.json({ message: 'Album deleted.' });
  }
);

// ==========================================
// 7. DOCUMENTS & SECURE DOWNLOADS
// ==========================================

apiRouter.get('/documents', optionalAuthenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user;
  const isStaff = isStaffOrAdmin(user?.role);

  let docs = [...db.documents].filter((d) => d.status === 'ACTIVE');

  if (!user) {
    docs = docs.filter((d) => d.visibility === 'PUBLIC');
  } else if (!isStaff) {
    docs = docs.filter(
      (d) =>
        d.visibility === 'PUBLIC' ||
        d.visibility === 'MEMBERS_ONLY' ||
        (d.visibility === 'ORGANIZATION_ONLY' && d.organizationId === user.assignedOrganizationId)
    );
  }

  res.json(docs);
});

apiRouter.get('/documents/:id/download', optionalAuthenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const doc = db.documents.find((d) => d.id === req.params.id);
  if (!doc) {
    res.status(404).json({ error: 'Document not found.' });
    return;
  }

  const user = req.user;
  const isStaff = isStaffOrAdmin(user?.role);

  // Strict authorization check before document download
  if (doc.visibility === 'MEMBERS_ONLY' && !user) {
    res.status(403).json({ error: 'Access denied. You must be a logged in parish member to download this document.' });
    return;
  }

  if (doc.visibility === 'ADMIN_ONLY' && !isStaff) {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }

  if (doc.visibility === 'ORGANIZATION_ONLY' && !isStaff && user?.assignedOrganizationId !== doc.organizationId) {
    res.status(403).json({ error: 'Access denied. Restricted to assigned organization members.' });
    return;
  }

  // Simulated secure download response with PDF/text content headers
  res.setHeader('Content-Disposition', `attachment; filename="${doc.fileName}"`);
  res.setHeader('Content-Type', 'application/pdf');
  res.send(`Official Document of St. Mariam Thresia Church\nTitle: ${doc.title}\nCategory: ${doc.category}\nUpload Date: ${doc.uploadDate}`);
});

apiRouter.post(
  '/documents',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    const { title, description, category, fileName, fileSize, visibility, organizationId } = req.body;
    if (!title || !fileName) {
      res.status(400).json({ error: 'Document title and file name are required.' });
      return;
    }

    const newDoc: ParishDocument = {
      id: `DOC-${Date.now()}`,
      title,
      description: description || '',
      category: category || 'PARISH_NOTICE',
      fileName,
      fileSize: fileSize || '500 KB',
      fileUrl: `/api/documents/DOC-${Date.now()}/download`,
      uploadedBy: req.user!.name,
      uploadDate: new Date().toISOString().split('T')[0],
      visibility: visibility || 'PUBLIC',
      organizationId,
      status: 'ACTIVE',
    };

    db.documents.unshift(newDoc);
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'DOCUMENT_UPLOADED',
      resource: 'DOCUMENT',
      resourceId: newDoc.id,
      details: `Uploaded document: ${newDoc.title} (${newDoc.visibility})`,
    });

    res.status(201).json(newDoc);
  }
);

apiRouter.delete(
  '/documents/:id',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN']),
  (req: AuthenticatedRequest, res: Response) => {
    const doc = db.documents.find((d) => d.id === req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Document not found.' });
      return;
    }
    doc.status = 'ARCHIVED';
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'DOCUMENT_ARCHIVED',
      resource: 'DOCUMENT',
      resourceId: doc.id,
      details: `Archived document: ${doc.title}`,
    });

    res.json({ message: 'Document archived.' });
  }
);

// Member Document Upload (Requirement: member can upload certificates, transfer forms, identity documents)
apiRouter.post(
  '/member/documents/upload',
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { title, category, fileName, fileSize, notes, fileData } = req.body;
    if (!title || !fileName) {
      res.status(400).json({ error: 'Document title and file name are required.' });
      return;
    }

    const docId = `DOC-MEM-${Date.now()}`;
    const newDoc: ParishDocument = {
      id: docId,
      title,
      description: notes || `Submitted by parish member ${user.name}`,
      category: category || 'MEMBER_SUBMISSION',
      fileName,
      fileSize: fileSize || '1.2 MB',
      fileUrl: `/api/documents/${docId}/download`,
      fileData: fileData || undefined,
      uploadedBy: user.name,
      uploadDate: new Date().toISOString().split('T')[0],
      visibility: 'ADMIN_ONLY',
      memberId: user.memberId || user.id,
      memberName: user.name,
      notes,
      verificationStatus: 'PENDING_VERIFICATION',
      status: 'ACTIVE',
    };

    db.documents.unshift(newDoc);
    db.save();

    db.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'MEMBER_DOCUMENT_UPLOADED',
      resource: 'DOCUMENT',
      resourceId: newDoc.id,
      details: `Member ${user.name} uploaded ${newDoc.title} (${newDoc.category})`,
    });

    res.status(201).json(newDoc);
  }
);

// Get current member's uploaded documents
apiRouter.get(
  '/member/documents/my',
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const myDocs = db.documents.filter(
      (d) =>
        d.status === 'ACTIVE' &&
        (d.memberId === user.memberId || d.memberId === user.id || d.uploadedBy === user.name)
    );

    res.json(myDocs);
  }
);

// Member deletes their own uploaded document
apiRouter.delete(
  '/member/documents/:id',
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const doc = db.documents.find(
      (d) =>
        d.id === req.params.id &&
        (d.memberId === user.memberId || d.memberId === user.id || d.uploadedBy === user.name)
    );

    if (!doc) {
      res.status(404).json({ error: 'Document not found or access unauthorized.' });
      return;
    }

    doc.status = 'ARCHIVED';
    db.save();

    res.json({ message: 'Document removed successfully' });
  }
);

// Priest / Admin verifies member uploaded document
apiRouter.put(
  '/documents/:id/verify',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    const doc = db.documents.find((d) => d.id === req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Document not found.' });
      return;
    }

    const { status, notes } = req.body;
    doc.verificationStatus = status || 'VERIFIED';
    if (notes) doc.verificationNotes = notes;
    doc.verifiedAt = new Date().toISOString();
    doc.verifiedBy = req.user?.name || 'Parish Priest';

    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'DOCUMENT_VERIFIED',
      resource: 'DOCUMENT',
      resourceId: doc.id,
      details: `${req.user?.name} marked document ${doc.title} as ${doc.verificationStatus}`,
    });

    res.json(doc);
  }
);

// ==========================================
// 8. MEMBERS & FAMILIES
// ==========================================

apiRouter.get(
  '/members',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    const { search, status, familyId } = req.query;
    let list = [...db.members];

    if (status && status !== 'ALL') {
      list = list.filter((m) => m.membershipStatus === status);
    }
    if (familyId) {
      list = list.filter((m) => m.familyId === familyId);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(
        (m) =>
          m.id.toLowerCase().includes(q) ||
          m.firstName.toLowerCase().includes(q) ||
          m.lastName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.phone.toLowerCase().includes(q)
      );
    }

    res.json(list);
  }
);

apiRouter.get('/members/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const targetId = req.params.id;
  const isStaff = isStaffOrAdmin(req.user?.role);
  const isSelf = req.user?.memberId === targetId;

  // IMPORTANT: Member A attempting to access Member B's information must be blocked!
  if (!isStaff && !isSelf) {
    res.status(403).json({ error: 'Forbidden. You do not have permission to view this member profile.' });
    return;
  }

  const member = db.members.find((m) => m.id === targetId);
  if (!member) {
    res.status(404).json({ error: 'Member record not found.' });
    return;
  }

  const family = member.familyId ? db.families.find((f) => f.id === member.familyId) : undefined;
  res.json({ ...member, family });
});

apiRouter.put('/members/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const targetId = req.params.id;
  const isStaff = isStaffOrAdmin(req.user?.role);
  const isSelf = req.user?.memberId === targetId;

  if (!isStaff && !isSelf) {
    res.status(403).json({ error: 'Forbidden. You cannot modify another member.' });
    return;
  }

  const member = db.members.find((m) => m.id === targetId);
  if (!member) {
    res.status(404).json({ error: 'Member not found.' });
    return;
  }

  // Members can only edit non-sensitive fields
  if (!isStaff) {
    const { phone, address, occupation, houseName } = req.body;
    if (phone) member.phone = phone;
    if (address) member.address = address;
    if (occupation) member.occupation = occupation;
    if (houseName) member.houseName = houseName;
    member.updatedAt = new Date().toISOString();
  } else {
    // Admin can update all fields
    Object.assign(member, req.body, { updatedAt: new Date().toISOString() });
  }

  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'MEMBER_UPDATED',
    resource: 'MEMBER',
    resourceId: member.id,
    details: `Updated member profile ${member.firstName} ${member.lastName}`,
  });

  res.json(member);
});

apiRouter.post(
  '/members',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    const { firstName, lastName, dateOfBirth, gender, phone, email, address, houseName, occupation, familyId, relationshipToHead } = req.body;
    if (!firstName || !lastName || !phone) {
      res.status(400).json({ error: 'First name, last name, and phone are required.' });
      return;
    }

    const memberId = `M-${100 + db.members.length + 1}`;
    const newMember: Member = {
      id: memberId,
      familyId,
      relationshipToHead: relationshipToHead || 'HEAD',
      firstName,
      lastName,
      dateOfBirth: dateOfBirth || '1990-01-01',
      gender: gender || 'OTHER',
      phone,
      email: email || '',
      address: address || '[PARISH RESIDENTIAL ADDRESS]',
      houseName: houseName || '',
      occupation: occupation || '',
      membershipStatus: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.members.push(newMember);
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'MEMBER_CREATED',
      resource: 'MEMBER',
      resourceId: newMember.id,
      details: `Created new member ${newMember.firstName} ${newMember.lastName} (${newMember.id})`,
    });

    res.status(201).json(newMember);
  }
);

apiRouter.patch(
  '/members/:id/status',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN']),
  (req: AuthenticatedRequest, res: Response) => {
    const member = db.members.find((m) => m.id === req.params.id);
    if (!member) {
      res.status(404).json({ error: 'Member not found.' });
      return;
    }

    const { status } = req.body;
    if (status !== 'ACTIVE' && status !== 'INACTIVE') {
      res.status(400).json({ error: 'Invalid status. Must be ACTIVE or INACTIVE.' });
      return;
    }

    member.membershipStatus = status;
    member.updatedAt = new Date().toISOString();
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'MEMBER_STATUS_CHANGED',
      resource: 'MEMBER',
      resourceId: member.id,
      details: `Changed member ${member.id} status to ${status}`,
    });

    res.json(member);
  }
);

// Families
apiRouter.get(
  '/families',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    const { search } = req.query;
    let list = [...db.families];

    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter((f) => f.familyName.toLowerCase().includes(q) || f.houseName.toLowerCase().includes(q));
    }

    const enriched = list.map((f) => ({
      ...f,
      members: db.members.filter((m) => m.familyId === f.id),
    }));

    res.json(enriched);
  }
);

apiRouter.get('/families/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const familyId = req.params.id;
  const isStaff = isStaffOrAdmin(req.user?.role);

  // Check if member belongs to this family
  const currentMember = req.user?.memberId ? db.members.find((m) => m.id === req.user?.memberId) : null;
  const isMemberOfFamily = currentMember && currentMember.familyId === familyId;

  if (!isStaff && !isMemberOfFamily) {
    res.status(403).json({ error: 'Forbidden. You do not have permission to view another family.' });
    return;
  }

  const family = db.families.find((f) => f.id === familyId);
  if (!family) {
    res.status(404).json({ error: 'Family record not found.' });
    return;
  }

  const members = db.members.filter((m) => m.familyId === family.id);
  res.json({ ...family, members });
});

apiRouter.post(
  '/families',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN']),
  (req: AuthenticatedRequest, res: Response) => {
    const { familyName, houseName, wardOrUnit, address, contactPhone, contactEmail, headMemberId } = req.body;
    if (!familyName || !houseName || !contactPhone) {
      res.status(400).json({ error: 'Family name, house name, and phone are required.' });
      return;
    }

    const newFamily: Family = {
      id: `FAM-${100 + db.families.length + 1}`,
      familyName,
      houseName,
      wardOrUnit: wardOrUnit || 'St. Thomas Unit 1',
      address: address || '[PARISH RESIDENTIAL ADDRESS]',
      contactPhone,
      contactEmail: contactEmail || '',
      headMemberId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.families.push(newFamily);
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'FAMILY_CREATED',
      resource: 'FAMILY',
      resourceId: newFamily.id,
      details: `Created family record: ${newFamily.familyName}`,
    });

    res.status(201).json(newFamily);
  }
);

apiRouter.put(
  '/families/:id',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN']),
  (req: AuthenticatedRequest, res: Response) => {
    const family = db.families.find((f) => f.id === req.params.id);
    if (!family) {
      res.status(404).json({ error: 'Family not found.' });
      return;
    }

    Object.assign(family, req.body, { updatedAt: new Date().toISOString() });
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'FAMILY_UPDATED',
      resource: 'FAMILY',
      resourceId: family.id,
      details: `Updated family record: ${family.familyName}`,
    });

    res.json(family);
  }
);

// ==========================================
// 8.1 PARISH MEMBERSHIP REGISTER (DIOCESE OF HOSUR)
// ==========================================

// Helper to check if user is Head of Family or Staff
function canManageFamilyRegister(req: AuthenticatedRequest, familyId: string): { allowed: boolean; isHead: boolean; isStaff: boolean } {
  const isStaff = isStaffOrAdmin(req.user?.role);
  if (isStaff) return { allowed: true, isHead: false, isStaff: true };

  const memberId = req.user?.memberId;
  if (!memberId) return { allowed: false, isHead: false, isStaff: false };

  const family = db.families.find((f) => f.id === familyId);
  if (!family) return { allowed: false, isHead: false, isStaff: false };

  const member = db.members.find((m) => m.id === memberId);
  if (!member || member.familyId !== familyId) {
    return { allowed: false, isHead: false, isStaff: false };
  }

  const isHead = family.headMemberId === member.id || member.relationshipToHead === 'HEAD';
  return { allowed: isHead, isHead, isStaff: false };
}

// Save or submit Family Register (Diocese of Hosur format)
apiRouter.put('/family-register/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const familyId = req.params.id;
  const authCheck = canManageFamilyRegister(req, familyId);

  if (!authCheck.allowed) {
    res.status(403).json({ error: 'Forbidden. Only the Head of Family or parish administration can manage this Parish Register.' });
    return;
  }

  const family = db.families.find((f) => f.id === familyId);
  if (!family) {
    res.status(404).json({ error: 'Family record not found.' });
    return;
  }

  const {
    familyNumber,
    headOfFamilyName,
    familyName,
    familyUnitName,
    houseName,
    wardOrUnit,
    wardNumber,
    contactPhone,
    mobileNumber,
    landline,
    contactEmail,
    address,
    doorNumber,
    street,
    area,
    city,
    district,
    state,
    pinCode,
    transferredParish,
    transferDate,
    parishTransferRegisterNumber,
    dioceseInKerala,
    monthlySubscription,
    churchTradition,
    nativeParish,
    nativeDiocese,
    houseOwnership,
    statusAction, // 'SAVE_DRAFT' | 'SUBMIT_INFORMATION' | 'SUBMIT_VERIFICATION' | 'REQUEST_CHANGE' | 'PRIEST_APPROVE' | 'PRIEST_REQUEST_CHANGES'
    changeRequestReason,
    priestReviewNotes,
    members: updatedMembersList,
  } = req.body;

  // Update physical register family details
  if (familyNumber !== undefined) family.familyNumber = familyNumber;
  if (headOfFamilyName !== undefined) family.headOfFamilyName = headOfFamilyName;
  if (familyName) family.familyName = familyName;
  if (familyUnitName !== undefined) family.familyUnitName = familyUnitName;
  if (houseName !== undefined) family.houseName = houseName;
  if (wardOrUnit !== undefined) family.wardOrUnit = wardOrUnit;
  if (wardNumber !== undefined) family.wardNumber = wardNumber;
  if (contactPhone) family.contactPhone = contactPhone;
  if (mobileNumber !== undefined) family.mobileNumber = mobileNumber;
  if (landline !== undefined) family.landline = landline;
  if (contactEmail !== undefined) family.contactEmail = contactEmail;

  // Address fields entered by the member for their own family residence
  if (doorNumber !== undefined) family.doorNumber = doorNumber;
  if (street !== undefined) family.street = street;
  if (area !== undefined) family.area = area;
  if (city !== undefined) family.city = city;
  if (district !== undefined) family.district = district;
  if (state !== undefined) family.state = state;
  if (pinCode !== undefined) family.pinCode = pinCode;
  if (address !== undefined) {
    family.address = address;
  } else if (doorNumber || street || area || city) {
    family.address = [doorNumber, street, area, city, district, state, pinCode].filter(Boolean).join(', ');
  }

  // Canonical Parish Register details
  if (transferredParish !== undefined) family.transferredParish = transferredParish;
  if (transferDate !== undefined) family.transferDate = transferDate;
  if (parishTransferRegisterNumber !== undefined) family.parishTransferRegisterNumber = parishTransferRegisterNumber;
  if (dioceseInKerala !== undefined) family.dioceseInKerala = dioceseInKerala;
  if (monthlySubscription !== undefined) family.monthlySubscription = monthlySubscription;
  if (churchTradition !== undefined) family.churchTradition = churchTradition;
  if (nativeParish !== undefined) family.nativeParish = nativeParish;
  if (nativeDiocese !== undefined) family.nativeDiocese = nativeDiocese;
  if (houseOwnership !== undefined) family.houseOwnership = houseOwnership;
  family.updatedAt = new Date().toISOString();

  // Status transitions
  if (statusAction === 'SUBMIT_INFORMATION' || statusAction === 'SUBMIT_VERIFICATION') {
    family.verificationStatus = 'Under Priest Review';
    family.registerStatus = 'Under Priest Review';
    family.verificationNotes = 'Submitted by Head of Family for Parish Priest review.';

    // Notify priest
    db.notifications.unshift({
      id: `NOTIF-FAM-${Date.now()}`,
      recipientUserId: 'USR-PRIEST',
      title: 'Family Register Submitted for Review',
      message: `${family.headOfFamilyName || family.familyName} has submitted their Parish Membership Register for verification.`,
      type: 'GENERAL',
      link: `/priest/members/${family.headMemberId || family.id}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'FAMILY_REGISTER_SUBMITTED',
      resource: 'FAMILY_REGISTER',
      resourceId: family.id,
      details: `Head of Family submitted Parish Register ${family.familyName} for official Priest verification.`,
    });
  } else if (statusAction === 'REQUEST_CHANGE') {
    family.verificationStatus = 'Changes Requested';
    family.registerStatus = 'Changes Requested';
    family.changeRequestReason = changeRequestReason || 'Changes requested to verified records.';
    family.changeRequestDate = new Date().toISOString();
    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'FAMILY_REGISTER_CHANGE_REQUESTED',
      resource: 'FAMILY_REGISTER',
      resourceId: family.id,
      details: `Correction requested for ${family.familyName}: ${family.changeRequestReason}`,
    });
  } else if (statusAction === 'PRIEST_APPROVE' && authCheck.isStaff) {
    family.verificationStatus = 'Approved';
    family.registerStatus = 'Approved';
    family.verifiedDate = new Date().toISOString().split('T')[0];
    family.verifiedBy = req.user!.name;
    family.verificationNotes = 'Verified and approved by Parish Priest.';
    family.priestReviewNotes = '';

    // Mark members as verified
    db.members.filter((m) => m.familyId === family.id).forEach((m) => {
      m.isVerified = true;
    });

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'FAMILY_REGISTER_VERIFIED',
      resource: 'FAMILY_REGISTER',
      resourceId: family.id,
      details: `Priest approved Parish Register ${family.familyName}.`,
    });
  } else if (statusAction === 'PRIEST_REQUEST_CHANGES' && authCheck.isStaff) {
    family.verificationStatus = 'Changes Requested';
    family.registerStatus = 'Changes Requested';
    family.priestReviewNotes = priestReviewNotes || 'Please review and update requested family information.';

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'FAMILY_REGISTER_CHANGES_REQUESTED',
      resource: 'FAMILY_REGISTER',
      resourceId: family.id,
      details: `Priest requested changes for ${family.familyName}: ${family.priestReviewNotes}`,
    });
  } else if (statusAction === 'SAVE_DRAFT') {
    if (family.verificationStatus !== 'Approved' && family.verificationStatus !== 'VERIFIED') {
      family.verificationStatus = 'Draft';
      family.registerStatus = 'Draft';
    }
  }

  // Update member items if provided in batch
  if (Array.isArray(updatedMembersList)) {
    updatedMembersList.forEach((incoming: Partial<Member>) => {
      if (!incoming.id) return;
      const mem = db.members.find((m) => m.id === incoming.id && m.familyId === familyId);
      if (mem) {
        if (incoming.fullName) {
          mem.fullName = incoming.fullName;
          const parts = incoming.fullName.split(' ');
          mem.firstName = parts[0] || mem.firstName;
          mem.lastName = parts.slice(1).join(' ') || mem.lastName;
        } else {
          if (incoming.firstName) mem.firstName = incoming.firstName;
          if (incoming.lastName) mem.lastName = incoming.lastName;
          mem.fullName = `${mem.firstName} ${mem.lastName}`.trim();
        }
        if (incoming.relationshipWithHead) mem.relationshipWithHead = incoming.relationshipWithHead;
        if (incoming.relationshipToHead) mem.relationshipToHead = incoming.relationshipToHead;
        if (incoming.dateOfBirth) mem.dateOfBirth = incoming.dateOfBirth;
        if (incoming.gender) mem.gender = incoming.gender as any;
        if (incoming.phone !== undefined) mem.phone = incoming.phone;
        if (incoming.email !== undefined) mem.email = incoming.email;
        if (incoming.profession !== undefined) {
          mem.profession = incoming.profession;
          mem.occupation = incoming.profession;
        } else if (incoming.occupation !== undefined) {
          mem.occupation = incoming.occupation;
          mem.profession = incoming.occupation;
        }
        if (incoming.baptismDate !== undefined) mem.baptismDate = incoming.baptismDate;
        if (incoming.baptismParish !== undefined) mem.baptismParish = incoming.baptismParish;
        if (incoming.firstHolyCommunionDate !== undefined) {
          mem.firstHolyCommunionDate = incoming.firstHolyCommunionDate;
          mem.firstCommunionConfirmationDate = incoming.firstHolyCommunionDate;
        }
        if (incoming.confirmationDate !== undefined) mem.confirmationDate = incoming.confirmationDate;
        if (incoming.marriageOrdinationDate !== undefined) {
          mem.marriageOrdinationDate = incoming.marriageOrdinationDate;
          mem.marriageDate = incoming.marriageOrdinationDate;
        }
        if (incoming.marriageOrdinationDetails !== undefined) mem.marriageOrdinationDetails = incoming.marriageOrdinationDetails;
        if (incoming.deathInfo !== undefined) {
          mem.deathInfo = incoming.deathInfo;
          mem.dateOfDeath = incoming.deathInfo !== '—' && incoming.deathInfo !== '-' ? incoming.deathInfo : undefined;
        }
        if (authCheck.isStaff && incoming.isVerified !== undefined) mem.isVerified = incoming.isVerified;
        mem.updatedAt = new Date().toISOString();
      }
    });
  }

  db.save();

  const refreshedMembers = db.members.filter((m) => m.familyId === family.id);
  res.json({ ...family, members: refreshedMembers });
});

// Add a family member to the register ONE BY ONE (by Head of Family or Priest)
apiRouter.post('/family-register/:id/members', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const familyId = req.params.id;
  const authCheck = canManageFamilyRegister(req, familyId);

  if (!authCheck.allowed) {
    res.status(403).json({ error: 'Forbidden. Only Head of Family or the Parish Priest can add family members.' });
    return;
  }

  const family = db.families.find((f) => f.id === familyId);
  if (!family) {
    res.status(404).json({ error: 'Family record not found.' });
    return;
  }

  const {
    fullName,
    firstName,
    lastName,
    relationshipWithHead,
    relationshipToHead,
    gender,
    dateOfBirth,
    baptismDate,
    baptismParish,
    firstHolyCommunionDate,
    confirmationDate,
    marriageOrdinationDate,
    marriageOrdinationDetails,
    profession,
    deathInfo,
    phone,
    email,
  } = req.body;

  const resolvedFullName = (fullName || `${firstName || ''} ${lastName || ''}`).trim();
  if (!resolvedFullName) {
    res.status(400).json({ error: 'Family member name is required.' });
    return;
  }

  const parts = resolvedFullName.split(' ');
  const finalFirst = firstName || parts[0] || resolvedFullName;
  const finalLast = lastName || parts.slice(1).join(' ') || '';

  const memberId = `M-${100 + db.members.length + 1}`;
  const newMember: Member = {
    id: memberId,
    familyId: family.id,
    relationshipToHead: relationshipToHead || 'CHILD',
    relationshipWithHead: relationshipWithHead || 'Member',
    fullName: resolvedFullName,
    firstName: finalFirst,
    lastName: finalLast,
    gender: gender || 'MALE',
    dateOfBirth: dateOfBirth || '',
    phone: phone || family.contactPhone || '',
    email: email || '',
    address: family.address,
    houseName: family.houseName,
    occupation: profession || '',
    profession: profession || '',
    membershipStatus: 'ACTIVE',
    baptismDate: baptismDate || '',
    baptismParish: baptismParish || '',
    firstHolyCommunionDate: firstHolyCommunionDate || '',
    confirmationDate: confirmationDate || '',
    marriageOrdinationDate: marriageOrdinationDate || '',
    marriageOrdinationDetails: marriageOrdinationDetails || '',
    deathInfo: deathInfo || '',
    isVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.members.push(newMember);

  // If family was Approved, adding a new member requests re-review
  if (family.verificationStatus === 'Approved') {
    family.verificationStatus = 'Under Priest Review';
    family.registerStatus = 'Under Priest Review';
    family.verificationNotes = `New family member (${resolvedFullName}) enrolled. Awaiting priest verification.`;
  }
  family.updatedAt = new Date().toISOString();

  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'MEMBER_ADDED_TO_FAMILY_REGISTER',
    resource: 'FAMILY_REGISTER',
    resourceId: family.id,
    details: `Added new member ${resolvedFullName} (${newMember.id}) to family ${family.familyName}`,
  });

  const refreshedMembers = db.members.filter((m) => m.familyId === family.id);
  res.status(201).json({ ...family, members: refreshedMembers, newMember });
});

// Update single family member
apiRouter.put('/family-register/:id/members/:memberId', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { id: familyId, memberId } = req.params;
  const authCheck = canManageFamilyRegister(req, familyId);

  if (!authCheck.allowed) {
    res.status(403).json({ error: 'Forbidden. Not authorized to modify this family register.' });
    return;
  }

  const member = db.members.find((m) => m.id === memberId && m.familyId === familyId);
  if (!member) {
    res.status(404).json({ error: 'Member not found in family register.' });
    return;
  }

  const incoming = req.body;
  if (incoming.fullName) {
    member.fullName = incoming.fullName;
    const parts = incoming.fullName.split(' ');
    member.firstName = parts[0] || member.firstName;
    member.lastName = parts.slice(1).join(' ') || member.lastName;
  }
  if (incoming.relationshipWithHead) member.relationshipWithHead = incoming.relationshipWithHead;
  if (incoming.relationshipToHead) member.relationshipToHead = incoming.relationshipToHead;
  if (incoming.dateOfBirth) member.dateOfBirth = incoming.dateOfBirth;
  if (incoming.gender) member.gender = incoming.gender;
  if (incoming.phone !== undefined) member.phone = incoming.phone;
  if (incoming.email !== undefined) member.email = incoming.email;
  if (incoming.profession !== undefined) {
    member.profession = incoming.profession;
    member.occupation = incoming.profession;
  }
  if (incoming.baptismDate !== undefined) member.baptismDate = incoming.baptismDate;
  if (incoming.baptismParish !== undefined) member.baptismParish = incoming.baptismParish;
  if (incoming.firstHolyCommunionDate !== undefined) member.firstHolyCommunionDate = incoming.firstHolyCommunionDate;
  if (incoming.confirmationDate !== undefined) member.confirmationDate = incoming.confirmationDate;
  if (incoming.marriageOrdinationDate !== undefined) member.marriageOrdinationDate = incoming.marriageOrdinationDate;
  if (incoming.marriageOrdinationDetails !== undefined) member.marriageOrdinationDetails = incoming.marriageOrdinationDetails;
  if (incoming.deathInfo !== undefined) member.deathInfo = incoming.deathInfo;
  if (authCheck.isStaff && incoming.isVerified !== undefined) member.isVerified = incoming.isVerified;
  member.updatedAt = new Date().toISOString();

  db.save();

  const refreshedMembers = db.members.filter((m) => m.familyId === familyId);
  res.json({ member, members: refreshedMembers });
});

// Delete family member from register
apiRouter.delete('/family-register/:id/members/:memberId', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { id: familyId, memberId } = req.params;
  const authCheck = canManageFamilyRegister(req, familyId);

  if (!authCheck.allowed) {
    res.status(403).json({ error: 'Forbidden. Not authorized to delete this family member.' });
    return;
  }

  const idx = db.members.findIndex((m) => m.id === memberId && m.familyId === familyId);
  if (idx === -1) {
    res.status(404).json({ error: 'Member record not found.' });
    return;
  }

  const removed = db.members.splice(idx, 1)[0];
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'MEMBER_REMOVED_FROM_FAMILY_REGISTER',
    resource: 'FAMILY_REGISTER',
    resourceId: familyId,
    details: `Removed member ${removed.fullName || removed.firstName} from family register ${familyId}`,
  });

  const refreshedMembers = db.members.filter((m) => m.familyId === familyId);
  res.json({ message: 'Family member removed successfully.', members: refreshedMembers });
});

// ==========================================
// 8.2 PRIEST PORTAL ROUTES (PRIEST ONLY)
// ==========================================

// Requirement 13: Pending Member Requests
apiRouter.get('/priest/pending-registrations', authenticateToken, requireRole(['PRIEST']), (_req: AuthenticatedRequest, res: Response) => {
  const pending = db.users
    .filter((u) => u.status === 'PENDING')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const allRequests = db.users
    .filter((u) => u.role === 'MEMBER' || u.role === 'PARISH_MEMBER')
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      status: u.status,
      createdAt: u.createdAt,
      approvedAt: u.approvedAt,
      approvedBy: u.approvedBy,
      rejectionReason: u.rejectionReason,
    }));

  res.json({
    pending,
    all: allRequests,
    pendingCount: pending.length,
  });
});

// Requirement 2 & 3: Priest Approves Member Account
apiRouter.post('/priest/registrations/:id/approve', authenticateToken, requireRole(['PRIEST']), (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) {
    res.status(404).json({ error: 'Registration request not found.' });
    return;
  }

  user.status = 'APPROVED';
  user.approvedAt = new Date().toISOString();
  user.approvedBy = req.user!.name;

  // Create member record and family record if they do not exist
  let member = db.members.find((m) => m.userId === user.id || (user.memberId && m.id === user.memberId));
  let family: Family | undefined;

  if (!member) {
    const memberId = user.memberId || `M-${100 + db.members.length + 1}`;
    user.memberId = memberId;
    const familyId = `FAM-${100 + db.families.length + 1}`;

    family = {
      id: familyId,
      familyNumber: `${100 + db.families.length + 1}`,
      headMemberId: memberId,
      headOfFamilyName: user.name,
      familyName: `${user.name} Family`,
      familyUnitName: 'St. Thomas Unit 1',
      houseName: '',
      wardOrUnit: 'St. Thomas Unit 1',
      wardNumber: '1',
      contactPhone: user.phone || '',
      mobileNumber: user.phone || '',
      contactEmail: user.email,
      address: '',
      churchTradition: 'Syro Malabar',
      diocese: 'Diocese of Hosur',
      verificationStatus: 'Draft',
      registerStatus: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.families.push(family);

    const nameParts = user.name.split(' ');
    member = {
      id: memberId,
      userId: user.id,
      familyId: family.id,
      relationshipToHead: 'HEAD',
      relationshipWithHead: 'Family Head',
      fullName: user.name,
      firstName: nameParts[0] || user.name,
      lastName: nameParts.slice(1).join(' ') || '',
      dateOfBirth: '1980-01-01',
      gender: 'MALE',
      phone: user.phone || '',
      email: user.email,
      address: '',
      houseName: '',
      occupation: '',
      profession: '',
      membershipStatus: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.members.push(member);
  }

  // Create welcome notification for the member
  db.notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    recipientUserId: user.id,
    title: 'Registration Approved by Parish Priest',
    message: 'Welcome to the parish! Your account has been approved. You can now fill in your Parish Membership Register.',
    type: 'GENERAL',
    link: '/member/profile',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'MEMBER_REGISTRATION_APPROVED',
    resource: 'USER',
    resourceId: user.id,
    details: `Priest approved registration request for ${user.name} (${user.email}). Account status set to APPROVED.`,
  });

  res.json({
    message: `Account for ${user.name} approved successfully. Member can now log in.`,
    user: sanitizeUser(user),
    member,
    family,
  });
});

// Requirement 2 & 3: Priest Rejects Member Account
apiRouter.post('/priest/registrations/:id/reject', authenticateToken, requireRole(['PRIEST']), (req: AuthenticatedRequest, res: Response) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) {
    res.status(404).json({ error: 'Registration request not found.' });
    return;
  }

  const reason = req.body.reason || 'Declined by parish administration.';
  user.status = 'REJECTED';
  user.rejectionReason = reason;
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'MEMBER_REGISTRATION_REJECTED',
    resource: 'USER',
    resourceId: user.id,
    details: `Priest rejected registration request for ${user.name} (${user.email}). Reason: ${reason}`,
  });

  res.json({
    message: `Registration request for ${user.name} was rejected.`,
    user: sanitizeUser(user),
  });
});

// Requirement 14: Priest Member List
apiRouter.get('/priest/members', authenticateToken, requireRole(['PRIEST']), (req: AuthenticatedRequest, res: Response) => {
  const search = ((req.query.search as string) || '').trim().toLowerCase();

  // Find all approved users with role MEMBER or members with family
  const approvedMembersList = db.members.map((mem) => {
    const fam = mem.familyId ? db.families.find((f) => f.id === mem.familyId) : undefined;
    const user = mem.userId ? db.users.find((u) => u.id === mem.userId) : undefined;

    return {
      memberId: mem.id,
      memberName: mem.fullName || `${mem.firstName} ${mem.lastName}`.trim(),
      firstName: mem.firstName,
      lastName: mem.lastName,
      familyId: fam?.id || '',
      familyName: fam?.familyName || 'Unassigned Family',
      familyNumber: fam?.familyNumber || fam?.registerFolioNumber || '—',
      headOfFamilyName: fam?.headOfFamilyName || '—',
      mobile: mem.phone || fam?.contactPhone || '—',
      email: mem.email || fam?.contactEmail || '—',
      status: mem.membershipStatus === 'ACTIVE' ? 'APPROVED' : (user?.status || 'APPROVED'),
      userStatus: user?.status || 'APPROVED',
      relationshipWithHead: mem.relationshipWithHead || (mem.relationshipToHead === 'HEAD' ? 'Family Head' : mem.relationshipToHead),
      dateRegistered: user?.createdAt || mem.createdAt || '—',
      verificationStatus: fam?.verificationStatus || fam?.registerStatus || 'Draft',
    };
  });

  // Filter by search query across: Member name, Family name, Family number, Member ID, Mobile number
  let filtered = approvedMembersList;
  if (search) {
    filtered = approvedMembersList.filter(
      (m) =>
        m.memberName.toLowerCase().includes(search) ||
        m.familyName.toLowerCase().includes(search) ||
        m.familyNumber.toLowerCase().includes(search) ||
        m.memberId.toLowerCase().includes(search) ||
        m.mobile.toLowerCase().includes(search)
    );
  }

  res.json(filtered);
});

// Requirement 15 & 16: Priest Family View - COMPLETE FAMILY REGISTER
apiRouter.get('/priest/members/:memberId', authenticateToken, requireRole(['PRIEST']), (req: AuthenticatedRequest, res: Response) => {
  const targetId = req.params.memberId;
  const member = db.members.find((m) => m.id === targetId || m.userId === targetId);

  if (!member) {
    // Check if it's a family ID
    const fam = db.families.find((f) => f.id === targetId);
    if (fam) {
      const familyMembers = db.members.filter((m) => m.familyId === fam.id);
      res.json({
        family: fam,
        members: familyMembers,
        member: familyMembers.find((m) => m.id === fam.headMemberId) || familyMembers[0],
      });
      return;
    }
    res.status(404).json({ error: 'Member not found.' });
    return;
  }

  const family = member.familyId ? db.families.find((f) => f.id === member.familyId) : undefined;
  const familyMembers = family ? db.members.filter((m) => m.familyId === family.id) : [member];

  res.json({
    member,
    family,
    members: familyMembers,
  });
});

// Requirement 17: Priest Review of Family Register
apiRouter.post('/priest/families/:familyId/review', authenticateToken, requireRole(['PRIEST']), (req: AuthenticatedRequest, res: Response) => {
  const family = db.families.find((f) => f.id === req.params.familyId);
  if (!family) {
    res.status(404).json({ error: 'Family not found.' });
    return;
  }

  const { action, notes } = req.body; // 'APPROVE' or 'REQUEST_CHANGES'

  if (action === 'APPROVE') {
    family.verificationStatus = 'Approved';
    family.registerStatus = 'Approved';
    family.verifiedDate = new Date().toISOString().split('T')[0];
    family.verifiedBy = req.user!.name;
    family.verificationNotes = notes || 'Verified and approved by Parish Priest.';
    family.priestReviewNotes = '';

    // Mark all members as verified
    db.members.filter((m) => m.familyId === family.id).forEach((m) => {
      m.isVerified = true;
    });

    // Notify family head if available
    const headMember = db.members.find((m) => m.id === family.headMemberId);
    if (headMember?.userId) {
      db.notifications.unshift({
        id: `NOTIF-VER-${Date.now()}`,
        recipientUserId: headMember.userId,
        title: 'Parish Register Verified & Approved',
        message: `Your Parish Membership Register (${family.familyName}) has been officially verified and approved by the Parish Priest.`,
        type: 'GENERAL',
        link: '/member/profile',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'FAMILY_REGISTER_APPROVED_BY_PRIEST',
      resource: 'FAMILY_REGISTER',
      resourceId: family.id,
      details: `Priest approved Parish Register ${family.familyName}.`,
    });
  } else if (action === 'REQUEST_CHANGES') {
    family.verificationStatus = 'Changes Requested';
    family.registerStatus = 'Changes Requested';
    family.priestReviewNotes = notes || 'Please review and update requested family information.';

    const headMember = db.members.find((m) => m.id === family.headMemberId);
    if (headMember?.userId) {
      db.notifications.unshift({
        id: `NOTIF-CHG-${Date.now()}`,
        recipientUserId: headMember.userId,
        title: 'Changes Requested to Parish Register',
        message: `The Parish Priest has requested updates to your family register: "${family.priestReviewNotes}"`,
        type: 'GENERAL',
        link: '/member/profile',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'FAMILY_REGISTER_CHANGES_REQUESTED_BY_PRIEST',
      resource: 'FAMILY_REGISTER',
      resourceId: family.id,
      details: `Priest requested changes for ${family.familyName}: ${family.priestReviewNotes}`,
    });
  }

  db.save();

  const refreshedMembers = db.members.filter((m) => m.familyId === family.id);
  res.json({
    message: action === 'APPROVE' ? 'Parish Register approved successfully.' : 'Changes requested successfully.',
    family,
    members: refreshedMembers,
  });
});

// Priest Dashboard Summary & Stats
apiRouter.get('/priest/dashboard-summary', authenticateToken, requireRole(['PRIEST']), (_req: AuthenticatedRequest, res: Response) => {
  const pendingRegistrations = db.users.filter((u) => u.status === 'PENDING');
  const approvedMembers = db.users.filter((u) => u.status === 'APPROVED' && (u.role === 'MEMBER' || u.role === 'PARISH_MEMBER'));
  const pendingFamilyReviews = db.families.filter(
    (f) => f.verificationStatus === 'Under Priest Review' || f.verificationStatus === 'Submitted' || f.verificationStatus === 'PENDING_VERIFICATION'
  );
  const totalApprovedFamilies = db.families.filter(
    (f) => f.verificationStatus === 'Approved' || f.verificationStatus === 'VERIFIED'
  );

  res.json({
    pendingRegistrationsCount: pendingRegistrations.length,
    approvedMembersCount: approvedMembers.length || db.members.length,
    totalFamiliesCount: db.families.length,
    totalApprovedFamiliesCount: totalApprovedFamilies.length,
    pendingFamilyReviewsCount: pendingFamilyReviews.length,
    pendingRegistrations: pendingRegistrations.slice(0, 10).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      createdAt: u.createdAt,
      status: u.status,
    })),
    pendingFamilies: pendingFamilyReviews.slice(0, 10).map((f) => ({
      id: f.id,
      familyName: f.familyName,
      familyNumber: f.familyNumber,
      headOfFamilyName: f.headOfFamilyName,
      unitName: f.familyUnitName || f.wardOrUnit,
      contactPhone: f.contactPhone || f.mobileNumber,
      membersCount: db.members.filter((m) => m.familyId === f.id).length,
      status: f.verificationStatus || f.registerStatus,
      updatedAt: f.updatedAt,
    })),
  });
});

// ==========================================
// 9. ORGANIZATIONS
// ==========================================

apiRouter.get('/organizations', (_req, res) => {
  const enriched = db.organizations.map((org) => {
    const members = db.organization_members.filter((om) => om.organizationId === org.id);
    return {
      ...org,
      membersCount: members.length,
    };
  });
  res.json(enriched);
});

apiRouter.get('/organizations/:id', (req, res) => {
  const org = db.organizations.find((o) => o.id === req.params.id || o.slug === req.params.id);
  if (!org) {
    res.status(404).json({ error: 'Organization not found.' });
    return;
  }

  const members = db.organization_members.filter((om) => om.organizationId === org.id);
  res.json({ ...org, members });
});

apiRouter.put(
  '/organizations/:id',
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    const org = db.organizations.find((o) => o.id === req.params.id);
    if (!org) {
      res.status(404).json({ error: 'Organization not found.' });
      return;
    }

    const isStaff = isStaffOrAdmin(req.user?.role);
    const isAssignedCoordinator =
      req.user?.role === 'ORGANIZATION_COORDINATOR' && req.user.assignedOrganizationId === org.id;

    if (!isStaff && !isAssignedCoordinator) {
      res.status(403).json({ error: 'Forbidden. You are not authorized to manage this organization.' });
      return;
    }

    const { description, coordinatorName, coordinatorPhone, coordinatorEmail, meetingSchedule } = req.body;
    if (description) org.description = description;
    if (coordinatorName) org.coordinatorName = coordinatorName;
    if (coordinatorPhone) org.coordinatorPhone = coordinatorPhone;
    if (coordinatorEmail) org.coordinatorEmail = coordinatorEmail;
    if (meetingSchedule) org.meetingSchedule = meetingSchedule;

    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'ORGANIZATION_UPDATED',
      resource: 'ORGANIZATION',
      resourceId: org.id,
      details: `Updated details for ${org.name}`,
    });

    res.json(org);
  }
);

// ==========================================
// 10. SACRAMENTAL RECORDS (ADMIN / PRIEST ONLY)
// ==========================================

apiRouter.get(
  '/sacramental-records',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    const { type, search } = req.query;
    let list = [...db.sacramental_records];

    if (type && type !== 'ALL') {
      list = list.filter((r) => r.type === type);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(
        (r) =>
          r.recordNumber.toLowerCase().includes(q) ||
          r.personName.toLowerCase().includes(q) ||
          (r.parents && r.parents.toLowerCase().includes(q))
      );
    }

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'SACRAMENTAL_RECORDS_VIEWED',
      resource: 'SACRAMENTAL_RECORDS',
      details: `Inspected sacramental archives with query: ${search || 'all'}`,
    });

    res.json(list);
  }
);

apiRouter.post(
  '/sacramental-records',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    const { type, recordNumber, personName, dateOfEvent, dateOfBirth, dateOfDeath, parents, godparentsOrSponsor, groomName, brideName, witnesses, church, priest, notes } = req.body;
    if (!type || !recordNumber || !personName || !dateOfEvent) {
      res.status(400).json({ error: 'Type, record number, person name, and date are required.' });
      return;
    }

    const newRecord: SacramentalRecord = {
      id: `SAC-${Date.now()}`,
      type,
      recordNumber,
      personName,
      dateOfEvent,
      dateOfBirth,
      dateOfDeath,
      parents,
      godparentsOrSponsor,
      groomName,
      brideName,
      witnesses,
      church: church || 'St. Mariam Thresia Church',
      priest: priest || 'Fr. Joshy N George',
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.sacramental_records.unshift(newRecord);
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'SACRAMENTAL_RECORD_CREATED',
      resource: 'SACRAMENTAL_RECORD',
      resourceId: newRecord.id,
      details: `Entered ${type} record #${recordNumber} for ${personName}`,
    });

    res.status(201).json(newRecord);
  }
);

// ==========================================
// 11. PRAYER REQUESTS
// ==========================================

apiRouter.get('/prayer-requests', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const isStaff = isStaffOrAdmin(req.user?.role);
  if (!isStaff) {
    // Normal members see ONLY their own prayer requests
    const own = db.prayer_requests.filter((p) => p.memberId === req.user?.memberId);
    res.json(own);
  } else {
    // Priest & Admins see all prayer requests
    res.json(db.prayer_requests);
  }
});

apiRouter.post('/prayer-requests', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { requestText, category, isPrivate } = req.body;
  if (!requestText) {
    res.status(400).json({ error: 'Prayer request intention cannot be empty.' });
    return;
  }

  const newPR: PrayerRequest = {
    id: `PR-${Date.now()}`,
    memberId: req.user!.memberId || req.user!.id,
    memberName: req.user!.name,
    memberEmail: req.user!.email,
    requestText,
    category: category || 'SPECIAL_INTENTION',
    isPrivate: Boolean(isPrivate),
    status: 'NEW',
    createdAt: new Date().toISOString(),
  };

  db.prayer_requests.unshift(newPR);
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'PRAYER_REQUEST_SUBMITTED',
    resource: 'PRAYER_REQUEST',
    resourceId: newPR.id,
    details: `Prayer intention submitted under category ${newPR.category}`,
  });

  res.status(201).json(newPR);
});

apiRouter.patch(
  '/prayer-requests/:id/status',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    const pr = db.prayer_requests.find((p) => p.id === req.params.id);
    if (!pr) {
      res.status(404).json({ error: 'Prayer request not found.' });
      return;
    }

    const { status, priestNotes } = req.body;
    if (status) pr.status = status;
    if (priestNotes !== undefined) pr.priestNotes = priestNotes;
    db.save();

    res.json(pr);
  }
);

// ==========================================
// 12. PRIEST APPOINTMENTS
// ==========================================

apiRouter.get('/appointments', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const isStaff = isStaffOrAdmin(req.user?.role);
  if (!isStaff) {
    // Normal members see ONLY their own appointments
    const own = db.appointment_requests.filter((a) => a.memberId === req.user?.memberId);
    res.json(own);
  } else {
    res.json(db.appointment_requests);
  }
});

apiRouter.post('/appointments', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { preferredDate, preferredTime, reason, message, memberPhone } = req.body;
  if (!preferredDate || !preferredTime || !reason) {
    res.status(400).json({ error: 'Preferred date, time, and pastoral reason are required.' });
    return;
  }

  const newApt: AppointmentRequest = {
    id: `APT-${Date.now()}`,
    memberId: req.user!.memberId || req.user!.id,
    memberName: req.user!.name,
    memberPhone: memberPhone || req.user!.phone || '+91 88071 88445',
    memberEmail: req.user!.email,
    preferredDate,
    preferredTime,
    reason,
    message: message || '',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.appointment_requests.unshift(newApt);
  db.save();

  db.addAuditLog({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'APPOINTMENT_REQUESTED',
    resource: 'APPOINTMENT',
    resourceId: newApt.id,
    details: `Appointment requested for ${preferredDate} (${reason})`,
  });

  res.status(201).json(newApt);
});

apiRouter.patch(
  '/appointments/:id/status',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    const apt = db.appointment_requests.find((a) => a.id === req.params.id);
    if (!apt) {
      res.status(404).json({ error: 'Appointment not found.' });
      return;
    }

    const { status, priestResponse } = req.body;
    if (status) apt.status = status;
    if (priestResponse !== undefined) apt.priestResponse = priestResponse;
    apt.updatedAt = new Date().toISOString();

    // Trigger notification to the requesting member
    const targetUser = db.users.find((u) => u.memberId === apt.memberId || u.id === apt.memberId);
    if (targetUser) {
      db.notifications.unshift({
        id: `NOTIF-${Date.now()}`,
        recipientUserId: targetUser.id,
        title: `Appointment Status: ${status}`,
        message: priestResponse || `Your appointment on ${apt.preferredDate} has been updated to ${status}.`,
        type: 'APPOINTMENT',
        link: '/member/appointments',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'APPOINTMENT_STATUS_UPDATED',
      resource: 'APPOINTMENT',
      resourceId: apt.id,
      details: `Appointment status updated to ${status}`,
    });

    res.json(apt);
  }
);

// ==========================================
// 13. NOTIFICATIONS
// ==========================================

apiRouter.get('/notifications', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const list = db.notifications.filter((n) => !n.recipientUserId || n.recipientUserId === userId);
  res.json(list);
});

apiRouter.patch('/notifications/:id/read', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const notif = db.notifications.find((n) => n.id === req.params.id);
  if (notif) {
    notif.isRead = true;
    db.save();
  }
  res.json({ success: true });
});

apiRouter.post('/notifications/mark-all-read', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  db.notifications.forEach((n) => {
    if (!n.recipientUserId || n.recipientUserId === userId) {
      n.isRead = true;
    }
  });
  db.save();
  res.json({ success: true });
});

// ==========================================
// 14. CONTACT MESSAGES
// ==========================================

apiRouter.post('/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required.' });
    return;
  }

  const newContact: ContactMessage = {
    id: `CNT-${Date.now()}`,
    name,
    email,
    phone: phone || '',
    subject: subject || 'General Parish Inquiry',
    message,
    status: 'NEW',
    createdAt: new Date().toISOString(),
  };

  db.contact_messages.unshift(newContact);
  db.save();

  res.status(201).json({ message: 'Thank you! Your message has been received by the parish office.' });
});

apiRouter.get(
  '/contact',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    res.json(db.contact_messages);
  }
);

apiRouter.patch(
  '/contact/:id/status',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    const item = db.contact_messages.find((c) => c.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Message not found.' });
      return;
    }
    item.status = req.body.status || 'READ';
    db.save();
    res.json(item);
  }
);

// ==========================================
// 15. USER MANAGEMENT (SUPER ADMIN ONLY)
// ==========================================

apiRouter.get(
  '/users',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  (req: AuthenticatedRequest, res: Response) => {
    const list = db.users.map(sanitizeUser);
    res.json(list);
  }
);

apiRouter.post(
  '/users',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  (req: AuthenticatedRequest, res: Response) => {
    const { email, name, role, password, memberId, assignedOrganizationId } = req.body;
    if (!email || !name || !role || !password) {
      res.status(400).json({ error: 'Email, name, role, and password are required.' });
      return;
    }

    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      res.status(400).json({ error: 'User with this email already exists.' });
      return;
    }

    const newUser = {
      id: `USR-${Date.now()}`,
      email,
      name,
      role: role as UserRole,
      memberId,
      assignedOrganizationId,
      status: 'ACTIVE' as const,
      passwordHash: bcrypt.hashSync(password, 10),
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'USER_CREATED',
      resource: 'USER',
      resourceId: newUser.id,
      details: `Created user ${name} with role ${role}`,
    });

    res.status(201).json(sanitizeUser(newUser));
  }
);

apiRouter.patch(
  '/users/:id/role',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  (req: AuthenticatedRequest, res: Response) => {
    const target = db.users.find((u) => u.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const { role } = req.body;
    target.role = role;
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'USER_ROLE_CHANGED',
      resource: 'USER',
      resourceId: target.id,
      details: `Changed role of user ${target.name} to ${role}`,
    });

    res.json(sanitizeUser(target));
  }
);

apiRouter.patch(
  '/users/:id/status',
  authenticateToken,
  requireRole(['SUPER_ADMIN']),
  (req: AuthenticatedRequest, res: Response) => {
    const target = db.users.find((u) => u.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    target.status = req.body.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
    db.save();

    db.addAuditLog({
      userId: req.user!.id,
      userName: req.user!.name,
      userRole: req.user!.role,
      action: 'USER_STATUS_CHANGED',
      resource: 'USER',
      resourceId: target.id,
      details: `Updated status of user ${target.name} to ${target.status}`,
    });

    res.json(sanitizeUser(target));
  }
);

// ==========================================
// 16. AUDIT / ACTIVITY LOGS
// ==========================================

apiRouter.get(
  '/audit-logs',
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'PARISH_ADMIN', 'PRIEST']),
  (req: AuthenticatedRequest, res: Response) => {
    const { action, resource, search } = req.query;
    let list = [...db.audit_logs];

    if (action && action !== 'ALL') {
      list = list.filter((l) => l.action === action);
    }
    if (resource && resource !== 'ALL') {
      list = list.filter((l) => l.resource === resource);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(
        (l) =>
          l.userName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q)
      );
    }

    res.json(list.slice(0, 100));
  }
);
