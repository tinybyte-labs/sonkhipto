import { useActionSheet } from "@expo/react-native-action-sheet";
import { useScrollToTop } from "@react-navigation/native";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import { ChevronDownIcon } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FlatList, ViewToken } from "react-native";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBar, AppBarIconButton, AppBarTitle } from "@/components/AppBar";
import type { FeedItem } from "@/components/FeedList";
import FeedList from "@/components/FeedList";
import { useColors } from "@/hooks/useColors";
import { feedItems, useFeed } from "@/providers/FeedProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { trpc } from "@/utils/trpc";

export default function FeedTabScreen() {
  const { translate, language } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const colors = useColors();
  const listRef = useRef<FlatList<FeedItem>>(null);
  const insets = useSafeAreaInsets();
  const dimensions = useWindowDimensions();
  const { feedType, changeFeedType } = useFeed();
  const { showActionSheetWithOptions } = useActionSheet();
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewedPostIds, setViewedPostIds] = useState<string[]>([]);

  useScrollToTop(listRef);

  const height = useMemo(
    () => dimensions.height - (insets.top + insets.bottom + 65 + 58),
    [dimensions.height, insets.top, insets.bottom],
  );

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
    () =>
      feedQuery.data?.pages
        .flatMap((page) => page.posts)
        .map(
          (post) =>
            ({ type: "post", data: post, key: post.id }) satisfies FeedItem,
        ) ?? [],
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
        setActiveIndex(changedItem.index ?? 0);
        if (item && item.type === "post") {
          const index = viewedPostIds.findIndex((id) => id === item.data.id);
          if (index === -1) {
            addView.mutate({ postId: item.data.id });
            console.log("ADD POST VIEW", item.data.id);
            setViewedPostIds([...viewedPostIds, item.data.id]);
          }
        }
      }
    },
    [addView, viewedPostIds],
  );

  const handleRefresh = useCallback(async () => {
    console.log("Refresh");
    setIsRefreshing(true);
    await feedQuery.refetch();
    setIsRefreshing(false);
  }, [feedQuery]);

  const showFeedTypePicker = useCallback(() => {
    showActionSheetWithOptions(
      {
        options: [
          ...feedItems.map((item) => translate(item.id)),
          translate("cancel"),
        ],
        cancelButtonIndex: feedItems.length,
        title: "Select Feed",
      },
      (index) => {
        const item = feedItems[index ?? -1];
        if (item) {
          changeFeedType(item.id);
        }
      },
    );
  }, [changeFeedType, showActionSheetWithOptions, translate]);

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [language, feedType]);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          header: () => (
            <AppBar>
              <TouchableOpacity
                onPress={showFeedTypePicker}
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <AppBarTitle title={translate(feedType)} style={{ flex: 0 }} />
                <ChevronDownIcon color={colors.foreground} size={24} />
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              {activeIndex > 0 ? (
                <AppBarIconButton
                  icon={
                    <Image
                      source={require("@/assets/icons/arrow-up.png")}
                      style={{
                        width: 24,
                        height: 24,
                        tintColor: colors.foreground,
                      }}
                    />
                  }
                  onPress={() =>
                    listRef.current?.scrollToOffset({
                      offset: 0,
                      animated: true,
                    })
                  }
                />
              ) : (
                <AppBarIconButton
                  icon={
                    feedQuery.isRefetching ? (
                      <ActivityIndicator size={24} color={colors.tintColor} />
                    ) : (
                      <Image
                        source={require("@/assets/icons/refresh.png")}
                        style={{
                          width: 24,
                          height: 24,
                          tintColor: colors.foreground,
                        }}
                      />
                    )
                  }
                  onPress={() => feedQuery.refetch()}
                />
              )}
            </AppBar>
          ),
          title: translate(feedType),
        }}
      />
      {feedQuery.isPending ? (
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
