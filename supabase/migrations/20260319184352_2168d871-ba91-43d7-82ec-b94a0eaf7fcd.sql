
-- Game types: image_word_match, fill_blanks, memory_cards, true_false, crossword, paragraph_order
CREATE TABLE public.fable_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fable_id UUID REFERENCES public.fables(id) ON DELETE CASCADE NOT NULL,
  game_type TEXT NOT NULL CHECK (game_type IN ('image_word_match', 'fill_blanks', 'memory_cards', 'true_false', 'crossword', 'paragraph_order')),
  title TEXT NOT NULL DEFAULT '',
  game_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fable_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Games viewable by everyone" ON public.fable_games FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert games" ON public.fable_games FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update games" ON public.fable_games FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete games" ON public.fable_games FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_fable_games_updated_at BEFORE UPDATE ON public.fable_games FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Student progress tracking
CREATE TABLE public.student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  fable_id UUID REFERENCES public.fables(id) ON DELETE CASCADE NOT NULL,
  video_watched BOOLEAN NOT NULL DEFAULT false,
  story_read BOOLEAN NOT NULL DEFAULT false,
  games_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, fable_id)
);

ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON public.student_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.student_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.student_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_student_progress_updated_at BEFORE UPDATE ON public.student_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
