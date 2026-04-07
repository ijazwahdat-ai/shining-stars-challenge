import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

let db: any = null;

try {
  if (!getApps().length) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    db = getFirestore(getApps()[0], firebaseConfig.firestoreDatabaseId);
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export { db };