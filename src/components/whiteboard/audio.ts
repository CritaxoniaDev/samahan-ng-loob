'use client'

import { useSyncExternalStore } from 'react';

// One shared <audio> for the whole board, so only one clip ever plays at a time.

let audio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;
let fadeTimer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

const element = () => {
  if (!audio) {
    audio = new Audio();
    audio.loop = true;
    audio.preload = 'none';
    ['play', 'pause', 'timeupdate', 'loadedmetadata', 'error'].forEach((e) => audio!.addEventListener(e, emit));
  }
  return audio;
};

export const playClip = async (url: string, volume = 0.75) => {
  const a = element();
  if (currentUrl !== url) {
    a.src = url;
    currentUrl = url;
  }
  // Ease in so a clip starting on its own never startles anyone.
  if (fadeTimer) clearInterval(fadeTimer);
  a.volume = 0;
  fadeTimer = setInterval(() => {
    a.volume = Math.min(volume, a.volume + volume / 16);
    if (a.volume >= volume && fadeTimer) clearInterval(fadeTimer);
  }, 50);
  try {
    await a.play();
  } catch {
    // Autoplay blocked or clip unavailable: stay paused, the UI shows a play button.
    emit();
  }
};

export const pauseClip = () => audio?.pause();

export const stopClip = () => {
  if (!audio) return;
  if (fadeTimer) clearInterval(fadeTimer);
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  currentUrl = null;
  emit();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Playback state for one clip URL: whether it's playing and how far along it is (0–1).
export const useClip = (url?: string | null) => {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => {
      if (!audio || !url || currentUrl !== url) return 'idle|0';
      const progress = audio.duration ? audio.currentTime / audio.duration : 0;
      return `${audio.paused ? 'paused' : 'playing'}|${progress.toFixed(3)}`;
    },
    () => 'idle|0'
  );
  const [state, progress] = snapshot.split('|');
  return { playing: state === 'playing', progress: Number(progress) };
};
