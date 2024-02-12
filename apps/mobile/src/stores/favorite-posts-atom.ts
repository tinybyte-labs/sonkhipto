import { atom } from "jotai";

export type FavoriteState = "favorite" | "favorite-removed" | undefined;

export const favoritePostsAtom = atom<Record<string, FavoriteState>>({});
