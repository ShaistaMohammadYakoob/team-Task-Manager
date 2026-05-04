import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [80, 'Project title cannot exceed 80 characters']
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [600, 'Project description cannot exceed 600 characters']
    },
    color: {
      type: String,
      default: '#4f46e5',
      match: [/^#([0-9A-F]{3}){1,2}$/i, 'Color must be a valid hex value']
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [memberSchema]
  },
  { timestamps: true }
);

projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });

export default mongoose.model('Project', projectSchema);
