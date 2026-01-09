import { AdMob, BannerAdSize, BannerAdPosition, AdOptions, RewardAdOptions, AdLoadInfo, RewardAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

// AdMob Configuration
// REPLACE THESE WITH YOUR REAL ADMOB IDS FOR PRODUCTION
const ADMOB_CONFIG = {
    // Android App ID: ca-app-pub-1841588721645178~8182666710 (Put in AndroidManifest.xml)
    // iOS App ID: ca-app-pub-xxxxxxxxxxxxxxxx~yyyyyyyyyy (Put in Info.plist)
    
    // Banner Ad ID
    bannerId: {
        android: 'ca-app-pub-1841588721645178/8875735624',
        ios: 'ca-app-pub-3940256099942544/2934735716',     // Test ID
    },
    
    // Interstitial Ad ID (Full screen ad between levels)
    // Using Test ID as user didn't provide a standard interstitial ID yet
    interstitialId: {
        android: 'ca-app-pub-1841588721645178/7096089404', 
        ios: 'ca-app-pub-3940256099942544/4411468910',     // Test ID
    },

    // Rewarded Ad ID (Watch video for lives)
    rewardedId: {
        android: 'ca-app-pub-1841588721645178/9231792992',
        ios: 'ca-app-pub-3940256099942544/1712485313',     // Test ID
    },

    isTesting: false // Set to false for production
};

export const initializeAdMob = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
        await AdMob.initialize({
            requestTrackingAuthorization: true,
            // testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'], // Add your test device ID if needed
            initializeForTesting: ADMOB_CONFIG.isTesting,
        });
        console.log('AdMob Initialized');
        
        // Prepare ads on init
        prepareInterstitialAd();
        prepareRewardedAd();
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

export const prepareRewardedAd = async () => {
    if (!Capacitor.isNativePlatform()) return;

    const adId = Capacitor.getPlatform() === 'ios' ? ADMOB_CONFIG.rewardedId.ios : ADMOB_CONFIG.rewardedId.android;

    const options: RewardAdOptions = {
        adId: adId,
        isTesting: ADMOB_CONFIG.isTesting,
    };

    try {
        await AdMob.prepareRewardVideoAd(options);
    } catch (error) {
        console.error('Failed to prepare rewarded ad', error);
    }
};

export const showRewardedAd = async (onReward: () => void) => {
    if (!Capacitor.isNativePlatform()) {
        // For testing in web/dev, simulate reward
        if (confirm('Watch Ad for Reward? (Simulated)')) {
            onReward();
        }
        return;
    }

    try {
        // Register event listener for reward
        const handler = AdMob.addListener(RewardAdPluginEvents.OnRewarded, (reward: AdMobRewardItem) => {
            console.log('User rewarded', reward);
            onReward();
            handler.remove(); // Cleanup
        });

        await AdMob.showRewardVideoAd();
        // Prepare next one
        prepareRewardedAd();
    } catch (error) {
        console.error('Failed to show rewarded ad', error);
        // Try to prepare again
        prepareRewardedAd();
    }
};
