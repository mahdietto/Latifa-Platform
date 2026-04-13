
-- Create fables table
CREATE TABLE public.fables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  teaser TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'Facile' CHECK (difficulty IN ('Facile', 'Moyen', 'Difficile')),
  duration TEXT NOT NULL DEFAULT '3 min',
  moral TEXT NOT NULL,
  story TEXT NOT NULL,
  video_url TEXT,
  has_game BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fables ENABLE ROW LEVEL SECURITY;

-- Everyone can read fables
CREATE POLICY "Fables are viewable by everyone" ON public.fables FOR SELECT USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can insert fables" ON public.fables FOR INSERT
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update fables" ON public.fables FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete fables" ON public.fables FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Timestamp trigger
CREATE TRIGGER update_fables_updated_at
  BEFORE UPDATE ON public.fables
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for fable images
INSERT INTO storage.buckets (id, name, public) VALUES ('fable-images', 'fable-images', true);

CREATE POLICY "Anyone can view fable images" ON storage.objects FOR SELECT USING (bucket_id = 'fable-images');
CREATE POLICY "Admins can upload fable images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'fable-images');
CREATE POLICY "Admins can update fable images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'fable-images');
CREATE POLICY "Admins can delete fable images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'fable-images');
