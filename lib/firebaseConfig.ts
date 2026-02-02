import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Debug: Log environment variables
console.log('Firebase Config Environment Variables:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD1ow-6s51baWQqEqFjvK7hQx_p62D3Lwc",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "eldopolis.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "eldopolis",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "eldopolis.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "717028258044",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:717028258044:web:c51f96a21be2a33b332779",
}

// Validate that all required config values are present
const validateFirebaseConfig = () => {
  const requiredKeys = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"]
  const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key as keyof typeof firebaseConfig])

  if (missingKeys.length > 0) {
    console.error("Missing Firebase configuration values:", missingKeys)
    return false
  }
  return true
}

// Initialize Firebase only if it hasn't been initialized yet and config is valid
let app: any = null
let db: any = null

if (validateFirebaseConfig()) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  db = getFirestore(app)
  console.log(`[FIREBASE] Database initialized on ${typeof window === 'undefined' ? 'SERVER' : 'CLIENT'}. Project: ${firebaseConfig.projectId}`)
} else {
  console.warn("[FIREBASE] Not initialized due to missing configuration")
}

export { app, db }
