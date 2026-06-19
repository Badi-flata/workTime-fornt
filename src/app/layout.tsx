import type { Metadata } from "next";
import { DM_Sans, Source_Sans_3, Oswald } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-label" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: "WorkTime | منصة إدارة الحضور",
  description: "نظام إدارة الحضور والانصراف الاحترافي",
};
// 
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return ( 
    <html lang="ar" dir="rtl">
      <body className={`${dmSans.variable} ${sourceSans.variable} ${oswald.variable} antialiased bg-surface text-on-surface`}>
        {children}
      </body>
    </html>
  );
}
