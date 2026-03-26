// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAc9Ci4KKE9HvkOotMit3YTHx1y0SOwC-Q",
  authDomain: "licoreria-app-5d82b.firebaseapp.com",
  projectId: "licoreria-app-5d82b",
  storageBucket: "licoreria-app-5d82b.firebasestorage.app",
  messagingSenderId: "880767387677",
  appId: "1:880767387677:web:453f885262679bff705ef4",
  measurementId: "G-LQVP3Q4VFH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);