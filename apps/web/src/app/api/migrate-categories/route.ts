import { categories } from "@acme/core/constants/categories";
import { db } from "@acme/db";
import { NextResponse } from "next/server";

export const GET = async () => {
  Object.entries(categories).forEach(async ([slug, { bengali, english }]) => {
    await db.category.upsert({
      where: { slug },
      create: {
        slug,
        name: english,
        nameBengali: bengali,
      },
      update: {
        name: english,
        nameBengali: bengali,
      },
    });
  });

  return new NextResponse("Done");
};
