# WebView App

A simple React Native app that wraps a website in a native mobile shell. Built for both Android and iOS.

## What it does

Opens a web page inside the app using React Native WebView. Pretty straightforward.

## Setup

Make sure you have Node.js and React Native CLI set up. If not, check out the [RN docs](https://reactnative.dev/docs/environment-setup).

### Install dependencies

```bash
npm install
```

### Run on iOS (Mac only)

```bash
cd ios
pod install
cd ..
npm run ios
```

Or open `ios/WebViewApp.xcworkspace` in Xcode and hit Run.

### Run on Android

```bash
npm run android
```

Or open the `android/` folder in Android Studio.

## Project structure

```
src/
  components/
    HomeScreen.tsx
    WebViewScreen.tsx
  utils/
    permissions.ts
App.tsx
```

## Tech stack

- React Native 0.76
- React Navigation
- react-native-webview
- TypeScript

## Author

**Aayush Tejas**

---

Feel free to fork or use this as a starting point for your own project.
