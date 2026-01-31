import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: AIzaSyBWN8Lfp6U-gbFl0t2OOn4IO_qdOEUdJ68,
  authDomain: servizo-79fe3.firebaseapp.com,
  projectId: servizo-79fe3,
  storageBucket: servizo-79fe3.appspot.com,
  messagingSenderId: "YOUR_SENDER_ID",
  appId: 1:1061160485531:android:7819e787c6bccc7592bc3e,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export { RecaptchaVerifier, signInWithPhoneNumber };
