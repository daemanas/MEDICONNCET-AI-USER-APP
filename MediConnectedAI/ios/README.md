# iOS project note

This app was initialized with React Native CLI on Windows, so a complete `.xcodeproj` is not in git.

On a Mac:

1. Keep this `ios/Podfile` and `ios/MediConnectedAI/Info.plist`.
2. If `MediConnectedAI.xcodeproj` is missing, generate iOS natives:

```bash
# from a temporary RN CLI template of the same RN version, copy the ios folder,
# then rename the target to MediConnectedAI and merge Info.plist + Podfile from this repo.
```

Or re-run init on macOS into an empty folder and copy `src/`, `App.jsx`, `index.js`, `babel.config.js`, `.env`, and `android/` customizations from here.

3. `cd ios && pod install`
4. `npx react-native run-ios`
