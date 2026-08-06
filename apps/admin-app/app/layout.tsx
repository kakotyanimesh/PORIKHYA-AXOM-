import type { Metadata } from "next";
import "@repo/ui/globals.css";
import { DM_Sans, Outfit } from "next/font/google";
import { cn } from "@repo/ui/lib/utils";
import { dottedFont } from "@repo/ui/lib/fonts";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { Toaster } from "@repo/ui/components/sonner";

const outfitHeading = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "porikhyaaxom admin",
  description: "Content management for porikhyaaxom",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "font-sans",
        dmSans.variable,
        outfitHeading.variable,
        dottedFont.variable,
      )}
    >
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
