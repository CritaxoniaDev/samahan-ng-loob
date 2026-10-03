'use client'

import { useEffect, useState } from 'react';
import { Ghost } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const TEASE_DAYS = 45;

// Days until this year's Halloween, or null outside the teaser window.
const daysUntilHalloween = (now = new Date()) => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const halloween = new Date(now.getFullYear(), 9, 31);
  const days = Math.round((halloween.getTime() - today.getTime()) / 86_400_000);
  return days >= 0 && days <= TEASE_DAYS ? days : null;
};

const PREVIEW_NOTES = [
  { label: 'boo.', paper: '#f97316', ink: '#1c0a00', rotate: -6 },
  { label: 'trick or treat?', paper: '#e9e4f5', ink: '#2e1065', rotate: 3 },
  { label: 'naaalala kita', paper: '#3b2f2a', ink: '#fde68a', rotate: -2 },
];

// Toolbar teaser for the upcoming Halloween / Undas edition of the wall.
export function HalloweenTeaser() {
  // Computed after mount so server and client render the same markup.
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => setDays(daysUntilHalloween()), []);

  if (days === null) return null;

  return (
    <>
      <span className="mx-1 h-6 w-px bg-border" />
      <Popover>
        <PopoverTrigger asChild>
          <button
            title="Halloween theme — coming soon"
            aria-label="Halloween theme, coming soon"
            className="relative flex h-10 items-center gap-2 rounded-full px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted data-[state=open]:text-foreground"
          >
            <Ghost className="h-4 w-4 shrink-0 motion-safe:animate-[float_3s_ease-in-out_infinite]" />
            <span className="hidden rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide text-white sm:inline">
              Soon
            </span>
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500 sm:hidden" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          sideOffset={14}
          collisionPadding={16}
          className="w-[min(20rem,calc(100vw-2rem))] overflow-hidden p-0"
        >
          {/* a peek at the spooky wall */}
          <div
            className="relative flex h-32 items-center justify-center gap-3 overflow-hidden"
            style={{
              background:
                'radial-gradient(circle at 50% 120%, rgba(249,115,22,0.45), transparent 60%), radial-gradient(circle at 85% 15%, rgba(255,255,255,0.12), transparent 25%), #0f0b14',
            }}
          >
            <span aria-hidden className="absolute right-6 top-4 h-6 w-6 rounded-full bg-amber-100/90 shadow-[0_0_24px_rgba(254,243,199,0.6)]" />
            {PREVIEW_NOTES.map((note) => (
              <span
                key={note.label}
                className="grid h-16 w-16 place-items-center rounded-[2px] p-1.5 text-center text-[13px] leading-tight shadow-lg"
                style={{
                  background: note.paper,
                  color: note.ink,
                  transform: `rotate(${note.rotate}deg)`,
                  fontFamily: 'var(--font-caveat), cursive',
                }}
              >
                {note.label}
              </span>
            ))}
          </div>

          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">Halloween &amp; Undas edition</p>
              <span className="shrink-0 rounded-full bg-orange-500/15 px-2 py-0.5 text-[11px] font-medium text-orange-600 dark:text-orange-400">
                Coming soon
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A spooky, candlelit wall with new paper styles — and a quiet corner to remember the people we miss.
            </p>
            <p
              className={cn('text-center text-2xl', days === 0 ? 'text-orange-500' : 'text-foreground')}
              style={{ fontFamily: 'var(--font-caveat), cursive' }}
            >
              {days === 0 ? 'happy halloween! 🎃' : `${days} ${days === 1 ? 'day' : 'days'} until Halloween`}
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
