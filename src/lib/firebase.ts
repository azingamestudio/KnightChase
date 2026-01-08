import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithCredential, User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase Web Configuration
// Not: Android/iOS native uygulamalar google-services.json kullanır.
// Bu config sadece Web/PWA sürümü içindir.
// Lütfen Firebase Konsolundan Web App oluşturup burayı doldurun.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "G-MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const initializeFirebase = async () => {
    // Initialize Analytics
    try {
        await FirebaseAnalytics.setCollectionEnabled({
            enabled: true,
        });
        console.log('Firebase Analytics Initialized');
    } catch (error) {
        console.error('Firebase Analytics Initialization failed', error);
    }
};

export const signInWithGoogle = async (): Promise<User | null> => {
    try {
        // 1. Native Google Sign In
        const result = await FirebaseAuthentication.signInWithGoogle();
        
        // 2. Create Credential
        const credential = GoogleAuthProvider.credential(result.credential?.idToken);
        
        // 3. Sign In to Firebase JS SDK (for Firestore access)
        const userCredential = await signInWithCredential(auth, credential);
        return userCredential.user;
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        return null;
    }
};

export const signOut = async () => {
    try {
        await FirebaseAuthentication.signOut();
        await auth.signOut();
    } catch (error) {
        console.error('Sign Out Error:', error);
    }
};

export const getCurrentUser = async () => {
    const result = await FirebaseAuthentication.getCurrentUser();
    return result.user;
};

// Analytics Helpers
export const logFirebaseEvent = async (name: string, params?: any) => {
    try {
        await FirebaseAnalytics.logEvent({ name, params });
    } catch (error) {
        console.error('Failed to log event', error);
    }
};

export const setScreenName = async (screenName: string) => {
    try {
        await FirebaseAnalytics.setScreenName({ screenName, nameOverride: screenName });
    } catch (error) {
        console.error('Failed to set screen name', error);
    }
};
