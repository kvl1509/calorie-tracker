import { useTheme } from '../hooks/useTheme';
import { Card } from '../components/UI/Card';

export function Settings() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Customize your application experience.</p>
      </header>

      <Card className="p-8 space-y-6">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-4">Appearance</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-slate-800 dark:text-slate-200">Theme</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Switch between light and dark mode</p>
          </div>
          <button 
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            <span 
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </Card>
    </div>
  );
}
