import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDSX9D0rsc4fZANbg_u60xY_Su4SxtGOVU",
  authDomain: "cardapio-universal-um.firebaseapp.com",
  projectId: "cardapio-universal-um",
  storageBucket: "cardapio-universal-um.firebasestorage.app",
  messagingSenderId: "1097365163502",
  appId: "1:1097365163502:web:4aa094776c7ab6066592ff"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
