import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1OtyEYZHH44-L647KaIx1x_5y_JZGd9Y",
  authDomain: "resolvex-21fce.firebaseapp.com",
  projectId: "resolvex-21fce",
  storageBucket: "resolvex-21fce.firebasestorage.app",
  messagingSenderId: "1002433700624",
  appId: "1:1002433700624:web:7de9ac8acec9ae6e893b95",
  measurementId: "G-BXFR5H604V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
export const auth = getAuth(app);

// Firestore Database
export const db = getFirestore(app);