'use client'

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ImagePlus, Loader2, Music2, Palette, Pin, Shuffle, X } from 'lucide-react';
import type { Song } from '@/lib/db';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getRandomFont, noteFont } from '@/utils/fonts';
import { prepareImage } from '@/utils/image';
import { NOTE_SIZE, cellOrigin } from './grid';
import { PAPER_SHADOW } from './NoteCard';
import { NOTE_THEMES, getTheme, paperStyle } from './themes';
import { SongSearch } from './SongPicker';

export const MAX_NOTE_LENGTH = 500;

export interface Draft {
  col: number;
  row: number;
  font: string;
  color: string;
  theme: string;
  image: { blob: Blob; preview: string } | null;
  song: Song | null;
}

interface ComposerProps {
  draft: Draft;
  text: string;
  name: string;
  posting: boolean;
  error: string | null;
  onText: (text: string) => void;
  onName: (name: string) => void;
  onChange: (patch: Partial<Draft>) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

// A blank note written in place, in the cell the visitor picked.
export function Composer({
  draft, text, name, posting, error, onText, onName, onChange, onCancel, onSubmit,
}: ComposerProps) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [imageState, setImageState] = useState<{ busy: boolean; error: string | null }>({ busy: false, error: null });
  const [musicOpen, setMusicOpen] = useState(false);

  const font = noteFont(draft.font);
  const theme = getTheme(draft.theme);
  const { left, top } = cellOrigin(draft.col, draft.row);
  const canPost = text.trim().length > 0 && !posting && !imageState.busy;

  // Focus once the camera has glided over; preventScroll keeps the board from jumping.
  useEffect(() => {
    const t = setTimeout(() => textRef.current?.focus({ preventScroll: true }), 380);
    return () => clearTimeout(t);
  }, [draft.col, draft.row]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Keys typed inside the pickers (rendered in portals) bubble here too; ignore them.
    if (!e.currentTarget.contains(e.target as Node)) return;
    if (e.key === 'Escape') onCancel();
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && canPost) onSubmit();
  };

  const pickImage = async (file?: File) => {
    if (!file) return;
    setImageState({ busy: true, error: null });
    try {
      const blob = await prepareImage(file);
      if (draft.image) URL.revokeObjectURL(draft.image.preview);
      onChange({ image: { blob, preview: URL.createObjectURL(blob) } });
      setImageState({ busy: false, error: null });
    } catch (e) {
      setImageState({ busy: false, error: (e as Error).message });
    }
  };

  const removeImage = () => {
    if (draft.image) URL.revokeObjectURL(draft.image.preview);
    onChange({ image: null });
  };

  // Dark paper needs light tints for chips and highlights.
  const tint = theme.id === 'midnight' ? 'bg-white/15' : 'bg-black/[0.08]';
  const hoverTint = theme.id === 'midnight' ? 'hover:bg-white/15' : 'hover:bg-black/10';
  const toolClass = (active: boolean) =>
    cn(
      'grid h-7 w-7 place-items-center rounded-full transition-colors',
      hoverTint,
      active ? cn(tint, 'opacity-100') : 'opacity-60 hover:opacity-100'
    );

  return (
    <motion.div
      data-composer
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={onKeyDown}
      className="absolute z-20 flex cursor-auto select-text flex-col rounded-[3px] px-4 pb-3 pt-6"
      style={{
        left,
        top,
        width: NOTE_SIZE,
        minHeight: NOTE_SIZE,
        ...paperStyle(theme, draft.color),
        boxShadow: `${PAPER_SHADOW}, 0 0 0 2px hsl(var(--foreground) / 0.85), 0 24px 60px -12px rgba(0,0,0,0.45)`,
      }}
      initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    >
      <span aria-hidden className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 border border-black/5" style={{ background: theme.tape }} />

      {draft.image && (
        <div className={cn('relative mb-2', theme.id === 'polaroid' && '-mx-1')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={draft.image.preview} alt="" draggable={false} className="h-28 w-full rounded-[2px] object-cover" />
          <button
            onClick={removeImage}
            aria-label="Remove photo"
            className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <textarea
        ref={textRef}
        value={text}
        onChange={(e) => onText(e.target.value)}
        maxLength={MAX_NOTE_LENGTH}
        placeholder="Ibuhos mo ang iyong saloobin..."
        aria-label="Your thought"
        className={cn(
          'flex-1 resize-none bg-transparent leading-[1.15] outline-none placeholder:opacity-50',
          draft.image ? 'min-h-[64px]' : 'min-h-[96px]'
        )}
        style={{ fontFamily: font.family, fontSize: Math.round((draft.image ? 18 : 22) * font.scale), color: theme.ink }}
      />

      <input
        value={name}
        onChange={(e) => onName(e.target.value)}
        maxLength={40}
        placeholder="— pangalan (opsyonal)"
        aria-label="Your name (optional)"
        className="mt-1 border-b bg-transparent py-1 text-[13px] outline-none placeholder:opacity-50"
        style={{ borderColor: theme.muted, color: theme.ink }}
      />

      {draft.song && (
        <div className={cn('mt-2 flex items-center gap-2 rounded-md p-1 pr-1.5', tint)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={draft.song.artwork} alt="" className="h-7 w-7 shrink-0 rounded-[4px] object-cover" />
          <span className="min-w-0 flex-1 text-[11px] leading-tight">
            <span className="block truncate font-medium">{draft.song.title}</span>
            <span className="block truncate" style={{ color: theme.muted }}>{draft.song.artist}</span>
          </span>
          <button onClick={() => onChange({ song: null })} aria-label="Remove song" className={cn('grid h-5 w-5 place-items-center rounded-full', hoverTint)}>
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {(imageState.error || error) && (
        <p className="mt-2 rounded-md bg-neutral-900 px-2 py-1 text-center text-[11px] text-white">
          {imageState.error ?? error}
        </p>
      )}

      {/* extras */}
      <div className="mt-2 flex items-center gap-0.5" style={{ color: theme.ink }}>
        <Popover>
          <PopoverTrigger asChild>
            <button title="Paper theme" aria-label="Paper theme" className={toolClass(draft.theme !== 'classic')}>
              <Palette className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" sideOffset={10} collisionPadding={16} className="w-64 p-3">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Paper</p>
            <div className="grid grid-cols-3 gap-2">
              {NOTE_THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onChange({ theme: t.id })}
                  className="group flex flex-col items-center gap-1.5 rounded-lg p-1.5 text-xs transition-colors hover:bg-muted"
                >
                  <span
                    className={cn(
                      'relative grid h-12 w-full place-items-center rounded-[3px] shadow-sm ring-offset-2 ring-offset-popover',
                      draft.theme === t.id && 'ring-2 ring-foreground'
                    )}
                    style={paperStyle(t, draft.color)}
                  >
                    <span className="text-lg leading-none" style={{ fontFamily: font.family }}>Aa</span>
                    {draft.theme === t.id && (
                      <Check className="absolute right-1 top-1 h-3 w-3" />
                    )}
                  </span>
                  {t.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <button
          title="Add a photo"
          aria-label="Add a photo"
          onClick={() => fileRef.current?.click()}
          className={toolClass(!!draft.image)}
          disabled={imageState.busy}
        >
          {imageState.busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            pickImage(e.target.files?.[0]);
            e.target.value = '';
          }}
        />

        <Popover open={musicOpen} onOpenChange={setMusicOpen}>
          <PopoverTrigger asChild>
            <button title="Add a song" aria-label="Add a song" className={toolClass(!!draft.song)}>
              <Music2 className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" sideOffset={10} collisionPadding={16} className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden p-0">
            <SongSearch
              onPick={(song) => {
                onChange({ song });
                setMusicOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>

        <button
          type="button"
          onClick={() => onChange({ font: nextFont(draft.font) })}
          title="Try another handwriting"
          aria-label="Try another handwriting"
          className={toolClass(false)}
        >
          <Shuffle className="h-3.5 w-3.5" />
        </button>

        <span className="ml-auto text-[10px] tabular-nums" style={{ color: theme.muted }}>
          {text.length}/{MAX_NOTE_LENGTH}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={onCancel}
          title="Discard (Esc)"
          className={cn('h-7 rounded-full px-3 text-xs transition-colors', hoverTint)}
          style={{ color: theme.muted }}
        >
          Discard
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canPost}
          title="Pin it (Ctrl + Enter)"
          className={cn(
            'flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-opacity disabled:opacity-30',
            theme.id === 'midnight' ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'
          )}
        >
          {posting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Pin className="h-3 w-3" />}
          {posting ? 'Pinning…' : 'Pin it'}
        </button>
      </div>
    </motion.div>
  );
}

// A different handwriting from the current one.
const nextFont = (current: string) => {
  for (let i = 0; i < 5; i++) {
    const font = getRandomFont();
    if (font !== current) return font;
  }
  return current;
};
