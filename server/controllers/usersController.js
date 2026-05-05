import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

/**
 * List all users for admins.
 */
export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ approvalStatus: 1, createdAt: -1 });
  res.status(200).json({ users });
});

/**
 * Get a single user by ID for admins.
 */
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({ user });
});

/**
 * Update a user's access role, job role, or profile fields for admins.
 */
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const allowedFields = ['name', 'email', 'employeeId', 'role', 'jobRole', 'avatar'];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  }

  if (req.body.role === 'admin') {
    user.approvalStatus = 'approved';
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    user.rejectionReason = '';
  }

  await user.save();
  res.status(200).json({ user });
});

/**
 * Approve, reject, or move a user back to pending after admin review.
 */
export const updateUserApproval = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user._id.toString() === req.user._id.toString() && req.body.approvalStatus !== 'approved') {
    res.status(400);
    throw new Error('You cannot remove your own approval');
  }

  if (user.role === 'admin' && req.body.approvalStatus !== 'approved') {
    res.status(400);
    throw new Error('Admin accounts must stay approved');
  }

  user.approvalStatus = req.body.approvalStatus;

  if (req.body.approvalStatus === 'approved') {
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    user.rejectionReason = '';
  } else {
    user.approvedBy = null;
    user.approvedAt = null;
    user.rejectionReason =
      req.body.approvalStatus === 'rejected'
        ? req.body.rejectionReason?.trim() || 'Not verified as a company/team member'
        : '';
  }

  await user.save();
  res.status(200).json({ user });
});

/**
 * Delete a user and remove their project/task associations.
 */
export const deleteUser = asyncHandler(async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await Project.updateMany({}, { $pull: { members: { user: user._id } } });
  await Task.updateMany({ assignedTo: user._id }, { $set: { assignedTo: null } });
  await user.deleteOne();

  res.status(200).json({ message: 'User deleted successfully' });
});
