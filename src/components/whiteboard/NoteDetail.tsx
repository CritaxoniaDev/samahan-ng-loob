'use client'

import { useEffect } from 'react';
import { ExternalLink, Pause, Play } from 'lucide-react';
import type { Note, Song } from '@/lib/db';
import { cn } from '@/lib/utils';
import { noteFont } from '@/utils/fonts';
import { splitNote } from './format';
import { getTheme, paperStyle } from './themes';
import { pauseClip, playClip, stopClip, useClip } from './audio';

// The opened note, drawn as the same piece of paper it is on the wall.
export function NoteDetail({ note }: { note: Note }) {
  const { body, author } = splitNote(note.text);
  const font = noteFont(note.font);
  const theme = getTheme(note.theme);

  return (
    <div className="space-y-3">
      <div
        className="relative rounded-[4px] px-7 pb-5 pt-10"
        style={{
          ...paperStyle(theme, note.color),
          boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.15)',
        }}
      >
        <span
          aria-hidden
          className="absolute -top-3.5 left-1/2 h-7 w-24 -translate-x-1/2 -rotate-2 border border-black/5"
          style={{ background: theme.tape }}
        />

        {note.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={note.image_url}
            alt={author ? `Photo shared by ${author}` : 'Photo shared with this note'}
            className="mb-5 max-h-[45vh] w-full rounded-[3px] bg-black/5 object-contain"
          />
        )}

        <p
          className="max-h-[40vh] overflow-y-auto whitespace-pre-wrap break-words py-1 leading-[1.45]"
          style={{ fontFamily: font.family, fontSize: Math.round(28 * font.scale) }}
        >
          {body}
        </p>
        <div
          className="mt-6 flex items-center justify-between gap-3 border-t pt-3 text-xs"
          style={{ color: theme.muted, borderColor: theme.muted }}
        >
          <span className="truncate">{author ? `— ${author}` : 'anonymous'}</span>
          <span className="shrink-0">{note.timestamp}</span>
        </div>
      </div>

      {note.song && <SongPlayer song={note.song} />}
    </div>
  );
}

// Plays the note's clip softly in the background while it's open.
function SongPlayer({ song }: { song: Song }) {
  const { playing, progress } = useClip(song.preview_url);

  useEffect(() => {
    playClip(song.preview_url);
    return stopClip;
  }, [song.preview_url]);

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/95 p-2.5 pr-3 text-foreground shadow-xl backdrop-blur">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={song.artwork}
        alt=""
        className={cn(
          'h-12 w-12 shrink-0 rounded-full object-cover shadow-md ring-2 ring-border motion-safe:animate-[spin_8s_linear_infinite]',
          !playing && '[animation-play-state:paused]'
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{song.title}</p>
        <p className="truncate text-xs text-muted-foreground">{song.artist}</p>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-foreground transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
      <button
        onClick={() => (playing ? pauseClip() : playClip(song.preview_url))}
        aria-label={playing ? 'Pause song' : 'Play song'}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foreground text-background transition-opacity hover:opacity-90"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
      </button>
      <a
        href={song.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open in Apple Music"
        title="Open in Apple Music"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}
