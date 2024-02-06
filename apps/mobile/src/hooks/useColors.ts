import { useTheme } from "@react-navigation/native";

import { colors } from "@/constants/colors";

export const useColors = () => {
  const theme = useTheme();
  return colors[theme.dark ? "dark" : "light"];
};
