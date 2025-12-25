import 'cordova-plugin-purchase';
import { Capacitor } from '@capacitor/core';

// Product ID from Google Play Console / App Store Connect
// You MUST create a Managed Product with this exact ID in the console
export const PRODUCT_ID_PREMIUM = 'knight_chase_premium';

let isInitialized = false;

// Callback type for premium status changes
type PremiumStatusCallback = (isPremium: boolean) => void;
const listeners: PremiumStatusCallback[] = [];

export const registerPremiumListener = (callback: PremiumStatusCallback) => {
    listeners.push(callback);
    // Emit current state immediately
    callback(getLocallyStoredPremiumStatus());
};

const notifyListeners = (isPremium: boolean) => {
    listeners.forEach(cb => cb(isPremium));
    localStorage.setItem('isPremium', isPremium ? 'true' : 'false');
};

const getLocallyStoredPremiumStatus = (): boolean => {
    return localStorage.getItem('isPremium') === 'true';
};

export const initializeStore = () => {
    if (!Capacitor.isNativePlatform()) {
        console.log('Store not initialized (not native)');
        return;
    }

    if (isInitialized) return;

    const { store, ProductType, Platform } = CdvPurchase;

    // Verbosity for debugging
    store.verbosity = CdvPurchase.LogLevel.INFO;

    // Register the product
    store.register([{
        id: PRODUCT_ID_PREMIUM,
        type: ProductType.NON_CONSUMABLE,
        platform: Platform.GOOGLE_PLAY,
    }]);

    // Setup listeners
    store.when()
        .approved(transaction => {
            console.log('Transaction approved:', transaction);
            transaction.verify();
        })
        .verified(receipt => {
            console.log('Receipt verified:', receipt);
            receipt.finish();
            notifyListeners(true); // Grant premium
        })
        .finished(transaction => {
            console.log('Transaction finished:', transaction);
        });

    // Handle product updates (restoring purchases)
    store.when(PRODUCT_ID_PREMIUM).updated(product => {
        if (product.owned) {
            notifyListeners(true);
        } else {
            // Only revoke if we are sure (optional, usually better to keep premium if offline)
            // notifyListeners(false); 
        }
    });

    // Initialize
    store.initialize([Platform.GOOGLE_PLAY])
        .then(() => {
            console.log('Store initialized');
            isInitialized = true;
        })
        .catch(err => {
            console.error('Store initialization failed', err);
        });
};

export const purchasePremium = () => {
    if (!Capacitor.isNativePlatform()) {
        alert('Purchases only work on a real device.');
        // For testing on web, you might want to uncomment this:
        // notifyListeners(true);
        return;
    }

    const { store } = CdvPurchase;
    const product = store.get(PRODUCT_ID_PREMIUM);

    if (product?.canPurchase) {
        product.getOffer()?.order();
    } else {
        console.log('Cannot purchase product:', product);
        alert('Cannot purchase right now. Please try again later.');
    }
};

export const restorePurchases = () => {
    if (!Capacitor.isNativePlatform()) return;
    
    const { store } = CdvPurchase;
    store.restorePurchases();
};
