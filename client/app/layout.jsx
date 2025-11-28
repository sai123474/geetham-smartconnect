import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Geetham SmartConnect",
  description: "Smart ERP & LMS for Geetham Educational Institutions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
