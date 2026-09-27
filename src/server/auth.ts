import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { User, UserRole, SafeUser } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'st-mariam-thresia-parish-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: SafeUser;
}

export function generateToken(user: SafeUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      memberId: user.memberId,
      assignedOrganizationId: user.assignedOrganizationId,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function sanitizeUser(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user;
  return safe;
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required. No token provided.' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: UserRole;
      memberId?: string;
      assignedOrganizationId?: string;
    };

    const user = db.users.find((u) => u.id === payload.id);
    if (!user || (user.status !== 'ACTIVE' && user.status !== 'APPROVED')) {
      res.status(401).json({ error: 'User session invalid or account not active/approved.' });
      return;
    }

    req.user = sanitizeUser(user);
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}

export function optionalAuthenticateToken(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = db.users.find((u) => u.id === payload.id);
      if (user && (user.status === 'ACTIVE' || user.status === 'APPROVED')) {
        req.user = sanitizeUser(user);
      }
    } catch {
      // Ignored for optional auth
    }
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    // Treat PRIEST as having access when SUPER_ADMIN or PARISH_ADMIN is allowed, and vice versa
    const isPriestRole = req.user.role === 'PRIEST' || req.user.role === 'SUPER_ADMIN' || req.user.role === 'PARISH_ADMIN';
    const allowsPriest = allowedRoles.includes('PRIEST') || allowedRoles.includes('SUPER_ADMIN') || allowedRoles.includes('PARISH_ADMIN');
    const isMemberRole = req.user.role === 'MEMBER' || req.user.role === 'PARISH_MEMBER';
    const allowsMember = allowedRoles.includes('MEMBER') || allowedRoles.includes('PARISH_MEMBER');

    if (
      allowedRoles.includes(req.user.role) ||
      (isPriestRole && allowsPriest) ||
      (isMemberRole && allowsMember)
    ) {
      next();
      return;
    }

    res.status(403).json({
      error: `Forbidden. Role '${req.user.role}' is not authorized for this resource.`,
    });
  };
}

export function isStaffOrAdmin(role?: UserRole): boolean {
  return role === 'PRIEST' || role === 'SUPER_ADMIN' || role === 'PARISH_ADMIN';
}

export function isPriest(role?: UserRole): boolean {
  return role === 'PRIEST' || role === 'SUPER_ADMIN' || role === 'PARISH_ADMIN';
}
