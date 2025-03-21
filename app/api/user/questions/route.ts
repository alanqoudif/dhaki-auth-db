import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// GET handler - retrieve user questions count
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get user from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;

    // Get user profile with questions count
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('questions_count, is_paid_user')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    return NextResponse.json({ 
      questionsCount: profile.questions_count,
      isPaidUser: profile.is_paid_user 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST handler - increment question count and save question
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get user from session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // Get current user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('questions_count, is_paid_user')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    // Check if free user has reached question limit
    const FREE_QUESTION_LIMIT = 3;
    if (!profile.is_paid_user && profile.questions_count >= FREE_QUESTION_LIMIT) {
      return NextResponse.json({ 
        error: 'Question limit reached', 
        questionsCount: profile.questions_count,
        isPaidUser: profile.is_paid_user
      }, { status: 403 });
    }

    // Save the question to the database
    const { error: questionError } = await supabase
      .from('questions')
      .insert({
        user_id: userId,
        question
      });

    if (questionError) {
      console.error('Error saving question:', questionError);
      return NextResponse.json({ error: 'Failed to save question' }, { status: 500 });
    }

    // Using the trigger function to increment the questions_count in profiles
    // The questions count will be updated automatically by the database trigger

    // Get updated profile count
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .select('questions_count, is_paid_user')
      .eq('id', userId)
      .single();

    if (updateError) {
      console.error('Error fetching updated profile:', updateError);
      return NextResponse.json({ error: 'Failed to fetch updated user data' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      questionsCount: updatedProfile.questions_count,
      isPaidUser: updatedProfile.is_paid_user
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}