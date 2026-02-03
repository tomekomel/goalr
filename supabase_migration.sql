-- Add status column
ALTER TABLE goals
ADD COLUMN status text NOT NULL DEFAULT 'planned';

-- Add updated_at column
ALTER TABLE goals
ADD COLUMN updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Optional: Create a trigger to automatically update updated_at
CREATE EXTENSION IF NOT EXISTS moddatetime;

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
