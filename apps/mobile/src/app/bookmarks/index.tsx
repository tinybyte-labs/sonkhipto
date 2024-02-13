import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import FeedList, { FeedItem } from "@/components/FeedList";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { trpc } from "@/utils/trpc";

export default function BookmarksScreen() {
  const colors = useColors();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { translate } = useLanguage();
  const { index } = useLocalSearchParams<{ index: string }>();
  const [height, setHeight] = useState(-1);
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const bookmarksQuery = trpc.post.getBookmarksWithPost.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const feedItems = useMemo(
    (): FeedItem[] =>
      bookmarksQuery.data?.pages
        .flatMap((page) => page.bookmarks)
        .map((bookmark) => ({
          type: "post",
          data: {
            id: bookmark.post.id,
            title: bookmark.post.title,
            content: bookmark.post.content,
            imageUrl: bookmark.post.imageUrl ?? undefined,
            authorName: bookmark.post.author.name ?? undefined,
            createdAt: bookmark.post.createdAt,
            sourceName: bookmark.post.sourceName,
            sourceUrl: bookmark.post.sourceUrl,
            bookmarkCount: bookmark.post._count.PostBookmark,
            favoriteCount: bookmark.post._count.FavoritePost,
            isBookmarked:
              !!user && bookmark.post.PostBookmark?.[0]?.userId === user.id,
            isFavorite:
              !!user && bookmark.post.FavoritePost?.[0]?.userId === user.id,
          },
          key: bookmark.postId,
        })) ?? [],
    [bookmarksQuery.data?.pages, user],
  );

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
    <View
      style={{ flex: 1 }}
      onLayout={(ev) => {
        setHeight(ev.nativeEvent.layout.height);
      }}
    >
      {bookmarksQuery.isPending || height < 0 ? (
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
          bottomInset={insets.bottom}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          onEndReached={handleEndReached}
          onEndReachedThreshold={3}
          initialScrollIndex={index ? Number(index) : 0}
          ListEmptyComponent={() => (
            <View
              style={{
                height,
                alignItems: "center",
                justifyContent: "center",
              }}
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
            ) : null
          }
        />
      )}
    </View>
  );
}
