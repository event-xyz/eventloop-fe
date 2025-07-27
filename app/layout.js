import "./globals.css";
import { GoogleOAuthProvider } from '@react-oauth/google';

export const metadata = {
  title: "EventLoop",
  description: "Event Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
