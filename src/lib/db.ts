import { db } from './firebase';
import { collection, addDoc, getDocs, query, getDoc, doc } from 'firebase/firestore';

export interface Note {
  id?: string;
  text: string;
  x: number;
  y: number;
  color: string;
  timestamp: string;
}

export interface Message {
  id?: string;
  message: string;
  image: string;
  theme: string;
  createdAt: string;
}

export const addNote = async (note: Omit<Note, 'id'>) => {
  const notesRef = collection(db, 'notes');
  return await addDoc(notesRef, note);
};

export const getNotes = async (): Promise<Note[]> => {
  const notesRef = collection(db, 'notes');
  const q = query(notesRef);
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Note[];
};

export const createMessage = async (message: Omit<Message, 'id' | 'createdAt'>) => {
  const messagesRef = collection(db, 'messages');
  const newMessage = {
    ...message,
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(messagesRef, newMessage);
  return docRef.id;
};

export const getMessage = async (id: string): Promise<Message | null> => {
  const messageRef = doc(db, 'messages', id);
  const messageSnap = await getDoc(messageRef);
  
  if (messageSnap.exists()) {
    return { id: messageSnap.id, ...messageSnap.data() } as Message;
  }
  return null;
};
