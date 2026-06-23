
-- Activity Logs table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view activity logs"
ON public.activity_logs FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert activity logs"
ON public.activity_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);

-- Trigger function to log task changes and create notifications
CREATE OR REPLACE FUNCTION public.log_task_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _actor_name TEXT;
  _assignee_name TEXT;
  _action TEXT;
  _details TEXT;
BEGIN
  -- Get actor name
  SELECT full_name INTO _actor_name FROM public.profiles WHERE user_id = auth.uid();
  _actor_name := COALESCE(_actor_name, 'System');

  IF TG_OP = 'INSERT' THEN
    _action := 'task_created';
    _details := _actor_name || ' created task "' || NEW.title || '"';

    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (auth.uid(), _action, 'task', NEW.id, _details);

    -- Notify assignee
    IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to != auth.uid() THEN
      SELECT full_name INTO _assignee_name FROM public.profiles WHERE user_id = NEW.assigned_to;
      INSERT INTO public.notifications (user_id, title, message)
      VALUES (NEW.assigned_to, 'New Task Assigned', '"' || NEW.title || '" has been assigned to you by ' || _actor_name);
    END IF;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Status change
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      _action := 'status_changed';
      _details := _actor_name || ' changed "' || NEW.title || '" status to ' || NEW.status;

      INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
      VALUES (auth.uid(), _action, 'task', NEW.id, _details);
    END IF;

    -- Assignment change
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL THEN
      SELECT full_name INTO _assignee_name FROM public.profiles WHERE user_id = NEW.assigned_to;
      _action := 'task_assigned';
      _details := _actor_name || ' assigned "' || NEW.title || '" to ' || COALESCE(_assignee_name, 'someone');

      INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
      VALUES (auth.uid(), _action, 'task', NEW.id, _details);

      IF NEW.assigned_to != auth.uid() THEN
        INSERT INTO public.notifications (user_id, title, message)
        VALUES (NEW.assigned_to, 'Task Assigned', '"' || NEW.title || '" has been assigned to you by ' || _actor_name);
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER task_activity_trigger
AFTER INSERT OR UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.log_task_activity();
