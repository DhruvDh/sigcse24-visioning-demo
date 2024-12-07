import type { Metadata } from "next";
import "./globals.css";
import "./fonts.css";

export const metadata: Metadata = {
  title: "Teaching LLMs to Teach",
  description: "A demo exploring constructivist approaches in AI tutoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
