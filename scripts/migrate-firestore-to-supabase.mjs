// One-time copy of Firestore `notes` and `messages` into Supabase.
// Usage: node --env-file=.env.local scripts/migrate-firestore-to-supabase.mjs
// Safe to re-run: rows are upserted by their original Firestore ID.

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';

const firebaseConfig = {
  apiKey: 'AIzaSyBnFxYCEysOE1y869vl5KpNIHhGd78w-Io',
  authDomain: 'sama-han-ng-loob.firebaseapp.com',
  projectId: 'sama-han-ng-loob',
  storageBucket: 'sama-han-ng-loob.firebasestorage.app',
  messagingSenderId: '524455706842',
  appId: '1:524455706842:web:a625d76083337477eea5e3',
};

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const firestore = getFirestore(initializeApp(firebaseConfig));
const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const KNOWN = {
  notes: ['text', 'x', 'y', 'color', 'font', 'timestamp'],
  messages: ['message', 'image', 'theme', 'createdAt'],
};

const toRow = {
  notes: (id, d) => ({
    id,
    text: d.text ?? '',
    x: d.x ?? 0,
    y: d.y ?? 0,
    color: d.color ?? null,
    font: d.font ?? null,
    timestamp: d.timestamp ?? null,
  }),
  messages: (id, d) => ({
    id,
    message: d.message ?? null,
    image: d.image ?? null,
    theme: d.theme ?? null,
    ...(d.createdAt ? { created_at: d.createdAt } : {}),
  }),
};

async function migrate(name) {
  const snap = await getDocs(collection(firestore, name));
  const unknown = new Set();
  const rows = snap.docs.map((doc) => {
    const data = doc.data();
    Object.keys(data).forEach((k) => !KNOWN[name].includes(k) && unknown.add(k));
    return toRow[name](doc.id, data);
  });

  if (unknown.size) console.warn(`  ${name}: ignoring unexpected fields: ${[...unknown].join(', ')}`);

  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await supabase.from(name).upsert(rows.slice(i, i + 500));
    if (error) throw new Error(`${name}: ${error.message}`);
  }

  const { count, error } = await supabase.from(name).select('*', { count: 'exact', head: true });
  if (error) throw new Error(`${name}: ${error.message}`);
  console.log(`  ${name}: ${rows.length} read from Firestore, ${count} now in Supabase`);
}

console.log('Migrating Firestore -> Supabase');
await migrate('notes');
await migrate('messages');
console.log('Done.');
process.exit(0);
