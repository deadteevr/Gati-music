import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use named database ID if supplied, else fallback to standard default behavior
let db;
try {
  if (firebaseConfig.firestoreDatabaseId) {
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } else {
    db = getFirestore(app);
  }
} catch {
  db = getFirestore(app);
}
export { db };

// CRITICAL DIRECTIVE: Error Handling Spec for Firestore Operations
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  userFriendlyMessage: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: any[];
  }
}

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null, shouldThrow = true) {
  const currentUser = auth.currentUser;
  
  let userFriendlyMessage = "An unexpected error occurred. Please try again later.";
  const code = error?.code || "";

  switch (code) {
    case 'permission-denied':
      userFriendlyMessage = "You don't have permission to perform this action. Ensure you're logged in correctly.";
      break;
    case 'not-found':
      userFriendlyMessage = "The requested information could not be found.";
      break;
    case 'already-exists':
      userFriendlyMessage = "This item already exists.";
      break;
    case 'resource-exhausted':
      userFriendlyMessage = "Too many requests. Please wait a moment and try again.";
      break;
    case 'unavailable':
      userFriendlyMessage = "The service is temporarily unavailable. Check your internet connection.";
      break;
    case 'unauthenticated':
      userFriendlyMessage = "You must be logged in to do that.";
      break;
    default:
      if (error instanceof Error) {
        userFriendlyMessage = error.message;
      }
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    userFriendlyMessage,
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  if (shouldThrow) {
    throw new Error(JSON.stringify(errInfo));
  }
}
