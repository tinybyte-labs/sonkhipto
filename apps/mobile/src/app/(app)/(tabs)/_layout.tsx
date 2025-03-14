import { Image } from "expo-image";
import { Redirect, Tabs } from "expo-router";

import { AppBar, AppBarTitle } from "@/components/AppBar";
import TabBar from "@/components/TabBar";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";

export default function TabLayout() {
  const { translate } = useLanguage();
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/onboarding/welcome" />;
  }

  if ((user.categories?.length ?? 0) === 0) {
    return <Redirect href="/onboarding/categories" />;
  }

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen
        name="(feed)"
        options={{
          title: translate("home"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require("@/assets/icons/home.png")}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: translate("discover"),
          header: () => (
            <AppBar>
              <AppBarTitle title={translate("discover")} />
            </AppBar>
          ),
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require("@/assets/icons/discover.png")}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: translate("settings"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require("@/assets/icons/settings.png")}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
