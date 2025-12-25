# Knight Chase - Android Setup Guide (Premium & Ads)

This guide helps you set up AdMob Ads and In-App Purchases (Premium) for your Android release.

## 1. AdMob Setup (Ads)

### Step 1: Create AdMob Account
1. Go to [apps.admob.com](https://apps.admob.com).
2. Create an account or sign in.
3. Click **Apps > Add App**.
4. Select **Android** and choose whether the app is listed on Play Store (select "No" if not yet published).
5. Name it "Knight Chase".

### Step 2: Create Ad Units
1. Once the app is created, go to **Ad Units**.
2. Click **Add Ad Unit**.
3. Select **Banner**.
   - Name: `Main Banner`
   - Copy the **Ad Unit ID** (looks like `ca-app-pub-xxxxxxxx/yyyyyyyy`).
4. Click **Add Ad Unit** again.
5. Select **Interstitial**.
   - Name: `Game Over Interstitial`
   - Copy the **Ad Unit ID**.

### Step 3: Get App ID
1. Go to **App Settings**.
2. Copy the **App ID** (looks like `ca-app-pub-xxxxxxxx~yyyyyyyy`).

### Step 4: Update Code
1. Open `android/app/src/main/AndroidManifest.xml`.
   - Find `<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" ... />`.
   - Replace the `value` with your **App ID** from Step 3.
2. Open `src/lib/admob.ts`.
   - Replace the values in `ADMOB_CONFIG` with your **Ad Unit IDs** from Step 2.
   - Set `isTesting: false` when you are ready to publish.

---

## 2. Google Play Console Setup (Premium IAP)

### Step 1: Create Application
1. Go to [Google Play Console](https://play.google.com/console).
2. Create a new app "Knight Chase".
3. Upload your AAB (see Building section) to the **Internal Testing** track first to test IAP.

### Step 2: Configure In-App Products
**Important:** You must upload a signed APK/AAB with the billing permission (already included) before you can create products.

1. In Play Console, go to **Monetize > Products > In-app products**.
2. Click **Create product**.
3. **Product ID:** `knight_chase_premium` (This MUST match the ID in `src/lib/store.ts`).
4. **Name:** Premium Upgrade
5. **Description:** Unlock all skins, themes, and remove ads.
6. **Price:** Set your price.
7. Click **Save** and **Activate**.

### Step 3: Test Accounts
1. Go to **Setup > License testing**.
2. Add your email address to the testers list so you can test purchases for free (or with test cards) without being charged real money.

---

## 3. Testing Premium Features (Developer Mode)

If you want to test how the app looks like when Premium is active (without actually buying it):

1. Open the app and go to **Settings**.
2. Scroll down to the **Premium Status** section.
3. Click the gray button **[Debug] Force Toggle Premium**.
4. This will instantly:
   - Remove ads.
   - Unlock all premium skins (King, Wizard).
   - Unlock all premium themes (Neon, Chalkboard).

**Note:** This is only for testing. Real users won't see this button if you hide it, but for now it's visible to help you test.

---

## 4. Building the App

### Step 1: Build Web Assets
Run this command in the project root:
```bash
npm run build
npx cap sync android
```

### Step 2: Open Android Studio
1. Open **Android Studio**.
2. Select **Open** and choose the `android` folder inside the `knight-chase` directory.

### Step 3: Generate Signed Bundle (AAB)
1. Wait for Gradle sync to finish.
2. Go to **Build > Generate Signed Bundle / APK**.
3. Select **Android App Bundle**.
4. Create a new **Key store path** (keep this file safe!).
5. Fill in the password and alias details.
6. Click **Next**, select **release**, and click **Create**.

The `.aab` file will be generated in `android/app/release/`. Upload this file to the Google Play Console.
