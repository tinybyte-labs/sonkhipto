import { useScrollToTop } from "@react-navigation/native";
import type { ImageSource } from "expo-image";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Fragment, useMemo, useRef } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import PostListItem from "@/components/PostListItem";
import type { TranslationKey } from "@/constants/translations";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/providers/LanguageProvider";
import { trpc } from "@/utils/trpc";

export const feedItems: {
  id: TranslationKey;
  icon: ImageSource;
  href: string;
}[] = [
  {
    id: "my-feed",
    icon: require("@/assets/icons/my-feed.png"),
    href: "/",
  },
  {
    id: "all-posts",
    icon: require("@/assets/icons/all-posts.png"),
    href: "/all-posts",
  },
  {
    id: "trending",
    icon: require("@/assets/icons/trending.png"),
    href: "/trending",
  },
  {
    id: "bookmark",
    icon: require("@/assets/icons/bookmarks.png"),
    href: "/bookmarks/",
  },
];

export default function DiscoverScreen() {
  const colors = useColors();
  const { translate, language } = useLanguage();
  const listRef = useRef<ScrollView>(null);
  useScrollToTop(listRef);

  const bookmarksQuery = trpc.post.getBookmarksWithPost.useQuery({ limit: 5 });
  const trendingQuery = trpc.feed.myFeed.useInfiniteQuery(
    {
      feedType: "trending",
      language,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const trendingPosts = useMemo(
    () => trendingQuery.data?.pages[0]?.posts.slice(0, 5) ?? [],
    [trendingQuery.data?.pages],
  );

  return (
    <ScrollView
      ref={listRef}
      style={{ flexGrow: 1 }}
      contentContainerStyle={{ paddingVertical: 16, gap: 32 }}
    >
      <FlatList
        data={feedItems}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => router.navigate(item.href)}
            style={{
              width: 86,
            }}
          >
            <View
              style={{
                backgroundColor: colors.card,
                aspectRatio: 1,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
              }}
            >
              <Image
                source={item.icon}
                style={{ width: 52, height: 52, tintColor: colors.tintColor }}
              />
            </View>
            <Text
              style={{
                color: colors.foreground,
                marginTop: 6,
                fontWeight: "500",
                textAlign: "center",
                fontSize: 13,
              }}
              numberOfLines={1}
            >
              {translate(item.id)}
            </Text>
          </TouchableOpacity>
        )}
      />

      {bookmarksQuery.data && bookmarksQuery.data.bookmarks.length > 0 && (
        <View style={{ gap: 12 }}>
          <SectionTitle
            title={translate("recentBookmarks")}
            action={{
              label: translate("seeAll"),
              onPress: () => router.push("/bookmarks/"),
            }}
          />

          <View>
            {bookmarksQuery.data.bookmarks.map((bookmark, index) => (
              <Fragment key={bookmark.postId}>
                <PostListItem
                  title={bookmark.post.title}
                  thumbnailUrl={bookmark.post.imageUrl}
                  onPress={() => router.navigate(`/bookmarks/?index=${index}`)}
                />
                {index < bookmarksQuery.data.bookmarks.length - 1 && (
                  <View style={{ paddingLeft: 16 + 12 + 72 }}>
                    <View
                      style={{
                        flex: 1,
                        height: 1,
                        backgroundColor: colors.border,
                      }}
                    />
                  </View>
                )}
              </Fragment>
            ))}
          </View>
        </View>
      )}

      {trendingPosts.length > 0 && (
        <View style={{ gap: 12 }}>
          <SectionTitle
            title={translate("trending")}
            action={{
              label: translate("seeAll"),
              onPress: () => router.navigate("/trending"),
            }}
          />
          <View>
            {trendingPosts.map((post, index) => (
              <Fragment key={post.id}>
                <PostListItem
                  title={post.title}
                  thumbnailUrl={post.imageUrl}
                  onPress={() => router.navigate(`/trending?index=${index}`)}
                />
                {index < trendingPosts.length - 1 && (
                  <View style={{ paddingLeft: 16 + 12 + 72 }}>
                    <View
                      style={{
                        flex: 1,
                        height: 1,
                        backgroundColor: colors.border,
                      }}
                    />
                  </View>
                )}
              </Fragment>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const SectionTitle = ({
  title,
  action,
}: {
  title: string;
  action?: { label: string; color?: string; onPress?: () => void };
}) => {
  const colors = useColors();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
      }}
    >
      <Text
        style={{
          flex: 1,
          fontSize: 18,
          fontWeight: "700",
          color: colors.foreground,
        }}
        numberOfLines={1}
      >
        {title}
      </Text>
      {!!action && (
        <TouchableOpacity onPress={action.onPress}>
          <Text
            style={{
              fontWeight: "600",
              color: action.color ?? colors.tintColor,
            }}
          >
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
