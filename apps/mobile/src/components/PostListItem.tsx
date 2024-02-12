import { Image } from "expo-image";
import { View, Text, Pressable } from "react-native";

import { useColors } from "@/hooks/useColors";

export default function PostListItem({
  thumbnailUrl,
  title,
  onPress,
}: {
  thumbnailUrl?: string | null;
  title: string;
  onPress?: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: "center",
        gap: 12,
        backgroundColor: pressed ? colors.secondary : colors.background,
      })}
      onPress={onPress}
    >
      <Image
        source={thumbnailUrl}
        style={{ height: 64, width: 64, borderRadius: 12 }}
      />
      <View style={{ flex: 1, gap: 6 }}>
        <Text
          style={{ color: colors.foreground, fontWeight: "600" }}
          numberOfLines={3}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}
