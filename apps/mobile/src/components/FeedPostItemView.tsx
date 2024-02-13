import dayjs from "dayjs";
import { Image } from "expo-image";
import millify from "millify";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FeedNewsItem } from "./FeedList";

import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/providers/LanguageProvider";

export default function FeedPostItemView({
  post,
  height,
  bottomInset = 0,
  topInset = 0,
  isFavorite,
  isBookmarked,
  bookmarkCount,
  favoriteCount,
  onBookmarkPress,
  onFavoritePress,
  onReadMore,
  onShare,
}: {
  post: FeedNewsItem["data"];
  height: number;
  bottomInset?: number;
  topInset?: number;
  isFavorite?: boolean;
  isBookmarked?: boolean;
  favoriteCount?: number;
  bookmarkCount?: number;
  onBookmarkPress?: () => void;
  onFavoritePress?: () => void;
  onReadMore?: () => void;
  onShare?: () => void;
}) {
  const { translate, language } = useLanguage();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: colors.background,
        height,
      }}
    >
      <Pressable style={{ flex: 1 }} onPress={onReadMore}>
        <View style={{ flex: 1, maxHeight: 320 + topInset }}>
          <Image
            source={post.imageUrl}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: colors.secondary,
            }}
            contentFit="cover"
          />
        </View>

        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              lineHeight: 32,
              color: colors.foreground,
            }}
            numberOfLines={3}
          >
            {post.title}
          </Text>
          <Text
            style={{
              lineHeight: 20,
              marginTop: 8,
              color: colors.secondaryForeground,
            }}
          >
            {post.sourceName} •{" "}
            {dayjs(post.createdAt, {
              locale: language === "bn" ? "bn-bd" : "en",
            }).fromNow()}
            {post.authorName
              ? ` • ${translate("byPublisher", {
                  name: post.authorName,
                })}`
              : ``}
          </Text>
          <Text
            style={{
              color: colors.foreground,
              fontSize: 16,
              lineHeight: 24,
              marginTop: 8,
            }}
            numberOfLines={6}
          >
            {post.content}
          </Text>
        </View>
      </Pressable>
      <View
        style={[
          {
            paddingHorizontal: 16,
            paddingBottom: bottomInset ? insets.bottom : 0,
          },
        ]}
      >
        <View style={[styles.actionsContainer]}>
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: pressed ? colors.card : colors.background },
            ]}
            onPress={onFavoritePress}
          >
            {isFavorite ? (
              <Image
                source={require("@/assets/icons/heart-fill.png")}
                style={{ width: 24, height: 24, tintColor: colors.tintColor }}
              />
            ) : (
              <Image
                source={require("@/assets/icons/heart-outline.png")}
                style={{ width: 24, height: 24, tintColor: colors.tintColor }}
              />
            )}
            {typeof favoriteCount === "number" && (
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>
                {millify(favoriteCount)}
              </Text>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: pressed ? colors.card : colors.background },
            ]}
            onPress={onBookmarkPress}
          >
            {isBookmarked ? (
              <Image
                source={require("@/assets/icons/bookmark-fill.png")}
                style={{ width: 24, height: 24, tintColor: colors.tintColor }}
              />
            ) : (
              <Image
                source={require("@/assets/icons/bookmark-outline.png")}
                style={{ width: 24, height: 24, tintColor: colors.tintColor }}
              />
            )}
            {typeof bookmarkCount === "number" && (
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>
                {millify(bookmarkCount)}
              </Text>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: pressed ? colors.card : colors.background },
            ]}
            onPress={onShare}
          >
            <Image
              source={require("@/assets/icons/share.png")}
              style={{ width: 24, height: 24, tintColor: colors.tintColor }}
            />
            <Text style={[styles.actionLabel, { color: colors.foreground }]}>
              {translate("share")}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: "row",
    paddingBottom: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    height: 40,
    justifyContent: "center",
    borderRadius: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
});
