import AsyncStorage from "@react-native-async-storage/async-storage";
import analytics from "@react-native-firebase/analytics";
import { router } from "expo-router";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";
import SnackBar from "react-native-snackbar";

import { useLanguage } from "./LanguageProvider";

import { EVENT_KEYS } from "@/constants/event-keys";
import { STORAGE_KEYS } from "@/constants/storage-keys";
import { useColors } from "@/hooks/useColors";
import { Bookmark } from "@/types/bookmark";
import { nanoid } from "@/utils";

export type BookmarkContextType = {
  bookmarks: Bookmark[];
  createBookmark: (dto: Omit<Bookmark, "id" | "createdAt">) => Promise<void>;
  deleteBookmark: (bookmarkId: string) => Promise<void>;
  isLoaded: boolean;
  isBusey: boolean;
};

export const BookmarkContext = createContext<BookmarkContextType | null>(null);

const saveBookmarksToStorage = async (bookmarks: Bookmark[]) => {
  return AsyncStorage.setItem(
    STORAGE_KEYS.BOOKMARKED_ITEMS,
    JSON.stringify(bookmarks)
  );
};

export default function BookmarkProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBusey, setIsBusey] = useState(false);
  const { translate } = useLanguage();
  const colors = useColors();

  const createBookmark: BookmarkContextType["createBookmark"] = useCallback(
    async (dto) => {
      if (isBusey || !isLoaded) return;

      const id = nanoid();
      const bookmark: Bookmark = {
        ...dto,
        id,
        createdAt: new Date().toISOString(),
      };

      const newList = [...bookmarks, bookmark];
      setBookmarks(newList);
      try {
        setIsBusey(true);
        await saveBookmarksToStorage(newList);
        analytics().logEvent(EVENT_KEYS.ADD_BOOKMARK, {
          bookmark_type: dto.type,
          news_item_id: dto.type === "news" ? dto.data.id : undefined,
        });
        SnackBar.show({
          text: translate("bookmarked"),
          action: {
            text: "Show Bookmarks",
            onPress: () => router.navigate("/bookmarks/"),
            textColor: colors.primary,
          },
        });
      } catch (error: any) {
        Alert.alert("Failed to create bookmark", error.message);
        setBookmarks(newList.filter((bm) => bm.id !== id));
      } finally {
        setIsBusey(false);
      }
    },
    [bookmarks, colors.primary, isBusey, isLoaded, translate]
  );

  const deleteBookmark: BookmarkContextType["deleteBookmark"] = useCallback(
    async (bookmarkId) => {
      if (isBusey || !isLoaded) return;

      const bookmark = bookmarks.find((bookmark) => bookmark.id === bookmarkId);
      if (!bookmark) {
        return;
      }

      const newList = bookmarks.filter((bm) => bm.id !== bookmarkId);
      setBookmarks(newList);

      try {
        setIsBusey(true);
        await saveBookmarksToStorage(newList);
        analytics().logEvent(EVENT_KEYS.REMOVE_BOOKMARK, {
          bookmark_type: bookmark.type,
          news_item_id: bookmark.type === "news" ? bookmark.data.id : undefined,
        });
        SnackBar.show({ text: translate("bookmarkRemoved") });
      } catch (error: any) {
        Alert.alert("Failed to delete bookmark", error.message);
        setBookmarks([...newList, bookmark]);
      } finally {
        setIsBusey(false);
      }
    },
    [bookmarks, isBusey, isLoaded, translate]
  );

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const bookmarkedItemsStr = await AsyncStorage.getItem(
          STORAGE_KEYS.BOOKMARKED_ITEMS
        );
        if (bookmarkedItemsStr) {
          const bookmarks = JSON.parse(bookmarkedItemsStr);
          setBookmarks(bookmarks);
        }
      } catch (error: any) {
        console.log(error);
      }
      setIsLoaded(true);
    };
    loadBookmarks();
  }, []);

  return (
    <BookmarkContext.Provider
      value={{ bookmarks, isLoaded, createBookmark, deleteBookmark, isBusey }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export const useBookmark = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmark must use insdie BookmarkProvider");
  }
  return context;
};
