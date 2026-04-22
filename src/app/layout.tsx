import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  title: {
    default: "ToyHype — Cool Toys for the Kid in You",
    template: "%s | ToyHype",
  },
  description:
    "Premium RC helicopters, drones, gadgets, board games, puzzles & collectibles for adults. Free shipping above Rs 999.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "ToyHype",
    title: "ToyHype — Cool Toys for the Kid in You",
    description:
      "Premium RC helicopters, drones, gadgets, board games, puzzles & collectibles for adults.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ToyHype — Cool Toys for the Kid in You",
    description: "Premium toys for adults. RC vehicles, gadgets, board games & more.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
