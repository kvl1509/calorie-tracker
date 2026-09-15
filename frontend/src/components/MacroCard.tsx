import { Card } from './UI/Card';

interface MacroCardProps {
  title: string;
  emoji: string;
  current: number;
  goal: number;
  colorClass: string;
  bgClass: string;
}

export function MacroCard({ title, emoji, current, goal, colorClass, bgClass }: MacroCardProps) {
  const percentage = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
  
  return (
    <Card className={`relative overflow-hidden ${bgClass} border-transparent`}>
      <div className="relative z-10">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
          <span>{emoji}</span> {title}
        </h3>
        
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{Math.round(current)}g</span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/ {goal}g</span>
        </div>
        
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">
          <span>{percentage}%</span>
        </div>
        
        <div className="h-2 w-full bg-white/50 dark:bg-slate-900/50 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${colorClass} transition-all duration-1000 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
