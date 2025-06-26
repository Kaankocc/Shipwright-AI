import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon, 
  FolderIcon, 
  UserCircleIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const { isAuthenticated, user, login, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  // Check system theme preference
  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
    { path: '/projects', label: 'Projects', icon: FolderIcon },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Shipwright AI Logo" className="w-8 h-8 rounded-lg object-contain shadow-sm" />
              <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Shipwright AI
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated && navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive(path)
                    ? 'text-slate-800 dark:text-slate-100 bg-slate-100/80 dark:bg-slate-800/80 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {label}
              </Link>
            ))}

            {/* User Profile */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all duration-200"
                >
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="text-sm font-medium">{user?.username}</span>
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50"
                    >
                      <div className="py-1">
                  <button
                    onClick={logout}
                          className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                  >
                          Sign out
                  </button>
                </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={login}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 shadow-sm"
              >
                Login with GitLab
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg border-t border-slate-200/50 dark:border-slate-800/50">
              {isAuthenticated && navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    isActive(path)
                      ? 'text-slate-800 dark:text-slate-100 bg-slate-100/80 dark:bg-slate-800/80'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {label}
                </Link>
              ))}

              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all duration-200"
                >
                  <UserCircleIcon className="h-5 w-5 mr-2" />
                  Sign out
                </button>
              ) : (
                <button
                  onClick={() => {
                    login();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-sm"
                >
                  Login with GitLab
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
} 