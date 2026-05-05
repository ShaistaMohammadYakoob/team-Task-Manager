import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const isApprovedForAccess = (user) =>
  user.role === 'admin' || !user.approvalStatus || user.approvalStatus === 'approved';

const createAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, {
    expiresIn: env.accessTokenTtl
  });

const createRefreshToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenTtl
  });

const issueTokens = async (user) => {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const sendAuthResponse = async (res, user, statusCode = 200) => {
  const tokens = await issueTokens(user);
  res.status(statusCode).json({
    user,
    ...tokens
  });
};

/**
 * Register a new user and return access and refresh tokens.
 */
export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, avatar, jobRole, employeeId } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(400);
    throw new Error('Email already exists');
  }

  const existingEmployee = await User.findOne({ employeeId: employeeId?.toUpperCase() });

  if (existingEmployee) {
    res.status(400);
    throw new Error('Employee ID already exists');
  }

  const userCount = await User.countDocuments();
  const isFirstUser = userCount === 0;
  const user = await User.create({
    name,
    email,
    password,
    employeeId,
    avatar: avatar || '',
    role: isFirstUser ? 'admin' : 'member',
    jobRole: jobRole || (isFirstUser ? 'task-manager' : 'frontend-developer'),
    approvalStatus: isFirstUser ? 'approved' : 'pending',
    approvedAt: isFirstUser ? new Date() : null
  });

  if (!isFirstUser) {
    res.status(201).json({
      user,
      requiresApproval: true,
      message: 'Account created. An admin must approve this employee before login.'
    });
    return;
  }

  await sendAuthResponse(res, user, 201);
});

/**
 * Authenticate a user and return access and refresh tokens.
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password +refreshTokenHash');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!isApprovedForAccess(user)) {
    res.status(403);
    throw new Error(
      user.approvalStatus === 'rejected'
        ? user.rejectionReason || 'Your account was not approved by the admin'
        : 'Your account is pending admin approval'
    );
  }

  await sendAuthResponse(res, user);
});

/**
 * Invalidate the current refresh token.
 */
export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
      const user = await User.findById(decoded.id).select('+refreshTokenHash');

      if (user && user.refreshTokenHash === hashToken(refreshToken)) {
        user.refreshTokenHash = '';
        await user.save({ validateBeforeSave: false });
      }
    } catch {
      // Logout stays idempotent even when the token is already invalid.
    }
  }

  res.status(200).json({ message: 'Logged out successfully' });
});

/**
 * Return a new access token and refresh token pair.
 */
export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401);
    throw new Error('Refresh token missing');
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
  } catch {
    res.status(401);
    throw new Error('Refresh token invalid');
  }

  const user = await User.findById(decoded.id).select('+refreshTokenHash');

  if (!user || user.refreshTokenHash !== hashToken(refreshToken)) {
    res.status(401);
    throw new Error('Refresh token invalid');
  }

  await sendAuthResponse(res, user);
});

/**
 * Get the authenticated user's profile.
 */
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ user: req.user });
});

/**
 * Update the authenticated user's profile fields.
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'email', 'avatar'];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  }

  await req.user.save();
  res.status(200).json({ user: req.user });
});

/**
 * Change the authenticated user's password.
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password +refreshTokenHash');

  if (!user || !(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  user.refreshTokenHash = '';
  await user.save();

  res.status(200).json({ message: 'Password changed successfully' });
});
