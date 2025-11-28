import "./globals.css";

export const metadata = {
  title: "Geetham SmartConnect",
  description: "LMS & ERP portal for Geetham Educational Institutions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-100">{children}</body>
    </html>
  );
}
