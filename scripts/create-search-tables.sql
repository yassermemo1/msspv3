-- Create saved_searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  search_config TEXT NOT NULL,
  entity_types TEXT[] NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_quick_filter BOOLEAN NOT NULL DEFAULT false,
  use_count INTEGER NOT NULL DEFAULT 0,
  last_used TIMESTAMP,
  tags TEXT[],
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  search_query TEXT NOT NULL,
  search_config TEXT,
  entity_types TEXT[] NOT NULL,
  results_count INTEGER NOT NULL DEFAULT 0,
  execution_time INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_is_public ON saved_searches(is_public);
CREATE INDEX IF NOT EXISTS idx_saved_searches_is_quick_filter ON saved_searches(is_quick_filter);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC); 