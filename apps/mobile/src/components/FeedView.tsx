import { useScrollToTop } from "@react-navigation/native";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ViewToken } from "react-native";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { FeedItem } from "@/components/FeedList";
import FeedList from "@/components/FeedList";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { trpc } from "@/utils/trpc";

export type FeedType = Parameters<
  typeof trpc.feed.myFeed.useInfiniteQuery
>["0"]["feedType"];

export type FeedViewProps = {
  feedType: FeedType;
};

export default function FeedView({ feedType }: FeedViewProps) {
  const { translate, language } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const colors = useColors();
  const listRef = useRef<FlashList<FeedItem>>(null);
  const [viewedPostIds, setViewedPostIds] = useState<string[]>([]);
  const [height, setHeight] = useState(-1);
  const { index } = useLocalSearchParams<{ index?: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  useScrollToTop(listRef as any);

  const feedQuery = trpc.feed.myFeed.useInfiniteQuery(
    {
      language,
      feedType,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const feed = useMemo(
    (): FeedItem[] =>
      feedQuery.data?.pages
        .flatMap((page) => page.posts)
        .map((post) => ({
          type: "post",
          data: {
            id: post.id,
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl,
            authorName: post.author?.name,
            createdAt: post.createdAt,
            sourceName: post.sourceName,
            sourceUrl: post.sourceUrl,
            bookmarkCount: post._count.PostBookmark,
            favoriteCount: post._count.FavoritePost,
            isBookmarked: !!user && post.PostBookmark?.[0]?.userId === user.id,
            isFavorite: !!user && post.FavoritePost?.[0]?.userId === user.id,
          },
          key: post.id,
        })) ?? [],
    [feedQuery.data?.pages, user],
  );

  const addViewMut = trpc.post.addView.useMutation();

  const handleEndReached = useCallback(() => {
    if (!feedQuery.isFetchingNextPage) {
      feedQuery.fetchNextPage();
    }
  }, [feedQuery]);

  const onViewableItemsChanged = useCallback(
    async (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      const changedItem = info.changed[0];
      if (changedItem && changedItem.isViewable) {
        const item = changedItem.item as FeedItem;
        if (item && item.type === "post") {
          const index = viewedPostIds.findIndex((id) => id === item.data.id);
          if (index === -1) {
            addViewMut.mutate({ postId: item.data.id });
            setViewedPostIds([...viewedPostIds, item.data.id]);
          }
        }
      }
    },
    [addViewMut, setViewedPostIds, viewedPostIds],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await feedQuery.refetch();
    setIsRefreshing(false);
  }, [feedQuery]);

  useEffect(() => {
    listRef.current?.scrollToIndex({ index: 0, animated: false });
  }, [language]);

  useEffect(() => {
    if (index) {
      listRef.current?.scrollToIndex({
        index: Number(index) ?? 0,
        animated: false,
      });
    }
  }, [index]);

  return (
    <View
      style={{ flex: 1 }}
      onLayout={(ev) => {
        setHeight(ev.nativeEvent.layout.height);
      }}
    >
      {feedQuery.isPending || height < 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.foreground} />
        </View>
      ) : feedQuery.isError ? (
        <View>
          <Text style={{ color: colors.foreground }}>
            Error: {feedQuery.error.message}
          </Text>
        </View>
      ) : (
        <FeedList
          ref={listRef}
          data={feed}
          onViewableItemsChanged={onViewableItemsChanged}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          onEndReached={handleEndReached}
          onEndReachedThreshold={3}
          height={height}
          topInset={insets.top + 40}
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
                {translate("youHaveCompletelyCaughtUp")}
              </Text>
            </View>
          )}
          ListFooterComponent={() =>
            feed.length === 0 ? null : feedQuery.isFetchingNextPage ? (
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
