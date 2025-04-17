import { useState, useCallback } from 'react';

/**
 * Hook for managing form state in the challenges feature
 */
function useFormState() {
  // Challenge form state
  const [newChallengeTitle, setNewChallengeTitle] = useState('');
  const [newChallengeDescription, setNewChallengeDescription] = useState('');
  const [newChallengeStartDate, setNewChallengeStartDate] = useState('');
  const [newChallengeEndDate, setNewChallengeEndDate] = useState('');
  
  // Activity log form state
  const [newActivityDescription, setNewActivityDescription] = useState('');
  const [newActivityImpactValue, setNewActivityImpactValue] = useState(1);
  
  // Submission state
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Reset the challenge form
   */
  const resetChallengeForm = useCallback(() => {
    setNewChallengeTitle('');
    setNewChallengeDescription('');
    setNewChallengeStartDate('');
    setNewChallengeEndDate('');
  }, []);
  
  /**
   * Reset the activity log form
   */
  const resetActivityForm = useCallback(() => {
    setNewActivityDescription('');
    setNewActivityImpactValue(1);
  }, []);
  
  /**
   * Validate the challenge form
   */
  const validateChallengeForm = useCallback(() => {
    if (!newChallengeTitle.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!newChallengeDescription.trim()) {
      setError('Description is required');
      return false;
    }
    
    if (!newChallengeStartDate) {
      setError('Start date is required');
      return false;
    }
    
    if (!newChallengeEndDate) {
      setError('End date is required');
      return false;
    }
    
    // Check that end date is after start date
    const startDate = new Date(newChallengeStartDate);
    const endDate = new Date(newChallengeEndDate);
    
    if (endDate <= startDate) {
      setError('End date must be after start date');
      return false;
    }
    
    setError(null);
    return true;
  }, [
    newChallengeTitle, 
    newChallengeDescription, 
    newChallengeStartDate, 
    newChallengeEndDate
  ]);
  
  /**
   * Validate the activity log form
   */
  const validateActivityForm = useCallback(() => {
    if (!newActivityDescription.trim()) {
      setError('Description is required');
      return false;
    }
    
    if (newActivityImpactValue <= 0) {
      setError('Impact value must be greater than zero');
      return false;
    }
    
    setError(null);
    return true;
  }, [newActivityDescription, newActivityImpactValue]);
  
  return {
    // Challenge form
    newChallengeTitle,
    setNewChallengeTitle,
    newChallengeDescription,
    setNewChallengeDescription,
    newChallengeStartDate,
    setNewChallengeStartDate,
    newChallengeEndDate,
    setNewChallengeEndDate,
    resetChallengeForm,
    validateChallengeForm,
    
    // Activity log form
    newActivityDescription,
    setNewActivityDescription,
    newActivityImpactValue,
    setNewActivityImpactValue,
    resetActivityForm,
    validateActivityForm,
    
    // Submission state
    isSubmitting,
    setSubmitting,
    error,
    setError
  };
}

export default useFormState;
