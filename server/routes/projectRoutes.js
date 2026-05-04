import express from 'express';
import { body, param } from 'express-validator';
import {
  addMember,
  createProject,
  deleteProject,
  getProjectById,
  listProjects,
  removeMember,
  updateProject
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();
const hexRule = /^#([0-9A-F]{3}){1,2}$/i;

router.use(protect);

router.get('/', listProjects);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Project title is required').isLength({ max: 80 }).withMessage('Project title cannot exceed 80 characters'),
    body('description').optional({ checkFalsy: true }).trim().isLength({ max: 600 }).withMessage('Project description cannot exceed 600 characters'),
    body('color').optional().matches(hexRule).withMessage('Color must be a valid hex value')
  ],
  validate,
  createProject
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid project ID')],
  validate,
  getProjectById
);

router.patch(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid project ID'),
    body('title').optional().trim().notEmpty().withMessage('Project title is required').isLength({ max: 80 }).withMessage('Project title cannot exceed 80 characters'),
    body('description').optional({ checkFalsy: true }).trim().isLength({ max: 600 }).withMessage('Project description cannot exceed 600 characters'),
    body('color').optional().matches(hexRule).withMessage('Color must be a valid hex value')
  ],
  validate,
  updateProject
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid project ID')],
  validate,
  deleteProject
);

router.post(
  '/:id/members',
  [
    param('id').isMongoId().withMessage('Invalid project ID'),
    body('userId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid user ID'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('role').optional().isIn(['admin', 'member']).withMessage('Role must be admin or member')
  ],
  validate,
  addMember
);

router.delete(
  '/:id/members/:userId',
  [
    param('id').isMongoId().withMessage('Invalid project ID'),
    param('userId').isMongoId().withMessage('Invalid user ID')
  ],
  validate,
  removeMember
);

export default router;
