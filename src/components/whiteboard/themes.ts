import type { CSSProperties } from 'react';

export interface NoteTheme {
  id: string;
  label: string;
  // `null` paper means "use the note's own paper shade" (the classic look).
  paper: string | null;
  pattern: string;
  patternSize?: string;
  ink: string;
  muted: string;
  tape: string;
}

const SHEEN = 'linear-gradient(170deg, rgba(255,255,255,0.45), rgba(255,255,255,0) 40%, rgba(0,0,0,0.04))';

export const NOTE_THEMES: NoteTheme[] = [
  {
    id: 'classic',
    label: 'Classic',
    paper: null,
    pattern: SHEEN,
    ink: '#171717',
    muted: '#737373',
    tape: 'rgba(163,163,163,0.3)',
  },
  {
    id: 'lined',
    label: 'Notebook',
    paper: '#fdfcf7',
    pattern:
      'linear-gradient(90deg, transparent 22px, rgba(220,80,80,0.45) 22px, rgba(220,80,80,0.45) 23px, transparent 23px), repeating-linear-gradient(180deg, transparent 0 25px, rgba(80,130,200,0.25) 25px 26px)',
    ink: '#1e2a44',
    muted: '#6b7a99',
    tape: 'rgba(163,163,163,0.3)',
  },
  {
    id: 'kraft',
    label: 'Kraft',
    paper: '#c9a97f',
    pattern: `radial-gradient(rgba(60,35,10,0.08) 1px, transparent 1.2px), ${SHEEN}`,
    patternSize: '5px 5px, 100% 100%',
    ink: '#36240f',
    muted: '#6b5236',
    tape: 'rgba(255,255,255,0.35)',
  },
  {
    id: 'blush',
    label: 'Blush',
    paper: '#fbe1e6',
    pattern: 'radial-gradient(circle at 85% 12%, rgba(255,255,255,0.75), transparent 45%), radial-gradient(circle at 10% 95%, rgba(255,170,190,0.35), transparent 50%)',
    ink: '#5a2533',
    muted: '#a0606f',
    tape: 'rgba(255,255,255,0.5)',
  },
  {
    id: 'midnight',
    label: 'Midnight',
    paper: '#1b1e2b',
    pattern:
      'radial-gradient(1px 1px at 18% 22%, rgba(255,255,255,0.7), transparent), radial-gradient(1px 1px at 72% 14%, rgba(255,255,255,0.5), transparent), radial-gradient(1.5px 1.5px at 84% 58%, rgba(255,255,255,0.6), transparent), radial-gradient(1px 1px at 34% 78%, rgba(255,255,255,0.45), transparent), radial-gradient(circle at 80% 0%, rgba(120,140,255,0.18), transparent 55%)',
    ink: '#f4f1e8',
    muted: 'rgba(244,241,232,0.55)',
    tape: 'rgba(255,255,255,0.18)',
  },
  {
    id: 'polaroid',
    label: 'Polaroid',
    paper: '#fafaf9',
    pattern: SHEEN,
    ink: '#262626',
    muted: '#8a8a8a',
    tape: 'rgba(163,163,163,0.3)',
  },
];

export const getTheme = (id?: string | null) => NOTE_THEMES.find((t) => t.id === id) ?? NOTE_THEMES[0];

// Inline styles for a piece of paper in the given theme.
export const paperStyle = (theme: NoteTheme, fallbackPaper?: string): CSSProperties => ({
  backgroundColor: theme.paper ?? fallbackPaper ?? 'hsl(0, 0%, 94%)',
  backgroundImage: theme.pattern,
  backgroundSize: theme.patternSize,
  color: theme.ink,
});
