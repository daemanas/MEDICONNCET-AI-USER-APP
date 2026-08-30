# MediConnected AI — User Mobile Application

MediConnected AI is the official **user** mobile app for finding healthcare in rural and underserved areas.

It is **not** a demo and **not** a separate product database.

The Provider Portal, the Admin Portal, and this User App all talk to the **same Node.js + Express backend** and the **same MongoDB** database.

This project is **React Native CLI**. It does **not** use Expo.

---

## 1. What this app does

A person with a phone can:

- Sign in with a mobile number and OTP
- Share or type their area (city / district)
- Find doctors, clinics, hospitals, nursing homes, diagnostic centres, laboratories, and pharmacies that are already registered in MediConnected
- Search medicines and place an order with a pharmacy
- See **their own** prescriptions, reports, and health records
- Message a provider
- Use a simple AI helper (navigation, not a doctor)
- Keep using nearby provider lists **offline** after a sync

---

## 2. Project architecture

```
Provider / Admin Web Portal
            ↓
    Node.js + Express API
            ↓
         MongoDB
            ↓
   React Native User App
            ↓
        WatermelonDB
            ↓
   Offline experience (cached area data)
```

**Online**

```
User App → Express API → MongoDB
```

**Offline**

```
User App → WatermelonDB (providers, doctors, medicines for the user’s district)
```

The app **never** connects to MongoDB directly.

---

## 3. Technology stack

| Layer | Choice |
| --- | --- |
| App | React Native CLI (JavaScript / JSX) |
| Navigation | React Navigation |
| HTTP | Axios |
| Offline DB | WatermelonDB |
| Network | @react-native-community/netinfo |
| Location | @react-native-community/geolocation + react-native-permissions |
| Voice in | @react-native-voice/voice (native, not Expo) |
| Voice out | react-native-tts |
| Session | react-native-keychain |
| Config | react-native-config (`API_BASE_URL`) |
| Backend | Existing `provider_mng/backend` (Express + Mongoose + MongoDB) |

**Do not install Expo, Expo Router, or Expo SDK packages.**

---

## 4. React Native CLI setup

This folder was created with the official CLI (not Expo):

```bash
npx @react-native-community/cli init MediConnectedAI
```

You run the app with:

```bash
npx react-native run-android
npx react-native run-ios
```

---

## 5. Requirements

- Node.js 22.11 or newer
- npm
- JDK 17 (for Android)
- Android Studio + Android SDK + an emulator or a phone with USB debugging
- For iOS: macOS, Xcode, CocoaPods
- The MediConnected backend running and MongoDB available

---

## 6. Android setup

1. Install Android Studio.
2. Install an emulator (API 26+) or enable USB debugging on a phone.
3. Accept SDK licenses.
4. Copy `.env.example` to `.env` and set `API_BASE_URL` (see section 12).
5. From this folder:

```bash
npm install
npx react-native start
```

In another terminal:

```bash
npx react-native run-android
```

Permissions already added in `android/app/src/main/AndroidManifest.xml`:

- Internet
- Fine / coarse location
- Microphone
- Notifications

---

## 7. iOS setup

This repository was generated on **Windows**, so a full Xcode project (`.xcodeproj`) is not included.

On a **Mac**:

1. Copy this `MediConnectedAI` folder.
2. Recreate the iOS native project with the same name using React Native CLI if `ios/MediConnectedAI.xcodeproj` is missing, **or** generate iOS with the official template and merge `ios/Podfile` and `ios/MediConnectedAI/Info.plist` from this repo.
3. In `ios/`:

```bash
bundle install   # if the project uses Bundler
pod install
```

4. Open `MediConnectedAI.xcworkspace` in Xcode.
5. Set the bundle id (example: `ai.mediconnected.user`).
6. Run:

```bash
npx react-native run-ios
```

Microphone, speech, and location texts are in `ios/MediConnectedAI/Info.plist`.

---

## 8. Node.js setup (backend)

The user app does **not** ship its own server.

Use the existing portal backend:

```
d:\curser\provider_mng\backend
```

```bash
cd provider_mng/backend
cp .env.example .env    # set MONGO_URI, JWT secrets, etc.
npm install
npm run dev
```

Default API: `http://localhost:5000`

Health check: `GET /api/health`

Mobile routes: ` /api/mobile/... `

---

## 9. Backend connection

Patient login, providers, medicines, orders, reports, messages, and AI all go through:

`/api/mobile`

The same Facility, Doctor, Patient, Prescription, LabOrder, and order collections used by the web portal are reused.

A small **additive** endpoint was added for GPS mapping (it does not replace existing APIs):

`POST /api/mobile/geocode/reverse`

If `MAPS_API_KEY` is set on the **server**, Google Geocoding is used. Otherwise the server calls OpenStreetMap Nominatim. The Maps key stays on the server, not in the app.

---

## 10. MongoDB architecture

```
One MongoDB database (example name: mediconnect_ai)
        ↑
   Express (Mongoose)
        ↑
 Portal web app    +    User mobile app
```

Do **not** create a second database for the phone.

WatermelonDB on the phone is only a **cache** of verified providers, doctors, and medicines for the user’s **district / city**.

---

## 11. API configuration

Central client: `src/api/client.js`

- Base URL from `API_BASE_URL`
- Bearer access token
- 20 second timeout
- Refresh on HTTP 401
- Friendly network errors

---

## 12. Environment variables

Copy `.env.example` to `.env`.

| Variable | Meaning |
| --- | --- |
| `API_BASE_URL` | Backend origin **without** `/api/mobile` |

Examples:

- Android emulator: `http://10.0.2.2:5000`
- iOS simulator: `http://127.0.0.1:5000`
- Physical phone: `http://192.168.x.x:5000` (your computer’s LAN IP; phone and PC on the same Wi‑Fi)
- Production: `https://your-api-host`

`react-native-config` reads `.env` at **native build** time. After changing `.env`, rebuild the Android/iOS app (not only Metro).

**Never** put MongoDB passwords, JWT secrets, or AI keys in the React Native app. AI keys belong in the backend `.env` (`AI_API_URL`, `AI_API_KEY`).

---

## 13. Authentication

1. User enters mobile number (+ name on first use).
2. App calls `POST /api/mobile/auth/otp/request`.
3. In development, the backend logs the OTP and may return `debugOtp`.
4. `POST /api/mobile/auth/otp/verify` returns `accessToken` and `refreshToken`.
5. Tokens are stored in the **Keychain / Keystore**, not in plain AsyncStorage.
6. On start, the app loads tokens and calls `GET /api/mobile/me`.
7. Logout clears tokens and wipes the local WatermelonDB.

If the session is invalid, the user sees Login.

---

## 14. Location permission

After sign-in, the user can:

1. Allow GPS → app sends lat/lng to the backend reverse-geocode API → city, district, state saved on the Patient record.
2. Or type city, district, and state by hand.

The app does **not** hardcode a village name.

Discovery ranking on the server prefers: same city, then same district, then distance.

---

## 15. WatermelonDB

Local tables (area cache only):

- `providers`
- `doctors`
- `medicines`
- `sync_meta` (last sync time)

Sensitive PDFs are **not** copied into WatermelonDB.

On logout, `unsafeResetDatabase()` clears this cache.

---

## 16. Offline-first architecture

**Online:** API results are shown, then district data is stored locally.

**Offline:** search and nearby lists read WatermelonDB. The UI says results are saved on the phone and shows **last updated**.

Orders, messages, and new medical records need a network. Those screens show an error and Retry if the API fails.

---

## 17. Sync process

`src/sync/syncService.js`

- Watches NetInfo
- When the network returns, calls `GET /api/mobile/sync?district=&city=&updatedSince=`
- Upserts by remote id (no duplicate rows)
- Full replace when there is no `updatedSince`
- Incremental when `updatedSince` exists
- Stores `lastSyncAt`

The phone does **not** download the entire MongoDB.

---

## 18. Provider discovery

`GET /api/mobile/providers`

Only **verified** facilities from the portal appear.

Types match the backend:

`HOSPITAL`, `CLINIC`, `NURSING_HOME`, `DIAGNOSTIC_CENTRE`, `LABORATORY`, `PHARMACY`, `MEDICINE_SHOP`

Doctors come from `FacilityDoctor` links, not from a fake list.

---

## 19. Medicine ordering

1. Search `GET /api/mobile/medicines`
2. Choose a pharmacy that stocks the item
3. Quantity + pickup or delivery (only if the facility allows it)
4. `POST /api/mobile/orders`
5. Pharmacy staff see the order in the **existing** pharmacy portal (`/api/pharmacy/patient-orders`)
6. User tracks `GET /api/mobile/orders/:id`

Statuses are the backend enums (Pending → reviewing → accepted → preparing → ready / pickup / delivery → completed). They are not invented in the app.

If no pharmacy is nearby, the UI says so and still lists other shops in the same district when the API returns them.

Phone calls open the dialer only after a confirmation dialog.

---

## 20. Reports

`GET /api/mobile/reports`  
`GET /api/mobile/reports/:id?kind=`

The server checks `report.patientId === logged-in patient`. The app does not “filter other people” as the only protection.

Categories: diagnostic, laboratory, clinic, hospital, nursing home (from facility type).

---

## 21. Prescriptions

`GET /api/mobile/prescriptions`  
`GET /api/mobile/prescriptions/:id`

Only **finalized / revised** prescriptions for that patient. Drafts are hidden by the API.

---

## 22. AI architecture

```
User text or voice
    → src/ai/voiceService.js (speech-to-text)
    → POST /api/mobile/ai
    → Backend mobileAi.service.js
         (optional remote AI if AI_API_URL + AI_API_KEY are set on the server)
         (otherwise local intent → search tools)
    → JSON { text, actions[] }
    → src/ai/aiTools.js navigates the real screens
    → src/ai/voiceService.js text-to-speech
```

The assistant is a **healthcare navigator**. It must not claim to diagnose. Emergency wording points to the Emergency screen. The app **never** auto-dials.

---

## 23. Voice architecture

- Microphone permission (Android / iOS)
- Speech recognition: `@react-native-voice/voice`
- TTS: `react-native-tts`
- Intent backup: `src/ai/intentService.js` if the network AI call fails

---

## 24. Notifications

Architecture: `src/services/notificationService.js`

Today the app loads `GET /api/mobile/notifications` (same Notification collection as the portal) and shows a badge on Home.

To add push later, attach FCM / APNs **on the backend** and a RN CLI library such as Notifee or `@react-native-firebase/messaging`. Do **not** use Expo Notifications.

---

## 25. Navigation

Bottom tabs: **Home · Orders · Services · Messages · Profile**

The Services tab is visually emphasized.

Stacks cover search, provider detail, medicines, checkout, orders, prescriptions, reports, records, wallet, emergency, chat, location, notifications, and the AI screen.

---

## 26. Folder structure

```
MediConnectedAI/
  android/
  ios/          (Podfile + Info.plist; full Xcode project on macOS)
  src/
    api/        HTTP clients
    auth/       session + Keychain
    ai/         assistant, tools, voice
    components/
    constants/
    database/   WatermelonDB
    i18n/en/    English strings (ready for more languages)
    location/
    navigation/
    screens/
    services/
    store/
    sync/
    utils/
  App.jsx
  .env.example
```

---

## 27. Running Android

```bash
cd MediConnectedAI
npm install
# start the backend first
npx react-native start
npx react-native run-android
```

Emulator API URL: `http://10.0.2.2:5000`

---

## 28. Running iOS

On macOS, after `pod install`:

```bash
npx react-native run-ios
```

Simulator API URL: `http://127.0.0.1:5000`

---

## 29. Development troubleshooting

| Problem | What to try |
| --- | --- |
| Network error on emulator | Use `10.0.2.2`, not `localhost`. Rebuild after `.env` change. |
| Phone cannot reach API | Use LAN IP, same Wi‑Fi, Windows firewall allow Node. |
| OTP not received | In development, read the backend console (`[sms:dev]`) or `debugOtp`. |
| Metro / redbox | `npx react-native start --reset-cache` |
| Location empty | Grant permission or enter district by hand. |
| Empty nearby list | No **verified** facilities in that district in MongoDB yet. Register them in the Provider portal. |
| Voice fails | Grant microphone. On some emulators speech recognition is missing. |
| WatermelonDB native error | Rebuild the app (native module). Try `jsi: false` in `src/database/database.js` if JSI fails. |

---

## 30. Production build

**Android**

1. Create a release keystore (do not commit it).
2. Set `API_BASE_URL` to the public HTTPS API.
3. `cd android && ./gradlew assembleRelease` (or `bundleRelease` for Play).

**iOS**

Archive in Xcode with a production bundle id and HTTPS API.

Turn off cleartext HTTP. Keep secrets only on the server.

---

## 31. Security notes

- No MongoDB URI in the app
- No JWT signing secrets in the app
- No AI API keys in the app
- Medical routes require a **PATIENT** JWT; the server checks ownership
- Logout clears encrypted tokens and local cache
- Calls require user confirmation
- Do not cache other patients’ documents

---

## 32. Future multilingual support

English lives in `src/i18n/en/`.

`src/i18n/index.js` already has `setLanguage`. To add Hindi later, add `src/i18n/hi/` with the same file names (`common.js`, `home.js`, …) and register the dictionary. Screens use `i18n.t(...)` instead of hard-coded sentences.

---

## Shared backend reminder

Inspect and extend `provider_mng/backend` instead of creating a new API project.

Existing mobile routes are in `backend/src/routes/mobile.routes.js`.
