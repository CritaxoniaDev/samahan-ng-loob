'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Maximize2, Minus, Moon, PenLine, Plus, Sun, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { addNote, getNotes, subscribeToNotes, uploadNoteImage, type Note } from '@/lib/db';
import { getRandomFont } from '@/utils/fonts';
import { cn } from '@/lib/utils';
import { CELL, NOTE_SIZE, TITLE, cellKey, cellOrigin, isReserved, layoutNotes, nearestFreeCell } from './grid';
import { NO_FILTER, NoteFilterPopover, describeFilter, isFiltering, matchesFilter, type NoteFilter } from './NoteFilter';
import { NoteCard } from './NoteCard';
import { Composer, type Draft } from './Composer';
import { NoteDetail } from './NoteDetail';
import { HalloweenTeaser } from './HalloweenTeaser';

// Screen = world * z + (x, y)
interface Camera {
  x: number;
  y: number;
  z: number;
}

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 2;
const DRAG_THRESHOLD = 5;
const HANDWRITING = 'var(--font-caveat), var(--font-kalam), cursive';

const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

// Soft off-white / light-gray paper shades, matching the monochrome theme.
const paperColor = () => `hsl(0, 0%, ${Math.floor(Math.random() * 12) + 86}%)`;

export function Whiteboard() {
  const boardRef = useRef<HTMLDivElement>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [filter, setFilter] = useState<NoteFilter>(NO_FILTER);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [draftText, setDraftText] = useState('');
  const [draftName, setDraftName] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const [hoverCell, setHoverCell] = useState<[number, number] | null>(null);
  const [panning, setPanning] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [ready, setReady] = useState(false);

  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ---------- camera ----------

  const [cam, setCam] = useState<Camera>({ x: 0, y: 0, z: 1 });
  const camRef = useRef(cam);
  const updateCam = useCallback((next: (c: Camera) => Camera) => {
    camRef.current = next(camRef.current);
    setCam(camRef.current);
  }, []);

  const tweenRef = useRef<number | null>(null);
  const stopTween = useCallback(() => {
    if (tweenRef.current !== null) cancelAnimationFrame(tweenRef.current);
    tweenRef.current = null;
  }, []);

  const flyTo = useCallback(
    (target: Camera, ms = 600) => {
      stopTween();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        updateCam(() => target);
        return;
      }
      const from = camRef.current;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / ms);
        const e = 1 - Math.pow(1 - t, 3);
        updateCam(() => ({
          x: from.x + (target.x - from.x) * e,
          y: from.y + (target.y - from.y) * e,
          z: from.z + (target.z - from.z) * e,
        }));
        tweenRef.current = t < 1 ? requestAnimationFrame(step) : null;
      };
      tweenRef.current = requestAnimationFrame(step);
    },
    [stopTween, updateCam]
  );

  const viewport = () => ({
    w: boardRef.current?.clientWidth ?? window.innerWidth,
    h: boardRef.current?.clientHeight ?? window.innerHeight,
  });

  // Camera that puts world point (wx, wy) at the middle of the screen.
  const centeredOn = useCallback((wx: number, wy: number, z: number): Camera => {
    const { w, h } = viewport();
    return { x: w / 2 - wx * z, y: h / 2 - wy * z, z };
  }, []);

  const zoomAt = useCallback(
    (sx: number, sy: number, factor: number) => {
      updateCam((c) => {
        const z = clampZoom(c.z * factor);
        const k = z / c.z;
        return { x: sx - (sx - c.x) * k, y: sy - (sy - c.y) * k, z };
      });
    },
    [updateCam]
  );

  const zoomFromCenter = (factor: number) => {
    stopTween();
    const { w, h } = viewport();
    const c = camRef.current;
    const z = clampZoom(c.z * factor);
    const k = z / c.z;
    flyTo({ x: w / 2 - (w / 2 - c.x) * k, y: h / 2 - (h / 2 - c.y) * k, z }, 250);
  };

  const toWorld = (sx: number, sy: number) => {
    const c = camRef.current;
    return { x: (sx - c.x) / c.z, y: (sy - c.y) / c.z };
  };

  // ---------- notes ----------

  const placed = useMemo(() => layoutNotes(notes), [notes]);
  const occupied = useMemo(() => new Set(placed.map((p) => p.key)), [placed]);

  const fetchNotes = useCallback(async () => {
    try {
      setNotes(await getNotes());
      setLoadState('ready');
    } catch (error) {
      console.error('Error loading notes:', error);
      setLoadState('error');
    }
  }, []);

  useEffect(() => {
    fetchNotes();
    return subscribeToNotes((note) =>
      setNotes((prev) =>
        prev.some((n) => n.id === note.id || (n.id?.startsWith('temp-') && n.x === note.x && n.y === note.y))
          ? prev
          : [...prev, note]
      )
    );
  }, [fetchNotes]);

  // Fit a world rectangle on screen, leaving room for the toolbar.
  const fitBounds = useCallback(
    (minX: number, minY: number, maxX: number, maxY: number, maxZoom = 1) => {
      const { w, h } = viewport();
      const pad = w < 640 ? 24 : 80;
      const z = clampZoom(Math.min((w - pad * 2) / (maxX - minX), (h - pad * 2 - 80) / (maxY - minY), maxZoom));
      flyTo({ x: (w - (minX + maxX) * z) / 2, y: (h - 80 - (minY + maxY) * z) / 2 + 20, z });
    },
    [flyTo]
  );

  const fitCells = useCallback(
    (cells: { col: number; row: number }[], includeTitle: boolean) => {
      const all = includeTitle
        ? [...cells, { col: TITLE.minCol, row: TITLE.minRow }, { col: TITLE.maxCol, row: TITLE.maxRow }]
        : cells;
      if (!all.length) return;
      const cols = all.map((c) => c.col);
      const rows = all.map((c) => c.row);
      fitBounds(
        Math.min(...cols) * CELL,
        Math.min(...rows) * CELL,
        (Math.max(...cols) + 1) * CELL,
        (Math.max(...rows) + 1) * CELL
      );
    },
    [fitBounds]
  );

  // Initial view: the title centred at a comfortable size.
  useEffect(() => {
    const showTitle = () => {
      const { w, h } = viewport();
      updateCam(() => centeredOn(0, 0, Math.max(0.3, Math.min(w / 1400, h / 950, 0.9))));
    };
    showTitle();
    setReady(true);

    let last = viewport();
    const onResize = () => {
      const next = viewport();
      // A tab opened in the background can mount with no size; frame the title once it has one.
      if (last.w === 0 || last.h === 0) showTitle();
      else updateCam((c) => ({ ...c, x: c.x + (next.w - last.w) / 2, y: c.y + (next.h - last.h) / 2 }));
      last = next;
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [centeredOn, updateCam]);

  // ---------- composing ----------

  const openComposer = useCallback(
    (col: number, row: number) => {
      setShowHint(false);
      setPostError(null);
      setDraft((prev) => (prev ? { ...prev, col, row } : { col, row, font: getRandomFont(), color: paperColor(), theme: 'classic', image: null, song: null }));
      const z = Math.max(camRef.current.z, viewport().w < 640 ? 1.15 : 1);
      // Sit a little above centre so the on-screen keyboard doesn't cover it on phones.
      flyTo(centeredOn((col + 0.5) * CELL, (row + 0.5) * CELL + (viewport().w < 640 ? 70 : 0), z));
    },
    [centeredOn, flyTo]
  );

  const writeNearCenter = () => {
    const { w, h } = viewport();
    const world = toWorld(w / 2, h / 2);
    const [col, row] = draft
      ? [draft.col, draft.row]
      : nearestFreeCell(world.x / CELL, world.y / CELL, occupied);
    openComposer(col, row);
  };

  const closeComposer = () => {
    if (draft?.image) URL.revokeObjectURL(draft.image.preview);
    setDraft(null);
    setPostError(null);
  };

  const postNote = async () => {
    if (!draft || !draftText.trim() || posting) return;
    if (occupied.has(cellKey(draft.col, draft.row))) {
      setPostError('Someone just pinned a note here. Pick another spot.');
      return;
    }

    setPosting(true);
    setPostError(null);

    // Upload the photo first; if that fails the draft stays open with everything intact.
    let imageUrl: string | null = null;
    if (draft.image) {
      try {
        imageUrl = await uploadNoteImage(draft.image.blob);
      } catch (error) {
        console.error('Error uploading image:', error);
        setPostError("Couldn't upload your photo. Try again or remove it.");
        setPosting(false);
        return;
      }
    }

    const note: Note = {
      text: draftName.trim() ? `${draftText.trim()}\n- ${draftName.trim()}` : draftText.trim(),
      x: draft.col,
      y: draft.row,
      color: draft.color,
      timestamp: new Date().toLocaleString(),
      font: draft.font,
      theme: draft.theme === 'classic' ? null : draft.theme,
      image_url: imageUrl,
      song: draft.song,
    };
    const tempId = `temp-${Date.now()}`;

    setNotes((prev) => [...prev, { ...note, id: tempId }]);
    setDraft(null);

    try {
      const { id } = await addNote(note);
      setNotes((prev) => {
        const rest = prev.filter((n) => n.id !== tempId);
        return rest.some((n) => n.id === id) ? rest : [...rest, { ...note, id }];
      });
      if (draft.image) URL.revokeObjectURL(draft.image.preview);
      setDraftText('');
      setDraftName('');
    } catch (error) {
      console.error('Error adding note:', error);
      setNotes((prev) => prev.filter((n) => n.id !== tempId));
      setDraft(draft);
      setPostError("Couldn't pin your note. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  // ---------- pointer: pan, pinch, tap-to-write ----------

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ startX: 0, startY: 0, moved: false, pinchDist: 0, midX: 0, midY: 0 });
  const suppressClick = useRef(false);

  const cellAt = (sx: number, sy: number): [number, number] => {
    const world = toWorld(sx, sy);
    return [Math.floor(world.x / CELL), Math.floor(world.y / CELL)];
  };

  const isFree = (col: number, row: number) => !isReserved(col, row) && !occupied.has(cellKey(col, row));

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    stopTween();
    suppressClick.current = false;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const g = gesture.current;
    if (pointers.current.size === 1) {
      Object.assign(g, { startX: e.clientX, startY: e.clientY, moved: false });
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      Object.assign(g, {
        moved: true,
        pinchDist: Math.hypot(a.x - b.x, a.y - b.y),
        midX: (a.x + b.x) / 2,
        midY: (a.y + b.y) / 2,
      });
      boardRef.current?.setPointerCapture(e.pointerId);
      setPanning(true);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);

    if (!prev) {
      // Just hovering: reveal the invisible grid cell under the mouse.
      if (e.pointerType !== 'mouse' || (e.target as HTMLElement).closest('[data-note],[data-composer]')) {
        if (hoverCell) setHoverCell(null);
        return;
      }
      const [col, row] = cellAt(e.clientX, e.clientY);
      const next = isFree(col, row) ? ([col, row] as [number, number]) : null;
      if (next?.[0] !== hoverCell?.[0] || next?.[1] !== hoverCell?.[1]) setHoverCell(next);
      return;
    }

    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;

    if (pointers.current.size === 1) {
      if (!g.moved && Math.hypot(e.clientX - g.startX, e.clientY - g.startY) > DRAG_THRESHOLD) {
        g.moved = true;
        boardRef.current?.setPointerCapture(e.pointerId);
        setPanning(true);
        setHoverCell(null);
        setShowHint(false);
      }
      if (g.moved) {
        updateCam((c) => ({ ...c, x: c.x + e.clientX - prev.x, y: c.y + e.clientY - prev.y }));
      }
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      updateCam((c) => {
        const z = clampZoom(c.z * (dist / (g.pinchDist || dist)));
        const k = z / c.z;
        return { x: midX - (g.midX - c.x) * k, y: midY - (g.midY - c.y) * k, z };
      });
      Object.assign(g, { pinchDist: dist, midX, midY });
      setShowHint(false);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    const g = gesture.current;
    const wasTap = pointers.current.size === 1 && !g.moved;
    pointers.current.delete(e.pointerId);

    if (g.moved) suppressClick.current = true;

    if (wasTap && !(e.target as HTMLElement).closest('[data-note],[data-composer]')) {
      const [col, row] = cellAt(e.clientX, e.clientY);
      if (isFree(col, row)) openComposer(col, row);
      else if (draft && !draftText.trim()) closeComposer();
    }

    if (pointers.current.size === 1) {
      // Lifting one finger of a pinch: carry on panning with the other.
      const [rest] = [...pointers.current.values()];
      Object.assign(g, { startX: rest.x, startY: rest.y });
    }
    if (pointers.current.size === 0) setPanning(false);
  };

  // ---------- wheel + keyboard ----------

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const onWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement).closest('[data-composer]')) return;
      e.preventDefault();
      stopTween();
      setShowHint(false);
      const scale = e.deltaMode === 1 ? 16 : 1;
      if (e.ctrlKey || e.metaKey) {
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * scale * 0.01));
      } else {
        updateCam((c) => ({ ...c, x: c.x - e.deltaX * scale, y: c.y - e.deltaY * scale }));
      }
    };
    board.addEventListener('wheel', onWheel, { passive: false });
    return () => board.removeEventListener('wheel', onWheel);
  }, [stopTween, updateCam, zoomAt]);

  const keyActions = useRef<Record<string, () => void>>({});
  keyActions.current = {
    '+': () => zoomFromCenter(1.25),
    '=': () => zoomFromCenter(1.25),
    '-': () => zoomFromCenter(0.8),
    '0': () => fitCells(placed, true),
    n: writeNearCenter,
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inField = e.target instanceof Element && e.target.closest('input, textarea, select, [role="dialog"]');
      if (e.ctrlKey || e.metaKey || e.altKey || inField) return;
      const action = keyActions.current[e.key];
      if (action) {
        e.preventDefault();
        action();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ---------- filtering ----------

  const filtering = isFiltering(filter);
  const matchCount = useMemo(() => notes.filter((n) => matchesFilter(n, filter)).length, [notes, filter]);

  // Fly to the notes that match; with no filter, frame the whole wall.
  const showMatches = (next: NoteFilter) => {
    setFilter(next);
    if (!isFiltering(next)) return fitCells(placed, true);
    const matching = placed.filter((p) => matchesFilter(p.note, next));
    if (matching.length) fitCells(matching, false);
  };

  const notesLayer = useMemo(
    () =>
      placed.map((p, i) => (
        <NoteCard
          key={p.key}
          placed={p}
          index={i}
          dimmed={filtering && !matchesFilter(p.note, filter)}
          onOpen={setSelectedNote}
        />
      )),
    [placed, filter, filtering]
  );

  const ghost = hoverCell && !draft && !panning ? cellOrigin(hoverCell[0], hoverCell[1]) : null;

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="fixed inset-0 overflow-hidden bg-background text-foreground"
        onPointerDownCapture={() => setShowHint(false)}
      >
        {/* the board */}
        <div
          ref={boardRef}
          className={cn(
            'absolute inset-0 touch-none select-none overscroll-none',
            panning ? 'cursor-grabbing' : ghost ? 'cursor-pointer' : 'cursor-grab'
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={() => setHoverCell(null)}
          onClickCapture={(e) => {
            if (suppressClick.current) {
              e.stopPropagation();
              suppressClick.current = false;
            }
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 40%, transparent 0%, transparent 55%, hsl(var(--foreground) / 0.06) 100%)',
            }}
          />

          <div
            className="absolute left-0 top-0 origin-top-left transition-opacity duration-500"
            style={{
              transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.z})`,
              opacity: ready ? 1 : 0,
            }}
          >
            <BoardTitle
              status={loadState}
              empty={loadState === 'ready' && notes.length === 0}
            />

            {ghost && (
              <div
                aria-hidden
                className="pointer-events-none absolute flex flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-foreground/15 text-foreground/35 transition-opacity"
                style={{ left: ghost.left, top: ghost.top, width: NOTE_SIZE, height: NOTE_SIZE }}
              >
                <Plus className="h-7 w-7" strokeWidth={1.5} />
                <span className="text-xl" style={{ fontFamily: HANDWRITING }}>
                  write here
                </span>
              </div>
            )}

            {notesLayer}

            <AnimatePresence>
              {draft && (
                <Composer
                  key="composer"
                  draft={draft}
                  text={draftText}
                  name={draftName}
                  posting={posting}
                  error={postError}
                  onText={setDraftText}
                  onName={setDraftName}
                  onChange={(patch) => setDraft((d) => d && { ...d, ...patch })}
                  onCancel={closeComposer}
                  onSubmit={postNote}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* brand */}
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-3 sm:left-6 sm:top-5">
          <div
            className="pointer-events-auto rounded-2xl border border-border/60 bg-background/75 px-4 py-2 shadow-sm backdrop-blur-md"
            style={{ fontFamily: HANDWRITING }}
          >
            <span className="block text-2xl font-bold leading-none">Samahan</span>
            <span className="-mt-0.5 block text-base leading-none text-muted-foreground">ng loob</span>
          </div>
          {loadState === 'ready' && notes.length > 0 && !filtering && (
            <span className="hidden rounded-full border border-border/60 bg-background/75 px-3 py-1 text-xs text-muted-foreground backdrop-blur-md sm:inline">
              {notes.length} {notes.length === 1 ? 'thought' : 'thoughts'}
            </span>
          )}
        </div>

        {/* active filter */}
        <AnimatePresence>
          {filtering && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="pointer-events-none absolute inset-x-4 top-[88px] flex justify-center sm:top-6"
            >
              <div className="pointer-events-auto flex max-w-full items-center gap-2 rounded-full border border-border/60 bg-background/85 py-1 pl-4 pr-1 text-sm shadow-sm backdrop-blur-md">
                <span className="truncate">
                  <span className="font-medium">{matchCount}</span>
                  <span className="text-muted-foreground"> of {notes.length} · </span>
                  {describeFilter(filter)}
                </span>
                <button
                  aria-label="Clear filter"
                  onClick={() => showMatches(NO_FILTER)}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* theme */}
        <button
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-border/60 bg-background/75 shadow-sm backdrop-blur-md transition-colors hover:bg-muted sm:right-6 sm:top-5"
        >
          {mounted && (resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
        </button>

        {/* first-visit hint */}
        <AnimatePresence>
          {showHint && ready && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.8 } }}
              exit={{ opacity: 0, y: 8 }}
              className="pointer-events-none absolute inset-x-4 bottom-24 flex justify-center"
            >
              <p className="rounded-full bg-foreground px-4 py-2 text-center text-xs text-background shadow-lg">
                <span className="hidden sm:inline">Click any empty spot to leave a note · drag to explore · Ctrl + scroll to zoom</span>
                <span className="sm:hidden">Tap any empty spot to write · pinch to zoom</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* toolbar */}
        <div className="absolute bottom-4 left-1/2 flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-1 rounded-full border border-border/60 bg-background/80 p-1.5 shadow-lg backdrop-blur-md sm:bottom-6">
          <button
            onClick={writeNearCenter}
            className="flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <PenLine className="h-4 w-4" />
            <span className="hidden sm:inline">Write a note</span>
            <span className="sm:hidden">Write</span>
          </button>

          <span className="mx-1 h-6 w-px bg-border" />

          <ToolButton label="Zoom out (-)" onClick={() => zoomFromCenter(0.8)} className="hidden sm:grid">
            <Minus className="h-4 w-4" />
          </ToolButton>
          <button
            onClick={() => {
              const { w, h } = viewport();
              const world = toWorld(w / 2, h / 2);
              flyTo(centeredOn(world.x, world.y, 1), 300);
            }}
            title="Reset to 100%"
            className="hidden h-10 w-12 rounded-full text-xs tabular-nums text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:block"
          >
            {Math.round(cam.z * 100)}%
          </button>
          <ToolButton label="Zoom in (+)" onClick={() => zoomFromCenter(1.25)} className="hidden sm:grid">
            <Plus className="h-4 w-4" />
          </ToolButton>
          <ToolButton label="See the whole wall (0)" onClick={() => fitCells(placed, true)}>
            <Maximize2 className="h-4 w-4" />
          </ToolButton>

          {notes.length > 0 && (
            <>
              <span className="mx-1 h-6 w-px bg-border" />
              <NoteFilterPopover
                notes={notes}
                filter={filter}
                matchCount={matchCount}
                onChange={setFilter}
                onShow={showMatches}
              />
            </>
          )}

          <HalloweenTeaser />
        </div>

        {/* note detail */}
        <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
          <DialogContent className="max-h-[92vh] max-w-md overflow-y-auto border-0 bg-transparent p-0 pt-4 text-neutral-900 shadow-none">
            <DialogHeader>
              <DialogTitle className="sr-only">Note</DialogTitle>
            </DialogHeader>
            {selectedNote && <NoteDetail note={selectedNote} />}
          </DialogContent>
        </Dialog>
      </div>
    </MotionConfig>
  );
}

function ToolButton({
  label, onClick, className, children,
}: { label: string; onClick: () => void; className?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        'grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        className
      )}
    >
      {children}
    </button>
  );
}

// The handwritten heading drawn on the board itself, over the reserved title cells.
function BoardTitle({ status, empty }: { status: 'loading' | 'ready' | 'error'; empty: boolean }) {
  const width = (TITLE.maxCol - TITLE.minCol + 1) * CELL;
  const height = (TITLE.maxRow - TITLE.minRow + 1) * CELL;
  return (
    <div
      className="pointer-events-none absolute flex flex-col items-center justify-center text-center"
      style={{ left: TITLE.minCol * CELL, top: TITLE.minRow * CELL, width, height }}
    >
      <h1 className="text-[88px] leading-[0.95] text-foreground" style={{ fontFamily: HANDWRITING }}>
        a bunch of untold thoughts,
        <br />
        written on the wall
      </h1>
      <p className="mt-6 max-w-xl text-2xl text-muted-foreground">
        Ibuhos ang iyong saloobin — share what&apos;s in your heart, one note at a time.
      </p>
      <p className="mt-5 text-3xl text-foreground/50" style={{ fontFamily: HANDWRITING }}>
        {status === 'loading'
          ? 'gathering the notes…'
          : status === 'error'
            ? "couldn't reach the wall right now"
            : empty
              ? 'the wall is empty — be the first to leave a thought'
              : 'pick any empty spot and leave yours'}
      </p>
    </div>
  );
}
