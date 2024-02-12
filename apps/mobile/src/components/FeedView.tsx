import { useScrollToTop } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAtom } from "jotai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FlatList, ViewToken } from "react-native";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { FeedItem } from "@/components/FeedList";
import FeedList from "@/components/FeedList";
import { useColors } from "@/hooks/useColors";
import { FeedType } from "@/providers/FeedProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { viewedPostIdsAtom } from "@/stores/viewed-post-ids";
import { trpc } from "@/utils/trpc";

export default function FeedView({ feedType }: { feedType: FeedType }) {
  const { translate, language } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const colors = useColors();
  const listRef = useRef<FlatList<FeedItem>>(null);
  const [viewedPostIds, setViewedPostIds] = useAtom(viewedPostIdsAtom);
  const [height, setHeight] = useState(-1);
  const { index } = useLocalSearchParams<{ index?: string }>();
  const insets = useSafeAreaInsets();

  useScrollToTop(listRef);

  const feedQuery = trpc.feed.myFeed.useInfiniteQuery(
    {
      language,
      feedType,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const addView = trpc.post.addView.useMutation();

  const feed = useMemo(
    (): FeedItem[] =>
      feedQuery.data?.pages
        .flatMap((page) => page.posts)
        .map((post) => ({ type: "post", data: post, key: post.id })) ?? [],
    [feedQuery.data?.pages],
  );

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
            addView.mutate({ postId: item.data.id });
            setViewedPostIds([...viewedPostIds, item.data.id]);
          }
        }
      }
    },
    [addView, setViewedPostIds, viewedPostIds],
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
    console.log(index);
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
      <StatusBar style="light" />
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
