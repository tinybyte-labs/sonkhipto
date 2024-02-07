import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "@/components/PrimaryButton";
import { languageTranslations } from "@/constants/translations";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/providers/LanguageProvider";
import { Language } from "@/types/language";
import { useAuth } from "@/providers/AuthProvider";

export default function LanguageSelector() {
  const colors = useColors();
  const [lang, setLang] = useState<Language>("english");
  const { changeLanguage } = useLanguage();
  const { signInAnonymously } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const onContinue = useCallback(async () => {
    try {
      setIsLoading(true);
      await changeLanguage(lang);
      await signInAnonymously();
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [changeLanguage, lang]);

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={[styles.welcome, { color: colors.secondaryForeground }]}>
          Welcome to
        </Text>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Sonkhipto
        </Text>
      </View>
      <View style={{ flex: 1 }} />
      <Text style={[styles.chooseLangText, { color: colors.foreground }]}>
        Choose your Language
      </Text>
      <Text
        style={[
          styles.chooseLangText,
          { color: colors.foreground, marginTop: 8 },
        ]}
      >
        আপনার ভাষা নির্বাচন করুন
      </Text>
      <View style={styles.langButtonsWrapper}>
        <Pressable
          style={[
            styles.langButton,
            {
              borderColor: lang === "english" ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setLang("english")}
        >
          <Text
            style={[
              styles.langButtonTitle,
              {
                color: lang === "english" ? colors.primary : colors.foreground,
              },
            ]}
          >
            English
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.langButton,
            {
              borderColor: lang === "bangla" ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setLang("bangla")}
        >
          <Text
            style={[
              styles.langButtonTitle,
              {
                color: lang === "bangla" ? colors.primary : colors.foreground,
              },
            ]}
          >
            বাংলা
          </Text>
        </Pressable>
      </View>
      <View style={{ flex: 1 }} />
      <PrimaryButton
        title={languageTranslations[lang].continue}
        onPress={onContinue}
        isLoading={isLoading}
        disabled={isLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    paddingTop: 64,
  },
  welcome: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 8,
  },
  chooseLangText: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
  },
  langButtonsWrapper: {
    gap: 16,
    marginTop: 32,
  },
  langButton: {
    height: 56,
    borderRadius: 56,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  langButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
