'use client'

import { useSyncExternalStore } from 'react';

// Which layout a visitor prefers: the full-screen wall or the classic scrolling page.
// Remembered per browser; falls back to the wall if storage is unavailable.

export type View = 'wall' | 'classic';

const STORAGE_KEY = 'samahan-view';
const listeners = new Set<() => void>();
let current: View | null = null;

const read = (): View => {
  if (current) return current;
  try {
    current = localStorage.getItem(STORAGE_KEY) === 'classic' ? 'classic' : 'wall';
  } catch {
    current = 'wall';
  }
  return current;
};

export const setView = (view: View) => {
  current = view;
  try {
    localStorage.setItem(STORAGE_KEY, view);
  } catch {
    // Private mode or blocked storage: the choice just won't be remembered.
  }
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// The server always renders the wall; the saved choice applies right after hydration.
export const useView = () => useSyncExternalStore(subscribe, read, () => 'wall' as View);
