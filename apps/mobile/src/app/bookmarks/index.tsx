import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getAppBarHeight } from "@/components/AppBar";
import FeedList, { FeedItem } from "@/components/FeedList";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/providers/LanguageProvider";
import { trpc } from "@/utils/trpc";

export default function BookmarksScreen() {
  const dimensions = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { translate } = useLanguage();
  const { index } = useLocalSearchParams();

  const height = useMemo(
    () => dimensions.height - getAppBarHeight(insets),
    [dimensions.height, insets],
  );

  const bookmarksQuery = trpc.post.getBookmarksWithPost.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
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
    setIsRefreshing(true);
    await bookmarksQuery.refetch();
    setIsRefreshing(false);
  }, [bookmarksQuery]);

  const handleEndReached = useCallback(() => {
    if (!bookmarksQuery.isFetchingNextPage) {
      bookmarksQuery.fetchNextPage();
    }
  }, [bookmarksQuery]);

  return (
    <View style={{ flex: 1 }}>
      {bookmarksQuery.isPending || height === 0 ? (
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
          initialScrollIndex={index ? Number(index) : 0}
          getItemLayout={(_, index) => ({
            index,
            length: height,
            offset: height * index,
          })}
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
