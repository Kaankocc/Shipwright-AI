import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from './Navbar';

export default function Layout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Global gradient and grid pattern background */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800" />
      <div className="fixed inset-0 z-0 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none select-none" />
      <div className="relative z-10">
      <Navbar />
        <main>
        <Outlet />
      </main>
      </div>
    </div>
  );
} 