import { useState, useEffect, useCallback } from 'react';
import { createClientComponent } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// Constants
const FREE_QUESTIONS_LIMIT = 3;

export function useQuestionLimits() {
  const { user } = useAuth();
  const supabase = createClientComponent();
  const [questionsCount, setQuestionsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaidUser, setIsPaidUser] = useState(false);

  // Load user's question count and paid status
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        // Check local storage for anonymous user's question count
        const localCount = localStorage.getItem('anonymousQuestionsCount');
        setQuestionsCount(localCount ? parseInt(localCount, 10) : 0);
        setIsPaidUser(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Get user data from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('questions_count, is_paid_user')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Set the state with the fetched data
        setQuestionsCount(profileData?.questions_count || 0);
        setIsPaidUser(profileData?.is_paid_user || false);
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('حدث خطأ أثناء تحميل بيانات المستخدم');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user, supabase]);

  // Increment question count
  const incrementQuestionCount = useCallback(async () => {
    if (user) {
      // Logged in user - update in database
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            questions_count: questionsCount + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;
        
        setQuestionsCount(prev => prev + 1);
      } catch (error) {
        console.error('Error incrementing question count:', error);
        toast.error('حدث خطأ أثناء تحديث عدد الأسئلة');
      }
    } else {
      // Anonymous user - update in local storage
      const newCount = questionsCount + 1;
      localStorage.setItem('anonymousQuestionsCount', newCount.toString());
      setQuestionsCount(newCount);
    }
  }, [user, questionsCount, supabase]);

  // Check if user can ask more questions
  const canAskMoreQuestions = useCallback(() => {
    if (isPaidUser) return true;
    return questionsCount < FREE_QUESTIONS_LIMIT;
  }, [questionsCount, isPaidUser]);

  // Get remaining questions
  const getRemainingQuestions = useCallback(() => {
    if (isPaidUser) return Infinity;
    return Math.max(0, FREE_QUESTIONS_LIMIT - questionsCount);
  }, [questionsCount, isPaidUser]);

  // Save question to database
  const saveQuestion = useCallback(async (question: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('questions')
        .insert({
          user_id: user.id,
          question: question,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving question:', error);
      // Don't show error to user as this is not critical
    }
  }, [user, supabase]);

  return {
    questionsCount,
    isLoading,
    isPaidUser,
    incrementQuestionCount,
    canAskMoreQuestions,
    getRemainingQuestions,
    saveQuestion
  };
}