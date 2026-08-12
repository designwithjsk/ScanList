import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Read Firebase Applet config
import config from '../firebase-applet-config.json';

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google login failed:", error);
    throw error;
  }
};

export const logoutFirebase = async () => {
  await signOut(auth);
};

export { app, auth, db };
export default app;
