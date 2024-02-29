
import { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Asset Under Management",
  description: "Show the assets under a given code ID in Archway",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
