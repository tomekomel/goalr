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

-- --- AUTHENTICATION & SECURITY (RLS) ---

-- 1. Add user_id column to link goals to specific users
-- We default to auth.uid() if not provided, making inserts easier
ALTER TABLE goals 
ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();

-- 2. Enable Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies

-- Policy: Users can see only their own goals
CREATE POLICY "Users can view their own goals" 
ON goals FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own goals
CREATE POLICY "Users can create their own goals" 
ON goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own goals
CREATE POLICY "Users can update their own goals" 
ON goals FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy: Users can delete their own goals
CREATE POLICY "Users can delete their own goals" 
ON goals FOR DELETE 
USING (auth.uid() = user_id);

-- --- PROGRESS TRACKING ---

-- Add progress column (0-100)
ALTER TABLE goals 
ADD COLUMN progress smallint DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);
