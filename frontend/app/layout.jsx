import "./globals.css";

export const metadata = {
  title: "Frontend",
  description: "Minimal Next.js app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
