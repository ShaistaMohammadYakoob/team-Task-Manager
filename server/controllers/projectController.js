import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const populateProject = (query) =>
  query
    .populate('owner', 'name email avatar role')
    .populate('members.user', 'name email avatar role');

const memberFilterFor = (user) => {
  if (user.role === 'admin') return {};
  return {
    $or: [{ owner: user._id }, { 'members.user': user._id }]
  };
};

const canViewProject = (project, user) => {
  if (user.role === 'admin') return true;
  if (project.owner.toString() === user._id.toString()) return true;
  return project.members.some((member) => member.user.toString() === user._id.toString());
};

const canManageProject = (project, user) => {
  if (user.role === 'admin') return true;
  if (project.owner.toString() === user._id.toString()) return true;
  return project.members.some(
    (member) => member.user.toString() === user._id.toString() && member.role === 'admin'
  );
};

const ensureProjectAccess = async (projectId, user, manage = false) => {
  const project = await Project.findById(projectId);

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const allowed = manage ? canManageProject(project, user) : canViewProject(project, user);

  if (!allowed) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }

  return project;
};

const withTaskCounts = async (projects) => {
  const ids = projects.map((project) => project._id);
  const counts = await Task.aggregate([
    { $match: { project: { $in: ids } } },
    { $group: { _id: '$project', taskCount: { $sum: 1 } } }
  ]);
  const countMap = new Map(counts.map((item) => [item._id.toString(), item.taskCount]));

  return projects.map((project) => ({
    ...project,
    taskCount: countMap.get(project._id.toString()) || 0
  }));
};

/**
 * List projects visible to the authenticated user.
 */
export const listProjects = asyncHandler(async (req, res) => {
  const projects = await populateProject(Project.find(memberFilterFor(req.user)).sort({ updatedAt: -1 })).lean();
  res.status(200).json({ projects: await withTaskCounts(projects) });
});

/**
 * Create a new project owned by the authenticated user.
 */
export const createProject = asyncHandler(async (req, res) => {
  const { title, description, color } = req.body;
  const project = await Project.create({
    title,
    description,
    color,
    owner: req.user._id,
    members: [{ user: req.user._id, role: 'admin' }]
  });

  const populated = await populateProject(Project.findById(project._id));
  res.status(201).json({ project: populated });
});

/**
 * Get a project with members and task counts.
 */
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await ensureProjectAccess(req.params.id, req.user);
  const populated = await populateProject(Project.findById(project._id)).lean();
  const taskCount = await Task.countDocuments({ project: project._id });
  res.status(200).json({ project: { ...populated, taskCount } });
});

/**
 * Update a project for project admins, owners, or global admins.
 */
export const updateProject = asyncHandler(async (req, res) => {
  const project = await ensureProjectAccess(req.params.id, req.user, true);
  const allowedFields = ['title', 'description', 'color'];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) project[field] = req.body[field];
  }

  await project.save();
  const populated = await populateProject(Project.findById(project._id));
  res.status(200).json({ project: populated });
});

/**
 * Delete a project and its tasks for owners or global admins.
 */
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isOwner = project.owner.toString() === req.user._id.toString();

  if (req.user.role !== 'admin' && !isOwner) {
    res.status(403);
    throw new Error('Forbidden');
  }

  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  res.status(200).json({ message: 'Project deleted successfully' });
});

/**
 * Add a member to a project for project admins, owners, or global admins.
 */
export const addMember = asyncHandler(async (req, res) => {
  const project = await ensureProjectAccess(req.params.id, req.user, true);
  const { userId, email, role = 'member' } = req.body;
  const user = userId
    ? await User.findById(userId)
    : await User.findOne({ email: email?.toLowerCase() });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const existingMember = project.members.find((member) => member.user.toString() === user._id.toString());

  if (existingMember) {
    existingMember.role = role;
  } else {
    project.members.push({ user: user._id, role });
  }

  await project.save();
  const populated = await populateProject(Project.findById(project._id));
  res.status(200).json({ project: populated });
});

/**
 * Remove a member from a project for project admins, owners, or global admins.
 */
export const removeMember = asyncHandler(async (req, res) => {
  const project = await ensureProjectAccess(req.params.id, req.user, true);

  if (project.owner.toString() === req.params.userId) {
    res.status(400);
    throw new Error('Project owner cannot be removed');
  }

  project.members = project.members.filter((member) => member.user.toString() !== req.params.userId);
  await project.save();

  await Task.updateMany(
    { project: project._id, assignedTo: new mongoose.Types.ObjectId(req.params.userId) },
    { $set: { assignedTo: null } }
  );

  const populated = await populateProject(Project.findById(project._id));
  res.status(200).json({ project: populated });
});
