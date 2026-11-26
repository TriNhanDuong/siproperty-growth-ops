import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "SI Property · Growth Ops Pilot",
    template: "%s · SI Property Pilot",
  },
  description: "A synthetic real estate marketing engineering pilot.",
};
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <a className="brand" href="/">
            SI<span>PROPERTY</span>
          </a>
          <a className="pilot-label" href="/privacy">
            ENGINEERING PILOT ↗
          </a>
        </header>
        {children}
        <footer>
          <span>SI Property Growth Ops</span>
          <span>Synthetic projects · No live listings · No sales contact</span>
          <a href="/privacy">Data & privacy</a>
        </footer>
      </body>
    </html>
  );
}
