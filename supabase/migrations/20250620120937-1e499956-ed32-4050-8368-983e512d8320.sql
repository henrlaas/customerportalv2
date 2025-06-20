
-- Add metadata tracking for folders when they are created
-- We'll store folder creation info in the existing media_metadata table
-- by adding entries with a special mime_type for folders

-- First, let's add an index to improve performance when querying folder metadata
CREATE INDEX IF NOT EXISTS idx_media_metadata_folder_lookup 
ON media_metadata(bucket_id, file_path) 
WHERE mime_type = 'application/folder';

-- Add a function to create folder metadata when folders are created
CREATE OR REPLACE FUNCTION create_folder_metadata(
  p_bucket_id TEXT,
  p_folder_path TEXT,
  p_created_by UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  metadata_id UUID;
BEGIN
  INSERT INTO media_metadata (
    file_path,
    bucket_id,
    uploaded_by,
    mime_type,
    original_name,
    file_size
  ) VALUES (
    p_folder_path,
    p_bucket_id,
    p_created_by,
    'application/folder',
    split_part(p_folder_path, '/', -1), -- Extract folder name from path
    0
  )
  RETURNING id INTO metadata_id;
  
  RETURN metadata_id;
END;
$$;
