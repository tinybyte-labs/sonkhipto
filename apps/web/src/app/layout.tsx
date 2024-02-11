import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "Sonkhipto - Your Daily Dose of Concise News. Stay Informed, Save Time!",
  description:
    "Sonkhipto delivers concise news updates tailored for the modern reader. Stay ahead of the curve with quick, easy-to-digest news bites in both Bangla and English. Spend less time scrolling, more time knowing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
