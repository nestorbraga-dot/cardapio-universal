import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDSX9fdvcvNbg_u60xY_Su4SxtGOVU",
  authDomain: "://firebaseapp.com",
  projectId: "cardapio-universal-um",
  storageBucket: "cardapio-universal-um.firebasestorage.app",
  messagingSenderId: "1097365cdvxf502",
  appId: "1:1097365163502:web:4aa094776gfh6066592ff"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
