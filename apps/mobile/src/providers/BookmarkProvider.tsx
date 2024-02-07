import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { Alert } from "react-native";
import SnackBar from "react-native-snackbar";

import { useLanguage } from "./LanguageProvider";

import { STORAGE_KEYS } from "@/constants/storage-keys";
import { useColors } from "@/hooks/useColors";
import { Bookmark } from "@/types/bookmark";
import { trpc } from "@/utils/trpc";
import { useAuth } from "./AuthProvider";
import { PostBookmark } from "@acme/db";

export type BookmarkContextType = {
  bookmarks: PostBookmark[];
  addBookmark: (postId: string) => Promise<void>;
  removeBookmark: (postId: string) => Promise<void>;
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
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const bookmarksQuery = trpc.post.getBookmarks.useQuery();

  const [isBusey, setIsBusey] = useState(false);
  const { translate } = useLanguage();
  const colors = useColors();

  const addBookmarkMut = trpc.post.addBookmark.useMutation();
  const removeBookmarkMut = trpc.post.removeBookmark.useMutation();

  const addBookmark: BookmarkContextType["addBookmark"] = useCallback(
    async (postId) => {
      if (isBusey) return;
      if (!user) {
        Alert.alert("Unauthorized");
        return;
      }

      try {
        setIsBusey(true);
        utils.post.getBookmarks.setData(undefined, (bookmarks) => [
          ...(bookmarks ?? []),
          { postId, userId: user.id, createdAt: new Date() },
        ]);
        await addBookmarkMut.mutateAsync({ id: postId });
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
      } finally {
        utils.post.getBookmarks.invalidate();
        utils.post.getBookmarksWithPost.invalidate();
        setIsBusey(false);
      }
    },
    [colors.primary, isBusey, translate]
  );

  const removeBookmark: BookmarkContextType["removeBookmark"] = useCallback(
    async (postId) => {
      if (isBusey) return;
      if (!user) {
        Alert.alert("Unauthorized");
        return;
      }

      try {
        setIsBusey(true);
        utils.post.getBookmarks.setData(
          undefined,
          (bookmarks) =>
            bookmarks?.filter((bookmark) => bookmark.postId !== postId)
        );
        await removeBookmarkMut.mutateAsync({ id: postId });
        SnackBar.show({ text: translate("bookmarkRemoved") });
      } catch (error: any) {
        Alert.alert("Failed to delete bookmark", error.message);
      } finally {
        utils.post.getBookmarks.invalidate();
        utils.post.getBookmarksWithPost.invalidate();
        setIsBusey(false);
      }
    },
    [isBusey, translate]
  );

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks: bookmarksQuery.data ?? [],
        isLoaded: !bookmarksQuery.isPending,
        addBookmark,
        removeBookmark,
        isBusey,
      }}
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
