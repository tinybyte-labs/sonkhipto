import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import FeedList, { FeedItem } from "@/components/FeedList";
import { useColors } from "@/hooks/useColors";
import { useBookmark } from "@/providers/BookmarkProvider";
import { useLanguage } from "@/providers/LanguageProvider";

export default function BookmarksScreen() {
  const { bookmarks } = useBookmark();
  const [height, setHeight] = useState(0);
  const colors = useColors();
  const { translate } = useLanguage();

  const feedItems = useMemo(() => {
    const items: FeedItem[] = [];
    bookmarks
      .sort((a, b) => (new Date(a.createdAt) > new Date(b.createdAt) ? -1 : 1))
      .forEach((bookmark) => {
        if (bookmark.type === "news") {
          items.push({ type: "news", key: bookmark.id, data: bookmark.data });
        }
      });
    return items;
  }, [bookmarks]);

  return (
    <View
      style={{ flex: 1 }}
      onLayout={(ev) => {
        setHeight(ev.nativeEvent.layout.height);
      }}
    >
      {height > 0 ? (
        <FeedList
          data={feedItems}
          height={height}
          useBottomInset
          ListEmptyComponent={() => (
            <View
              style={{ height, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: colors.secondaryForeground }}>
                {translate("noBookmarks")}
              </Text>
              <Text
                style={{
                  color: colors.foreground,
                  fontWeight: "600",
                  marginTop: 16,
                }}
                onPress={() => router.navigate("/")}
              >
                Go to Feed
              </Text>
            </View>
          )}
        />
      ) : (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.foreground} />
        </View>
      )}
    </View>
  );
}
