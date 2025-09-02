import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/global/vibes-design-system.css";
import WalletProvider from "@/components/features/wallet/WalletProvider";
import { NotificationProvider } from "@/components/ui/NotificationSystem";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VIBES DeFi - Complete DeFi Ecosystem on Solana",
  description: "Experience the future of DeFi with VIBES - featuring presale, vesting, and staking mechanisms on Solana blockchain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NotificationProvider>
          <WalletProvider>
            {children}
          </WalletProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
