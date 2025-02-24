import {
  getArticleMetadataFromPrathamAloBangla,
  getLatestArticleLinksFromPrathamAloBangla,
} from "@/publishers/prothomalo-bangla";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const maxDuration = 300;

export const GET = async () => {
  const links = await getLatestArticleLinksFromPrathamAloBangla();
  return NextResponse.json(links);
};
