import "./globals.css";

export const metadata = {
  title: "VYBZ — AI Memory & Friendship Trivia Engine",
  description: "VYBZ turns memories into interactive friendship trivia.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}