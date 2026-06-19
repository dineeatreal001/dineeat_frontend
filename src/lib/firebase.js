// lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDScubeniD9TJZVcT3PkTZg6yX_iNr6lRg",
  authDomain: "login-eb086.firebaseapp.com",
  projectId: "login-eb086",
  storageBucket: "login-eb086.firebasestorage.app",
  messagingSenderId: "224674379727",
  appId: "1:224674379727:web:076e3de899a025955f84ba",
  measurementId: "G-3NPWCL67G1"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup, signOut };