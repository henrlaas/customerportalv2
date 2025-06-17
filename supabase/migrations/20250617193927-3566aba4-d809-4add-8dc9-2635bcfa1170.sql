
-- Drop the existing quarter column and its enum type
ALTER TABLE okrs DROP COLUMN quarter;
DROP TYPE IF EXISTS quarter_type;

-- Create new month enum type
CREATE TYPE month_type AS ENUM (
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
);

-- Add the month column to okrs table
ALTER TABLE okrs ADD COLUMN month month_type NOT NULL DEFAULT 'January';
