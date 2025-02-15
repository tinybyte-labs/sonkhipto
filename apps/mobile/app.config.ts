import type { ExpoConfig } from "expo/config";

const defineConfig = (): ExpoConfig => ({
  name: "Sonkhipto",
  slug: "sonkhipto",
  version: "1.3.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.tinybytelabs.sonkhipto",
    googleServicesFile: "./GoogleService-Info.plist",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
      dark: {
        image: "./assets/images/splash.png",
        resizeMode: "contain",
        backgroundColor: "#09090b",
      },
    },
    config: {
      usesNonExemptEncryption: false,
    },
    entitlements: {
      "com.apple.developer.networking.wifi-info": true,
    },
  },
  android: {
    versionCode: 5,
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#FF3F48",
    },
    package: "com.tinybytelabs.sonkhipto",
    googleServicesFile: "./google-services.json",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
      dark: {
        image: "./assets/images/splash.png",
        resizeMode: "contain",
        backgroundColor: "#09090b",
      },
    },
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "@react-native-firebase/app",
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
        },
      },
    ],
    [
      "expo-secure-store",
      {
        faceIDPermission:
          "Allow $(PRODUCT_NAME) to access your Face ID biometric data.",
      },
    ],
  ],
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "24e1521d-66b9-4077-9741-d07a5325ee46",
    },
  },
  owner: "tinybyte_labs_ltd",
});

export default defineConfig;
