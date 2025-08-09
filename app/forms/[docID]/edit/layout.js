import "../../../globals.css";

export const metadata = {
  title: "Edit Form | Eventloop",
  description: "Event Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
          {children}
      </body>
    </html>
  );
}
