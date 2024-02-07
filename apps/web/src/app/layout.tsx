import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import Link from "next/link";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sonkhipto",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header>
          <nav>
            <div className="container py-4 flex items-center">
              <Link href="/">
                <Image
                  src="/sonkhipto.svg"
                  alt="Sonkhipto Logo"
                  width={3755}
                  height={1080}
                  className="h-14 w-fit"
                />
              </Link>
              <div className="flex-1"></div>
              <div className="flex"></div>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
