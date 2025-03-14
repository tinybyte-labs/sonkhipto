import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { ActivityIndicator, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export interface LoadingViewProps {
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export default function LoadingView({ color, style }: LoadingViewProps) {
  const colors = useColors();
  return (
    <View
      style={[
        { flex: 1, alignItems: "center", justifyContent: "center" },
        style,
      ]}
    >
      <ActivityIndicator color={color ?? colors.foreground} />
    </View>
  );
}
