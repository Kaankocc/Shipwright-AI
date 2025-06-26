import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { CodeBracketIcon, CloudArrowUpIcon, CommandLineIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Global grid pattern overlay */}
      <div className="pointer-events-none select-none fixed inset-0 z-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
      {/* Hero Section */}
      <div className="relative z-10 pt-20 pb-16 sm:pb-24">
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl tracking-tight font-extrabold text-slate-900 dark:text-slate-100 sm:text-5xl md:text-6xl"
          >
            <span className="block">Build Better Software</span>
            <span className="block text-[#FC6D26]">with AI-Powered Code Generation</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-3 max-w-md mx-auto text-base text-slate-600 dark:text-slate-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
          >
            Shipwright AI helps you generate full starter codebases, set up GitLab repositories,
            and configure CI/CD pipelines - all through an intuitive chat interface.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8"
          >
            {isAuthenticated ? (
              <Link
                to="/chat"
                className="w-full flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-lg text-white bg-[#FC6D26] hover:bg-[#FF9248] md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md ring-1 ring-[#FC6D26]/20 hover:ring-[#FC6D26]/40"
              >
                Start Building
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-medium rounded-lg text-white bg-[#FC6D26] hover:bg-[#FF9248] md:py-4 md:text-lg md:px-10 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md ring-1 ring-[#FC6D26]/20 hover:ring-[#FC6D26]/40"
              >
                Get Started
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-4xl">
              Powerful Features
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Everything you need to build and deploy your software projects
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-200 dark:border-slate-600 group"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#FC6D26] text-white mb-4 group-hover:bg-[#FF9248] transition-colors duration-200">
                <CodeBracketIcon className="h-6 w-6" />
              </div>
              <div className="text-lg leading-6 font-medium text-slate-900 dark:text-slate-100">
                AI-Powered Code Generation
              </div>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
                Generate complete starter codebases based on natural language descriptions.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-200 dark:border-slate-600 group"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#FC6D26] text-white mb-4 group-hover:bg-[#FF9248] transition-colors duration-200">
                <CloudArrowUpIcon className="h-6 w-6" />
              </div>
              <div className="text-lg leading-6 font-medium text-slate-900 dark:text-slate-100">
                GitLab Integration
              </div>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
                Automatically create and configure GitLab repositories for your projects.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-200 dark:border-slate-600 group"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#FC6D26] text-white mb-4 group-hover:bg-[#FF9248] transition-colors duration-200">
                <CommandLineIcon className="h-6 w-6" />
              </div>
              <div className="text-lg leading-6 font-medium text-slate-900 dark:text-slate-100">
                CI/CD Pipeline Setup
              </div>
              <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
                Configure end-to-end CI/CD pipelines with best practices built-in.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-4xl">
              Trusted by Developers
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:border-[#FC6D26] dark:hover:border-[#FC6D26] transition-colors duration-200">
              <p className="text-slate-600 dark:text-slate-300 italic">
                "Shipwright AI has revolutionized our development workflow. We can now prototype and deploy new features in a fraction of the time."
              </p>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Sarah Chen</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Senior Developer, TechCorp</p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:border-[#FC6D26] dark:hover:border-[#FC6D26] transition-colors duration-200">
              <p className="text-slate-600 dark:text-slate-300 italic">
                "The AI-powered code generation is incredibly accurate and saves us hours of boilerplate work."
              </p>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Michael Rodriguez</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">CTO, StartupX</p>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:border-[#FC6D26] dark:hover:border-[#FC6D26] transition-colors duration-200">
              <p className="text-slate-600 dark:text-slate-300 italic">
                "The GitLab integration and CI/CD setup features are game-changers for our team's productivity."
              </p>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Emma Thompson</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">DevOps Engineer, CloudScale</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10">
        <div className="bg-gradient-to-r from-[#FC6D26] to-[#FF9248] rounded-xl shadow-xl max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between mt-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-white">Start building your project today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-lg shadow-lg">
              <Link
                to={isAuthenticated ? "/chat" : "/login"}
                className="inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-medium rounded-lg text-white bg-[#FC6D26] hover:bg-[#FF9248] transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-md ring-1 ring-[#FC6D26]/20 hover:ring-[#FC6D26]/40"
              >
                {isAuthenticated ? "Start Building" : "Get Started"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 