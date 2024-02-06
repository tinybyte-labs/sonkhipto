import { Redirect, Tabs } from "expo-router";
import { HomeIcon, SettingsIcon } from "lucide-react-native";

import TabBar from "@/components/TabBar";
import { useLanguage } from "@/providers/LanguageProvider";

export default function TabLayout() {
  const { translate, hasSelectedLanguage } = useLanguage();

  if (!hasSelectedLanguage) {
    return <Redirect href="/language-selector" />;
  }

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen
        name="(feed)"
        options={{
          title: translate("myFeed"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <HomeIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: translate("settings"),
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}