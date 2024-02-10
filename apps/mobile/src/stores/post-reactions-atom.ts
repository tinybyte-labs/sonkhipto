import { PostReactionType } from "@acme/db";
import { atom } from "jotai";

export const postReactionsAtom = atom<Record<string, PostReactionType | null>>(
  {},
);
