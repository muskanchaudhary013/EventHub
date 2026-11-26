import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { EventHubProvider } from "@/context/EventHubContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "EventHub — Discover. Register. Experience.",
  description:
    "Your gateway to every Hack4Tech event. Discover campus events, issue instant digital QR passes, manage fast gate check-ins, and run multi-track fests seamlessly.",
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('eh-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.setAttribute('data-theme','light');}}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`,
          }}
        />
      </head>
      <body className="bg-background text-on-surface font-sans antialiased selection:bg-primary-container/25 selection:text-primary">
        <AuthProvider>
          <EventHubProvider>{children}</EventHubProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
