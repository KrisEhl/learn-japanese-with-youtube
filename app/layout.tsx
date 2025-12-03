import "./../styles/globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen p-6 bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}