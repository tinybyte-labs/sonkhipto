import {
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
  createMaterialTopTabNavigator,
} from "@react-navigation/material-top-tabs";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { withLayoutContext } from "expo-router";

import TopTabs from "@/components/TopTabs";

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
  MaterialTopTabNavigationOptions,
  typeof Navigator,
  TabNavigationState<ParamListBase>,
  MaterialTopTabNavigationEventMap
>(Navigator);

export default function FeedLayout() {
  return (
    <MaterialTopTabs tabBar={(props) => <TopTabs {...props} />}>
      <MaterialTopTabs.Screen
        name="all-posts"
        options={{ title: "All Posts" }}
      />
      <MaterialTopTabs.Screen name="index" options={{ title: "My Feed" }} />
      <MaterialTopTabs.Screen name="trending" options={{ title: "Trending" }} />
    </MaterialTopTabs>
  );
}
