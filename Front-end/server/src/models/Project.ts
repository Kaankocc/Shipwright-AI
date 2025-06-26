import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  githubRepositoryUrl?: string;
  owner: mongoose.Types.ObjectId; // Reference to User
  collaborators: mongoose.Types.ObjectId[]; // Array of User references
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  githubRepositoryUrl: {
    type: String,
    required: false,
    trim: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ collaborators: 1 });

// Update the updatedAt timestamp before saving
ProjectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Project = mongoose.model<IProject>('Project', ProjectSchema); 