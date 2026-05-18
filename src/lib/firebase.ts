import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAPDOC3PNH6QYsKOaSYz96txMqFLYotMOE",
  authDomain: "your-daily-shop-ad160.firebaseapp.com",
  projectId: "your-daily-shop-ad160",
  storageBucket: "your-daily-shop-ad160.firebasestorage.app",
  messagingSenderId: "601370412052",
  appId: "1:601370412052:web:2f6f2bf30148a6bceb9301",
  measurementId: "G-LQYF53T83W",
  databaseURL: "https://your-daily-shop-ad160-default-rtdb.firebaseio.com" // typically
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);

