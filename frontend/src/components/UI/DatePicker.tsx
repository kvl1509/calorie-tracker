import { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Matches the backend/app convention of getting today's date in IST
function getTodayStr() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

// Format local Date object to YYYY-MM-DD
function formatDateStr(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Parse YYYY-MM-DD to local Date object at midnight
function parseDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function DatePicker({ 
  value, 
  onChange, 
  max 
}: { 
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  max?: string; // YYYY-MM-DD
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => parseDate(value));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // If value changes externally, update current month to reflect it
  useEffect(() => {
    setCurrentMonth(parseDate(value));
  }, [value]);

  const toggleOpen = () => setIsOpen(!isOpen);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const maxDate = max ? parseDate(max) : new Date(2100, 0, 1);
  const isNextMonthDisabled = currentMonth.getFullYear() === maxDate.getFullYear() && currentMonth.getMonth() >= maxDate.getMonth();

  const handleSelect = (date: Date) => {
    onChange(formatDateStr(date));
    setIsOpen(false);
  };

  const parsedValueDate = parseDate(value);
  const formattedValue = parsedValueDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: parsedValueDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined 
  });
  
  const todayStr = getTodayStr();
  const isToday = value === todayStr;
  const displayValue = isToday ? `Today, ${formattedValue}` : formattedValue;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggleOpen}
        className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/20"
      >
        <CalendarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <span className="text-slate-700 dark:text-slate-200 font-medium whitespace-nowrap">
          {displayValue}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 z-50 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-72 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={prevMonth}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button 
              onClick={nextMonth}
              disabled={isNextMonthDisabled}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-slate-400 dark:text-slate-500 py-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-3">
            {days.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="p-2" />;
              
              const dateStr = formatDateStr(date);
              const isSelected = dateStr === value;
              const isDisabled = max ? dateStr > max : false;
              const isCurrentDay = dateStr === todayStr;

              return (
                <button
                  key={i}
                  disabled={isDisabled}
                  onClick={() => handleSelect(date)}
                  className={twMerge(
                    clsx(
                      "w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm transition-all",
                      isSelected 
                        ? "bg-purple-600 text-white font-semibold shadow-md shadow-purple-500/30" 
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                      isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent",
                      !isSelected && isCurrentDay && "text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-900/20"
                    )
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handleSelect(parseDate(todayStr))}
              className="w-full py-2 text-sm font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 rounded-xl transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
