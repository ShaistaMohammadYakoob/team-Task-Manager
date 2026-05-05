import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { asyncHandler } from './asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, token missing');
  }

  let decoded;

  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch {
    res.status(401);
    throw new Error('Not authorized, token invalid');
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    res.status(401);
    throw new Error('Not authorized, user not found');
  }

  const approvedForAccess = user.role === 'admin' || !user.approvalStatus || user.approvalStatus === 'approved';

  if (!approvedForAccess) {
    res.status(403);
    throw new Error(
      user.approvalStatus === 'rejected'
        ? user.rejectionReason || 'Your account was not approved by the admin'
        : 'Your account is pending admin approval'
    );
  }

  req.user = user;
  next();
});
