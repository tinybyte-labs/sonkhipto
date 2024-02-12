import analytics from "@react-native-firebase/analytics";
import dayjs from "dayjs";
import { Image } from "expo-image";
import * as WebBrowser from "expo-web-browser";
import { useAtom } from "jotai";
import { useCallback, useMemo } from "react";
import { Alert, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FeedNewsItem } from "./FeedList";

import { EVENT_KEYS } from "@/constants/event-keys";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/providers/LanguageProvider";
import { favoritePostsAtom } from "@/stores/favorite-posts-atom";
import { postBookmarksAtom } from "@/stores/post-bookmark-atom";
import { trpc } from "@/utils/trpc";

export default function FeedPostItemView({
  post,
  height,
  isViewable,
  bottomInset = 0,
  topInset = 0,
}: {
  post: FeedNewsItem["data"];
  height: number;
  isViewable?: boolean;
  bottomInset?: number;
  topInset?: number;
}) {
  const [favoritePosts, setFavoritePosts] = useAtom(favoritePostsAtom);
  const [postBookmarks, setPostBookmarks] = useAtom(postBookmarksAtom);
  const { translate, language } = useLanguage();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const utils = trpc.useUtils();

  const favoritePost = useMemo(
    () => favoritePosts[post.id],
    [favoritePosts, post.id],
  );
  console.log({ favoritePost, id: post.id, fav: post.FavoritePost });

  const isBookmarked = useMemo(() => {
    const _bookmark = postBookmarks[post.id];
    if (typeof _bookmark !== "undefined") {
      return _bookmark;
    }
    return !!post.PostBookmark?.[0];
  }, [post.PostBookmark, post.id, postBookmarks]);

  const isFavoritePost = useMemo(() => {
    if (favoritePost === "favorite") {
      return true;
    } else if (favoritePost === "favorite-removed") {
      return false;
    }
    return !!post.FavoritePost?.[0];
  }, [favoritePost, post.FavoritePost]);

  const favoriteCount = useMemo(() => {
    let count = post._count?.FavoritePost ?? 0;
    if (favoritePost === "favorite") {
      count += 1;
    } else if (favoritePost === "favorite-removed") {
      count -= 1;
    }
    return count;
  }, [favoritePost, post._count?.FavoritePost]);

  const addToFavorites = trpc.post.addToFavorites.useMutation({
    onMutate: () => {
      const posts = { ...favoritePosts };
      if (favoritePost === "favorite-removed") {
        posts[post.id] = undefined;
      } else {
        posts[post.id] = "favorite";
      }
      setFavoritePosts(posts);
    },
  });

  const removeFromFavorites = trpc.post.removeFromFavorites.useMutation({
    onMutate: () => {
      const posts = { ...favoritePosts };
      if (favoritePost === "favorite") {
        posts[post.id] = undefined;
      } else {
        posts[post.id] = "favorite-removed";
      }
      setFavoritePosts(posts);
    },
  });

  const addBookmark = trpc.post.addBookmark.useMutation({
    onMutate: (data) => {
      const bookmarks = { ...postBookmarks };
      bookmarks[data.id] = true;
      setPostBookmarks(bookmarks);
    },
    onSuccess: () => {
      utils.post.getBookmarksWithPost.invalidate();
    },
  });

  const removeBookmark = trpc.post.removeBookmark.useMutation({
    onMutate: (data) => {
      const bookmarks = { ...postBookmarks };
      bookmarks[data.id] = false;
      setPostBookmarks(bookmarks);
    },
    onSuccess: () => {
      utils.post.getBookmarksWithPost.invalidate();
    },
  });

  const onReadMore = useCallback(async () => {
    analytics().logEvent(EVENT_KEYS.READ_MORE, {
      news_item_id: post.id,
      news_item_url: post.sourceUrl,
    });
    await WebBrowser.openBrowserAsync(post.sourceUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  }, [post.id, post.sourceUrl]);

  const onShare = useCallback(async () => {
    try {
      await Share.share({
        title: post.title,
        message: post.sourceUrl,
      });
      analytics().logEvent(EVENT_KEYS.NEWS_ITEM_SHARE, {
        news_item_id: post.id,
        news_item_url: post.sourceUrl,
      });
    } catch (error: any) {
      Alert.alert("Faild to share", error.message);
    }
  }, [post.id, post.title, post.sourceUrl]);

  const onBookmarkPress = useCallback(() => {
    if (isBookmarked) {
      Alert.alert(
        translate("removeBookmark"),
        translate("removeBookmarkWarningMsg"),
        [
          {
            style: "cancel",
            text: translate("cancel"),
          },
          {
            style: "destructive",
            text: translate("remove"),
            onPress: () => removeBookmark.mutate({ id: post.id }),
          },
        ],
      );
    } else {
      addBookmark.mutate({ id: post.id });
    }
  }, [isBookmarked, addBookmark, removeBookmark, post, translate]);

  const onFavoritePress = useCallback(() => {
    if (isFavoritePost) {
      removeFromFavorites.mutate({ id: post.id });
    } else {
      addToFavorites.mutate({ id: post.id });
    }
  }, [addToFavorites, isFavoritePost, post.id, removeFromFavorites]);

  return (
    <View
      style={{
        backgroundColor: colors.background,
        height,
      }}
    >
      <Pressable style={{ flex: 1 }} onPress={onReadMore}>
        <View style={{ flex: 1, maxHeight: 240 + topInset }}>
          <Image
            source={post.imageUrl}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: colors.secondary,
            }}
            contentFit="cover"
          />
        </View>

        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              lineHeight: 32,
              color: colors.foreground,
            }}
            numberOfLines={3}
          >
            {post.title}
          </Text>
          <Text
            style={{
              lineHeight: 20,
              marginTop: 8,
              color: colors.secondaryForeground,
            }}
          >
            {post.author?.name
              ? `${translate("source", { name: post.sourceName })} • ${dayjs(
                  post.createdAt,
                  {
                    locale: language === "bn" ? "bn-bd" : "en",
                  },
                ).fromNow()} • ${translate("byPublisher", {
                  name: post.author.name,
                })}`
              : ``}
          </Text>
          <Text
            style={{
              color: colors.foreground,
              fontSize: 16,
              lineHeight: 24,
              marginTop: 8,
            }}
            numberOfLines={6}
          >
            {post.content}
          </Text>
        </View>
      </Pressable>
      <View
        style={[
          {
            paddingHorizontal: 16,
            paddingBottom: bottomInset ? insets.bottom : 0,
          },
        ]}
      >
        <View
          style={[
            styles.actionsContainer,
            {
              borderColor: colors.border,
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: pressed ? colors.card : colors.background },
            ]}
            onPress={onFavoritePress}
          >
            {isFavoritePost ? (
              <Image
                source={require("@/assets/icons/heart-fill.png")}
                style={{ width: 24, height: 24, tintColor: colors.tintColor }}
              />
            ) : (
              <Image
                source={require("@/assets/icons/heart-outline.png")}
                style={{ width: 24, height: 24, tintColor: colors.tintColor }}
              />
            )}
            <Text style={[styles.actionLabel, { color: colors.foreground }]}>
              {favoriteCount}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: pressed ? colors.card : colors.background },
            ]}
            onPress={onShare}
          >
            <Image
              source={require("@/assets/icons/share.png")}
              style={{ width: 24, height: 24, tintColor: colors.tintColor }}
            />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: pressed ? colors.card : colors.background },
            ]}
            onPress={onBookmarkPress}
          >
            {isBookmarked ? (
              <Image
                source={require("@/assets/icons/bookmark-fill.png")}
                style={{ width: 24, height: 24, tintColor: colors.tintColor }}
              />
            ) : (
              <Image
                source={require("@/assets/icons/bookmark-outline.png")}
                style={{ width: 24, height: 24, tintColor: colors.tintColor }}
              />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    padding: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    height: 40,
    justifyContent: "center",
    borderRadius: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
});
