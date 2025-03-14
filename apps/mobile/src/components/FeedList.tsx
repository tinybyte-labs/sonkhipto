import type { PublicPost } from "@acme/trpc/types";
import type { FlashListProps, ListRenderItemInfo } from "@shopify/flash-list";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { forwardRef, useCallback, useState } from "react";
import { Alert, Share, Text, View } from "react-native";
import Snackbar from "react-native-snackbar";

import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/providers/LanguageProvider";
import { trpc } from "@/utils/trpc";

import FeedPostItemView from "./FeedPostItemView";

export interface FeedNewsItem {
  type: "post";
  key: string;
  data: PublicPost;
}
export interface FeedAdItem {
  type: "ad";
  key: string;
}
export type FeedItem = FeedNewsItem | FeedAdItem;
export type ExtraData = Record<
  string,
  {
    favoriteCount?: number;
    bookmarkCount?: number;
    isFavorite?: boolean;
    isBookmarked?: boolean;
  }
>;

export type FeedListProps = Omit<
  FlashListProps<FeedItem>,
  "renderItem" | "extraData"
> & {
  height: number;
  bottomInset?: number;
  topInset?: number;
};

const FeedList = forwardRef<FlashList<FeedItem>, FeedListProps>(
  ({ height, topInset, bottomInset, onRefresh, ...props }, ref) => {
    const colors = useColors();
    const utils = trpc.useUtils();
    const [extraData, setExtraData] = useState<ExtraData>({});
    const { translate } = useLanguage();

    const addToFavoritesMut = trpc.post.addToFavorites.useMutation({
      onMutate: (data) => {
        const item = extraData[data.id];
        const _data = { ...extraData };
        _data[data.id] = {
          ...item,
          favoriteCount: (item.favoriteCount ?? 0) + 1,
          isFavorite: true,
        };
        setExtraData(_data);
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      },
    });

    const removeFromFavoritesMut = trpc.post.removeFromFavorites.useMutation({
      onMutate: (data) => {
        const item = extraData[data.id];
        const _data = { ...extraData };
        _data[data.id] = {
          ...item,
          favoriteCount: (item.favoriteCount ?? 0) - 1,
          isFavorite: false,
        };
        setExtraData(_data);
      },
    });

    const addBookmarkMut = trpc.post.addBookmark.useMutation({
      onMutate: (data) => {
        const item = extraData[data.id];
        const _data = { ...extraData };
        _data[data.id] = {
          ...item,
          bookmarkCount: (item.bookmarkCount ?? 0) + 1,
          isBookmarked: true,
        };
        setExtraData(_data);
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      },
      onSuccess: () => {
        void utils.post.getBookmarksWithPost.invalidate();
        Snackbar.show({
          backgroundColor: colors.card,
          textColor: colors.secondaryForeground,
          text: translate("addedToBookmarks"),
          action: {
            text: translate("manageBookmarks"),
            textColor: colors.tintColor,
            onPress: () => {
              router.navigate("/bookmarks");
            },
          },
        });
      },
    });

    const removeBookmarkMut = trpc.post.removeBookmark.useMutation({
      onMutate: (data) => {
        const item = extraData[data.id];
        const _data = { ...extraData };
        _data[data.id] = {
          ...item,
          bookmarkCount: (item.bookmarkCount ?? 0) - 1,
          isBookmarked: false,
        };
        setExtraData(_data);
      },
      onSuccess: () => {
        void utils.post.getBookmarksWithPost.invalidate();
      },
    });

    const onReadMore = useCallback(async (post: FeedNewsItem) => {
      await WebBrowser.openBrowserAsync(post.data.sourceUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      });
    }, []);

    const onShare = useCallback(async (post: FeedNewsItem) => {
      try {
        await Share.share({
          title: post.data.title,
          message: post.data.sourceUrl,
        });
      } catch (error: unknown) {
        Alert.alert(
          "Faild to share",
          error instanceof Error ? error.message : String(error),
        );
      }
    }, []);

    const renderItem = useCallback(
      ({ item, extraData }: ListRenderItemInfo<FeedItem>) => {
        switch (item.type) {
          case "post": {
            const extraDataItem = (extraData as ExtraData | null)?.[
              item.data.id
            ];
            const isFavorite =
              typeof extraDataItem?.isFavorite === "boolean"
                ? extraDataItem.isFavorite
                : item.data.viewer?.favorite;
            const isBookmarked =
              typeof extraDataItem?.isBookmarked === "boolean"
                ? extraDataItem.isBookmarked
                : item.data.viewer?.bookmarked;
            const bookmarkCount =
              typeof item.data._count.bookmarks === "number"
                ? item.data._count.bookmarks +
                  (typeof extraDataItem?.bookmarkCount === "number"
                    ? extraDataItem.bookmarkCount
                    : 0)
                : undefined;
            const favoriteCount =
              typeof item.data._count.favorites === "number"
                ? item.data._count.favorites +
                  (typeof extraDataItem?.favoriteCount === "number"
                    ? extraDataItem.favoriteCount
                    : 0)
                : undefined;
            return (
              <FeedPostItemView
                post={item.data}
                height={height}
                bottomInset={bottomInset}
                topInset={topInset}
                isFavorite={isFavorite}
                isBookmarked={isBookmarked}
                favoriteCount={favoriteCount}
                bookmarkCount={bookmarkCount}
                onBookmarkPress={() => {
                  if (isBookmarked) {
                    removeBookmarkMut.mutate({ id: item.data.id });
                  } else {
                    addBookmarkMut.mutate({ id: item.data.id });
                  }
                }}
                onFavoritePress={() => {
                  if (isFavorite) {
                    removeFromFavoritesMut.mutate({ id: item.data.id });
                  } else {
                    addToFavoritesMut.mutate({ id: item.data.id });
                  }
                }}
                onReadMore={() => onReadMore(item)}
                onShare={() => onShare(item)}
              />
            );
          }
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
      [
        addBookmarkMut,
        addToFavoritesMut,
        bottomInset,
        colors.secondaryForeground,
        height,
        onReadMore,
        onShare,
        removeBookmarkMut,
        removeFromFavoritesMut,
        topInset,
      ],
    );

    return (
      <FlashList
        ref={ref}
        keyExtractor={(item) => item.key}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        viewabilityConfig={{ itemVisiblePercentThreshold: 95 }}
        renderItem={renderItem}
        estimatedItemSize={height}
        getItemType={(item) => item.type}
        extraData={extraData}
        onRefresh={() => {
          onRefresh?.();
          setExtraData({});
        }}
        {...props}
      />
    );
  },
);

export default FeedList;
