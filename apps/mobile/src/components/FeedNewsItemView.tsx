import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { EVENT_KEYS } from "@/constants/event-keys";
import { useColors } from "@/hooks/useColors";
import { useBookmark } from "@/providers/BookmarkProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import analytics from "@react-native-firebase/analytics";
import dayjs from "dayjs";
import {
  BookmarkCheckIcon,
  BookmarkIcon,
  ChevronRightIcon,
  ShareIcon,
} from "lucide-react-native";

import type { Post } from "@acme/db";

export default function FeedNewsItemView({
  post,
  height,
  isViewable,
  useBottomInsets,
}: {
  post: Post & { author: { name: string } };
  height: number;
  isViewable?: boolean;
  useBottomInsets?: boolean;
}) {
  const colors = useColors();
  const [showImage, setShowImage] = useState(false);
  const { translate, language } = useLanguage();
  const { bookmarks, createBookmark, deleteBookmark } = useBookmark();
  const bookmark = useMemo(
    () => bookmarks.find((bm) => bm.type === "news" && bm.data.id === post.id),
    [bookmarks, post.id]
  );
  const insets = useSafeAreaInsets();

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
    if (bookmark) {
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
            onPress: () => deleteBookmark(bookmark.id),
          },
        ]
      );
    } else {
      createBookmark({ type: "news", data: post });
    }
  }, [bookmark, createBookmark, deleteBookmark, post, translate]);

  return (
    <View
      style={{
        backgroundColor: colors.background,
        height,
      }}
    >
      <View style={{ aspectRatio: 16 / 9 }}>
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
        <View
          style={{
            backgroundColor: "rgb(255,255,255)",
            paddingHorizontal: 10,
            borderRadius: 999,
            position: "absolute",
            bottom: -8,
            height: 24,
            alignItems: "center",
            justifyContent: "center",
            right: 12,
            shadowColor: "black",
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <Text
            style={{
              color: "black",
              opacity: 0.75,
              fontWeight: "600",
              fontSize: 12,
            }}
          >
            Sonkhipto
          </Text>
        </View>
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
            {translate("byPublisher", {
              name: post.author.name,
            })}{" "}
            •{" "}
            {dayjs(post.createdAt, {
              locale: language === "bangla" ? "bn-bd" : "en",
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
          style={({ pressed }) => [
            styles.wideButton,
            { backgroundColor: pressed ? colors.card : colors.secondary },
          ]}
          onPress={onReadMore}
        >
          <Text
            style={[
              styles.wideButtonTitle,
              {
                color: colors.tintColor,
              },
            ]}
            numberOfLines={1}
          >
            {translate("readMoreAt", { name: post.sourceName })}
          </Text>
          <ChevronRightIcon size={22} color={colors.tintColor} />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: pressed ? colors.card : colors.secondary },
          ]}
          onPress={onBookmarkPress}
        >
          {bookmark ? (
            <BookmarkCheckIcon size={22} color={colors.tintColor} />
          ) : (
            <BookmarkIcon size={22} color={colors.tintColor} />
          )}
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: pressed ? colors.card : colors.secondary },
          ]}
          onPress={onShare}
        >
          <ShareIcon size={22} color={colors.tintColor} />
        </Pressable>
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
    width: 48,
    height: 48,
    justifyContent: "center",
  },
  wideButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingRight: 12,
    paddingLeft: 16,
    height: 48,
    borderRadius: 48,
    flex: 1,
    justifyContent: "space-between",
  },
  wideButtonTitle: {
    fontWeight: "600",
  },
});
