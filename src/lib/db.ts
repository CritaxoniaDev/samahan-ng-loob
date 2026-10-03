import { supabase } from './supabase';

export interface Note {
  id?: string;
  text: string;
  x: number;
  y: number;
  color: string;
  timestamp: string;
  font?: string;
  theme?: string | null;
  image_url?: string | null;
  song?: Song | null;
}

// A 30-second preview clip from the iTunes Search API (see app/api/music).
export interface Song {
  id: number;
  title: string;
  artist: string;
  artwork: string;
  preview_url: string;
  url: string;
}

export interface Message {
  id?: string;
  message: string;
  image: string;
  theme: string;
  createdAt: string;
}

export const addNote = async (note: Omit<Note, 'id'>) => {
  // Leave out empty extras so plain notes still save before 002_note_media.sql is run.
  const row = Object.fromEntries(Object.entries(note).filter(([, v]) => v !== null && v !== undefined));
  const { data, error } = await supabase.from('notes').insert(row).select('id').single();
  if (error) throw error;
  return data;
};

export const uploadNoteImage = async (image: Blob) => {
  const ext = image.type === 'image/gif' ? 'gif' : image.type === 'image/png' ? 'png' : image.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `notes/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from('note-images')
    .upload(path, image, { contentType: image.type, cacheControl: '31536000', upsert: false });
  if (error) throw error;
  return supabase.storage.from('note-images').getPublicUrl(path).data.publicUrl;
};

export const getNotes = async (): Promise<Note[]> => {
  // Oldest first: when two notes claim the same grid cell, the earlier one keeps it.
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at')
    .order('id');
  if (error) throw error;
  return data as Note[];
};

// Live updates when someone else pins a note. Requires realtime on the notes table
// (see supabase/schema.sql); without it this simply never fires.
export const subscribeToNotes = (onInsert: (note: Note) => void) => {
  const channel = supabase
    .channel('notes-inserts')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notes' }, (payload) =>
      onInsert(payload.new as Note)
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
};

export const createMessage = async (message: Omit<Message, 'id' | 'createdAt'>) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({ ...message, created_at: new Date().toISOString() })
    .select('id')
    .single();
  if (error) throw error;
  return data.id as string;
};

export const getMessage = async (id: string): Promise<Message | null> => {
  const { data, error } = await supabase
    .from('messages')
    .select('id, message, image, theme, created_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { created_at, ...rest } = data;
  return { ...rest, createdAt: created_at } as Message;
};
