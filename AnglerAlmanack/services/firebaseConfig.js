// src/firebaseConfig.js
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Only works for web-style uploads
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAje7UNE2MhdFu9pLFJAa21tYbz21Nhu3s",
  authDomain: "angleralmanack.firebaseapp.com",
  projectId: "angleralmanack",
  storageBucket: "angleralmanack.firebasestorage.app",
  messagingSenderId: "87616154788",
  appId: "1:87616154788:web:d2d2349a0697db6559ca31",
  measurementId: "G-PW68DE6K76"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// to import in other files import { auth, db, storage } from './src/firebaseConfig';

