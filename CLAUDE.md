# Vice Tracker — CLAUDE.md

## Project Overview

**Vice Tracker** is a React Native 0.74 mobile application (Android-first) for tracking personal habits or vices. Users add vices with a per-vice cooldown timer; logging a vice turns its card red and schedules a push notification for when the cooldown elapses, at which point the card turns green.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | React Native 0.74.7 / React 18.2.0 |
| Language | TypeScript 5.0.4 |
| Navigation | @react-navigation/native + @react-navigation/stack |
| UI Components | react-native-paper 5.15.3 (Material Design 3) |
| State Management | Zustand 5.0.13 |
| Local Storage | @react-native-async-storage/async-storage |
| Notifications | @notifee/react-native 9.1.8 |
| Animations | react-native-reanimated 4.3.1 |
| Gestures | react-native-gesture-handler 2.31.2 |
| Icons | react-native-vector-icons 10.3.0 (MaterialCommunityIcons) |
| Testing | Jest 29.6.3 + react-test-renderer |
| Linting | ESLint 8.19.0 (@react-native/eslint-config) |
| Formatting | Prettier 2.8.8 |
| Bundler | Metro (@react-native/metro-config 0.74.89) |

Node.js >= 18, JDK 17 required.

## Repository Structure

```
Vice-tracker/
├── .github/workflows/build-android.yml   # CI: builds debug APK on push
├── CLAUDE.md
├── README.md
├── package.json
├── index.js              # RN entry point (gesture-handler import must be first)
├── App.tsx               # Root: GestureHandlerRootView > SafeAreaProvider > PaperProvider > NavigationContainer
├── app.json              # App name: ViceTracker
├── babel.config.js       # @react-native/babel-preset + reanimated plugin
├── metro.config.js
├── tsconfig.json
├── android/              # Native Android project (package: com.vicetracker)
│   └── app/src/main/
│       ├── AndroidManifest.xml   # POST_NOTIFICATIONS, VIBRATE, RECEIVE_BOOT_COMPLETED
│       └── java/com/vicetracker/
└── src/
    ├── types/index.ts        # Vice, HistoryEntry
    ├── store/
    │   ├── viceStore.ts      # vices[], addVice, logVice, deleteVice (persisted)
    │   └── historyStore.ts   # entries[], addEntry, deleteEntry, clearHistory (persisted)
    ├── navigation/
    │   ├── types.ts          # RootStackParamList: Vices | History
    │   └── AppNavigator.tsx  # Stack navigator, purple header
    ├── screens/
    │   ├── VicesScreen.tsx   # Vice list + FAB + delete dialog; schedules notifications
    │   └── HistoryScreen.tsx # Logged-before-delete entries
    ├── components/
    │   ├── ViceCard.tsx          # Red/green status, Log button, Delete button
    │   ├── AddViceModal.tsx      # Name + description + cooldown (hours)
    │   └── DeleteConfirmDialog.tsx  # Cancel / Delete Only / Log & Delete
    └── utils/
        └── notifications.ts  # notifee wrapper: setup, requestPermissions, schedule, cancel
```

## Development Commands

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start Metro bundler (keep running in a separate terminal)
npm start

# Run on Android device/emulator
npm run android

# Linting
npm run lint

# Tests
npm test

# Bundle JS for Android release
npm run bundle:android

# Build release APK (requires signing config)
npm run build:apk

# Build debug APK
npm run build:debug-apk
```

## Building an APK

### Via GitHub Actions (recommended — no local toolchain needed)

Every push to `main` or `claude/**` triggers `.github/workflows/build-android.yml`, which:

1. Sets up JDK 17 and Android SDK on an Ubuntu runner
2. Runs `npm ci`
3. Runs `./gradlew assembleDebug`
4. Uploads `app-debug.apk` as a workflow artifact (retained 14 days)

**To download the APK:**
1. Go to the repository on GitHub → **Actions** tab
2. Click the latest **Build Android APK** run
3. Download the `vice-tracker-debug-<sha>` artifact

### Local build (Android Studio / command line)

**Prerequisites:**
- Android Studio with SDK Platform 34 and Build Tools 34 installed
- `ANDROID_HOME` env var pointing to your SDK (e.g. `~/Library/Android/sdk`)
- JDK 17 (`JAVA_HOME` set accordingly)

```bash
# 1. Install JS deps
npm install --legacy-peer-deps

# 2. Start Metro in one terminal
npm start

# 3. Build and install debug APK (in another terminal)
npm run android

# — or build APK without installing —
cd android && ./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```

**First-run checklist:**
- Accept Android SDK licenses: `$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses`
- Ensure an emulator is running or a device connected with USB debugging enabled

## Git Workflow

- **Main branch:** `main`
- Feature / AI-assistant work on `claude/*` branches
- Commit messages use the imperative mood: `add vice tracking screen`
- Keep commits focused — one logical change per commit
- CI builds a debug APK on every push; download from GitHub Actions artifacts

## Architecture Conventions

### Vice lifecycle
1. **Add** — name, optional description, cooldown in hours (stored as `cooldownMinutes`)
2. **Log** — sets `lastLoggedAt`, card turns red, notifee schedules a `TIMESTAMP` trigger notification
3. **Cooldown elapses** — notification fires ("You can X again!"), card turns green
4. **Delete** — cancels pending notification via `notifee.cancelNotification('vice-<id>')`; optionally saves to history first

### State Management (Zustand)
- One store per domain: `viceStore`, `historyStore`
- Stores export a single `use<Domain>Store` hook
- Both stores are persisted via `zustand/middleware` `persist` + `createJSONStorage(() => AsyncStorage)`
- Notification side-effects (schedule/cancel) happen in the screen, not the store

### Navigation
- Typed `RootStackParamList` in `src/navigation/types.ts`
- Single `NavigationContainer` in `App.tsx`
- History screen is reachable via a clock icon in the Vices screen header

### Components
- Prefer `react-native-paper` over custom primitives (Material Design 3)
- PascalCase filenames: `ViceCard.tsx`
- Extract sub-components when a file exceeds ~150 lines
- No inline styles except truly dynamic values; use `StyleSheet.create()` for layout

### TypeScript
- `strict` mode via `@react-native/typescript-config`
- No `any` — use `unknown` and narrow explicitly
- Shared types in `src/types/`

### Notifications (`src/utils/notifications.ts`)
- `setupNotifications()` — creates Android channel, called on app launch
- `requestNotificationPermissions()` — called after setup; handles denied state gracefully
- `scheduleViceReadyNotification(vice)` — cancels previous then creates a `TIMESTAMP` trigger
- `cancelViceNotification(viceId)` — call before deleting a vice

### Storage
- All AsyncStorage access is wrapped in stores via Zustand `persist`
- Never import AsyncStorage directly outside of store files

### Testing
- Test files live next to the file they test: `ViceCard.test.tsx` beside `ViceCard.tsx`
- Use Jest + react-test-renderer for snapshot / behaviour tests

## Key Dependency Notes

- **react-native-gesture-handler** must be the very first import in `index.js`
- **react-native-reanimated** requires its Babel plugin in `babel.config.js`
- **react-native-vector-icons** fonts are linked via `fonts.gradle` in `android/app/build.gradle`
  (MaterialIcons.ttf and MaterialCommunityIcons.ttf)
- **@notifee/react-native** requires `POST_NOTIFICATIONS`, `VIBRATE`, and `RECEIVE_BOOT_COMPLETED`
  permissions in `AndroidManifest.xml` (already added)
- **react-navigation v7** requires `react-native-screens` and `react-native-safe-area-context`
