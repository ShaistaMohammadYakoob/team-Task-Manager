import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    jobRole: {
      type: String,
      enum: [
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
      ],
      default: 'frontend-developer'
    },
    avatar: {
      type: String,
      default: ''
    },
    refreshTokenHash: {
      type: String,
      select: false,
      default: ''
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshTokenHash;
  return user;
};

export default mongoose.model('User', userSchema);
