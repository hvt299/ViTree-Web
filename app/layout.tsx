import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ViTree | Quản lý Gia phả & Huyết thống",
  description: "Hệ thống quản lý gia phả thông minh. Theo dõi sơ đồ cây dòng họ, huyết thống và thông tin các thế hệ dễ dàng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} h-full antialiased`}
    >
      <body
        className={`${beVietnamPro.className} min-h-full flex flex-col bg-gray-50 text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
