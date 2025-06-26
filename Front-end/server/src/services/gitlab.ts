import axios from 'axios';
import * as fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { User } from '../models/User';

const execAsync = promisify(exec);

export class GitLabService {
  private static async getGitLabClient(accessToken: string) {
    if (!accessToken) {
      throw new Error('GitLab access token is required');
    }
    return axios.create({
      baseURL: 'https://gitlab.com/api/v4',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  static async createRepository(userId: string, name: string, description: string = '') {
    const user = await User.findById(userId);
    if (!user || !user.accessToken) {
      throw new Error('User not found or no GitLab access token available');
    }

    console.log('Creating repository with access token:', user.accessToken.substring(0, 10) + '...');
    const client = await this.getGitLabClient(user.accessToken);
    try {
      const response = await client.post('/projects', {
        name,
        description,
        visibility: 'private',
        initialize_with_readme: true,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating GitLab repository:', error.response?.data || error.message);
      throw error;
    }
  }

  static async pushProjectToGitLab(
    userId: string,
    projectPath: string,
    repoUrl: string,
    projectName: string
  ): Promise<{ success: boolean; message: string; repositoryUrl: string }> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.accessToken) {
        throw new Error('User not found or no access token available');
      }

      // Use the Projects directory at the root level
      const projectsPath = path.join(__dirname, '..', '..', '..', '..', 'Projects');
      console.log('Current directory:', process.cwd());
      console.log('__dirname:', __dirname);
      console.log('Resolved Projects path:', projectsPath);
      if (!fs.existsSync(projectsPath)) {
        throw new Error(`Projects directory not found: ${projectsPath}`);
      }
      console.log(`Using Projects directory: ${projectsPath}`);

      // List contents of the Projects directory
      const files = fs.readdirSync(projectsPath);
      console.log('Contents of Projects directory:', files);

      // Check if git is already initialized
      const gitDir = path.join(projectsPath, '.git');
      if (!fs.existsSync(gitDir)) {
        console.log('Initializing git repository...');
        await execAsync('git init', { cwd: projectsPath });
      } else {
        console.log('Git repository already initialized.');
      }
      
      // Add all files
      console.log('Adding files to git...');
      // Create a .gitkeep file if the directory is empty
      if (files.length === 0) {
        fs.writeFileSync(path.join(projectsPath, '.gitkeep'), '');
        console.log('Created .gitkeep file for empty directory');
      }
      await execAsync('git add .', { cwd: projectsPath });
      
      // Create initial commit
      console.log('Creating initial commit...');
      try {
        await execAsync('git commit -m "Initial commit: Pushing Projects directory"', { cwd: projectsPath });
      } catch (error) {
        console.log('No changes to commit or commit already exists.');
      }
      
      // Add remote and push
      console.log('Adding remote and pushing to GitLab...');
      // Check if remote already exists
      try {
        await execAsync('git remote get-url origin', { cwd: projectsPath });
        console.log('Remote origin already exists, skipping add.');
        // Update remote URL if it exists
        const authUrl = repoUrl.replace('https://', `https://oauth2:${user.accessToken}@`);
        await execAsync(`git remote set-url origin ${authUrl}`, { cwd: projectsPath });
        console.log('Updated remote URL with authentication.');
      } catch {
        const authUrl = repoUrl.replace('https://', `https://oauth2:${user.accessToken}@`);
        await execAsync(`git remote add origin ${authUrl}`, { cwd: projectsPath });
        console.log('Remote origin added.');
      }
      await execAsync('git branch -M main', { cwd: projectsPath });
      // Pull remote changes with rebase before pushing
      try {
        await execAsync('git pull --rebase origin main', { cwd: projectsPath });
      } catch (error) {
        console.log('Pull with rebase failed:', error);
        throw error;
      }
      // Now push to the remote
      try {
        await execAsync('git push -u origin main', { cwd: projectsPath });
      } catch (error) {
        console.log('Push failed:', error);
        throw error;
      }
      // Delete contents of the Projects folder after successful push
      const projectFiles = fs.readdirSync(projectsPath);
      for (const file of projectFiles) {
        const filePath = path.join(projectsPath, file);
        if (fs.lstatSync(filePath).isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
      }
      console.log('Projects folder contents deleted after successful push.');
      return { success: true, message: 'Project successfully pushed to GitLab', repositoryUrl: repoUrl };
    } catch (error) {
      console.error('Error pushing to GitLab:', error);
      return { 
        success: false, 
        message: `Error pushing to GitLab: ${error instanceof Error ? error.message : 'Unknown error'}`,
        repositoryUrl: ''
      };
    }
  }

  static async getRepositoryUrl(userId: string, repositoryName: string) {
    const user = await User.findById(userId);
    if (!user || !user.accessToken) {
      throw new Error('User not found or no GitLab access token available');
    }

    const client = await this.getGitLabClient(user.accessToken);
    try {
      // Search for the repository by name
      const response = await client.get(`/projects`, {
        params: {
          search: repositoryName,
          membership: true
        }
      });
      
      // Find the exact match by name
      const repository = response.data.find((repo: any) => repo.name === repositoryName);
      
      if (!repository) {
        throw new Error(`Repository with name '${repositoryName}' not found`);
      }
      
      return repository.http_url_to_repo;
    } catch (error: any) {
      console.error('Error getting repository URL:', error.response?.data || error.message);
      throw error;
    }
  }

  static async createAndPushRepository(userId: string, name: string, description: string = '') {
    try {
      // First create the repository
      const repoData = await this.createRepository(userId, name, description);
      const repoUrl = repoData.http_url_to_repo;
      
      // Get the absolute path to the Projects directory
      const projectsPath = path.join(process.cwd(), 'Projects');
      
      // Push the Projects directory to the newly created repository
      const result = await this.pushProjectToGitLab(
        userId,
        projectsPath,
        repoUrl,
        name
      );

      return {
        ...result,
        repositoryId: repoData.id,
        repositoryUrl: repoUrl
      };
    } catch (error) {
      console.error('Error in createAndPushRepository:', error);
      throw error;
    }
  }
} 