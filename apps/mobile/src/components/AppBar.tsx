import type { ReactNode } from "react";
import type {
  StyleProp,
  ViewStyle} from "react-native";
import {
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import type { EdgeInsets} from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export interface CustomHeaderProps {
  children: ReactNode;
  hideInset?: boolean;
}

export const getAppBarHeight = (insets: EdgeInsets) => {
  return 58 + insets.top;
};

export const AppBar = ({ children, hideInset }: CustomHeaderProps) => {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  return (
    <View
      style={{
        paddingTop: hideInset ? 0 : insets.top,
        backgroundColor: colors.background,
      }}
    >
      <View style={styles.container}>{children}</View>
    </View>
  );
};

export const AppBarTitle = ({
  title,
  style,
}: {
  title: string;
  style?: StyleProp<ViewStyle>;
}) => {
  const colors = useColors();
  return (
    <View style={[styles.titleContainer, style]}>
      <Text
        numberOfLines={1}
        style={[styles.title, { color: colors.foreground }]}
      >
        {title}
      </Text>
    </View>
  );
};

export const AppBarIconButton = ({
  title,
  icon,
  onPress,
  disabled,
}: {
  title?: string;
  icon: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}) => {
  const colors = useColors();
  return (
    <Pressable
      aria-label={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButtonContainer,
        { backgroundColor: pressed ? colors.card : colors.secondary },
      ]}
      disabled={disabled}
    >
      {icon}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 42,
  },
  iconButtonContainer: {
    width: 42,
    height: 42,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
  },
});
