import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const canViewProject = (project, user) => {
  if (user.role === 'admin') return true;
  if (project.owner.toString() === user._id.toString()) return true;
  return project.members.some((member) => member.user.toString() === user._id.toString());
};

const ensureProjectAccess = async (projectId, user) => {
  const project = await Project.findById(projectId);

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  if (!canViewProject(project, user)) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }

  return project;
};

const taskPopulate = (query) =>
  query
    .populate('project', 'title color owner members')
    .populate('assignedTo', 'name email employeeId avatar role jobRole approvalStatus')
    .populate('createdBy', 'name email employeeId avatar role jobRole approvalStatus')
    .populate('completedBy', 'name email employeeId avatar role jobRole approvalStatus');

const canAccessTask = (task, user) => {
  if (user.role === 'admin') return true;
  const project = task.project;
  if (project.owner.toString() === user._id.toString()) return true;
  return project.members.some((member) => member.user.toString() === user._id.toString());
};

/**
 * List tasks with optional project, status, assignee, and priority filters.
 */
export const listTasks = asyncHandler(async (req, res) => {
  const { projectId, status, assignee, priority } = req.query;
  const filters = {};

  if (projectId) {
    await ensureProjectAccess(projectId, req.user);
    filters.project = projectId;
  } else if (req.user.role !== 'admin') {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
    }).select('_id');
    filters.project = { $in: projects.map((project) => project._id) };
  }

  if (status) filters.status = status;
  if (assignee) filters.assignedTo = assignee === 'me' ? req.user._id : assignee;
  if (priority) filters.priority = priority;

  const tasks = await taskPopulate(Task.find(filters).sort({ dueDate: 1, updatedAt: -1 }));
  res.status(200).json({ tasks });
});

/**
 * Create a task in a project visible to the authenticated user.
 */
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, project, assignedTo, status, priority, dueDate, tags, completionNote } = req.body;
  const taskStatus = status || 'todo';

  await ensureProjectAccess(project, req.user);

  const task = await Task.create({
    title,
    description,
    project,
    assignedTo: assignedTo || null,
    createdBy: req.user._id,
    status: taskStatus,
    priority: priority || 'medium',
    dueDate: dueDate || null,
    tags: tags || [],
    completedBy: taskStatus === 'done' ? req.user._id : null,
    completedAt: taskStatus === 'done' ? new Date() : null,
    completionNote: taskStatus === 'done' ? completionNote || '' : ''
  });

  const populated = await taskPopulate(Task.findById(task._id));
  res.status(201).json({ task: populated });
});

/**
 * Get one task if the authenticated user can access its project.
 */
export const getTaskById = asyncHandler(async (req, res) => {
  const task = await taskPopulate(Task.findById(req.params.id));

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (!canAccessTask(task, req.user)) {
    res.status(403);
    throw new Error('Forbidden');
  }

  res.status(200).json({ task });
});

/**
 * Update a task in a project visible to the authenticated user.
 */
export const updateTask = asyncHandler(async (req, res) => {
  const task = await taskPopulate(Task.findById(req.params.id));

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (!canAccessTask(task, req.user)) {
    res.status(403);
    throw new Error('Forbidden');
  }

  const previousStatus = task.status;
  const allowedFields = ['title', 'description', 'assignedTo', 'status', 'priority', 'dueDate', 'tags', 'completionNote'];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      task[field] = field === 'assignedTo' && !req.body[field] ? null : req.body[field];
    }
  }

  if (task.status === 'done') {
    if (previousStatus !== 'done' || !task.completedAt || !task.completedBy) {
      task.completedAt = new Date();
      task.completedBy = req.user._id;
    }
  } else {
    task.completedAt = null;
    task.completedBy = null;
    task.completionNote = '';
  }

  await task.save();
  const populated = await taskPopulate(Task.findById(task._id));
  res.status(200).json({ task: populated });
});

/**
 * Delete a task if the authenticated user is admin or task creator.
 */
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await taskPopulate(Task.findById(req.params.id));

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  if (!canAccessTask(task, req.user)) {
    res.status(403);
    throw new Error('Forbidden');
  }

  const isCreator = task.createdBy._id.toString() === req.user._id.toString();
  if (req.user.role !== 'admin' && !isCreator) {
    res.status(403);
    throw new Error('Forbidden');
  }

  await task.deleteOne();
  res.status(200).json({ message: 'Task deleted successfully' });
});
