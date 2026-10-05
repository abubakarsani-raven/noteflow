import { getApps, getApp, initializeApp, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || "noteflow-dev";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    });
  }

  // Fallback for local emulator or default environment credentials
  return initializeApp({
    projectId,
  });
}

const app = initializeFirebaseAdmin();
export const db: Firestore = getFirestore(app);
export { app };
