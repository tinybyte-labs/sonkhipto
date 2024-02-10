import { Image } from "expo-image";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ListItem, ListSection } from "@/components/List";
import { languageTranslations } from "@/constants/translations";
import { useColors } from "@/hooks/useColors";
import { availableLanguages, useLanguage } from "@/providers/LanguageProvider";

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
        {availableLanguages.map((lang) => (
          <ListItem
            key={lang}
            title={languageTranslations[lang][lang]}
            leading={
              language === lang ? (
                <Image
                  source={require("@/assets/icons/check.png")}
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: colors.foreground,
                  }}
                />
              ) : null
            }
            onPress={() => changeLanguage(lang)}
          />
        ))}
      </ListSection>
    </ScrollView>
  );
}
