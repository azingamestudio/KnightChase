import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { Capacitor } from '@capacitor/core';
import { initializeApp } from 'firebase/app';

// Firebase Web Configuration
// Not: Android/iOS native uygulamalar google-services.json kullanır.
// Bu config sadece Web/PWA sürümü içindir.
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "G-MEASUREMENT_ID"
};

export const initializeFirebase = async () => {
    // Initialize Firebase for Web (optional if you only care about Native)
    if (!Capacitor.isNativePlatform()) {
        try {
            initializeApp(firebaseConfig);
            console.log('Firebase Web Initialized');
        } catch (e) {
            console.warn('Firebase Web config missing or invalid', e);
        }
    }

    // Initialize Analytics
    try {
        // Example: Enable analytics collection
        await FirebaseAnalytics.setCollectionEnabled({
            enabled: true,
        });
        
        console.log('Firebase Analytics Initialized');
    } catch (error) {
        console.error('Firebase Analytics Initialization failed', error);
    }
};

export const logFirebaseEvent = async (name: string, params?: any) => {
    try {
        await FirebaseAnalytics.logEvent({
            name,
            params,
        });
    } catch (error) {
        console.error('Failed to log event', error);
    }
};

export const setScreenName = async (screenName: string) => {
    try {
        await FirebaseAnalytics.setScreenName({
            screenName,
            nameOverride: screenName,
        });
    } catch (error) {
        console.error('Failed to set screen name', error);
    }
};
