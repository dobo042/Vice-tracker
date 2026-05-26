# Vice Tracker — CLAUDE.md

## Project Overview

**Vice Tracker** is a React Native mobile application (Android-first) for tracking personal habits or vices. The project was initialized in May 2026 and is in the early development phase — configuration and dependencies are in place, but application source code has not been written yet.

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
| Icons | react-native-vector-icons 10.3.0 |
| Testing | Jest 29.6.3 + react-test-renderer |
| Linting | ESLint 8.19.0 (@react-native/eslint-config) |
| Formatting | Prettier 2.8.8 |
| Bundler | Metro (@react-native/metro-config 0.74.89) |

Node.js >= 18 is required.

## Repository Structure

```
Vice-tracker/
├── CLAUDE.md           # This file
├── README.md           # User-facing docs (currently empty)
├── package.json        # Dependencies and scripts
│
# To be created as the project grows:
├── index.js            # React Native entry point
├── App.tsx             # Root component
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen-level components
│   ├── navigation/     # Navigation configuration
│   ├── store/          # Zustand state stores
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Helpers and utilities
│   └── types/          # Shared TypeScript types
├── android/            # Android native project
├── tsconfig.json       # TypeScript config (to be created)
├── babel.config.js     # Babel config (to be created)
├── metro.config.js     # Metro bundler config (to be created)
└── .eslintrc.js        # ESLint config (to be created)
```

## Development Commands

```bash
# Start Metro bundler (keep running in a separate terminal)
npm start

# Run on Android (requires Android emulator or device)
npm run android

# Linting
npm run lint

# Tests
npm test

# Bundle for Android release
npm run bundle:android

# Build release APK
npm run build:apk

# Build debug APK
npm run build:debug-apk
```

## Git Workflow

- **Main branch:** `main`
- Feature and AI-assistant work happens on dedicated branches (e.g. `claude/*`)
- Commit messages use the imperative mood, e.g. `add vice tracking screen`
- Keep commits focused — one logical change per commit

## Architecture Conventions

### State Management (Zustand)
- Each domain (vices, settings, notifications) gets its own store file under `src/store/`
- Stores export a single `use<Domain>Store` hook
- Keep store state normalized; derive computed values with selectors inside the hook

### Navigation
- Define all route names as a typed `RootStackParamList` in `src/navigation/types.ts`
- Use a single `NavigationContainer` at the root (`App.tsx`)
- Screen components live in `src/screens/`, one file per screen

### Components
- Prefer `react-native-paper` components over custom primitives for consistent Material Design 3 theming
- Component files use PascalCase: `ViceCard.tsx`
- Keep components small; extract sub-components when a file exceeds ~150 lines
- Use `react-native-safe-area-context` (`SafeAreaView`) for all full-screen layouts

### TypeScript
- `strict` mode enabled (configure in `tsconfig.json` when created)
- No `any` — use `unknown` and narrow explicitly
- Shared types go in `src/types/`; screen-specific prop types live in their own file

### Storage
- All persistence goes through `@react-native-async-storage/async-storage`
- Wrap storage calls in a thin utility layer (`src/utils/storage.ts`) so the rest of the app never imports AsyncStorage directly

### Notifications
- Notification logic lives in `src/utils/notifications.ts` or a dedicated service
- Request permissions on first launch; handle the denied state gracefully

### Styling
- Use `react-native-paper`'s `useTheme()` hook for colors/typography — avoid hardcoded hex values
- Layout and spacing via React Native `StyleSheet.create()`
- No inline styles except for truly dynamic values

### Testing
- Unit tests live alongside the file they test: `ViceCard.test.tsx` next to `ViceCard.tsx`
- Use Jest + react-test-renderer for component snapshots
- Aim to test behavior, not implementation details

## Environment & Configuration Files to Create

Before writing application code, create these standard React Native configuration files:

1. **`index.js`** — entry point that registers `App` with `AppRegistry`
2. **`App.tsx`** — root component with `NavigationContainer` and theme provider
3. **`tsconfig.json`** — extend `@react-native/typescript-config/tsconfig.json`
4. **`babel.config.js`** — use `@react-native/babel-preset` preset
5. **`metro.config.js`** — use `@react-native/metro-config` defaults
6. **`.eslintrc.js`** — extend `@react-native` eslint config
7. **`.prettierrc`** — `{ "singleQuote": true, "trailingComma": "all", "printWidth": 100 }`
8. **`.gitignore`** — standard React Native gitignore

## Key Dependency Notes

- **react-navigation v7** requires `react-native-screens` and `react-native-safe-area-context` to be installed and linked (already listed as dependencies)
- **react-native-gesture-handler** must be imported at the very top of `index.js` (before any other import)
- **react-native-reanimated** requires its Babel plugin in `babel.config.js`
- **react-native-vector-icons** requires linking fonts in the Android `build.gradle`
- **@notifee/react-native** requires Android permission declarations in `AndroidManifest.xml`
