import { Text, View } from "react-native";

import FeedView from "@/components/FeedView";
import LoadingView from "@/components/LoadingView";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/providers/LanguageProvider";
import { trpc } from "@/utils/trpc";

export default function FeedTabScreen() {
  const { language } = useLanguage();
  const colors = useColors();

  const feedQuery = trpc.feed.myFeedV2.useInfiniteQuery(
    { language },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  if (feedQuery.isPending) {
    return <LoadingView />;
  }

  if (feedQuery.isError) {
    return (
      <View>
        <Text style={{ color: colors.foreground }}>
          Error: {feedQuery.error.message}
        </Text>
      </View>
    );
  }

  return (
    <FeedView
      data={feedQuery.data.pages.flatMap((page) => page.posts)}
      isFetchingNextPage={feedQuery.isFetchingNextPage}
      onFetchNextPage={async () => {
        await feedQuery.fetchNextPage();
      }}
      onRefresh={async () => {
        await feedQuery.refetch();
      }}
    />
  );
}
