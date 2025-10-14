import type { Metadata } from "next";
import { Exo_2, Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import SessionProvider from "@/components/providers/SessionProvider";

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "AlumniConnect - Connect With Your Alumni Network",
  description: "Build meaningful connections, discover opportunities, and grow together with fellow graduates",
  keywords: ["alumni", "network", "connections", "career", "mentorship"],
  authors: [{ name: "AlumniConnect Team" }],
  openGraph: {
    title: "AlumniConnect",
    description: "Build meaningful connections, discover opportunities, and grow together with fellow graduates",
    url: "https://alumniconnect.com",
    siteName: "AlumniConnect",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AlumniConnect",
    description: "Build meaningful connections, discover opportunities, and grow together with fellow graduates",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${exo2.variable} ${roboto.variable} antialiased bg-background text-foreground font-roboto`}
      >
        <SessionProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
