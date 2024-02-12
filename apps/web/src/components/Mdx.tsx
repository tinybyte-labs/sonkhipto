import { useMDXComponent } from "next-contentlayer/hooks";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";
import Image from "next/image";

const components: MDXComponents = {
  a: ({ href, children }) => <Link href={href as string}>{children}</Link>,
  // eslint-disable-next-line jsx-a11y/alt-text
  Image: (props: any) => <Image {...props} />,
};

export default function Mdx({ code }: { code: string }) {
  const MDXContent = useMDXComponent(code);

  return (
    <div className="prose max-w-none md:prose-lg lg:prose-xl">
      <MDXContent components={components} />
    </div>
  );
}
