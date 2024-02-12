import { Post, PostBookmark, FavoritePost } from "@acme/db";
import { forwardRef, useCallback } from "react";
import {
  FlatList,
  FlatListProps,
  ListRenderItem,
  Text,
  View,
} from "react-native";

import FeedPostItemView from "./FeedPostItemView";

import { useColors } from "@/hooks/useColors";

export type FeedNewsItem = {
  type: "post";
  key: string;
  data: Post & {
    FavoritePost?: FavoritePost[];
    PostBookmark?: PostBookmark[];
    author?: {
      name: string | null;
    };
    _count?: {
      FavoritePost?: number;
    };
  };
};
export type FeedAdItem = {
  type: "ad";
  key: string;
};
export type FeedItem = FeedNewsItem | FeedAdItem;

export type FeedListProps = Omit<FlatListProps<FeedItem>, "renderItem"> & {
  height: number;
  bottomInset?: number;
  topInset?: number;
};

const FeedList = forwardRef<FlatList, FeedListProps>(
  ({ height, topInset, bottomInset, ...props }, ref) => {
    const colors = useColors();

    const renderItem: ListRenderItem<FeedItem> = useCallback(
      ({ item }) => {
        switch (item.type) {
          case "post":
            return (
              <FeedPostItemView
                post={item.data}
                height={height}
                bottomInset={bottomInset}
                topInset={topInset}
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
      [bottomInset, colors.secondaryForeground, height, topInset],
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
        viewabilityConfig={{ itemVisiblePercentThreshold: 95 }}
        initialNumToRender={3}
        renderItem={renderItem}
        {...props}
      />
    );
  },
);

export default FeedList;
