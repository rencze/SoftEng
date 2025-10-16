// src/app/layout.js
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata = {
  title: "2LOY Car Aircon",
  description: "Premium car air conditioning services",
  icons: {
    icon: [
      { url: '/system-logo.png', type: 'image/png', sizes: '32x32' },
      { url: '/system-logo.png', type: 'image/png', sizes: '16x16' },
    ],
    shortcut: '/system-logo.png',
    apple: '/system-logo.png', // for Apple devices
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}