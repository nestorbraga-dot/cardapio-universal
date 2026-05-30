import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtgdZNhMPHydgd7CK24RkUCff6x1tNggU",
  authDomain: "cardapio-universal.firebaseapp.com",
  projectId: "cardapio-universal",
  storageBucket: "cardapio-universal.firebasestorage.app",
  messagingSenderId: "117239972317",
  appId: "1:117239972317:web:e23efbbed0e0a2b78ab634"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
