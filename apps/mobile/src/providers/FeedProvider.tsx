import AsyncStorage from "@react-native-async-storage/async-storage";
import { ImageSource } from "expo-image";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { STORAGE_KEYS } from "@/constants/storage-keys";
import { trpc } from "@/utils/trpc";

export type FeedType = Parameters<
  typeof trpc.feed.myFeed.useQuery
>["0"]["feedType"];

export type FeedContextType = {
  feedType: FeedType;
  changeFeedType: (type: FeedType) => Promise<void>;
};

export const feedItems: {
  id: FeedType;
  icon: ImageSource;
}[] = [
  {
    id: "my-feed",
    icon: require("@/assets/icons/my-feed.png"),
  },
  {
    id: "all-posts",
    icon: require("@/assets/icons/all-posts.png"),
  },
  {
    id: "trending",
    icon: require("@/assets/icons/trending.png"),
  },
];

export const FeedContext = createContext<FeedContextType | null>(null);

export default function FeedProvider({ children }: { children: ReactNode }) {
  const [feedType, setFeedType] =
    useState<FeedContextType["feedType"]>("my-feed");
  const [isLoaded, setIsLoaded] = useState(false);

  const changeFeedType: FeedContextType["changeFeedType"] = useCallback(
    async (type) => {
      setFeedType(type);
      await AsyncStorage.setItem(STORAGE_KEYS.FEED_TYPE, type);
    },
    [],
  );

  useEffect(() => {
    const load = async () => {
      const feedType = await AsyncStorage.getItem(STORAGE_KEYS.FEED_TYPE);
      if (
        feedType &&
        feedItems.findIndex((item) => item.id === feedType) !== -1
      ) {
        setFeedType(feedType as FeedType);
      }
      setIsLoaded(true);
    };
    load();
  }, []);

  if (!isLoaded) {
    return null;
  }

  return (
    <FeedContext.Provider value={{ feedType, changeFeedType }}>
      {children}
    </FeedContext.Provider>
  );
}

export const useFeed = () => {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error("useFeed must use insdie FeedProvider");
  }
  return context;
};
