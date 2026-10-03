'use client'

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Music2 } from 'lucide-react';
import type { Note } from '@/lib/db';
import { noteFont } from '@/utils/fonts';
import { NOTE_SIZE, cellOrigin, type PlacedNote } from './grid';
import { dayKey, formatDayLabel, noteFontSize, splitNote } from './format';
import { getTheme, paperStyle } from './themes';

export const PAPER_SHADOW =
  '0 1px 1px rgba(0,0,0,0.08), 0 10px 20px -8px rgba(0,0,0,0.35), 0 2px 6px -2px rgba(0,0,0,0.12)';

interface NoteCardProps {
  placed: PlacedNote;
  index: number;
  dimmed: boolean;
  onOpen: (note: Note) => void;
}

export const NoteCard = memo(function NoteCard({ placed, index, dimmed, onOpen }: NoteCardProps) {
  const { note, col, row, rotate, dx, dy } = placed;
  const { body, author } = splitNote(note.text);
  const font = noteFont(note.font);
  const theme = getTheme(note.theme);
  const { left, top } = cellOrigin(col, row);
  const day = dayKey(note.timestamp);
  const fontSize = Math.round(noteFontSize(body.length) * font.scale * (note.image_url ? 0.75 : 1));

  return (
    <motion.button
      type="button"
      data-note
      onClick={() => onOpen(note)}
      aria-label={`Note${author ? ` by ${author}` : ''}${note.song ? `, with song ${note.song.title}` : ''}: ${body.slice(0, 80)}`}
      tabIndex={dimmed ? -1 : 0}
      className="absolute flex flex-col rounded-[3px] px-5 pb-3 pt-7 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
      style={{
        left: left + dx,
        top: top + dy,
        width: NOTE_SIZE,
        height: NOTE_SIZE,
        ...paperStyle(theme, note.color),
        boxShadow: PAPER_SHADOW,
        pointerEvents: dimmed ? 'none' : 'auto',
        ...(note.image_url && { paddingTop: 18, paddingLeft: 12, paddingRight: 12 }),
      }}
      initial={{ opacity: 0, scale: 0.8, y: 14, rotate: rotate * 2 }}
      animate={{ opacity: dimmed ? 0.1 : 1, scale: 1, y: 0, rotate }}
      whileHover={{ scale: 1.05, rotate: 0, zIndex: 10, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay: Math.min(index * 0.02, 0.4) }}
    >
      {/* tape */}
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 z-10 h-6 w-20 border border-black/5 backdrop-blur-[1px]"
        style={{ background: theme.tape, transform: `translateX(-50%) rotate(${-rotate * 0.8}deg)` }}
      />

      {note.song && (
        <span
          aria-hidden
          className="absolute -right-2 -top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-neutral-900 text-white shadow-md ring-2 ring-white/80"
        >
          <Music2 className="h-3.5 w-3.5" />
        </span>
      )}

      {note.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={note.image_url}
          alt=""
          loading="lazy"
          draggable={false}
          className="mb-2 h-[104px] w-full shrink-0 rounded-[2px] bg-black/5 object-cover"
        />
      )}

      <p
        className="flex-1 overflow-hidden whitespace-pre-wrap break-words leading-[1.15]"
        style={{
          fontFamily: font.family,
          fontSize,
          maskImage: 'linear-gradient(to bottom, black 78%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 78%, transparent)',
        }}
      >
        {body}
      </p>

      <span className="mt-2 flex items-center justify-between gap-2 text-[11px]" style={{ color: theme.muted }}>
        <span className="truncate">{author ? `— ${author}` : 'anonymous'}</span>
        <span className="shrink-0">{day === 'unknown' ? '' : formatDayLabel(day)}</span>
      </span>
    </motion.button>
  );
});
