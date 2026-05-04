import express from 'express';
import { body } from 'express-validator';
import {
  changePassword,
  getMe,
  login,
  logout,
  refresh,
  signup,
  updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
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
const passwordRule = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/\d/)
  .withMessage('Password must include a number');

router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }).withMessage('Name is too long'),
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    passwordRule,
    body('jobRole').optional().isIn(jobRoles).withMessage('Invalid team role'),
    body('avatar').optional({ checkFalsy: true }).isURL().withMessage('Avatar must be a valid URL')
  ],
  validate,
  signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  login
);

router.post('/logout', logout);

router.post(
  '/refresh',
  [body('refreshToken').optional({ checkFalsy: true }).isString().withMessage('Refresh token must be valid')],
  validate,
  refresh
);

router.get('/me', protect, getMe);

router.patch(
  '/me',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 80 }).withMessage('Name is too long'),
    body('email').optional().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('avatar').optional({ checkFalsy: true }).isURL().withMessage('Avatar must be a valid URL')
  ],
  validate,
  updateProfile
);

router.patch(
  '/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/\d/)
      .withMessage('Password must include a number')
  ],
  validate,
  changePassword
);

export default router;
