-- ============================================================
-- SOMAULIPO FLASHCARDS TABLE SETUP
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.flashcards (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid not null,
    deck_name text not null,
    front text not null,
    back text not null
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies just in case
DROP POLICY IF EXISTS "Users can view their own flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Users can insert their own flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Users can update their own flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Users can delete their own flashcards" ON public.flashcards;

-- Recreate Policies
CREATE POLICY "Users can view their own flashcards" 
    ON public.flashcards FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcards" 
    ON public.flashcards FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcards" 
    ON public.flashcards FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcards" 
    ON public.flashcards FOR DELETE 
    USING (auth.uid() = user_id);
