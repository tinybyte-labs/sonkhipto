import { Image } from "expo-image";
import { Redirect, Tabs } from "expo-router";

import { AppBar, AppBarTitle } from "@/components/AppBar";
import TabBar from "@/components/TabBar";
import { useAuth } from "@/providers/AuthProvider";
import { feedItems, useFeed } from "@/providers/FeedProvider";
import { useLanguage } from "@/providers/LanguageProvider";

export default function TabLayout() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const { feedType } = useFeed();

  if (!user) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: translate(feedType),
          tabBarIcon: ({ color, size }) => (
            <Image
              source={feedItems.find((item) => item.id === feedType)?.icon}
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
