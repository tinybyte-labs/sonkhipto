import type { NewsItem } from "@/types/news-item";
import type { WithId } from "@/types/with-id";
import { forwardRef, useCallback } from "react";
import {
  FlatList,
  FlatListProps,
  ListRenderItem,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

import { Post } from "@acme/db";

import FeedNewsItemView from "./FeedNewsItemView";

export type FeedNewsItem = {
  type: "post";
  key: string;
  data: Post;
};
export type FeedAdItem = {
  type: "ad";
  key: string;
};
export type FeedItem = FeedNewsItem | FeedAdItem;

export type FeedListProps = Omit<FlatListProps<FeedItem>, "renderItem"> & {
  height: number;
  useBottomInset?: boolean;
};

const FeedList = forwardRef<FlatList, FeedListProps>(
  ({ height, useBottomInset, ...props }, ref) => {
    const colors = useColors();

    const renderItem: ListRenderItem<FeedItem> = useCallback(
      ({ item }) => {
        switch (item.type) {
          case "post":
            return (
              <FeedNewsItemView
                newsItem={item.data}
                height={height}
                useBottomInsets={useBottomInset}
              />
            );
          case "ad":
            return (
              <View
                style={{
                  height,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: colors.secondaryForeground }}>Ad</Text>
              </View>
            );
          default:
            return <View style={{ height }} />;
        }
      },
      [colors.secondaryForeground, height, useBottomInset],
    );

    return (
      <FlatList
        ref={ref}
        style={{ flexGrow: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyExtractor={(item) => item.key}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        viewabilityConfig={{ itemVisiblePercentThreshold: 100 }}
        renderItem={renderItem}
        {...props}
      />
    );
  },
);

export default FeedList;
