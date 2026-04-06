import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Doctors Meet",
  description: "A platform for managing doctor appointments and patient records.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

        <main>{children}</main>

        <footer>
            <div className="text-center text-sm text-gray-500 py-4">
              <p> Made With ❤️ Manoj Kumar</p>
            </div>
        </footer>
      </body>
    </html>
  );
}
