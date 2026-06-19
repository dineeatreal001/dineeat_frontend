// app/layout.js (Server Component)
import { Archivo } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";
import AuthProvider from "@/context/AuthContext";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "DineEat",
    template: "%s | DineEat",
  },
  description: "Restaurant management system for modern food businesses",
  keywords: "restaurant management, POS, billing, inventory, reservations",
  authors: [{ name: "DineEat" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${archivo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}