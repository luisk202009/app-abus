-- Fix the overly permissive policy on user_tasks
DROP POLICY IF EXISTS "Users can view/edit their own tasks" ON public.user_tasks;

-- Create proper RLS policies for user_tasks
CREATE POLICY "Users can view their own tasks" 
ON public.user_tasks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" 
ON public.user_tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
ON public.user_tasks 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
ON public.user_tasks 
FOR DELETE 
USING (auth.uid() = user_id);