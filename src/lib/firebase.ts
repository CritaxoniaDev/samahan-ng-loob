import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBnFxYCEysOE1y869vl5KpNIHhGd78w-Io",
    authDomain: "sama-han-ng-loob.firebaseapp.com",
    projectId: "sama-han-ng-loob",
    storageBucket: "sama-han-ng-loob.firebasestorage.app",
    messagingSenderId: "524455706842",
    appId: "1:524455706842:web:a625d76083337477eea5e3",
    measurementId: "G-J2ERWCXVFS"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);