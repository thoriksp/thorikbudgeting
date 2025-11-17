import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDpKxY8k1fy2tgRxtrnHyoWffLBrQDGhxI",
  authDomain: "budget-tracker-92dbd.firebaseapp.com",
  databaseURL: "https://budget-tracker-92dbd-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "budget-tracker-92dbd",
  storageBucket: "budget-tracker-92dbd.firebasestorage.app",
  messagingSenderId: "1086543623280",
  appId: "1:1086543623280:web:3343f3f6cc36bdb59b30b5"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const auth = getAuth(app);
