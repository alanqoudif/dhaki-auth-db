'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useQuestionLimits } from '@/hooks/useQuestionLimits';
import { AuthDialog } from '@/components/auth/auth-dialog';

export function HomeContent() {
  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  
  const { user } = useAuth();
  const { 
    questionsCount, 
    canAskMoreQuestions, 
    isPaidUser,
    incrementQuestionCount,
    saveQuestion
  } = useQuestionLimits();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;
    
    // If user is not logged in or has reached question limit
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    if (!canAskMoreQuestions) {
      setShowAuthDialog(true);
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Save question to the database
      await saveQuestion(question);
      
      // TODO: Implement the AI call to get the answer
      // This is where you would make your API call to process the question
      
      setQuestion(''); // Clear the form after successful submission
    } catch (error) {
      console.error('Error submitting question:', error);
      // Handle submission error
    } finally {
      setSubmitting(false);
    }
  };
  
  // Render question limit information
  const renderQuestionLimitInfo = () => {
    if (!user) return null;
    
    const remainingQuestions = isPaidUser ? 'غير محدود' : Math.max(0, 3 - questionsCount);
    
    return (
      <div className="text-center text-sm mt-2">
        {isPaidUser ? (
          <span className="text-green-600">أنت مستخدم مميز ويمكنك طرح أسئلة غير محدودة.</span>
        ) : (
          <span>الأسئلة المتبقية: <strong>{remainingQuestions}</strong> من أصل 3 أسئلة مجانية.</span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="اسأل ذكي..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <div className="flex justify-between items-center">
          {renderQuestionLimitInfo()}
          <Button type="submit" disabled={submitting || !question.trim()}>
            {submitting ? 'جاري المعالجة...' : 'إرسال'}
          </Button>
        </div>
      </form>
      
      {/* Authentication Dialog */}
      <AuthDialog 
        isOpen={showAuthDialog} 
        onOpenChange={setShowAuthDialog} 
        defaultMode={user ? 'signin' : 'signup'}
      />
    </div>
  );
}