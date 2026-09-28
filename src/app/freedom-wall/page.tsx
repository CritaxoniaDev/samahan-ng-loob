'use client'

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getRandomFont } from '@/utils/fonts';
import { addNote, getNotes } from '@/lib/db';
import { Header } from '@/components/Header';
import { PenLine, Search, BookOpen, Eye, Quote, CalendarDays } from 'lucide-react';

interface Note {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  timestamp: string;
  font: string;
}

const generatePastelColor = () => {
  // Monochrome: soft off-white / light-gray paper shades
  const lightness = Math.floor(Math.random() * 14) + 84; // 84-97%
  return `hsl(0, 0%, ${lightness}%)`;
};

// The author name is appended to the stored text as "\n- name".
// Split it back out for display.
const splitNote = (text: string): { body: string; author: string | null } => {
  const idx = text.lastIndexOf('\n- ');
  if (idx === -1) return { body: text.trim(), author: null };
  return { body: text.slice(0, idx).trim(), author: text.slice(idx + 3).trim() };
};

// Normalize a note's timestamp to a stable day key (or 'unknown' if unparseable).
const dayKey = (ts: string): string => {
  const d = new Date(ts);
  return isNaN(d.getTime()) ? 'unknown' : d.toDateString();
};

// Human label for a day filter pill.
const formatDayLabel = (key: string): string => {
  if (key === 'unknown') return 'Undated';
  const d = new Date(key);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const sameYear = d.getFullYear() === today.getFullYear();
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
};

const HANDWRITING = 'var(--font-caveat), var(--font-kalam), cursive';

export default function FreedomWall() {
  const [noteText, setNoteText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('all');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const fetchedNotes = await getNotes();
    // newest first
    const sorted = (fetchedNotes as Note[]).slice().sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setNotes(sorted);
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setIsLoading(true);

    const newNote = {
      text: authorName ? `${noteText}\n- ${authorName}` : noteText,
      x: 0,
      y: 0,
      color: generatePastelColor(),
      timestamp: new Date().toLocaleString(),
      font: getRandomFont(),
    };

    try {
      await addNote(newNote);
      await fetchNotes();
      setNoteText('');
      setAuthorName('');
      document.getElementById('wall')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleAddNote();
    }
  };

  const features = [
    {
      icon: PenLine,
      title: 'Share your Thoughts',
      body: 'Pour out whatever is on your heart and pin it to the wall — sign it or leave it anonymous.',
    },
    {
      icon: BookOpen,
      title: 'Browse the Wall',
      body: 'Read the untold words other people have left behind. You are never the only one feeling it.',
    },
    {
      icon: Eye,
      title: 'Open a Note',
      body: 'Tap any note to read the full thought exactly the way it was written by hand.',
    },
  ];

  // Distinct days that actually have notes, newest first.
  const days = Array.from(new Set(notes.map((n) => dayKey(n.timestamp)))).sort((a, b) => {
    if (a === 'unknown') return 1;
    if (b === 'unknown') return -1;
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const visibleNotes =
    selectedDay === 'all' ? notes : notes.filter((n) => dayKey(n.timestamp) === selectedDay);

  return (
    <>
      <Header />

      <div className="min-h-screen bg-background text-foreground">
        <main className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Hero */}
          <section className="pt-32 pb-16 text-center">
            <h1
              className="mx-auto max-w-3xl text-5xl md:text-7xl leading-[1.05] text-foreground"
              style={{ fontFamily: HANDWRITING }}
            >
              a bunch of untold thoughts,
              <br />
              written on the wall
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base md:text-lg text-muted-foreground">
              Ibuhos ang iyong saloobin — share what&apos;s in your heart, one note at a time.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#share">
                <Button className="h-11 gap-2 rounded-lg px-6 text-sm font-medium">
                  <PenLine className="h-4 w-4" />
                  Share a Thought
                </Button>
              </a>
              <a href="#wall">
                <Button
                  variant="outline"
                  className="h-11 gap-2 rounded-lg border-border px-6 text-sm font-medium"
                >
                  <Search className="h-4 w-4" />
                  Browse the Wall
                </Button>
              </a>
            </div>
          </section>

          {/* Feature cards */}
          <section className="grid gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-6 transition-shadow duration-300 hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/50">
                  <f.icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </section>

          {/* Share form */}
          <section id="share" className="scroll-mt-28 pb-16">
            <Card className="mx-auto max-w-2xl rounded-2xl border border-border bg-card shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-semibold text-foreground">
                  Share your thoughts
                </CardTitle>
                <p className="text-sm text-muted-foreground">Write it once. Let it live on the wall.</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Pangalan mo (opsyonal)"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="h-11 rounded-lg border-border bg-background pl-10 focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <PenLine className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                </div>

                <div className="relative">
                  <Textarea
                    placeholder="Ibuhos mo ang iyong saloobin..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="min-h-[150px] rounded-lg border-border bg-background p-4 text-lg focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ fontFamily: HANDWRITING }}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                    Ctrl + Enter to post
                  </div>
                </div>

                <Button
                  onClick={handleAddNote}
                  disabled={isLoading || !noteText.trim()}
                  className="h-11 w-full gap-2 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Posting...' : (
                    <>
                      <PenLine className="h-4 w-4" />
                      Post to the Wall
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* The wall */}
          <section id="wall" className="scroll-mt-28 pb-24">
            <div className="mb-6 space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">On the wall</h2>
                  <p className="text-sm text-muted-foreground">
                    {visibleNotes.length} {visibleNotes.length === 1 ? 'thought' : 'thoughts'}
                    {selectedDay === 'all' ? ' shared' : ` on ${formatDayLabel(selectedDay)}`}
                  </p>
                </div>
              </div>

              {days.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <button
                    onClick={() => setSelectedDay('all')}
                    className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs transition-colors ${
                      selectedDay === 'all'
                        ? 'bg-foreground text-background'
                        : 'border border-border bg-card text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    All
                  </button>
                  {days.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDay(d)}
                      className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-xs transition-colors ${
                        selectedDay === d
                          ? 'bg-foreground text-background'
                          : 'border border-border bg-card text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {formatDayLabel(d)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {visibleNotes.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-20 text-center">
                <Quote className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
                <p className="text-muted-foreground">
                  The wall is empty. Be the first to leave a thought.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleNotes.map((note) => {
                  const { body, author } = splitNote(note.text);
                  return (
                    <button
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <span className="inline-flex w-fit rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                        {author ? `— ${author}` : 'anonymous'}
                      </span>

                      <p
                        className="mt-4 flex-1 text-xl leading-snug text-foreground line-clamp-6"
                        style={{ fontFamily: HANDWRITING }}
                      >
                        {body}
                      </p>

                      <div className="mt-5 border-t border-border pt-3 text-xs text-muted-foreground">
                        {note.timestamp}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
          Every note is a story worth telling.
        </footer>
      </div>

      {/* Note detail */}
      <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
        <DialogContent className="max-w-lg rounded-2xl border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="sr-only">Note</DialogTitle>
          </DialogHeader>
          {selectedNote && (() => {
            const { body, author } = splitNote(selectedNote.text);
            return (
              <div className="space-y-6 py-2">
                <span className="inline-flex rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                  {author ? `— ${author}` : 'anonymous'}
                </span>
                <p
                  className="text-2xl leading-relaxed text-foreground"
                  style={{ fontFamily: HANDWRITING }}
                >
                  {body}
                </p>
                <div className="border-t border-border pt-3 text-xs text-muted-foreground">
                  {selectedNote.timestamp}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
}
