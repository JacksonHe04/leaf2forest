import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "602｜记忆录 📝",
  description: "安徽省青阳中学 2022 界 602 班的记忆录",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
