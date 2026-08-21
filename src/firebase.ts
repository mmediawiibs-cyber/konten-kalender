import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- TEMPEL KODE FIREBASECONFIG MILIK ANDA DI BAWAH INI ---
const firebaseConfig = {
  apiKey: "AIzaSyBez8mVfJysA4mdC4GtaAsb1QbqRvBjaj4",
  authDomain: "kalender-konten-tim.firebaseapp.com",
  projectId: "kalender-konten-tim",
  storageBucket: "kalender-konten-tim.firebasestorage.app",
  messagingSenderId: "982950993542",
  appId: "1:982950993542:web:8f50d7f718e342e1f73b07",
  measurementId: "G-GVQCDE80V4",
};
// -----------------------------------------------------------

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
