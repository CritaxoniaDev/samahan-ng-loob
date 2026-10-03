'use client'

import { useEffect, useState } from 'react';
import { Loader2, Music2, Pause, Play, Search } from 'lucide-react';
import type { Song } from '@/lib/db';
import { cn } from '@/lib/utils';
import { playClip, pauseClip, stopClip, useClip } from './audio';

// Search body for the composer's music popover.
export function SongSearch({ onPick }: { onPick: (song: Song) => void }) {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSongs([]);
      setStatus('idle');
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      setStatus('loading');
      try {
        const res = await fetch(`/api/music?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const data = await res.json();
        setSongs(data.songs ?? []);
        setStatus(res.ok ? 'idle' : 'error');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setStatus('error');
      }
    }, 350);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  // Stop any preview when the picker closes.
  useEffect(() => stopClip, []);

  return (
    <div>
      <div className="border-b border-border p-3">
        <label className="flex h-10 items-center gap-2 rounded-xl bg-muted/60 px-3 focus-within:ring-2 focus-within:ring-ring">
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="sr-only">Search songs</span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a song or artist…"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      <div className="max-h-72 overflow-y-auto overscroll-contain p-1.5">
        {!query.trim() && (
          <p className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
            <Music2 className="h-5 w-5" />
            Add a 30-second clip that plays when someone opens your note.
          </p>
        )}
        {status === 'error' && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Music search is unavailable right now.</p>
        )}
        {status === 'idle' && query.trim() && songs.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No songs found.</p>
        )}
        {songs.map((song) => (
          <SongRow key={song.id} song={song} onPick={() => onPick(song)} />
        ))}
      </div>

      <p className="border-t border-border px-4 py-2 text-[10px] text-muted-foreground">Previews provided by Apple Music</p>
    </div>
  );
}

function SongRow({ song, onPick }: { song: Song; onPick: () => void }) {
  const { playing } = useClip(song.preview_url);
  return (
    <div className="group flex items-center gap-1 rounded-lg pr-1 transition-colors hover:bg-muted">
      <button onClick={onPick} className="flex min-w-0 flex-1 items-center gap-3 p-1.5 text-left">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={song.artwork} alt="" className="h-10 w-10 shrink-0 rounded-md bg-muted object-cover" />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{song.title}</span>
          <span className="block truncate text-xs text-muted-foreground">{song.artist}</span>
        </span>
      </button>
      <button
        onClick={() => (playing ? pauseClip() : playClip(song.preview_url, 0.6))}
        aria-label={playing ? `Pause preview of ${song.title}` : `Preview ${song.title}`}
        className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors hover:bg-background',
          playing ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
    </div>
  );
}
