import type { Metadata } from "next";
import { DM_Sans, Source_Sans_3, Oswald } from "next/font/google";
import "./globals.css";
import { AuthGuard } from "@/components/layout/AuthGuard";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-label" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "WorkTime | منصة إدارة الحضور",
  description: "نظام إدارة الحضور والانصراف الاحترافي",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return ( 
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${dmSans.variable} ${sourceSans.variable} ${oswald.variable} 
                       antialiased bg-surface text-on-surface`}>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
