import type { Category } from "@acme/db";
import { TRPCError } from "@trpc/server";
import React, { useCallback, useState } from "react";
import type { ListRenderItemInfo } from "react-native";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
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
  const [selectedCategoriesSlugs, setSelectedCategoriesSlug] = useState<
    string[]
  >(() => user?.categories?.map((category) => category.slug) ?? []);
  const categoriesQuery = trpc.categories.getAllCategories.useQuery({});
  const followCategories = trpc.categories.followCategories.useMutation();
  const utils = trpc.useUtils();

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
      await utils.feed.myFeedV2.invalidate();
      Alert.alert(translate("interesetUpdateSuccessMessage"));
    } catch (error) {
      Alert.alert(
        "Failed to continue",
        error instanceof TRPCError ? error.message : String(error),
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    followCategories,
    refetch,
    selectedCategoriesSlugs,
    translate,
    user,
    utils.feed.myFeedV2,
  ]);

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
    <View style={{ flex: 1 }}>
      <FlatGrid
        ListHeaderComponent={
          <View
            style={{ padding: 32, paddingVertical: 16, alignItems: "center" }}
          >
            <Text style={[styles.title, { color: colors.foreground }]}>
              {translate("interestScreenTitle")}
            </Text>
            <Text
              style={[styles.subtitle, { color: colors.secondaryForeground }]}
            >
              {translate("interestScreenSubtitle")}
            </Text>
          </View>
        }
        style={{ flex: 1 }}
        data={categoriesQuery.data}
        renderItem={renderItem}
        itemDimension={120}
      />
      <View style={{ padding: 16 }}>
        <PrimaryButton
          title={translate("update")}
          disabled={selectedCategoriesSlugs.length < 3}
          onPress={handleContinue}
          isLoading={isLoading}
        />
      </View>
    </View>
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
