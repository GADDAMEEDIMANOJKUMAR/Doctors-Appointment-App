import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Link from "next/link";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import {dark} from "@clerk/themes"; 
import { Button } from "@/components/ui/button";
import Header from "@/components/header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Doctors Meet",
  description: "A platform for managing doctor appointments and patient records.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en" suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider appearance={{baseTheme: dark}}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
         <Header />
          <main>{children}</main>
          <footer>
            <div className="text-center text-sm text-gray-500 py-4">
              <p> Made With ❤️ Manoj Kumar</p>
            </div>
          </footer>
        </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
