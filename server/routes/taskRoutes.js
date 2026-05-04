import express from 'express';
import { body, param, query } from 'express-validator';
import { createTask, deleteTask, getTaskById, listTasks, updateTask } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();
const statuses = ['todo', 'in-progress', 'done'];
const priorities = ['low', 'medium', 'high'];

const futureDateRule = body('dueDate')
  .optional({ nullable: true, checkFalsy: true })
  .isISO8601()
  .withMessage('Due date must be a valid date')
  .custom((value) => {
    const dueDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDate < today) throw new Error('Due date cannot be in the past');
    return true;
  });

router.use(protect);

router.get(
  '/',
  [
    query('projectId').optional().isMongoId().withMessage('Invalid project ID'),
    query('status').optional().isIn(statuses).withMessage('Invalid task status'),
    query('priority').optional().isIn(priorities).withMessage('Invalid priority'),
    query('assignee').optional().custom((value) => value === 'me' || /^[a-f\d]{24}$/i.test(value)).withMessage('Invalid assignee')
  ],
  validate,
  listTasks
);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 120 }).withMessage('Task title cannot exceed 120 characters'),
    body('description').optional({ checkFalsy: true }).trim().isLength({ max: 1200 }).withMessage('Task description cannot exceed 1200 characters'),
    body('project').isMongoId().withMessage('Project is required'),
    body('assignedTo').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Invalid assignee'),
    body('status').optional().isIn(statuses).withMessage('Invalid task status'),
    body('priority').optional().isIn(priorities).withMessage('Invalid priority'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('tags.*').optional().trim().isLength({ max: 32 }).withMessage('Tags must be 32 characters or less'),
    futureDateRule
  ],
  validate,
  createTask
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid task ID')],
  validate,
  getTaskById
);

router.patch(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid task ID'),
    body('title').optional().trim().notEmpty().withMessage('Task title is required').isLength({ max: 120 }).withMessage('Task title cannot exceed 120 characters'),
    body('description').optional({ checkFalsy: true }).trim().isLength({ max: 1200 }).withMessage('Task description cannot exceed 1200 characters'),
    body('assignedTo').optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage('Invalid assignee'),
    body('status').optional().isIn(statuses).withMessage('Invalid task status'),
    body('priority').optional().isIn(priorities).withMessage('Invalid priority'),
    body('dueDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Due date must be a valid date'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('tags.*').optional().trim().isLength({ max: 32 }).withMessage('Tags must be 32 characters or less')
  ],
  validate,
  updateTask
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid task ID')],
  validate,
  deleteTask
);

export default router;
