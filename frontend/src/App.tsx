import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Settings as SettingsPage } from './pages/Settings';
import { Activity, LayoutDashboard, Settings, UserCircle } from 'lucide-react';
import { useState, useEffect, type ReactNode } from 'react';
import { useTheme } from './hooks/useTheme';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('auth_token'));
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'history' | 'profile' | 'settings'>('dashboard');
  
  // Initialize theme
  useTheme();

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('auth_token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <Profile onLogout={handleLogout} />;
      case 'settings':
        return <SettingsPage />;
      case 'history':
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans pb-24 md:pb-0 md:pl-20 transition-colors duration-300">
      
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex justify-between items-center z-50 transition-colors duration-300">
        <NavItem 
          icon={<LayoutDashboard className="w-6 h-6" />} 
          label="Today" 
          active={currentTab === 'dashboard'} 
          onClick={() => setCurrentTab('dashboard')} 
        />
        <NavItem 
          icon={<UserCircle className="w-6 h-6" />} 
          label="Profile" 
          active={currentTab === 'profile'} 
          onClick={() => setCurrentTab('profile')} 
        />
        <NavItem 
          icon={<Settings className="w-6 h-6" />} 
          label="Settings" 
          active={currentTab === 'settings'} 
          onClick={() => setCurrentTab('settings')} 
        />
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed top-0 left-0 bottom-0 w-20 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex-col items-center py-8 z-50 transition-colors duration-300">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center mb-8 shadow-sm">
          <Activity className="text-white w-6 h-6" />
        </div>
        
        <div className="flex flex-col gap-6 flex-grow">
          <NavItem 
            icon={<LayoutDashboard className="w-6 h-6" />} 
            active={currentTab === 'dashboard'} 
            onClick={() => setCurrentTab('dashboard')} 
          />
          <NavItem 
            icon={<UserCircle className="w-6 h-6" />} 
            active={currentTab === 'profile'} 
            onClick={() => setCurrentTab('profile')} 
          />
          <NavItem 
            icon={<Settings className="w-6 h-6" />} 
            active={currentTab === 'settings'} 
            onClick={() => setCurrentTab('settings')} 
          />
        </div>
        
      </nav>

      <main className="w-full">
        {renderContent()}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: ReactNode, label?: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}>
      <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-purple-50 dark:bg-purple-900/30' : 'bg-transparent'}`}>
        {icon}
      </div>
      {label && <span className="text-xs font-medium">{label}</span>}
    </button>
  );
}

export default App;
