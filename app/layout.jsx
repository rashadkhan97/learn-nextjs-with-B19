// app/layout.jsx — Root layout: wraps every page, required by App Router
import './globals.css';

export const metadata = {
  title: 'Next.js Demo Project', // sets <title> in <head>
  description: 'A simple, one-file-per-concept demo of React/Next.js components, events, and hooks.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="container">{children}</div> {/* children = current page's content */}
      </body>
    </html>
  );
}