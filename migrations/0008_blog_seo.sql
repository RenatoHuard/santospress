-- Adiciona campos de SEO e organização ao spress_blog_posts
ALTER TABLE spress_blog_posts
  ADD COLUMN IF NOT EXISTS autor_id  uuid REFERENCES spress_usuarios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS seo_titulo text,
  ADD COLUMN IF NOT EXISTS seo_descricao text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS categoria text;

-- Bucket para imagens do blog
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-imagens', 'blog-imagens', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para o bucket blog-imagens
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'blog_imagens_select'
  ) THEN
    CREATE POLICY blog_imagens_select ON storage.objects
      FOR SELECT USING (bucket_id = 'blog-imagens');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'blog_imagens_insert'
  ) THEN
    CREATE POLICY blog_imagens_insert ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'blog-imagens');
  END IF;
END $$;
