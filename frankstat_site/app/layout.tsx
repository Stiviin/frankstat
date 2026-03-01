import type { Metadata } from "next";

<<<<<<< HEAD
=======
import { AuthProvider } from "@/lib/auth-context";


>>>>>>> 8f2e237 (Save local)
export const metadata: Metadata = {
  title: "Frankstat | Premium Printing in Nairobi",
  description:
    "Nairobi's trusted printing partner. Banners, posters, signage, sublimation, business cards, heat press & more. Fast turnaround. M-Pesa payments.",
  keywords: "printing nairobi, banners, posters, signage, sublimation, business cards, vinyl cutting, heat press",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
<<<<<<< HEAD
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
=======
      <body style={{ margin: 0, padding: 0 }}>{children}
      <AuthProvider>{children}</AuthProvider>

      </body>
>>>>>>> 8f2e237 (Save local)
    </html>
  );
}
