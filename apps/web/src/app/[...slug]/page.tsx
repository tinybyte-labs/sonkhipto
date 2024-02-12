import Mdx from "@/components/Mdx";
import { allPages } from "contentlayer/generated";
import { notFound } from "next/navigation";

export const generateStaticParams = async () =>
  allPages.map((item) => ({ slug: item.slug.split("/") }));

export const generateMetadata = ({
  params,
}: {
  params: { slug: string[] };
}) => {
  const item = allPages.find((item) => item.slug === params.slug.join("/"));
  if (!item) {
    return {};
  }
  return {
    title: item.seo?.title ?? item.title,
    description: item.seo?.description ?? item.description,
  };
};

export default function BasePage({ params }: { params: { slug: string[] } }) {
  const page = allPages.find((page) => page.slug === params.slug.join("/"));
  if (!page) {
    notFound();
  }

  return (
    <main className="prose mx-auto my-16">
      <h1>{page.title}</h1>
      <Mdx code={page.body.code} />
    </main>
  );
}
