import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import FeedList, { FeedItem } from "@/components/FeedList";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/providers/LanguageProvider";
import { trpc } from "@/utils/trpc";

export default function BookmarksScreen() {
  const [height, setHeight] = useState(0);
  const colors = useColors();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { translate } = useLanguage();
  const bookmarksQuery = trpc.post.getBookmarksWithPost.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const feedItems = useMemo(() => {
    const items: FeedItem[] = [];
    bookmarksQuery.data?.pages
      .flatMap((page) => page.bookmarks)
      .forEach((bookmark) => {
        items.push({ type: "post", data: bookmark.post, key: bookmark.postId });
      });
    return items;
  }, [bookmarksQuery]);

  const handleRefresh = useCallback(async () => {
    console.log("Refresh");
    setIsRefreshing(true);
    await bookmarksQuery.refetch();
    setIsRefreshing(false);
  }, [bookmarksQuery]);

  const handleEndReached = useCallback(() => {
    if (!bookmarksQuery.isFetchingNextPage) {
      console.log("Fetching next page...");
      void bookmarksQuery.fetchNextPage();
    }
  }, [bookmarksQuery]);

  return (
    <View
      style={{ flex: 1 }}
      onLayout={(ev) => {
        setHeight(ev.nativeEvent.layout.height);
      }}
    >
      {bookmarksQuery.isPending || height == 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.foreground} />
        </View>
      ) : bookmarksQuery.isError ? (
        <Text>Error: {bookmarksQuery.error.message}</Text>
      ) : (
        <FeedList
          data={feedItems}
          height={height}
          useBottomInset
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          onEndReached={handleEndReached}
          onEndReachedThreshold={3}
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
          ListFooterComponent={() =>
            feedItems.length ===
            0 ? null : bookmarksQuery.isFetchingNextPage ? (
              <View
                style={{
                  height,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator />
                <Text
                  style={{ color: colors.secondaryForeground, marginTop: 24 }}
                >
                  {translate("loadingMore")}...
                </Text>
              </View>
            ) : (
              <View
                style={{
                  height,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: colors.secondaryForeground }}>
                  {translate("youHaveReachedTheEnd")}
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
}
