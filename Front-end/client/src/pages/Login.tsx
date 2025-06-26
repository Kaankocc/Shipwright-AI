import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome to Shipwright AI
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in with your GitLab account to get started
          </p>
        </div>
        <div>
          <button
            onClick={login}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Sign in with GitLab
          </button>
        </div>
      </div>
    </div>
  );
} 