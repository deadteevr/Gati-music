import { getDoc, setDoc, doc } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword } from 'firebase/auth';

const googleProvider = new GoogleAuthProvider();

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const user = result.user;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const isAdmin = user.email === 'deadteevr@gmail.com';
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.email?.split('@')[0] || 'Artist',
          email: user.email,
          role: isAdmin ? 'admin' : 'artist',
          createdAt: new Date().toISOString()
        });
      } else if (isAdmin && userSnap.data()?.role !== 'admin') {
        // Force upgrade to admin if they already existed as an artist
        await setDoc(userRef, { role: 'admin' }, { merge: true });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'users');
    }
    
    return user;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const isAdmin = user.email === 'deadteevr@gmail.com';
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName || 'Artist',
          email: user.email,
          role: isAdmin ? 'admin' : 'artist',
          createdAt: new Date().toISOString()
        });
      } else if (isAdmin && userSnap.data()?.role !== 'admin') {
        // Force upgrade to admin if they already existed as an artist
        await setDoc(userRef, { role: 'admin' }, { merge: true });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'users');
    }
    
    return user;
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const logout = () => signOut(auth);
