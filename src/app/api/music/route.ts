import { NextResponse } from 'next/server';
import type { Song } from '@/lib/db';

// Song search for note clips, backed by the free iTunes Search API (no key needed,
// 30-second previews). Searches the Philippine store so OPM shows up first.

interface ITunesTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackViewUrl: string;
}

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.trim().slice(0, 100);
  if (!q) return NextResponse.json({ songs: [] });

  const url = new URL('https://itunes.apple.com/search');
  url.search = new URLSearchParams({ term: q, media: 'music', entity: 'song', limit: '15', country: 'PH' }).toString();

  try {
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (!res.ok) throw new Error(`iTunes responded ${res.status}`);
    const { results } = (await res.json()) as { results: ITunesTrack[] };

    const songs: Song[] = results
      .filter((t) => t.previewUrl)
      .map((t) => ({
        id: t.trackId,
        title: t.trackName,
        artist: t.artistName,
        artwork: (t.artworkUrl100 ?? '').replace('100x100bb', '300x300bb'),
        preview_url: t.previewUrl!,
        url: t.trackViewUrl,
      }));

    return NextResponse.json({ songs });
  } catch (error) {
    console.error('Music search failed:', error);
    return NextResponse.json({ songs: [], error: 'Music search is unavailable right now.' }, { status: 502 });
  }
}
