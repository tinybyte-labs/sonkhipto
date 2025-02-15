import { customAlphabet } from "nanoid/non-secure";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const nanoid = customAlphabet(
  "abcdefghijklmnopqrstuvwxyz0123456789",
  10,
);
