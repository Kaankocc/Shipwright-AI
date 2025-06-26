import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import dotenv from 'dotenv';
import { Strategy as GitLabStrategy } from 'passport-gitlab2';
import mongoose from 'mongoose';
import { AuthService } from './services/auth';
import path from 'path';
import { ProjectService } from './services/project';
import { GitLabService } from './services/gitlab';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Debug: Log environment variables
console.log('Environment variables:', {
  GITLAB_CLIENT_ID: process.env.GITLAB_CLIENT_ID,
  GITLAB_CLIENT_SECRET: process.env.GITLAB_CLIENT_SECRET,
  GITLAB_CALLBACK_URL: process.env.GITLAB_CALLBACK_URL,
  MONGODB_URI: process.env.MONGODB_URI,
  CLIENT_URL: process.env.CLIENT_URL
});

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: false, // Set to false for local development
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// GitLab Strategy
passport.use(new GitLabStrategy({
  clientID: process.env.GITLAB_CLIENT_ID!,
  clientSecret: process.env.GITLAB_CLIENT_SECRET!,
  callbackURL: process.env.GITLAB_CALLBACK_URL || 'http://localhost:3000/auth/gitlab/callback',
  scope: 'api read_user write_repository'
}, async (accessToken, refreshToken, profile, done) => {
  console.log('GitLab OAuth callback received:', {
    profile: {
      id: profile.id,
      username: profile.username,
      emails: profile.emails
    },
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    requestedScopes: 'api read_user write_repository'
  });
  
  try {
    const user = await AuthService.findOrCreateUser(profile, accessToken, refreshToken);
    return done(null, user);
  } catch (error) {
    console.error('Error in GitLab strategy:', error);
    return done(error as Error);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await AuthService.getUserById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Routes
app.get('/auth/gitlab', (req, res, next) => {
  console.log('Initiating GitLab OAuth flow with scopes:', ['read_user', 'api', 'write_repository']);
  passport.authenticate('gitlab')(req, res, next);
});

app.get('/auth/gitlab/callback',
  (req, res, next) => {
    console.log('Received GitLab callback with query params:', req.query);
    passport.authenticate('gitlab', { failureRedirect: '/login' })(req, res, next);
  },
  (req, res) => {
    console.log('Authentication successful, redirecting to home');
    res.redirect(process.env.CLIENT_URL || 'http://localhost:3001');
  }
);

app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

app.post('/api/user/preferences', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const user = await AuthService.updateUserPreferences(
      (req.user as any)._id,
      req.body.preferences
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating preferences' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Project Routes
app.post('/api/projects', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    // Create the project in MongoDB with name and GitHub repository URL
    const project = await ProjectService.createProject({
      name: req.body.name,
      githubRepositoryUrl: req.body.githubRepositoryUrl,
      owner: (req.user as any)._id
    });

    res.json(project);
  } catch (error) {
    console.error('Error in project creation:', error);
    res.status(500).json({ 
      message: 'Error creating project',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/api/projects', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const projects = await ProjectService.getUserProjects((req.user as any)._id);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const project = await ProjectService.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project' });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const project = await ProjectService.updateProject(req.params.id, req.body);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project' });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const success = await ProjectService.deleteProject(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project' });
  }
});

app.post('/api/projects/:id/update-repository-url', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const { githubRepositoryUrl } = req.body;
    const project = await ProjectService.updateProject(req.params.id, { githubRepositoryUrl });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project repository URL' });
  }
});

app.post('/api/push-to-gitlab', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const { repositoryName, description } = req.body;
    
    if (!repositoryName) {
      return res.status(400).json({ message: 'Repository name is required' });
    }

    // Create GitLab repository
    const repo = await GitLabService.createRepository(
      (req.user as any)._id,
      repositoryName,
      description || `Project generated by Shipwright AI: ${repositoryName}`
    );

    // Push the existing Projects folder to GitLab
    const projectsPath = path.resolve(__dirname, '../../../Projects');
    const result = await GitLabService.pushProjectToGitLab(
      (req.user as any)._id,
      projectsPath,
      repo.http_url_to_repo,
      repositoryName
    );

    if (result.success) {
      res.json({
        message: 'Project successfully pushed to GitLab',
        repositoryUrl: result.repositoryUrl
      });
    } else {
      res.status(500).json({
        message: result.message,
        error: 'Failed to push project to GitLab'
      });
    }
  } catch (error) {
    console.error('Error pushing to GitLab:', error);
    res.status(500).json({ 
      message: 'Error pushing project to GitLab',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shipwright')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 