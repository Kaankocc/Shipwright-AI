import { User, IUser } from '../models/User';

export class AuthService {
  static async findOrCreateUser(profile: any, accessToken: string, refreshToken: string): Promise<IUser> {
    try {
      console.log('Processing GitLab OAuth callback:', {
        gitlabId: profile.id,
        email: profile.emails[0].value,
        username: profile.username,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken
      });

      let user = await User.findOne({ gitlabId: profile.id });

      if (!user) {
        console.log('Creating new user with GitLab credentials');
        user = await User.create({
          gitlabId: profile.id,
          email: profile.emails[0].value,
          username: profile.username,
          accessToken,
          refreshToken,
          preferences: {
            theme: 'light',
            notifications: true
          }
        });
      } else {
        console.log('Updating existing user with new tokens');
        // Update existing user's tokens and last login
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        await user.save();
      }

      console.log('User processed successfully:', {
        userId: user._id,
        gitlabId: user.gitlabId,
        hasAccessToken: !!user.accessToken
      });

      return user;
    } catch (error) {
      console.error('Error in findOrCreateUser:', error);
      throw error;
    }
  }

  static async getUserById(id: string): Promise<IUser | null> {
    try {
      const user = await User.findById(id);
      if (user) {
        console.log('Retrieved user:', {
          userId: user._id,
          gitlabId: user.gitlabId,
          hasAccessToken: !!user.accessToken
        });
      }
      return user;
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  }

  static async updateUserPreferences(userId: string, preferences: Partial<IUser['preferences']>): Promise<IUser | null> {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { $set: { preferences } },
        { new: true }
      );
    } catch (error) {
      console.error('Error in updateUserPreferences:', error);
      throw error;
    }
  }
} 