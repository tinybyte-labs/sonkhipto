import type { MDXComponents } from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import { useMDXComponent } from "next-contentlayer/hooks";

const components: MDXComponents = {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  a: ({ href, children }) => <Link href={href!}>{children}</Link>,
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
