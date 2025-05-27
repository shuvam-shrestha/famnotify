
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getDatabase, type Database } from 'firebase/database';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// IMPORTANT: Replace this with your actual Firebase project configuration!
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://your-project-id.firebaseio.com", // Ensure this is your_actual_database_url
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional, for Google Analytics
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Database = getDatabase(app);
// const auth = getAuth(app); // If you need Firebase Auth
// const firestore = getFirestore(app); // If you need Firestore
// const storage = getStorage(app); // If you need Firebase Storage
// const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null; // If you need Analytics

export { app, db /*, auth, firestore, storage, analytics */ };

/*
IMPORTANT: Firebase Security Rules
------------------------------------
You MUST configure Firebase Realtime Database security rules for your project.
By default, new databases might be locked down or wide open.

Example (for demonstration - adapt for your needs):
{
  "rules": {
    "notifications": {
      ".read": "true", // Or "auth != null" to allow only logged-in users to read
      ".write": "true", // Or "auth != null" for logged-in users, or more specific rules
      "$notificationId": {
        // Allow marking as read by anyone (or specific users)
        "read": { ".write": "true" } 
      }
    },
    // Add other rules for users, etc. if needed
  }
}

For "Notify Family" and "Cooking Requests", anonymous users (visitors) need to write.
Authenticated users (family members) need to read all notifications and write to mark them as read.
Consider these needs when setting your rules in the Firebase console.
*/

