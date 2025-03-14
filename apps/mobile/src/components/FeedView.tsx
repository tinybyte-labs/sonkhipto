import type { PublicPost } from "@acme/trpc/types";
import { useScrollToTop } from "@react-navigation/native";
import type { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams } from "expo-router";
import type { RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FlatList, ViewToken } from "react-native";
import { ActivityIndicator, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { FeedItem } from "@/components/FeedList";
import FeedList from "@/components/FeedList";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/providers/LanguageProvider";
import { trpc } from "@/utils/trpc";

export type FeedType = Parameters<
  typeof trpc.feed.myFeed.useInfiniteQuery
>["0"]["feedType"];

export interface FeedViewProps {
  data: PublicPost[];
  onRefresh?: () => Promise<void>;
  onFetchNextPage?: () => Promise<void>;
  isFetchingNextPage?: boolean;
}

export default function FeedView({
  data,
  isFetchingNextPage,
  onFetchNextPage,
  onRefresh,
}: FeedViewProps) {
  const { translate, language } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const colors = useColors();
  const listRef = useRef<FlashList<FeedItem>>(null);
  const [viewedPostIds, setViewedPostIds] = useState<string[]>([]);
  const [height, setHeight] = useState(-1);
  const { index } = useLocalSearchParams<{ index?: string }>();
  const insets = useSafeAreaInsets();

  useScrollToTop(listRef as unknown as RefObject<FlatList<FeedItem>>);

  const feed = useMemo(
    (): FeedItem[] =>
      data.map((post) => ({
        type: "post",
        key: post.id,
        data: post,
      })),
    [data],
  );

  const addViewMut = trpc.post.addView.useMutation();

  const handleEndReached = useCallback(async () => {
    if (!isFetchingNextPage) {
      await onFetchNextPage?.();
    }
  }, [isFetchingNextPage, onFetchNextPage]);

  const onViewableItemsChanged = useCallback(
    (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      const changedItem = info.changed[0];
      if (changedItem.isViewable) {
        const item = changedItem.item as FeedItem;
        if (item.type === "post") {
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
    await onRefresh?.();
    setIsRefreshing(false);
  }, [onRefresh]);

  useEffect(() => {
    listRef.current?.scrollToIndex({ index: 0, animated: false });
  }, [language]);

  useEffect(() => {
    if (index) {
      listRef.current?.scrollToIndex({
        index: Number(index),
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
      {height < 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.foreground} />
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
            feed.length === 0 ? null : isFetchingNextPage ? (
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
