
-- Tighten the notifications insert policy - only allow system/trigger inserts via service role
-- The trigger runs as SECURITY DEFINER so it bypasses RLS anyway
DROP POLICY "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Service role can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
