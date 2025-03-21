import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { EdgeInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export const getTabBarHeight = (insets: EdgeInsets) => {
  return 64 + 1 + insets.bottom;
};

export default function TabBar({
  descriptors,
  state,
  navigation,
  insets,
}: BottomTabBarProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.tabsContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const color = isFocused
            ? colors.tintColor
            : colors.secondaryForeground;

          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : (options.title ?? route.name);

          const icon = options.tabBarIcon;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              key={route.name}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
            >
              {icon?.({ focused: isFocused, color, size: 26 })}
              <Text style={[styles.tabLabel, { color }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  tabsContainer: {
    height: 64,
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 13,
    marginTop: 6,
    fontWeight: "500",
  },
});
