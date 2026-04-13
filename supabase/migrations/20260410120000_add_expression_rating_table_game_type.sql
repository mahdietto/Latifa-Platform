-- Allow expression_rating_table (self-assessment Poor/Average/Good/Excellent) in fable_games.game_type
ALTER TABLE public.fable_games DROP CONSTRAINT IF EXISTS fable_games_game_type_check;

ALTER TABLE public.fable_games
ADD CONSTRAINT fable_games_game_type_check
CHECK (
  game_type = ANY (
    ARRAY[
      'image_word_match',
      'fill_blanks',
      'memory_cards',
      'true_false',
      'crossword',
      'paragraph_order',
      'mcq',
      'video_sound_match',
      'expression_rating_table'
    ]
  )
);
