export type Colors = {
  primary: string;
  primaryActive: string;
  primaryForeground: string;
  tintColor: string;
  background: string;
  foreground: string;
  distructive: string;
  secondary: string;
  secondaryForeground: string;
  card: string;
  border: string;
  transparent: string;
};

const darkColors: Colors = {
  primary: "#FF5D61",
  primaryActive: "#ffffff",
  tintColor: "#FF5D61",
  primaryForeground: "#151839",
  background: "#09090b",
  foreground: "#fafafa",
  secondary: "#18181b",
  card: "#27272a",
  secondaryForeground: "#a1a1aa",
  border: "rgba(255,255,255,0.1)",
  distructive: "#f87171",
  transparent: "hsla(240,10%,4%,0)",
};

export const lightColors: Colors = {
  ...darkColors,
  primary: "#E73B3C",
  primaryActive: "#D91F20",
  primaryForeground: "#FFFFFF",
  tintColor: "#09090b",
  background: "#FFFFFF",
  foreground: "#09090b",
  secondary: "#f4f4f5",
  card: "#e4e4e7",
  border: "rgba(0,0,0,0.1)",
  secondaryForeground: "#71717a",
  distructive: "#ef4444",
  transparent: "rgba(255,255,255,0)",
};

export const colors: Record<"dark" | "light", Colors> = {
  dark: darkColors,
  light: lightColors,
};