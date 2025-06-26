import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import dotenv from 'dotenv';
import { Strategy as GitLabStrategy } from 'passport-gitlab2';
import mongoose from 'mongoose';
import { AuthService } from './services/auth';
import path from 'path';

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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shipwright')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 