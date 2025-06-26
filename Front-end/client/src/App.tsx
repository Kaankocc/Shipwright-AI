import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Chat from './pages/Chat';
import Projects from './pages/Projects';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="login"
          element={isAuthenticated ? <Navigate to="/chat" /> : <Login />}
        />
        <Route
          path="chat"
          element={isAuthenticated ? <Chat /> : <Navigate to="/login" />}
        />
        <Route
          path="projects"
          element={isAuthenticated ? <Projects /> : <Navigate to="/login" />}
        />
      </Route>
    </Routes>
  );
}

export default App; 