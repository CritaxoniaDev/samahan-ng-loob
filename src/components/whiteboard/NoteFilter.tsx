'use client'

import { useMemo, useState } from 'react';
import { Check, Search, SlidersHorizontal, X } from 'lucide-react';
import type { Note } from '@/lib/db';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { dayKey, formatDayLabel } from './format';

export interface NoteFilter {
  day: string; // 'all' or a dayKey
  query: string;
}

export const NO_FILTER: NoteFilter = { day: 'all', query: '' };

export const isFiltering = (filter: NoteFilter) => filter.day !== 'all' || filter.query.trim() !== '';

const matchesQuery = (note: Note, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [note.text, note.song?.title, note.song?.artist].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes(q);
};

export const matchesFilter = (note: Note, filter: NoteFilter) =>
  (filter.day === 'all' || dayKey(note.timestamp) === filter.day) && matchesQuery(note, filter.query);

// Short summary for the trigger and the active-filter chip.
export const describeFilter = (filter: NoteFilter) =>
  [filter.day !== 'all' && formatDayLabel(filter.day), filter.query.trim() && `“${filter.query.trim()}”`]
    .filter(Boolean)
    .join(' · ');

interface NoteFilterPopoverProps {
  notes: Note[];
  filter: NoteFilter;
  matchCount: number;
  onChange: (filter: NoteFilter) => void;
  onShow: (filter: NoteFilter) => void;
}

export function NoteFilterPopover({ notes, filter, matchCount, onChange, onShow }: NoteFilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const active = isFiltering(filter);

  // Days that have notes (newest first), counted against the current search.
  const days = useMemo(() => {
    const counts = new Map<string, number>();
    for (const note of notes) {
      const key = dayKey(note.timestamp);
      counts.set(key, (counts.get(key) ?? 0) + (matchesQuery(note, filter.query) ? 1 : 0));
    }
    return [...counts.entries()].sort(([a], [b]) => {
      if (a === 'unknown') return 1;
      if (b === 'unknown') return -1;
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }, [notes, filter.query]);

  const searchCount = notes.filter((n) => matchesQuery(n, filter.query)).length;

  const show = (next: NoteFilter) => {
    onShow(next);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Filter notes"
          className={cn(
            'relative flex h-10 items-center gap-2 rounded-full px-3 text-sm transition-colors hover:bg-muted hover:text-foreground',
            active || open ? 'bg-muted text-foreground' : 'text-muted-foreground'
          )}
        >
          <SlidersHorizontal className="h-4 w-4 shrink-0" />
          <span className="hidden max-w-[140px] truncate sm:inline">{active ? describeFilter(filter) : 'Filter'}</span>
          {active && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-foreground sm:hidden" />}
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={14}
        collisionPadding={16}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-[min(20rem,calc(100vw-2rem))] overflow-hidden p-0"
      >
        <div className="border-b border-border p-3">
          <label className="flex h-10 items-center gap-2 rounded-xl bg-muted/60 px-3 focus-within:ring-2 focus-within:ring-ring">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="sr-only">Search notes</span>
            <input
              value={filter.query}
              onChange={(e) => onChange({ ...filter, query: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && matchCount > 0 && show(filter)}
              placeholder="Search words, names or songs…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {filter.query && (
              <button
                aria-label="Clear search"
                onClick={() => onChange({ ...filter, query: '' })}
                className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </label>
        </div>

        <p className="px-4 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">When</p>
        <div className="max-h-60 overflow-y-auto overscroll-contain px-1.5 pb-1.5" role="listbox" aria-label="Day">
          <DayOption
            label="All days"
            count={searchCount}
            selected={filter.day === 'all'}
            onSelect={() => show({ ...filter, day: 'all' })}
          />
          {days.map(([day, count]) => (
            <DayOption
              key={day}
              label={formatDayLabel(day)}
              count={count}
              selected={filter.day === day}
              onSelect={() => show({ ...filter, day })}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border p-2">
          <button
            onClick={() => show(NO_FILTER)}
            disabled={!active}
            className="h-9 rounded-full px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            Reset
          </button>
          <button
            onClick={() => show(filter)}
            disabled={matchCount === 0}
            className="h-9 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {matchCount === 0 ? 'No matches' : `Show ${matchCount} ${matchCount === 1 ? 'note' : 'notes'}`}
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function DayOption({
  label, count, selected, onSelect,
}: { label: string; count: number; selected: boolean; onSelect: () => void }) {
  return (
    <button
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      disabled={count === 0 && !selected}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-35',
        selected && 'bg-muted font-medium'
      )}
    >
      <Check className={cn('h-4 w-4 shrink-0', selected ? 'opacity-100' : 'opacity-0')} />
      <span className="flex-1 truncate">{label}</span>
      <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
    </button>
  );
}
