import { ChevronDownIcon, ChevronRightIcon } from "lucide-react-native";
import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export const ListSection = ({
  title,
  children,
  description,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
}) => {
  const colors = useColors();
  return (
    <View style={{ paddingHorizontal: 8 }}>
      {!!title && (
        <View style={{ paddingHorizontal: 8, marginBottom: 6 }}>
          <View
            style={{
              paddingBottom: 8,
              borderBottomWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                fontWeight: "500",
                color: colors.foreground,
                lineHeight: 20,
              }}
            >
              {title}
            </Text>
          </View>
        </View>
      )}
      {children}
      {!!description && (
        <View style={{ paddingHorizontal: 8, marginTop: 6 }}>
          <Text
            style={{
              fontSize: 12,
              color: colors.secondaryForeground,
              lineHeight: 18,
            }}
          >
            {description}
          </Text>
        </View>
      )}
    </View>
  );
};

export const ListItem = ({
  title,
  subtitle,
  onPress,
  onLongPress,
  type,
  color,
  leading,
  icon,
}: {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  type?: "navigation" | "dropdown" | "button";
  color?: string;
  leading?: ReactNode;
  icon?: ReactNode;
}) => {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => ({
        minHeight: 64,
        paddingHorizontal: 8,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        borderRadius: 12,
        backgroundColor: pressed ? colors.secondary : colors.background,
      })}
    >
      {icon && (
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 48,
            backgroundColor: colors.card,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            fontWeight: "600",
            color:
              color ?? (type === "button" ? colors.primary : colors.foreground),
            textAlign: type === "button" ? "center" : undefined,
          }}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text
            style={{
              color: colors.foreground,
              marginTop: 4,
              lineHeight: 20,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {leading}
      {type === "navigation" ? (
        <ChevronRightIcon size={22} color={colors.tintColor} />
      ) : type === "dropdown" ? (
        <ChevronDownIcon size={22} color={colors.tintColor} />
      ) : null}
    </Pressable>
  );
};

export const ListItemSeperator = () => {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", paddingLeft: 16 }}>
      <View style={{ backgroundColor: colors.border, flex: 1, height: 1 }} />
    </View>
  );
};
