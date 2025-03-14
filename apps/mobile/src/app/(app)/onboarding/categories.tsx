import type { Category } from "@acme/db";
import { TRPCError } from "@trpc/server";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import type { ListRenderItemInfo } from "react-native";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatGrid } from "react-native-super-grid";

import LoadingView from "@/components/LoadingView";
import PrimaryButton from "@/components/PrimaryButton";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/providers/AuthProvider";
import { useLanguage } from "@/providers/LanguageProvider";
import { trpc } from "@/utils/trpc";

export default function CategoriesScreen() {
  const { translate, language } = useLanguage();
  const { user, refetch } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const colors = useColors();
  const router = useRouter();
  const [selectedCategoriesSlugs, setSelectedCategoriesSlug] = useState<
    string[]
  >(() => user?.categories?.map((category) => category.slug) ?? []);
  const categoriesQuery = trpc.categories.getAllCategories.useQuery({});
  const followCategories = trpc.categories.followCategories.useMutation();

  const handleContinue = useCallback(async () => {
    if (selectedCategoriesSlugs.length < 3) {
      return;
    }
    if (!user) {
      return;
    }

    setIsLoading(true);
    try {
      await followCategories.mutateAsync(selectedCategoriesSlugs);
      await refetch();
      router.push("/");
    } catch (error) {
      Alert.alert(
        "Failed to continue",
        error instanceof TRPCError ? error.message : String(error),
      );
    } finally {
      setIsLoading(false);
    }
  }, [followCategories, refetch, router, selectedCategoriesSlugs, user]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Category>) => {
      const selected = selectedCategoriesSlugs.includes(item.slug);
      return (
        <TouchableHighlight
          disabled={isLoading}
          key={item.id}
          onPress={() =>
            setSelectedCategoriesSlug((categories) =>
              selected
                ? categories.filter((c) => c !== item.slug)
                : [...categories, item.slug],
            )
          }
          style={{
            height: 80,
            borderWidth: 1,
            borderColor: selected ? colors.primary : colors.border,
            borderRadius: 16,
            padding: 12,
            justifyContent: "flex-end",
          }}
          underlayColor={colors.secondary}
        >
          <Text style={{ fontWeight: "600", color: colors.foreground }}>
            {language === "bn" ? item.nameBengali : item.name}
          </Text>
        </TouchableHighlight>
      );
    },
    [
      colors.border,
      colors.foreground,
      colors.primary,
      colors.secondary,
      isLoading,
      language,
      selectedCategoriesSlugs,
    ],
  );

  if (categoriesQuery.isPending) {
    return <LoadingView />;
  }

  if (categoriesQuery.isError) {
    return (
      <View>
        <Text>{categoriesQuery.error.message}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 32, paddingVertical: 16, alignItems: "center" }}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {translate("interestScreenTitle")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.secondaryForeground }]}>
          {translate("interestScreenSubtitle")}
        </Text>
      </View>
      <FlatGrid
        style={{ flex: 1 }}
        data={categoriesQuery.data}
        renderItem={renderItem}
        itemDimension={120}
      />
      <View style={{ padding: 16 }}>
        <PrimaryButton
          title={translate("continue")}
          disabled={selectedCategoriesSlugs.length < 3}
          onPress={handleContinue}
          isLoading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    textAlign: "center",
  },
});
