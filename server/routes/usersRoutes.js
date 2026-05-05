import express from 'express';
import { body, param } from 'express-validator';
import { deleteUser, getUserById, listUsers, updateUser, updateUserApproval } from '../controllers/usersController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();
const jobRoles = [
  'frontend-developer',
  'backend-developer',
  'full-stack-developer',
  'ui-ux-designer',
  'qa-tester',
  'task-manager',
  'project-manager',
  'devops-engineer',
  'business-analyst',
  'product-owner',
  'other'
];

router.use(protect, authorize('admin'));

router.get('/', listUsers);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid user ID')],
  validate,
  getUserById
);

router.patch(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 80 }).withMessage('Name is too long'),
    body('email').optional().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('employeeId')
      .optional()
      .trim()
      .isLength({ min: 2, max: 40 })
      .withMessage('Employee ID must be 2 to 40 characters')
      .matches(/^[A-Za-z0-9_-]+$/)
      .withMessage('Employee ID can only include letters, numbers, hyphen, and underscore'),
    body('role').optional().isIn(['admin', 'member']).withMessage('Role must be admin or member'),
    body('jobRole').optional().isIn(jobRoles).withMessage('Invalid team role'),
    body('avatar').optional({ checkFalsy: true }).isURL().withMessage('Avatar must be a valid URL')
  ],
  validate,
  updateUser
);

router.patch(
  '/:id/approval',
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('approvalStatus').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid approval status'),
    body('rejectionReason').optional({ checkFalsy: true }).trim().isLength({ max: 300 }).withMessage('Rejection reason is too long')
  ],
  validate,
  updateUserApproval
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid user ID')],
  validate,
  deleteUser
);

export default router;
