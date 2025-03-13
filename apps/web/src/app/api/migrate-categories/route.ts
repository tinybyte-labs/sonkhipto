import { categories } from "@acme/core/constants/categories";
import { db } from "@acme/db";
import { NextResponse } from "next/server";

export const GET = async () => {
  for (const category of Object.entries(categories)) {
    const [slug, { bengali, english }] = category;
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
  }

  return new NextResponse("Done");
};
