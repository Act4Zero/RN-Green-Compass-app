import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import useHabitStats from '../../hooks/useHabitStats';
import HabitContextModule from '../../context/HabitContext/HabitContext';
import { HabitLog, UserGoal } from '../../types/supabase';

const { useHabit } = HabitContextModule;

// Constants
const emptyDates: string[] = [];
const emptyLogs: HabitLog[] = [];

// Define the calendar day type for better type safety
type CalendarDay = {
  date: string;
  day: number;
  isActive: boolean;
  isEmpty: boolean;
  isDisabled?: boolean;
  activityLevel?: 'none' | 'low' | 'medium' | 'high';
  id?: string;
};

interface UseHistoryManagerReturn {
  // States
  selectedDate: string | null;
  selectedCategory: string;
  filteredLogs: HabitLog[];
  activeDates: string[];
  logs: HabitLog[];
  habits: any[] | null; // Add habits to the return type
  completedGoals: UserGoal[];
  currentViewMonth: Date;
  registrationDate: Date | null;
  calendarDays: CalendarDay[];
  currentMonthName: string;
  currentYearNum: number;
  todayLocal: Date;
  
  // Stats
  totalCO2Saved: number;
  totalActions: number;
  overallStreak: number;
  
  // Methods
  handleSelectDate: (date: string) => void;
  handleSelectCategory: (category: string) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  formatSelectedDate: (dateString: string) => string;
  
  // Router
  router: ReturnType<typeof useRouter>;
}

export default function useHistoryManager(): UseHistoryManagerReturn {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    totalCO2Saved, 
    totalActions, 
    overallStreak,
    getDatesWithCompletedHabits,
    getLogsGroupedByDate
  } = useHabitStats();
  
  const { habitLogs, habits, userGoals } = useHabit();
  
  // State for completed goals
  const [completedGoals, setCompletedGoals] = useState<UserGoal[]>([]);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredLogs, setFilteredLogs] = useState<HabitLog[]>([]);
  
  // Use real data from the hooks instead of mock data
  const [activeDates, setActiveDates] = useState<string[]>(emptyDates);
  const [logs, setLogs] = useState<HabitLog[]>(habitLogs || emptyLogs);
  
  // State for calendar navigation
  const [currentViewMonth, setCurrentViewMonth] = useState<Date>(new Date());
  const [registrationDate, setRegistrationDate] = useState<Date | null>(null);

  // Current date for comparison with calendar dates (using local time)
  const today = new Date();
  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Helper function to format dates in local time as "YYYY-MM-DD"
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calendar navigation functions
  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentViewMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    
    // Optional: Don't go before registration date if needed
    if (registrationDate && prevMonth >= registrationDate) {
      setCurrentViewMonth(prevMonth);
    } else if (registrationDate) {
      setCurrentViewMonth(new Date(registrationDate));
    } else {
      setCurrentViewMonth(prevMonth);
    }
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentViewMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // Don't go beyond current month
    const today = new Date();
    if (nextMonth.getFullYear() < today.getFullYear() || 
        (nextMonth.getFullYear() === today.getFullYear() && 
         nextMonth.getMonth() <= today.getMonth())) {
      setCurrentViewMonth(nextMonth);
    }
  };
  
  // Get activity level for a specific date
  const getActivityLevel = (dateString: string): 'none' | 'low' | 'medium' | 'high' => {
    const logsForDate = logs.filter(log => log.log_date === dateString);
    const count = logsForDate.length;
    
    if (count === 0) return 'none';
    if (count <= 2) return 'low';
    if (count <= 5) return 'medium';
    return 'high';
  };

  // Generate calendar days for the current view month using local date strings
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentViewMonth.getFullYear();
    const month = currentViewMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    // Get the day of the week for the last day (0 = Sunday, 6 = Saturday)
    const lastDayOfWeek = lastDay.getDay();
    
    const days = [];
    
    // Add empty spaces for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ date: '', day: 0, isActive: false, isEmpty: true, id: `empty-start-${i}` });
    }
    
    // Add the days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateString = formatLocalDate(date);
      
      // Check if this date is in the future (compared to local today)
      const isInFuture = date > todayLocal;
      
      // Get activity level for this date
      const activityLevel = getActivityLevel(dateString);
      
      days.push({
        date: dateString,
        day: i,
        isActive: activeDates.includes(dateString) && !isInFuture,
        isEmpty: false,
        isDisabled: isInFuture,
        activityLevel
      });
    }
    
    // Add empty spaces for days after the last day of the month to complete the grid
    // If lastDayOfWeek is 6 (Saturday), we don't need to add any empty spaces
    const emptySpacesNeeded = lastDayOfWeek < 6 ? 6 - lastDayOfWeek : 0;
    for (let i = 0; i < emptySpacesNeeded; i++) {
      days.push({ date: '', day: 0, isActive: false, isEmpty: true, id: `empty-end-${i}` });
    }
    
    return days;
  };

  // Computed values
  const calendarDays = generateCalendarDays();
  const currentMonthName = currentViewMonth.toLocaleString('default', { month: 'long' });
  const currentYearNum = currentViewMonth.getFullYear();

  // Effects
  useEffect(() => {
    // Use the local date string for today
    const todayStr = formatLocalDate(todayLocal);
    setSelectedDate(todayStr);
    
    if (user) {
      // Use user.created_at as the registration date
      const regDate = user.created_at ? new Date(user.created_at) : null;
      setRegistrationDate(regDate);
      
      if (regDate && currentViewMonth < regDate) {
        setCurrentViewMonth(new Date(regDate));
      }
    }
  }, [user, currentViewMonth]);

  useEffect(() => {
    if (habitLogs && habitLogs.length > 0) {
      setLogs(habitLogs);
      
      // Extract unique dates from habit logs (assuming they are stored as "YYYY-MM-DD")
      const dates = Array.from(new Set(habitLogs.map(log => log.log_date)));
      setActiveDates(dates);
    }
  }, [habitLogs]);
  
  useEffect(() => {
    if (userGoals && userGoals.length > 0) {
      const completed = userGoals.filter(goal => goal.current_value >= goal.target_value);
      setCompletedGoals(completed);
    }
  }, [userGoals]);

  useEffect(() => {
    if (selectedDate) {
      let filtered = logs.filter(log => log.log_date === selectedDate);
      
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(log => {
          const habit = habits?.find(h => h.id === log.habit_id);
          return habit && habit.category === selectedCategory;
        });
      }
      
      setFilteredLogs(filtered);
      
      if (userGoals && userGoals.length > 0) {
        const dateGoals = userGoals.filter(goal => {
          return goal.current_value >= goal.target_value && 
                 goal.updated_at && 
                 goal.updated_at.split('T')[0] === selectedDate;
        });
        setCompletedGoals(dateGoals);
      }
    } else {
      setFilteredLogs([]);
    }
  }, [selectedDate, selectedCategory, logs, habits, userGoals]);

  // Event handlers
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };
  
  // For summary display, we can still use a local date format
  const formatSelectedDate = (dateString: string) => {
    if (!dateString) return '';
    
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    const date = new Date(year, month - 1, day);
    
    // Check if date is valid before calling toLocaleDateString
    return date instanceof Date && !isNaN(date.getTime()) 
      ? date.toLocaleDateString() 
      : '';
  };



  return {
    // States
    selectedDate,
    selectedCategory,
    filteredLogs,
    activeDates,
    logs,
    habits, // Add habits to the returned object
    completedGoals,
    currentViewMonth,
    registrationDate,
    calendarDays,
    currentMonthName,
    currentYearNum,
    todayLocal,
    
    // Stats
    totalCO2Saved,
    totalActions,
    overallStreak,
    
    // Methods
    handleSelectDate,
    handleSelectCategory,
    goToPreviousMonth,
    goToNextMonth,
    formatSelectedDate,
    
    // Router
    router,
  };
}
