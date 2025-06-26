# AutoStarter (Codename: Shipwright)

AutoStarter is an AI-powered web application that generates full starter codebases based on natural language descriptions, bootstraps GitLab repositories, and sets up end-to-end CI/CD pipelines. The app features an intuitive chatbot interface that guides users through the creation of their desired software project.

## 🔐 User Authentication & GitLab Integration

### Authentication Flow

1. **Landing Page**

   - Prompts user to **Sign Up / Log In** using their GitLab account
   - Uses OAuth2 to request scopes: `read_user`, `api`, `write_repository`

2. **Post-Authentication**
   - Redirect user to main application
   - Store GitLab token securely (server-side session or encrypted DB)

## 💬 Chatbot Interface

### Layout

- Fullscreen layout with centered chatbox
- Light/dark theme support

### User Interaction

- **Initial Prompt**: "What would you like to build today?"
- **Example Input**: "I want to build a job board using Django and PostgreSQL, deployed on Google Cloud."

## ⚙️ Processing Phases with UI Feedback

### Real-time Task Feed

The application displays an animated task feed showing progress:

- ✅ Determining tech stack
- ✅ Generating backend skeleton
- ✅ Creating GitLab repository
- ✅ Committing code
- ✅ Configuring GitLab CI/CD
- ✅ Deploying to GCP (optional)

Each task includes a spinner or checkmark indicator for completion status.

## 🛠️ Backend Architecture

### 1. Prompt Interpretation

- Utilizes Google Vertex AI to:
  - Parse framework, language, database, deployment target
  - Detect optional modules (auth, admin, frontend)

### 2. Starter Code Generation

Generates comprehensive project structure:

- Folder hierarchy
- Core application files (`main.py`, `models.py`, `Dockerfile`, etc.)
- `README.md`
- `.gitlab-ci.yml` for pipeline configuration

### 3. GitLab Integration

- Creates new repository via GitLab API
- Pushes generated code (Git or GitLab file API)
- Configures default branch

### 4. CI/CD Pipeline

Customizes `.gitlab-ci.yml` based on tech stack:

- Linting and testing stages
- Build process
- GCP deployment steps (when specified)

## ✅ Completion & Follow-Up

### Success Flow

## 📁 Server-Side Structure

```
/server
  ├── /templates
  ├── /generators
  ├── /gitlab
  ├── /ci
  └── main.py (or index.js)
```

## 🔐 Environment Configuration

Required environment variables:

- `GITLAB_CLIENT_ID`
- `GITLAB_CLIENT_SECRET`
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_APPLICATION_CREDENTIALS`
- `SESSION_SECRET`
- `GCP_PROJECT_ID` (for deployment)

## 📊 Database Schema

### Users Collection

```json
{
  "_id": "ObjectId",
  "gitlabId": "String",
  "email": "String",
  "username": "String",
  "accessToken": "String (encrypted)",
  "refreshToken": "String (encrypted)",
  "createdAt": "DateTime",
  "lastLogin": "DateTime",
  "preferences": {
    "theme": "String",
    "notifications": "Boolean"
  }
}
```

### Projects Collection

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users)",
  "name": "String",
  "description": "String",
  "gitlabRepoId": "String",
  "gitlabRepoUrl": "String",
  "techStack": {
    "frontend": ["String"],
    "backend": ["String"],
    "database": "String",
    "deployment": "String"
  },
  "status": "String (enum: pending, generating, completed, failed)",
  "createdAt": "DateTime",
  "updatedAt": "DateTime",
  "generationHistory": [
    {
      "timestamp": "DateTime",
      "action": "String",
      "status": "String",
      "details": "Object"
    }
  ]
}
```

### Chat Sessions Collection

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref: Users)",
  "projectId": "ObjectId (ref: Projects)",
  "messages": [
    {
      "role": "String (enum: user, assistant)",
      "content": "String",
      "timestamp": "DateTime"
    }
  ],
  "startedAt": "DateTime",
  "lastActivity": "DateTime",
  "status": "String (enum: active, completed, archived)"
}
```

### Templates Collection

```json
{
  "_id": "ObjectId",
  "name": "String",
  "description": "String",
  "category": "String",
  "techStack": {
    "frontend": ["String"],
    "backend": ["String"],
    "database": "String"
  },
  "files": [
    {
      "path": "String",
      "content": "String",
      "type": "String"
    }
  ],
  "createdAt": "DateTime",
  "updatedAt": "DateTime",
  "isPublic": "Boolean"
}
```

## 📁 Complete Project Structure

```
shipwright-ai/
├── .github/
│   └── workflows/              # GitHub Actions workflows
├── client/                     # Frontend React application
│   ├── public/
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── styles/           # Global styles
│   │   ├── types/            # TypeScript types
│   │   └── utils/            # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── server/                     # Backend application
│   ├── src/
│   │   ├── api/              # API routes and controllers
│   │   ├── config/           # Configuration files
│   │   ├── db/               # Database models and schemas
│   │   ├── generators/       # Code generation modules
│   │   ├── gitlab/           # GitLab integration
│   │   ├── services/         # Business logic
│   │   ├── templates/        # Code templates
│   │   └── utils/            # Utility functions
│   ├── tests/                # Backend tests
│   ├── package.json
│   └── tsconfig.json
├── docs/                      # Documentation
│   ├── api/                  # API documentation
│   ├── architecture/         # Architecture diagrams
│   └── guides/               # User guides
├── scripts/                   # Utility scripts
├── .env.example              # Example environment variables
├── .gitignore
├── docker-compose.yml        # Development environment
├── README.md
└── package.json             # Root package.json for workspace
```

## 🔄 Database Indexes

### Users Collection

- `gitlabId` (unique)
- `email` (unique)
- `username` (unique)

### Projects Collection

- `userId`
- `gitlabRepoId` (unique)
- `status`
- `createdAt`

### Chat Sessions Collection

- `userId`
- `projectId`
- `lastActivity`

### Templates Collection

- `category`
- `isPublic`
- `techStack.backend`
- `techStack.frontend`

## 🔒 Security Considerations

1. **Token Storage**

   - GitLab tokens are encrypted at rest
   - Refresh tokens are stored securely
   - Access tokens are rotated regularly

2. **Data Access**

   - Projects are scoped to users
   - Templates have public/private visibility
   - Chat sessions are user-specific

3. **Rate Limiting**

   - API endpoints are rate-limited
   - Code generation requests are queued
   - GitLab API calls are throttled

4. **Audit Trail**
   - All code generation attempts are logged
   - User actions are tracked
   - System events are monitored

---

_This documentation serves as the foundation for the AutoStarter project. Each module (authentication, code generation, CI/CD, chat) can be developed independently while adhering to the shared API schema and UI update protocol._
