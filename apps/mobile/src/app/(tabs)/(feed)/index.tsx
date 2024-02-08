import type { FeedItem } from "@/components/FeedList";
import type { FlatList, ViewToken } from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Stack } from "expo-router";
import { AppBar, AppBarIconButton, AppBarTitle } from "@/components/AppBar";
import FeedList from "@/components/FeedList";
import { EVENT_KEYS } from "@/constants/event-keys";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/providers/LanguageProvider";
import analytics from "@react-native-firebase/analytics";
import { useScrollToTop } from "@react-navigation/native";
import { ArrowUpIcon, RefreshCwIcon } from "lucide-react-native";
import { trpc } from "@/utils/trpc";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FeedTabScreen() {
  const { translate, language } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const colors = useColors();
  const listRef = useRef<FlatList<FeedItem>>(null);
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  useScrollToTop(listRef);
  const dimensions = useWindowDimensions();

  const height = useMemo(
    () => dimensions.height - (insets.top + insets.bottom + 65 + 62),
    [dimensions.height, insets.top, insets.bottom]
  );

  const myFeedQuery = trpc.feed.myFeed.useInfiniteQuery(
    {
      language: language === "bangla" ? "bn" : "en",
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const addView = trpc.post.addView.useMutation();
  const addImpression = trpc.post.addImpression.useMutation();

  const feed = useMemo(
    () =>
      myFeedQuery.data?.pages
        .flatMap((page) => page.posts)
        .map(
          (post) =>
            ({ type: "post", data: post, key: post.id }) satisfies FeedItem
        ) ?? [],
    [myFeedQuery.data?.pages]
  );

  const handleEndReached = useCallback(() => {
    if (!myFeedQuery.isFetchingNextPage) {
      console.log("Fetching next page...");
      void myFeedQuery.fetchNextPage();
    }
  }, [myFeedQuery]);

  const onViewableItemsChanged = useCallback(
    (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      const changedItem = info.changed[0];
      if (changedItem && changedItem.isViewable) {
        const item = changedItem.item as FeedItem;
        console.log(item);
        setActiveIndex(changedItem.index ?? 0);
        if (item && item.type === "post") {
          addImpression.mutate({ postId: item.data.id });
          void analytics().logEvent(EVENT_KEYS.NEWS_ITEM_IMPRESSION, {
            news_item_id: item.data.id,
            news_item_title: item.data.title,
            news_item_url: item.data.sourceUrl,
          });
        }
      }
    },
    []
  );

  const handleRefresh = useCallback(async () => {
    console.log("Refresh");
    setIsRefreshing(true);
    await myFeedQuery.refetch();
    setIsRefreshing(false);
  }, [myFeedQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const item = feed[activeIndex];
      if (item) {
        void analytics().logEvent(EVENT_KEYS.NEWS_ITEM_VIEW, {
          news_item_id: item.data.id,
          news_item_title: item.data.title,
          news_item_url: item.data.sourceUrl,
        });
        addView.mutate({ postId: item.data.id });
        console.log("ADD POST VIEW", item.data.id);
      }
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [activeIndex, feed]);

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [language]);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          header: () => (
            <AppBar>
              <AppBarTitle title={translate("myFeed")} />
              {activeIndex > 0 ? (
                <AppBarIconButton
                  icon={<ArrowUpIcon size={22} color={colors.tintColor} />}
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
                    myFeedQuery.isRefetching ? (
                      <ActivityIndicator size={22} color={colors.tintColor} />
                    ) : (
                      <RefreshCwIcon size={22} color={colors.tintColor} />
                    )
                  }
                  onPress={() => myFeedQuery.refetch()}
                />
              )}
            </AppBar>
          ),
          title: translate("myFeed"),
        }}
      />
      {myFeedQuery.isPending ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.foreground} />
        </View>
      ) : myFeedQuery.isError ? (
        <View>
          <Text style={{ color: colors.foreground }}>
            Error: {myFeedQuery.error.message}
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
            feed.length === 0 ? null : myFeedQuery.isFetchingNextPage ? (
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
