
-- Create departments table
CREATE TABLE public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Everyone can view departments
CREATE POLICY "Anyone can view departments" ON public.departments
  FOR SELECT USING (true);

-- Only admins can manage departments
CREATE POLICY "Admins can insert departments" ON public.departments
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update departments" ON public.departments
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete departments" ON public.departments
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed default department
INSERT INTO public.departments (name) VALUES ('General'), ('Engineering'), ('Marketing'), ('Sales'), ('HR');
