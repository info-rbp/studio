import { initializeApp, getApps, App } from 'firebase-admin/app';
import { firebaseConfig } from './config';
import { credential } from 'firebase-admin';

// This is a temporary solution for service account credentials.
// In a production environment, you should use a more secure method
// like Google Cloud Secret Manager.
const getServiceAccount = () => {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    }
    return undefined;
  } catch (e) {
    console.error('Could not parse FIREBASE_SERVICE_ACCOUNT environment variable.');
    return undefined;
  }
}


export function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    throw new Error('Firebase Admin SDK service account credentials are not configured. Please set the FIREBASE_SERVICE_ACCOUNT environment variable.');
  }

  return initializeApp({
    credential: credential.cert(serviceAccount),
    databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
  });
}
