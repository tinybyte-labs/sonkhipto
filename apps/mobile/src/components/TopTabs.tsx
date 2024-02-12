import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Animated, Pressable, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BAR_WIDTH = 32;

const TopTabs = ({
  state,
  navigation,
  descriptors,
  position,
}: MaterialTopTabBarProps) => {
  const insets = useSafeAreaInsets();
  const inputRange = state.routes.map((_, i) => i);

  const dimensions = useWindowDimensions();
  const offset = position.interpolate({
    inputRange,
    outputRange: inputRange.map((index) => {
      const itemSize = dimensions.width / inputRange.length;
      return index * itemSize + itemSize / 2 - BAR_WIDTH / 2;
    }),
  });

  return (
    <LinearGradient
      colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        paddingTop: insets.top,
        zIndex: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          height: 40,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

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

          const opacity = position.interpolate({
            inputRange,
            outputRange: inputRange.map((i) => (i === index ? 1 : 0.75)),
          });

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <Animated.Text
                style={{
                  fontWeight: "700",
                  color: "#FFFFFF",
                  fontSize: 16,
                  opacity,
                  textShadowColor: "rgba(0,0,0,0.1)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 1,
                }}
              >
                {label}
              </Animated.Text>
            </Pressable>
          );
        })}
      </View>
      <Animated.View
        style={{
          position: "absolute",
          left: 0,
          width: BAR_WIDTH,
          height: 3,
          bottom: 2,
          backgroundColor: "#FFFFFF",
          borderRadius: 99,
          zIndex: 10,
          transform: [
            {
              translateX: offset,
            },
          ],
          pointerEvents: "box-none",
          shadowColor: "black",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 1,
        }}
      />
    </LinearGradient>
  );
};

export default TopTabs;
