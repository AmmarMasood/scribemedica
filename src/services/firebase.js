// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  // Your Firebase configuration object here
  apiKey: import.meta.env.VITE_STAGE_API_KEY,
  authDomain: import.meta.env.VITE_STAGE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_STAGE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STAGE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_STAGE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_STAGE_APP_ID,
  measurementId: import.meta.env.VITE_STAGE_MESSUREMENT_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export the auth instance
export const auth = getAuth(app);

export function mapAuthCodeToMessage(authCode) {
  switch (authCode) {
    case "auth/wrong-password":
      return "Password provided is not corrected";

    case "auth/user-not-found":
      return "User with the provided email does not exist";

    case "auth/email-already-in-use":
      return "User with the provided email already exists";
    // Many more authCode mapping here...
    case "auth/missing-email":
      return "Please provide an email";

    default:
      return authCode;
  }
}
