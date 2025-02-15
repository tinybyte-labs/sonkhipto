import { NextResponse } from "next/server";
import Parser from "rss-parser";

export const GET = async () => {
  const res = await fetch("https://www.ittefaq.com.bd/feed/");
  const feedStr = await res.text();
  const parser = new Parser();
  const feed = await parser.parseString(feedStr);
  return NextResponse.json(feed);
};
