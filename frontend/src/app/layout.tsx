import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { EventHubProvider } from "@/context/EventHubContext";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EventHub — College Fest & Hackathon Ops Platform",
  description:
    "Discover campus events, issue instant digital QR passes, manage fast gate check-ins, and run multi-track collegiate fests seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} ${montserrat.variable}`}
    >
      <body className="bg-background text-on-surface font-sans antialiased selection:bg-primary-container/20 selection:text-primary">
        <AuthProvider>
          <EventHubProvider>{children}</EventHubProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
