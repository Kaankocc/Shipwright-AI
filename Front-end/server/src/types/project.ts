export interface IProject {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  techStack: {
    frontend?: string[];
    backend?: string[];
    database?: string;
    deployment?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  gitlabRepositoryId?: number;
  gitlabRepositoryUrl?: string;
  chats?: Array<{
    id: string;
    messages: Array<{
      role: 'user' | 'assistant';
      content: string;
      timestamp: Date;
    }>;
  }>;
} 