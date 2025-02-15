import * as Application from "expo-application";
import * as Device from "expo-device";
import { Platform } from "react-native";

export const APP_NAME = "Sonkhipto";

export const LOCALHOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";

export const PROD_API = "https://sonkhipto.com";
export const DEV_API = `http://${LOCALHOST}:3000`;

export const API_URL = PROD_API;

export const ITUNE_ITEM_ID = 6477333889;
export const ANDROID_PACKAGE_NAME = "com.tinybytelabs.sonkhipto";
export const IOS_BUNDLE_IDENTIFIER = "com.tinybytelabs.sonkhipto";

export const RC_PUBLIC_IOS_SDK_KEY = "";
export const RC_PUBLIC_ANDROID_SDK_KEY = "";

export const APP_VERSION = Application.nativeApplicationVersion ?? "1.0.0";
export const APP_BUILD_NUMBER = Application.nativeBuildVersion ?? 0;

export const VERSION_WITH_BUILD_NUMBER = `${APP_VERSION}(${APP_BUILD_NUMBER})`;

export const DEV_PRO = __DEV__ && true;

export const PRIVACY_POLICY_URL = "https://sonkhipto.com/legal/privacy";
export const TERMS_OF_SERVICE_URL = "https://sonkhipto.com/legal/terms";

export const FACEBOOK_URL = "https://www.facebook.com/sonkhiptoapp";
export const INSTAGRAM_URL = "https://www.instagram.com/sonkhipto.app";
export const WEBSITE_URL = "https://sonkhipto.com";
