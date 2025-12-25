import { AdMob, BannerAdSize, BannerAdPosition, AdOptions, AdLoadInfo } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// AdMob Configuration
// REPLACE THESE WITH YOUR REAL ADMOB IDS FOR PRODUCTION
const ADMOB_CONFIG = {
    // Android App ID: ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy (Put in AndroidManifest.xml)
    // iOS App ID: ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy (Put in Info.plist)
    
    // Banner Ad ID
    bannerId: {
        android: 'ca-app-pub-3940256099942544/6300978111', // Test ID
        ios: 'ca-app-pub-3940256099942544/2934735716',     // Test ID
        // REAL IDs EXAMPLE:
        // android: 'ca-app-pub-YOUR_ID/YOUR_BANNER_ID',
    },
    
    // Interstitial Ad ID (Full screen ad between levels)
    interstitialId: {
        android: 'ca-app-pub-3940256099942544/1033173712', // Test ID
        ios: 'ca-app-pub-3940256099942544/4411468910',     // Test ID
    },

    isTesting: true // Set to false for production
};

export const initializeAdMob = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
        await AdMob.initialize({
            requestTrackingAuthorization: true,
            testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'], // Add your test device ID if needed
            initializeForTesting: ADMOB_CONFIG.isTesting,
        });
        console.log('AdMob Initialized');
    } catch (error) {
        console.error('AdMob Initialization failed', error);
    }
};

export const showBannerAd = async () => {
    if (!Capacitor.isNativePlatform()) return;

    const adId = Capacitor.getPlatform() === 'ios' ? ADMOB_CONFIG.bannerId.ios : ADMOB_CONFIG.bannerId.android;

    const options: AdOptions = {
        adId: adId,
        adSize: BannerAdSize.ADAPTIVE_BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: ADMOB_CONFIG.isTesting,
    };

    try {
        await AdMob.showBanner(options);
    } catch (error) {
        console.error('Failed to show banner', error);
    }
};

export const hideBannerAd = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
        await AdMob.hideBanner();
        await AdMob.removeBanner();
    } catch (error) {
        console.error('Failed to hide banner', error);
    }
};

export const prepareInterstitialAd = async () => {
    if (!Capacitor.isNativePlatform()) return;

    const adId = Capacitor.getPlatform() === 'ios' ? ADMOB_CONFIG.interstitialId.ios : ADMOB_CONFIG.interstitialId.android;

    const options: AdOptions = {
        adId: adId,
        isTesting: ADMOB_CONFIG.isTesting,
    };

    try {
        await AdMob.prepareInterstitial(options);
    } catch (error) {
        console.error('Failed to prepare interstitial', error);
    }
};

export const showInterstitialAd = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
        await AdMob.showInterstitial();
        // Prepare the next one
        prepareInterstitialAd();
    } catch (error) {
        console.error('Failed to show interstitial', error);
        // Try to prepare for next time
        prepareInterstitialAd();
    }
};
