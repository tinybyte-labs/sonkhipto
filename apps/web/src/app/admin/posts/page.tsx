"use client";

import { Button } from "@/components/ui/button";
import { trpc } from "@/utils/trpc";
import Link from "next/link";
import { useMemo } from "react";

export default function PostsPage() {
  const postsQuery = trpc.post.findMany.useInfiniteQuery(
    { limit: 100 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );
  const posts = useMemo(
    () => postsQuery.data?.pages.flatMap((page) => page.posts) ?? [],
    [postsQuery.data?.pages],
  );

  if (postsQuery.isPending) {
    return <p>Loading...</p>;
  }
  if (postsQuery.isError) {
    return <p>Error: {postsQuery.error.message}</p>;
  }

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>
          <p>{post.title}</p>
          {post.author && <p>By {post.author.name}</p>}
          <p>{post.content}</p>
          <Link href={post.sourceUrl}>{post.sourceName}</Link>
        </div>
      ))}
      {postsQuery.data.pages[postsQuery.data.pages.length - 1].nextCursor && (
        <Button onClick={() => postsQuery.fetchNextPage()}>Load More</Button>
      )}
    </div>
  );
}
