import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { JSX } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string | JSX.Element;
  techStack?: {
    name?: string;
    frontend: string[];
    backend: string[];
    database: string | null;
    deployment: string | null;
    additional_tools: string[];
  };
}

interface GenerationStep {
  name: string;
  status: 'pending' | 'loading' | 'completed';
}

export default function Chat() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);
  const [projectName, setProjectName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [analyzedTechStack, setAnalyzedTechStack] = useState<Message['techStack'] | null>(null);
  const [projectGenerated, setProjectGenerated] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(projectId);
  const [projectPushed, setProjectPushed] = useState(false);
  const [githubRepositoryUrl, setGithubRepositoryUrl] = useState<string | null>(null);

  // Update savedProjectId when projectId changes
  useEffect(() => {
    if (projectId) {
      setSavedProjectId(projectId);
    }
  }, [projectId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const updateStepStatus = (stepName: string, status: 'pending' | 'loading' | 'completed') => {
    setGenerationSteps(prev => 
      prev.map(step => 
        step.name === stepName ? { ...step, status } : step
      )
    );
  };

  const simulateGeneration = async (techStack: Message['techStack']) => {
    if (!techStack) return;

    // Start with backend if it exists
    if (techStack.backend.length > 0) {
      updateStepStatus('Backend', 'loading');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate work
      updateStepStatus('Backend', 'completed');
    }

    // Then frontend
    if (techStack.frontend.length > 0) {
      updateStepStatus('Frontend', 'loading');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate work
      updateStepStatus('Frontend', 'completed');
    }

    // Database
    if (techStack.database) {
      updateStepStatus('Database', 'loading');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate work
      updateStepStatus('Database', 'completed');
    }

    // Deployment
    if (techStack.deployment) {
      updateStepStatus('Deployment', 'loading');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate work
      updateStepStatus('Deployment', 'completed');
    }

    // Additional tools
    if (techStack.additional_tools.length > 0) {
      updateStepStatus('Additional Tools', 'loading');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
      updateStepStatus('Additional Tools', 'completed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setHasStartedChat(true);

    try {
      // Call the tech stack extraction API
      const response = await fetch('http://localhost:8000/api/ai/extract-tech-stack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      
      // Log the complete backend response
      console.log('Backend Response:', {
        tech_stack: data.tech_stack,
        confidence: data.confidence,
        metadata: data.metadata
      });
      
      // Initialize generation steps based on tech stack
      const steps: GenerationStep[] = [];
      if (data.tech_stack.backend?.length > 0) steps.push({ name: 'Backend', status: 'pending' });
      if (data.tech_stack.frontend?.length > 0) steps.push({ name: 'Frontend', status: 'pending' });
      if (data.tech_stack.database) steps.push({ name: 'Database', status: 'pending' });
      if (data.tech_stack.deployment) steps.push({ name: 'Deployment', status: 'pending' });
      if (data.tech_stack.additional_tools?.length > 0) steps.push({ name: 'Additional Tools', status: 'pending' });
      
      setGenerationSteps(steps);
      setAnalyzedTechStack(data.tech_stack);
      setProjectGenerated(false);

      // Add tech stack to the user message
      setMessages(prev => prev.map((msg, index) => 
        index === prev.length - 1 
          ? { ...msg, techStack: data.tech_stack }
          : msg
      ));

      // Show tech stack analysis message (no steps or button here)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I\'ve analyzed your project requirements. Would you like me to generate the project structure?',
        techStack: data.tech_stack
      }]);

    } catch (error) {
      console.error('Error extracting tech stack:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error while analyzing your project. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateProject = async () => {
    if (!analyzedTechStack) return;
    setIsLoading(true);
    try {
      const generateResponse = await fetch('http://localhost:8000/api/project/generate_full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: analyzedTechStack.name || 'New Project',
          tech_stack: analyzedTechStack
        }),
      });

      const generateData = await generateResponse.json();
      console.log('Generate Full Response:', generateData);

      // Update messages with generation result
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: (
          <div>
            {generateData.message.split(' | ').map((part: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 mb-1">
                <span>{part}</span>
                <span className="text-green-500">✓</span>
              </div>
            ))}
          </div>
        ),
        techStack: analyzedTechStack
      }]);

      // Update generation steps based on the response
      if (generateData.backend) {
        updateStepStatus('Backend', 'completed');
      }
      if (generateData.frontend) {
        updateStepStatus('Frontend', 'completed');
      }
      setProjectGenerated(true);
    } catch (error) {
      console.error('Error generating project:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error generating project structure. Please try again.',
        techStack: analyzedTechStack
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepStatus = (status: 'pending' | 'loading' | 'completed') => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
          </div>
        );
      case 'completed':
        return <span className="text-green-500">✓</span>;
      default:
        return null;
    }
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) return;
    
    setIsSaving(true);
    try {
      // Create a new project with the name and GitHub repository URL
      const projectResponse = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: projectName,
          githubRepositoryUrl: githubRepositoryUrl
        }),
      });

      if (!projectResponse.ok) {
        throw new Error('Failed to create project');
      }

      const project = await projectResponse.json();
      setSavedProjectId(project._id); // Store the project ID for later use
      setShowSaveDialog(false);
      setProjectName('');
      setGithubRepositoryUrl(null); // Reset the GitHub URL after saving
      
      // Show success message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Project "${project.name}" saved successfully with GitHub repository!`,
      }]);
    } catch (error) {
      console.error('Error saving project:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error saving project. Please try again.',
      }]);
    } finally {
      setIsSaving(false);
    }
  };

  // Push to GitLab handler
  const handlePushToGitLab = async () => {
    if (!analyzedTechStack?.name) return;
    setIsPushing(true);
    try {
      // Call push-to-gitlab endpoint with just the repository name
      const pushRes = await fetch(`http://localhost:3000/api/push-to-gitlab`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          repositoryName: analyzedTechStack.name,
          description: `Project generated by Shipwright AI: ${analyzedTechStack.name}`
        }),
      });
      const pushData = await pushRes.json();
      if (pushRes.ok) {
        // Store the GitHub repository URL
        setGithubRepositoryUrl(pushData.repositoryUrl);
        setProjectPushed(true); // Mark that the project has been pushed
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span>Project successfully pushed to GitLab</span>
                <span className="text-green-500">✓</span>
              </div>
              <a href={pushData.repositoryUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Repository</a>
            </div>
          ),
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error pushing to GitLab: ${pushData.message || 'Unknown error'}`,
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error pushing to GitLab. Please try again.',
      }]);
    } finally {
      setIsPushing(false);
    }
  };

  if (!hasStartedChat) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-slate-100 mb-4">
                What would you like to build today?
              </h1>
              <p className="text-lg text-slate-300">
                Describe your project and I'll help you get started.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="w-full">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="e.g., I want to build a job board using Django and PostgreSQL, deployed on Google Cloud."
                  className="w-full h-32 p-4 text-lg rounded-lg border border-slate-700 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-600 resize-none placeholder:text-slate-400"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute bottom-4 right-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Building
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header with Save button */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {projectId ? 'Viewing Project Chat' : 'Chat'}
          </h1>
          {!projectId && projectPushed && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              disabled={messages.length === 0 || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Project'}
            </button>
          )}
        </div>
      </div>

      {/* Save Project Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Save Project</h2>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full p-2 mb-4 border rounded-lg dark:border-gray-700 dark:bg-gray-700 dark:text-white"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProject}
                disabled={!projectName.trim() || isSaving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg px-4 py-2 max-w-xl whitespace-pre-line ${msg.role === 'user' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-100'}`}>
                  {msg.content}
                  {/* Only show steps for the first assistant message after analysis, not for every message */}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Show steps and button only after tech stack analysis and before project generation */}
      {analyzedTechStack && !projectGenerated && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="p-4 bg-slate-800/50 border-t border-slate-700 flex flex-col items-start rounded-lg mx-4 mb-4">
            <div className="mb-3 font-semibold text-slate-100 text-lg">Project Steps:</div>
            <div className="flex flex-wrap gap-4 mb-4">
              {generationSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-slate-200 font-medium">{step.name}</span>
                  {renderStepStatus(step.status)}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleGenerateProject}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-md transition-all duration-300 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Project'}
              </button>
              {isLoading && (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Show Push to GitLab button after project is generated */}
      {analyzedTechStack && projectGenerated && !projectPushed && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="p-4 bg-transparent border-t border-slate-800 flex flex-col items-start">
            <button
              onClick={handlePushToGitLab}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-md transition-all duration-300 disabled:opacity-50"
              disabled={isPushing}
            >
              {isPushing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Pushing...</span>
                </div>
              ) : 'Push to GitLab'}
            </button>
          </div>
        </div>
      )}
      {/* Loading spinner for general loading state (e.g., after sending a message) */}
      {isLoading && !analyzedTechStack && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What would you like to build today?"
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600 placeholder:text-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 