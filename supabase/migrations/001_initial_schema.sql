-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Secret server-side pokemon mapping (single row)
CREATE TABLE board_state (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  pokemon_map JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Visible card state (Realtime-enabled)
CREATE TABLE board_cards (
  index INTEGER PRIMARY KEY CHECK (index >= 0 AND index < 36),
  owner_id UUID REFERENCES profiles(id),
  owner_name TEXT,
  pokemon JSONB,
  is_matched BOOLEAN DEFAULT false,
  matched_at TIMESTAMPTZ,
  flipped_at TIMESTAMPTZ
);

-- Per-user match scores
CREATE TABLE match_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) NOT NULL UNIQUE,
  count INTEGER DEFAULT 0,
  last_pokemon_name TEXT,
  matched_at TIMESTAMPTZ
);

-- User's caught pokemon collection
CREATE TABLE collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  pokemon_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  color TEXT,
  type TEXT[],
  rate INTEGER,
  is_legendary BOOLEAN DEFAULT false,
  evolves_to JSONB,
  count INTEGER DEFAULT 1,
  first_at TIMESTAMPTZ DEFAULT now(),
  last_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(owner_id, pokemon_id)
);

-- PokeAPI response cache
CREATE TABLE pokemon_cache (
  pokemon_id INTEGER PRIMARY KEY,
  species_data JSONB NOT NULL,
  type_data JSONB NOT NULL,
  evolution_data JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT now()
);

-- Initialize 36 empty board card slots
INSERT INTO board_cards (index, is_matched)
SELECT i, false FROM generate_series(0, 35) AS i;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE pokemon_cache ENABLE ROW LEVEL SECURITY;

-- board_state: NO client access (server-only via service_role)

-- board_cards: authenticated can read all
CREATE POLICY "board_cards_select" ON board_cards FOR SELECT TO authenticated USING (true);

-- match_players: authenticated can read all
CREATE POLICY "match_players_select" ON match_players FOR SELECT TO authenticated USING (true);

-- collections: users can only read their own
CREATE POLICY "collections_select" ON collections FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

-- profiles: anyone can read, users can update their own avatar
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- pokemon_cache: authenticated can read
CREATE POLICY "pokemon_cache_select" ON pokemon_cache FOR SELECT TO authenticated USING (true);

-- Enable Realtime for board_cards and match_players
ALTER PUBLICATION supabase_realtime ADD TABLE board_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE match_players;

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
