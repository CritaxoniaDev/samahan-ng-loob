'use client'

import { LayoutList, StickyNote } from 'lucide-react';
import { setView, useView, type View } from '@/lib/view';
import { cn } from '@/lib/utils';

const OPTIONS: { value: View; label: string; icon: typeof StickyNote }[] = [
  { value: 'wall', label: 'Wall', icon: StickyNote },
  { value: 'classic', label: 'Classic', icon: LayoutList },
];

// Toggle between the full-screen wall and the classic scrolling page.
export function ViewSwitcher({ className }: { className?: string }) {
  const view = useView();

  const choose = (next: View) => {
    if (next === view) return;
    setView(next);
    window.scrollTo({ top: 0 });
  };

  return (
    <div
      role="radiogroup"
      aria-label="Layout"
      className={cn(
        'flex h-11 items-center gap-0.5 rounded-full border border-border/60 bg-background/75 p-1 shadow-sm backdrop-blur-md',
        className
      )}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          role="radio"
          aria-checked={view === value}
          aria-label={`${label} view`}
          title={`${label} view`}
          onClick={() => choose(value)}
          className={cn(
            'flex h-full items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors',
            view === value ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
