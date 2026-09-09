import type { Metadata } from "next";
import "./globals.css";
import { MembershipProvider } from "@/hooks/use-membership";
import { Toaster } from "@/components/ui/toaster";
export const metadata: Metadata = {
  metadataBase: new URL("https://IBgenie.com"),
  title: "IBGenie Pro | Your IB learning workspace",
  description:
    "Create useful resources, build understanding with quizzes and flashcards, plan your study, and explore ideas with AI subject coaches.",
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <MembershipProvider>
          {children}
          <Toaster />
        </MembershipProvider>
      </body>
    </html>
  );
}
