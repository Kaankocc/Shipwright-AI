# 🚢 Shipwright AI

![Shipwright AI Logo](Front-end/client/public/big_logo.png)

> **AI-Powered Code Generation Platform** - Build complete software projects from natural language descriptions

Demo URL: https://drive.google.com/file/d/1tuxOE8h4LFjmTSVgPIJ4r3vRhHgNHQDg/view?usp=sharing

Shipwright AI is a personal project that revolutionizes software development by combining AI-powered code generation with GitLab integration and CI/CD automation. Simply describe your project idea in natural language, and watch as the platform generates a complete starter codebase, sets up GitLab repositories, and configures deployment pipelines.

## ✨ Features

### 🤖 AI-Powered Code Generation

- **Natural Language Processing**: Describe your project in plain English
- **Multi-Stack Support**: Generate projects for React, Angular, Vue, Django, Node.js, .NET, and more
- **Smart Tech Stack Detection**: AI automatically determines the best technologies for your requirements
- **Complete Project Structure**: Get fully functional starter codebases with proper folder hierarchy

### 🔗 GitLab Integration

- **OAuth Authentication**: Secure login with your GitLab account
- **Repository Creation**: Automatically create and configure GitLab repositories
- **Code Push**: Seamlessly push generated code to your repositories
- **Project Management**: Track and manage all your generated projects

### ⚡ CI/CD Pipeline Automation

- **Custom Pipeline Generation**: AI creates optimized `.gitlab-ci.yml` files
- **Multi-Environment Support**: Configure staging and production deployments
- **Best Practices Built-in**: Follow industry standards for testing, building, and deployment
- **Cloud Deployment**: Support for Google Cloud Platform and other cloud providers

### 💬 Interactive Chat Interface

- **Real-time Progress Tracking**: Watch your project being built step by step
- **Conversational AI**: Natural dialogue with the system about your project requirements
- **Visual Feedback**: Animated progress indicators and status updates
- **Project History**: Save and revisit your project conversations

## 🏗️ Architecture

### Frontend (React + TypeScript)

- **Modern UI**: Built with React 18, TypeScript, and Tailwind CSS
- **Responsive Design**: Beautiful, mobile-friendly interface
- **Real-time Updates**: Live progress tracking and status updates
- **Authentication**: Secure GitLab OAuth integration

### Backend (FastAPI + Node.js)

- **Python FastAPI**: AI processing and code generation engine
- **Node.js Express**: Authentication and project management server
- **Google Vertex AI**: Advanced AI model for code generation and tech stack analysis
- **MongoDB**: Flexible document storage for users, projects, and chat sessions

### AI Engine

- **Google Generative AI**: Powers natural language understanding and code generation
- **Tech Stack Analysis**: Intelligent detection of frameworks, databases, and deployment targets
- **Template System**: Pre-built templates for common project types
- **Code Quality**: Generated code follows best practices and industry standards

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- GitLab account
- Google Cloud Platform account (for AI features)

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd Shipwright-AI
   ```

2. **Backend Setup (Python)**

   ```bash
   cd Back-end
   pip install -r requirements.txt
   ```

3. **Frontend Setup**

   ```bash
   cd Front-end/client
   npm install
   ```

4. **Server Setup**
   ```bash
   cd Front-end/server
   npm install
   ```

### Environment Variables

Create `.env` files in the appropriate directories:

**Back-end/.env:**

```env
GOOGLE_API_KEY=your_google_api_key
```

**Front-end/server/.env:**

```env
GITLAB_CLIENT_ID=your_gitlab_client_id
GITLAB_CLIENT_SECRET=your_gitlab_client_secret
GITLAB_CALLBACK_URL=http://localhost:3000/auth/gitlab/callback
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
CLIENT_URL=http://localhost:3001
```

### Running the Application

1. **Start the Python backend:**

   ```bash
   cd Back-end
   uvicorn main:app --reload
   ```

2. **Start the Node.js server:**

   ```bash
   cd Front-end/server
   npm run dev
   ```

3. **Start the React frontend:**

   ```bash
   cd Front-end/client
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8000
   - Server: http://localhost:3000

## 🛠️ Supported Technologies

### Frontend Frameworks

- **React** - Modern component-based UI development
- **Angular** - Full-featured TypeScript framework
- **Vue.js** - Progressive JavaScript framework

### Backend Frameworks

- **Django** - Python web framework with batteries included
- **Node.js/Express** - JavaScript runtime with Express framework
- **.NET** - Microsoft's cross-platform development platform

### Databases

- **PostgreSQL** - Advanced open-source relational database
- **MongoDB** - NoSQL document database
- **SQLite** - Lightweight, serverless database

### Deployment Platforms

- **Google Cloud Platform** - Comprehensive cloud infrastructure
- **GitLab CI/CD** - Built-in continuous integration and deployment
- **Docker** - Containerization for consistent deployments

## 📊 Project Structure

```
Shipwright AI/
├── Back-end/                 # Python FastAPI backend
│   ├── main.py              # AI processing and code generation
│   └── requirements.txt     # Python dependencies
├── Front-end/
│   ├── client/              # React frontend application
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── pages/       # Page components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   └── App.tsx      # Main application component
│   │   └── package.json
│   └── server/              # Node.js authentication server
│       ├── src/
│       │   ├── services/    # Business logic services
│       │   ├── models/      # Database models
│       │   └── index.ts     # Express server setup
│       └── package.json
├── docs/                    # Project documentation
│   └── CONTEXT.md          # Detailed architecture overview
└── Projects/               # Generated project output
```

## 🔧 Development

### Code Generation Process

1. **User Input**: Natural language description of the project
2. **AI Analysis**: Google Vertex AI extracts tech stack requirements
3. **Template Selection**: Choose appropriate code templates
4. **Code Generation**: Generate complete project structure
5. **Repository Setup**: Create GitLab repository and push code
6. **CI/CD Configuration**: Generate and configure deployment pipelines

### API Endpoints

**AI Processing:**

- `POST /api/ai/extract-tech-stack` - Analyze project requirements
- `POST /api/project/generate_backend` - Generate backend code
- `POST /api/project/generate_frontend` - Generate frontend code
- `POST /api/project/generate_full` - Generate complete project

**Authentication:**

- `GET /auth/gitlab` - Initiate GitLab OAuth
- `GET /auth/gitlab/callback` - OAuth callback handler
- `GET /api/user` - Get current user information

**Projects:**

- `POST /api/projects` - Create new project
- `GET /api/projects` - List user projects
- `GET /api/projects/:id` - Get project details

## 🎯 Use Cases

### For Developers

- **Rapid Prototyping**: Quickly generate proof-of-concepts
- **Learning New Stacks**: Explore different technology combinations
- **Boilerplate Reduction**: Skip repetitive project setup tasks
- **Team Onboarding**: Standardize project structures across teams

### For Teams

- **Consistent Architecture**: Enforce best practices and patterns
- **Faster Time-to-Market**: Reduce development cycle times
- **Knowledge Sharing**: Document and reuse successful patterns
- **Quality Assurance**: Built-in testing and CI/CD configurations

### For Organizations

- **Developer Productivity**: Focus on business logic, not setup
- **Standardization**: Consistent project structures and practices
- **Scalability**: Handle multiple projects and teams efficiently
- **Innovation**: Experiment with new technologies quickly

## 🤝 Contributing

This is a personal project, but contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation for new features
- Maintain consistent code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Vertex AI** for powerful AI capabilities
- **GitLab** for excellent developer tools and APIs
- **React** and **FastAPI** communities for amazing frameworks
- **Tailwind CSS** for beautiful, utility-first styling

## 📞 Contact

This is a personal project by Kaan Koc. Feel free to reach out with questions, suggestions, or just to say hello!

Email: iam@kaankoc.tech

---

**Built with ❤️ and ☕ by a developer who believes in the power of AI to transform software development.**
