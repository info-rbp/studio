import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-8897114742-ff06b",
  "appId": "1:1056433687745:web:d66780c0394fe87424d840",
  "apiKey": "AIzaSyC6iIy9ZrEBTfpf6jDDPzKOe64YBQG6qYk",
  "authDomain": "studio-8897114742-ff06b.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1056433687745"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
