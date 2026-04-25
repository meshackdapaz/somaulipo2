-- ============================================================
-- SOMAULIPO MESSAGES FIX
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Ensure columns for file attachments exist so images don't show up as links
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS file_name TEXT;

-- 2. Drop the existing delete policy if it's broken
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.messages;

-- 3. Create a fresh DELETE policy that properly casts types just in case
CREATE POLICY "Users can delete their own messages" 
ON public.messages 
FOR DELETE 
USING (auth.uid()::text = sender_id::text);

-- 4. Just to be completely safe, ensure RLS is enabled and SELECT is allowed
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see messages in their conversations" ON public.messages;
CREATE POLICY "Users can see messages in their conversations"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND auth.uid() = ANY (conversations.participants)
  )
);
