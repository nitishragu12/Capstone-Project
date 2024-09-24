import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DataProvider } from "./context/DataContext";
import { ErrorProvider } from "./context/ErrorContext";
import { LoadingProvider } from "./context/LoadingContext";
// import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PaperMate",
  description: "ToDo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorProvider>
          <LoadingProvider>
            <DataProvider>
              {children}
            </DataProvider>
          </LoadingProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}
