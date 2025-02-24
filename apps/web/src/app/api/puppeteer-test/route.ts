import { getArticleMetadataFromPrathamAloBangla } from "@/publishers/prothomalo-bangla";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const maxDuration = 30;

export const GET = async () => {
  const links = await getArticleMetadataFromPrathamAloBangla(
    "https://www.prothomalo.com/politics/cr7jmc7oy6",
  );
  return NextResponse.json(links);
};
