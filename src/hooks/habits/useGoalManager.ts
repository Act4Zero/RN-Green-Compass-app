import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { focusAreas, TimeFrequency } from '@/types/goal.types';
import useGoals from '../../hooks/useGoals';
import { useAppLocale } from '@/context/AppLocaleContext';

interface UseGoalManagerProps {
  source?: string;
}

interface UseGoalManagerReturn {
  selectedFocusAreas: string[];
  frequency: TimeFrequency;
  targetValue: number;
  targetInputValue: string;
  isSubmitting: boolean;
  toggleFocusArea: (id: string) => void;
  incrementTarget: () => void;
  decrementTarget: () => void;
  handleTargetInputChange: (value: string) => void;
  handleTargetInputBlur: () => void;
  handleContinue: () => Promise<void>;
  setFrequency: (frequency: TimeFrequency) => void;
  router: ReturnType<typeof useRouter>;
}

export default function useGoalManager({ source }: UseGoalManagerProps): UseGoalManagerReturn {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { createNewGoal, loading, error } = useGoals();
  const { locale, t } = useAppLocale();

  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<TimeFrequency>('weekly');
  const [targetValue, setTargetValue] = useState(5);
  const [targetInputValue, setTargetInputValue] = useState<string>(targetValue.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add authentication check effect
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Reset state when source changes
  useEffect(() => {
    setSelectedFocusAreas([]);
    setFrequency('weekly');
    setTargetValue(5);
  }, [source]);

  const toggleFocusArea = (id: string) => {
    setSelectedFocusAreas(prev => 
      prev.includes(id) ? [] : [id]
    );
  };

  const incrementTarget = () => {
    const newValue = Math.min(targetValue + 1, 20);
    setTargetValue(newValue);
    setTargetInputValue(newValue.toString());
  };

  const decrementTarget = () => {
    const newValue = Math.max(targetValue - 1, 1);
    setTargetValue(newValue);
    setTargetInputValue(newValue.toString());
  };

  const handleTargetInputChange = (value: string) => {
    if (/^\d*$/.test(value)) {
      setTargetInputValue(value);
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        setTargetValue(Math.min(Math.max(numValue, 1), 20));
      }
    }
  };

  const handleTargetInputBlur = () => {
    setTargetInputValue(targetValue.toString());
  };

  const handleContinue = async () => {
    if (selectedFocusAreas.length === 0) {
      Alert.alert(t('Please select at least one focus area', 'Изберете поне една област'));
      return;
    }

    if (!user) {
      Alert.alert(t('Error', 'Грешка'), t('User not authenticated. Please sign in again.', 'Няма активен профил. Влезте отново.'));
      router.replace('/auth/signin');
      return;
    }

    setIsSubmitting(true);

    try {
      const promises = selectedFocusAreas.map(async (areaId) => {
        const area = focusAreas.find(a => a.id === areaId);
        if (!area) return null;

        let goalTitle;
        switch(area.name) {
          case 'Mobility': goalTitle = t('Green Journey', 'Зелено пътуване'); break;
          case 'Food': goalTitle = t('Sustainable Bites', 'Устойчиво хранене'); break;
          case 'Household Activities': goalTitle = t('Eco Home Challenge', 'Предизвикателство за еко дом'); break;
          case 'Heating': goalTitle = t('Climate Comfort', 'Климатичен комфорт'); break;
          default: goalTitle = t(`${area.name} Challenge`, `Предизвикателство: ${area.name}`);
        }

        const frequencyText = frequency === 'one-time' ? '' : frequency;
        const frequencyBg = frequency === 'daily' ? 'дневно' : frequency === 'weekly' ? 'седмично' : frequency === 'monthly' ? 'месечно' : '';
        const goalDescription = locale === 'bg' ? `Изпълнете ${targetValue} устойчиви действия ${frequencyBg} в избраната област.` : `Complete ${targetValue} sustainable actions ${frequencyText} related to ${area.name.toLowerCase()}`;

        let endDate: string | undefined = undefined;
        const today = new Date();
        
        if (frequency === 'daily') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          endDate = tomorrow.toISOString().split('T')[0];
        } else if (frequency === 'weekly') {
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          endDate = nextWeek.toISOString().split('T')[0];
        } else if (frequency === 'monthly') {
          const nextMonth = new Date(today);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          endDate = nextMonth.toISOString().split('T')[0];
        }

        const result = await createNewGoal(
          goalTitle,
          targetValue,
          area.category,
          undefined, // subcategory
          undefined, // habitId
          goalDescription,
          endDate
        );

        return result;
      });

      await Promise.all(promises);
      router.replace('/home');
    } catch (error) {
      Alert.alert(t('Error', 'Грешка'), t('Failed to create goal', 'Целта не можа да бъде създадена'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    selectedFocusAreas,
    frequency,
    targetValue,
    targetInputValue,
    isSubmitting,
    toggleFocusArea,
    incrementTarget,
    decrementTarget,
    handleTargetInputChange,
    handleTargetInputBlur,
    handleContinue,
    setFrequency,
    router,
  };
}
