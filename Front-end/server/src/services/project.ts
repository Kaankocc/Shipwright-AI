import { Project, IProject } from '../models/Project';
import mongoose from 'mongoose';

export class ProjectService {
  static async createProject(data: {
    name: string;
    githubRepositoryUrl?: string;
    owner: mongoose.Types.ObjectId;
    collaborators?: mongoose.Types.ObjectId[];
  }): Promise<IProject> {
    const project = new Project(data);
    return await project.save();
  }

  static async getProjectById(id: string): Promise<IProject | null> {
    return await Project.findById(id)
      .populate('owner', 'username email')
      .populate('collaborators', 'username email');
  }

  static async getUserProjects(userId: mongoose.Types.ObjectId): Promise<IProject[]> {
    return await Project.find({
      $or: [
        { owner: userId },
        { collaborators: userId }
      ]
    })
    .populate('owner', 'username email')
    .populate('collaborators', 'username email');
  }

  static async updateProject(
    projectId: string,
    updates: Partial<IProject>
  ): Promise<IProject | null> {
    return await Project.findByIdAndUpdate(
      projectId,
      { $set: updates },
      { new: true }
    );
  }

  static async deleteProject(projectId: string): Promise<boolean> {
    const result = await Project.findByIdAndDelete(projectId);
    return !!result;
  }
} 