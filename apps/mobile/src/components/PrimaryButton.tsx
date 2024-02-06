import { Text, StyleSheet, ActivityIndicator, Pressable } from "react-native";

import { useColors } from "@/hooks/useColors";

export default function PrimaryButton({
  onPress,
  title,
  disabled,
  isLoading,
}: {
  onPress?: () => void;
  title?: string;
  disabled?: boolean;
  isLoading?: boolean;
}) {
  const colors = useColors();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: pressed ? colors.primaryActive : colors.primary,
          opacity: disabled || isLoading ? 0.5 : 1,
        },
      ]}
      disabled={disabled || isLoading}
      onPress={onPress}
    >
      {isLoading && <ActivityIndicator color={colors.primaryForeground} />}
      <Text
        style={[
          styles.label,
          {
            color: colors.primaryForeground,
          },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    flexDirection: "row",
  },
  label: {
    fontWeight: "600",
    fontSize: 16,
  },
});
