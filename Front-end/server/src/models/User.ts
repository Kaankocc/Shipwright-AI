import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  gitlabId: string;
  email: string;
  username: string;
  accessToken: string;
  refreshToken: string;
  createdAt: Date;
  lastLogin: Date;
  preferences: {
    theme: string;
    notifications: boolean;
  };
}

const UserSchema = new Schema<IUser>({
  gitlabId: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  preferences: {
    theme: {
      type: String,
      default: 'light'
    },
    notifications: {
      type: Boolean,
      default: true
    }
  }
});

// Create indexes
UserSchema.index({ gitlabId: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true });

export const User = mongoose.model<IUser>('User', UserSchema); 