import { Image, ImageSource } from "expo-image";
import { router } from "expo-router";
import { Fragment, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Pressable,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { FeedType, feedItems, useFeed } from "@/providers/FeedProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { trpc } from "@/utils/trpc";

type ActionItem = {
  id: string;
  name: string;
  image: ImageSource;
  onPress: () => void;
};

export default function DiscoverScreen() {
  const { changeFeedType } = useFeed();
  const colors = useColors();
  const { translate } = useLanguage();
  const bookmarksQuery = trpc.post.getBookmarksWithPost.useQuery({ limit: 5 });

  const handleOpenFeed = useCallback(
    (type: FeedType) => {
      changeFeedType(type);
      router.navigate("/");
    },
    [changeFeedType],
  );

  const items = useMemo(
    (): ActionItem[] => [
      ...feedItems.map<ActionItem>((item) => ({
        id: item.id,
        image: item.icon,
        name: translate(item.id),
        onPress: () => handleOpenFeed(item.id),
      })),
      {
        id: "bookmark",
        image: require("@/assets/icons/bookmarks.png"),
        name: translate("bookmarks"),
        onPress: () => router.push("/bookmarks/"),
      },
    ],
    [handleOpenFeed, translate],
  );

  return (
    <ScrollView
      style={{ flexGrow: 1 }}
      contentContainerStyle={{ paddingVertical: 16, gap: 32 }}
    >
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.id}
            onPress={item.onPress}
            style={{
              width: 86,
            }}
          >
            <View
              style={{
                backgroundColor: colors.card,
                aspectRatio: 1,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
              }}
            >
              <Image
                source={item.image}
                style={{ width: 52, height: 52, tintColor: colors.tintColor }}
              />
            </View>
            <Text
              style={{
                color: colors.foreground,
                marginTop: 6,
                fontWeight: "500",
                textAlign: "center",
                fontSize: 13,
              }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {bookmarksQuery.data && bookmarksQuery.data.bookmarks.length > 0 && (
        <View style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 18,
                fontWeight: "700",
                color: colors.foreground,
              }}
              numberOfLines={1}
            >
              {translate("recentBookmarks")}
            </Text>
            <TouchableOpacity onPress={() => router.push("/bookmarks/")}>
              <Text style={{ fontWeight: "600", color: colors.tintColor }}>
                {translate("seeAll")}
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            {bookmarksQuery.data.bookmarks.map((bookmark, index) => (
              <Fragment key={bookmark.postId}>
                <Pressable
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    alignItems: "center",
                    gap: 12,
                    backgroundColor: pressed
                      ? colors.secondary
                      : colors.background,
                  })}
                  onPress={() => router.navigate(`/bookmarks/?index=${index}`)}
                >
                  <Image
                    source={bookmark.post.imageUrl}
                    style={{ height: 72, width: 72, borderRadius: 12 }}
                  />
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text
                      style={{ color: colors.foreground, fontWeight: "600" }}
                    >
                      {bookmark.post.title}
                    </Text>
                    <Text
                      style={{
                        color: colors.secondaryForeground,
                        fontSize: 12,
                      }}
                      numberOfLines={1}
                    >
                      {bookmark.post.content}
                    </Text>
                  </View>
                </Pressable>
                {index < bookmarksQuery.data.bookmarks.length - 1 && (
                  <View style={{ paddingLeft: 16 + 12 + 72 }}>
                    <View
                      style={{
                        flex: 1,
                        height: 1,
                        backgroundColor: colors.border,
                      }}
                    />
                  </View>
                )}
              </Fragment>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
