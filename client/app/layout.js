export const metadata = {
  title: "Geetham SmartConnect",
  description: "LMS & ERP system for Geetham Educational Institutions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
