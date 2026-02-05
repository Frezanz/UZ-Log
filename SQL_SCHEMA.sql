-- Create content table
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  content TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  file_url TEXT,
  file_size TEXT,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL,
  is_public BOOLEAN DEFAULT false
);

CREATE TABLE book_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES content(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  content TEXT,
  type TEXT DEFAULT 'text',
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL
);

ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own content"
  ON content
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create content"
  ON content
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content"
  ON content
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own content"
  ON content
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public content is viewable"
  ON content
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users see own book pages"
  ON book_pages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM content
      WHERE content.id = book_pages.book_id
      AND content.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own book pages"
  ON book_pages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM content
      WHERE content.id = book_pages.book_id
      AND content.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own book pages"
  ON book_pages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM content
      WHERE content.id = book_pages.book_id
      AND content.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own book pages"
  ON book_pages
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM content
      WHERE content.id = book_pages.book_id
      AND content.user_id = auth.uid()
    )
  );
