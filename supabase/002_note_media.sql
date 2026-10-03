-- Run once in the Supabase SQL editor (after schema.sql).
-- Adds per-note themes, photos and song clips.

alter table public.notes
  add column if not exists theme text,
  add column if not exists image_url text,
  add column if not exists song jsonb;

-- Public bucket for note photos: anyone can view, visitors can upload
-- (max 5 MB, images only). Nobody can overwrite or delete through the API.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('note-images', 'note-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "Public can upload note images"
  on storage.objects for insert to anon
  with check (bucket_id = 'note-images');
