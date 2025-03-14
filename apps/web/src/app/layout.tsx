import "@/styles/globals.css";

import { GoogleOAuthProvider } from "@react-oauth/google";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "@/components/ui/toaster";
import AuthProvider from "@/providers/auth-provider";
import TRPCProvider from "@/providers/trpc-provider";

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
      <body className={inter.className}>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}
        >
          <TRPCProvider>
            <AuthProvider>{children}</AuthProvider>
          </TRPCProvider>
        </GoogleOAuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
