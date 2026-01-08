import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { safeStorage } from './storage';

export const syncUserData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);

    try {
        const docSnap = await getDoc(userRef);
        
        // Local Data
        const localLives = parseInt(safeStorage.getItem('kc_lives') || '10');
        const localLevel = parseInt(safeStorage.getItem('kc_unlocked_levels') || '1');
        const localPremium = safeStorage.getItem('kc_premium') === 'true';

        if (docSnap.exists()) {
            // Cloud Data
            const data = docSnap.data();
            const cloudLevel = data.maxLevel || 1;
            const cloudPremium = data.isPremium || false;

            // Conflict Resolution (Max wins)
            const finalLevel = Math.max(localLevel, cloudLevel);
            const finalPremium = localPremium || cloudPremium;

            // Update Local
            safeStorage.setItem('kc_unlocked_levels', finalLevel.toString());
            if (finalPremium) safeStorage.setItem('kc_premium', 'true');

            // Update Cloud if Local is newer
            if (localLevel > cloudLevel || (!cloudPremium && localPremium)) {
                await updateDoc(userRef, {
                    maxLevel: finalLevel,
                    isPremium: finalPremium,
                    lastSync: new Date()
                });
            }
        } else {
            // Create New Doc
            await setDoc(userRef, {
                username: user.displayName || 'Player',
                email: user.email,
                maxLevel: localLevel,
                lives: localLives,
                isPremium: localPremium,
                createdAt: new Date(),
                lastSync: new Date()
            });
        }
    } catch (error) {
        console.error('Sync Error:', error);
    }
};

export const saveProgressToCloud = async (level: number) => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    try {
        await updateDoc(userRef, {
            maxLevel: level,
            lastPlayed: new Date()
        });
    } catch (e) {
        console.error('Failed to save progress', e);
    }
};
