// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBERRsPKScx0-EQ-e5hq0BZpCMOQwHur5Q",
  authDomain: "fellas-623d2.firebaseapp.com",
  projectId: "fellas-623d2",
  storageBucket: "fellas-623d2.firebasestorage.app",
  messagingSenderId: "846042700379",
  appId: "1:846042700379:web:8046bf913f7c0f4f8c7d7e",
  measurementId: "G-HJWV3249JY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
