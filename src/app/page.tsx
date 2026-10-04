'use client'

import { Whiteboard } from '@/components/whiteboard/Whiteboard';
import { ClassicView } from '@/components/classic/ClassicView';
import { useView } from '@/lib/view';

export default function FreedomWall() {
  const view = useView();
  return view === 'classic' ? <ClassicView /> : <Whiteboard />;
}
