-- Create fabulistes table
CREATE TABLE public.fabulistes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  image_url text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fabulistes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fabulistes viewable by everyone" ON public.fabulistes
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can insert fabulistes" ON public.fabulistes
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update fabulistes" ON public.fabulistes
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete fabulistes" ON public.fabulistes
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

ALTER TABLE public.fables ADD COLUMN fabuliste_id uuid REFERENCES public.fabulistes(id) ON DELETE SET NULL;

CREATE TRIGGER update_fabulistes_updated_at
  BEFORE UPDATE ON public.fabulistes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();