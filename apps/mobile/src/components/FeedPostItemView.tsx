import analytics from "@react-native-firebase/analytics";
import dayjs from "dayjs";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { useAtom } from "jotai";
import { ArrowUpRightIcon } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FeedNewsItem } from "./FeedList";

import { EVENT_KEYS } from "@/constants/event-keys";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/providers/LanguageProvider";
import { postBookmarksAtom } from "@/stores/post-bookmark-atom";
import { postReactionsAtom } from "@/stores/post-reactions-atom";
import { trpc } from "@/utils/trpc";

export default function FeedPostItemView({
  post,
  height,
  isViewable,
  useBottomInsets,
}: {
  post: FeedNewsItem["data"];
  height: number;
  isViewable?: boolean;
  useBottomInsets?: boolean;
}) {
  const [postReactions, setPostReactions] = useAtom(postReactionsAtom);
  const [postBookmarks, setPostBookmarks] = useAtom(postBookmarksAtom);
  const [showImage, setShowImage] = useState(false);
  const { translate, language } = useLanguage();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const utils = trpc.useUtils();
  const dimensions = useWindowDimensions();

  const isBookmarked = useMemo(() => {
    const _bookmark = postBookmarks[post.id];
    if (typeof _bookmark !== "undefined") {
      return _bookmark;
    }
    return !!post.PostBookmark?.[0];
  }, [post.PostBookmark, post.id, postBookmarks]);

  const reaction = useMemo(() => {
    const _reaction = postReactions[post.id];
    if (typeof _reaction !== "undefined") {
      return _reaction;
    }
    return post.PostReaction?.[0]?.reaction ?? null;
  }, [postReactions, post.PostReaction, post.id]);

  const addReaction = trpc.post.addReaction.useMutation({
    onMutate: (data) => {
      const _reactions = { ...postReactions };
      _reactions[data.id] = data.reaction;
      setPostReactions(_reactions);
    },
  });

  const removeReaction = trpc.post.removeReaction.useMutation({
    onMutate: (data) => {
      const _reactions = { ...postReactions };
      _reactions[data.id] = null;
      setPostReactions(_reactions);
    },
  });

  const addBookmark = trpc.post.addBookmark.useMutation({
    onMutate: (data) => {
      const _reactions = { ...postBookmarks };
      _reactions[data.id] = true;
      setPostBookmarks(_reactions);
    },
    onSuccess: () => {
      utils.post.getBookmarksWithPost.invalidate();
    },
  });

  const removeBookmark = trpc.post.removeBookmark.useMutation({
    onMutate: (data) => {
      const _reactions = { ...postBookmarks };
      _reactions[data.id] = false;
      setPostBookmarks(_reactions);
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

  const onReactionPress = useCallback(() => {
    if (reaction) {
      removeReaction.mutate({ id: post.id });
    } else {
      addReaction.mutate({ id: post.id, reaction: "LIKE" });
    }
  }, [addReaction, post.id, reaction, removeReaction]);

  return (
    <View
      style={{
        backgroundColor: colors.background,
        height,
      }}
    >
      <View style={{ height: dimensions.height * 0.25 }}>
        <Pressable onPress={() => setShowImage(!showImage)}>
          <Image
            source={post.imageUrl}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: colors.secondary,
            }}
            contentFit="cover"
          />
        </Pressable>
      </View>

      <View style={{ padding: 16, paddingBottom: 4 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            lineHeight: 24,
            color: colors.foreground,
          }}
        >
          {post.title}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{
            flex: 1,
          }}
          contentContainerStyle={{
            paddingTop: 4,
            paddingHorizontal: 16,
            paddingBottom: 24,
          }}
        >
          <Text
            style={{
              lineHeight: 22,
              color: colors.foreground,
            }}
          >
            {post.content}
          </Text>
          <Text
            style={{
              fontSize: 12,
              lineHeight: 16,
              marginTop: 6,
              color: colors.secondaryForeground,
            }}
          >
            {post.author?.name
              ? `${translate("byPublisher", {
                  name: post.author.name,
                })} • ${translate("source", { name: post.sourceName })} • `
              : ``}
            {dayjs(post.createdAt, {
              locale: language === "bn" ? "bn-bd" : "en",
            }).fromNow()}
          </Text>
        </ScrollView>
        <LinearGradient
          colors={[colors.transparent, colors.background]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 20,
            zIndex: 1,
          }}
        />
      </View>

      <View
        style={[
          styles.actionsContainer,
          {
            borderColor: colors.border,
            paddingBottom: useBottomInsets ? insets.bottom + 12 : 12,
          },
        ]}
      >
        <Pressable
          style={[
            styles.wideButton,
            {
              backgroundColor: colors.tintColor,
            },
          ]}
          onPress={onReadMore}
        >
          <Text
            style={[
              styles.wideButtonTitle,
              {
                color: colors.tintForegroundColor,
              },
            ]}
            numberOfLines={1}
          >
            {translate("readMore")}
          </Text>
          <ArrowUpRightIcon size={22} color={colors.tintForegroundColor} />
        </Pressable>
        <View
          style={{
            flexDirection: "row",
            gap: 6,
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: pressed ? colors.card : colors.secondary },
            ]}
            onPress={onReactionPress}
          >
            {reaction === "LIKE" ? (
              <Image
                source={require("@/assets/icons/like-fill.png")}
                style={{ width: 24, height: 24, tintColor: colors.tintColor }}
              />
            ) : (
              <Image
                source={require("@/assets/icons/like-outline.png")}
                style={{ width: 24, height: 24, tintColor: colors.tintColor }}
              />
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              { backgroundColor: pressed ? colors.card : colors.secondary },
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
              styles.iconButton,
              { backgroundColor: pressed ? colors.card : colors.secondary },
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  iconButton: {
    alignItems: "center",
    gap: 8,
    borderRadius: 44,
    width: 44,
    height: 44,
    justifyContent: "center",
  },
  wideButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    paddingRight: 16,
    paddingLeft: 16,
    height: 44,
    borderRadius: 44,
  },
  wideButtonTitle: {
    fontWeight: "600",
  },
});
