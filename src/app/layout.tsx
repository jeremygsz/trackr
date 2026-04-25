import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trackr - Gestion de finances personnelles",
  description: "Suivez vos dépenses, abonnements et échéances simplement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
