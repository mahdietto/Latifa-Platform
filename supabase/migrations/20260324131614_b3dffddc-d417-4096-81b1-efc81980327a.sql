
-- Add stars and game_attempts columns to student_progress
ALTER TABLE public.student_progress ADD COLUMN IF NOT EXISTS stars integer NOT NULL DEFAULT 0;
ALTER TABLE public.student_progress ADD COLUMN IF NOT EXISTS game_attempts jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Create trigger for auto-creating profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for auto-assigning user role on signup
CREATE OR REPLACE TRIGGER on_auth_user_role_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Add RLS policy for admins to view all progress (for leaderboard)
CREATE POLICY "Admins can view all progress"
  ON public.student_progress FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add policy for public profiles read (needed for leaderboard)
-- Already exists: "Profiles viewable by everyone"

-- Add policy to allow everyone to read all progress for leaderboard
CREATE POLICY "Anyone can view progress for leaderboard"
  ON public.student_progress FOR SELECT
  TO authenticated
  USING (true);
