// firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDBlAeRtkmG7lBOg930rj0nvrqeQiAptfw",
  authDomain: "citapp-9f0fc.firebaseapp.com",
  projectId: "citapp-9f0fc",
  storageBucket: "citapp-9f0fc.firebasestorage.app",
  messagingSenderId: "499704875874",
  appId: "1:499704875874:web:f3cee2bb2d0c9934493a3b"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

