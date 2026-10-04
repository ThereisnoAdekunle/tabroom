import "./globals.css";
export const metadata = { title: "Tabroom", description: "Shared tabs for group costs on Monad." };
export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
