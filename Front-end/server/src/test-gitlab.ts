import { GitLabService } from './services/gitlab';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testGitLabPush() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Get the first user from the database (you can modify this to use a specific user ID)
    const User = mongoose.model('User');
    const user = await User.findOne();
    
    if (!user) {
      throw new Error('No user found in the database');
    }

    console.log('Found user:', {
      id: user._id,
      username: user.username,
      hasAccessToken: !!user.accessToken
    });

    // Test the createAndPushRepository method
    console.log('Starting repository creation and push...');
    const result = await GitLabService.createAndPushRepository(
      user._id.toString(),
      'test-repo-' + Date.now(), // Unique name using timestamp
      'Test repository created via API'
    );

    console.log('Repository creation and push result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testGitLabPush(); 