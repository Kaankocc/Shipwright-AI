import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Project {
  _id: string;
  name: string;
  githubRepositoryUrl?: string;
  owner: {
    _id: string;
    username: string;
    email: string;
  };
  collaborators: Array<{
    _id: string;
    username: string;
    email: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/projects', {
          credentials: 'include',
        });
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError('Failed to load projects');
        console.error('Error fetching projects:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Update the projects state to remove the deleted project
      setProjects(prevProjects => prevProjects.filter(project => project._id !== projectId));
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project. Please try again.');
    }
  };

  const openDeleteDialog = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {error}
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Please try again later
        </p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-3xl font-extrabold text-slate-100 mb-2">Your Projects</h2>
        <p className="text-slate-400 mb-6">You haven't created any projects yet. Start your first one!</p>
          <Link
            to="/chat"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-all duration-300"
          >
            Start New Project
          </Link>
      </div>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-100">Your Projects</h2>
          <p className="text-slate-400 mt-2">All your generated projects are listed here. Click a project to view details or manage it.</p>
        </div>
        <Link
          to="/chat"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-amber-600 hover:bg-amber-700 shadow-md transition-all duration-300"
        >
          New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div
            key={project._id}
            className="bg-slate-900/80 backdrop-blur-sm overflow-hidden shadow-xl rounded-2xl border border-slate-800 transition-transform duration-200 hover:scale-[1.025] hover:shadow-2xl group"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-slate-100 truncate max-w-[70%] group-hover:text-amber-400 transition-colors duration-200">
                  {project.name}
                </h3>
                <button
                  onClick={() => openDeleteDialog(project._id)}
                  className="text-sm text-red-500 hover:text-red-400"
                >
                  Delete Project
                </button>
              </div>
              {project.githubRepositoryUrl && (
                <div className="mt-2">
                  <a 
                    href={project.githubRepositoryUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-amber-400 hover:text-amber-300 underline"
                  >
                    View Repository
                  </a>
                </div>
              )}
              <div className="mt-4 space-y-2">
                <div className="text-sm text-slate-400">
                  Owner: {project.owner.username}
                </div>
                {project.collaborators.length > 0 && (
                  <div className="text-sm text-slate-400">
                    Collaborators: {project.collaborators.map(c => c.username).join(', ')}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-slate-800/80 px-8 py-4">
              <div className="text-sm text-slate-400">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Project Confirmation Dialog */}
      {deleteDialogOpen && projectToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900/95 p-6 rounded-lg w-96 border border-slate-800">
            <h2 className="text-xl font-semibold mb-4 text-slate-100">Delete Project</h2>
            <p className="text-slate-400 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(projectToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
} 