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
  apiKey: "AIzaSyD33TFQu_tSnh49WSvNX4PDKhSXlTz43Sk",
  authDomain: "knightchase-68ab7.firebaseapp.com",
  projectId: "knightchase-68ab7",
  storageBucket: "knightchase-68ab7.firebasestorage.app",
  messagingSenderId: "758569726130",
  appId: "1:758569726130:android:899c780c4808f088a859ab",
  measurementId: "G-MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const initializeFirebase = async () => {
    // Initialize Analytics
    try {
        if (Capacitor.isNativePlatform()) {
            await FirebaseAnalytics.setCollectionEnabled({
                enabled: true,
            });
            console.log('Firebase Analytics Initialized');
        }
    } catch (error) {
        console.error('Firebase Analytics Initialization failed', error);
    }
};

export const signInWithGoogle = async (): Promise<User | null> => {
    try {
        console.log('Starting Google Sign-In...');
        // 1. Native Google Sign In
        const result = await FirebaseAuthentication.signInWithGoogle();
        console.log('Native Sign-In Success:', result);
        
        // 2. Create Credential
        const credential = GoogleAuthProvider.credential(result.credential?.idToken);
        
        // 3. Sign In to Firebase JS SDK (for Firestore access)
        const userCredential = await signInWithCredential(auth, credential);
        return userCredential.user;
    } catch (error: any) {
                console.error('Google Sign-In Error:', error);
                // Show more detailed error
                const errorMessage = error.message || error.code || JSON.stringify(error);
                alert(`Sign-In Failed:\n${errorMessage}\n\nPlease check Logcat for details.`);
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
        if (Capacitor.isNativePlatform()) {
            await FirebaseAnalytics.setScreenName({ screenName, nameOverride: screenName });
        }
    } catch (error) {
        console.error('Failed to set screen name', error);
    }
};
