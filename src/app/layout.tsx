"use client";

import "./globals.css";
import { PrivyProvider } from "@privy-io/react-auth";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="h-full">
      <body className="h-full">
        <PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}>
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}
