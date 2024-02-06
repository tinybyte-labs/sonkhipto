import { CheckIcon } from "lucide-react-native";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ListItem, ListSection } from "@/components/List";
import {
  banglaTranslations,
  englishTranslations,
} from "@/constants/translations";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/providers/LanguageProvider";

export default function LanguageScreen() {
  const { translate, changeLanguage, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const colors = useColors();

  return (
    <ScrollView
      style={{ flexGrow: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: insets.bottom + 32,
        gap: 32,
        paddingTop: 32,
      }}
    >
      <ListSection title={translate("chooseLanguage")}>
        <ListItem
          title={englishTranslations.english}
          leading={
            language === "english" ? (
              <CheckIcon size={22} color={colors.tintColor} />
            ) : null
          }
          onPress={() => changeLanguage("english")}
        />
        <ListItem
          title={banglaTranslations.bangla}
          leading={
            language === "bangla" ? (
              <CheckIcon size={22} color={colors.tintColor} />
            ) : null
          }
          onPress={() => changeLanguage("bangla")}
        />
      </ListSection>
    </ScrollView>
  );
}
