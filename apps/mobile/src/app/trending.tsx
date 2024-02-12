import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import FeedList, { FeedItem } from "@/components/FeedList";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/providers/LanguageProvider";
import { trpc } from "@/utils/trpc";

export default function TrendingScreen() {
  const colors = useColors();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { translate, language } = useLanguage();
  const { index } = useLocalSearchParams<{ index: string }>();
  const [height, setHeight] = useState(-1);

  const trendingQuery = trpc.feed.myFeed.useInfiniteQuery(
    {
      language,
      feedType: "trending",
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const feed = useMemo(
    (): FeedItem[] =>
      trendingQuery.data?.pages
        .flatMap((page) => page.posts)
        .map((post) => ({ type: "post", data: post, key: post.id })) ?? [],
    [trendingQuery.data?.pages],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await trendingQuery.refetch();
    setIsRefreshing(false);
  }, [trendingQuery]);

  const handleEndReached = useCallback(() => {
    if (!trendingQuery.isFetchingNextPage) {
      trendingQuery.fetchNextPage();
    }
  }, [trendingQuery]);

  return (
    <View
      style={{ flex: 1 }}
      onLayout={(ev) => {
        setHeight(ev.nativeEvent.layout.height);
      }}
    >
      {trendingQuery.isPending || height < 0 ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.foreground} />
        </View>
      ) : trendingQuery.isError ? (
        <Text>Error: {trendingQuery.error.message}</Text>
      ) : (
        <FeedList
          data={feed}
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
                {translate("noDataToShow")}
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
            feed.length === 0 ? null : trendingQuery.isFetchingNextPage ? (
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
