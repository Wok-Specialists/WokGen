import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support WokGen — Crypto Donations',
  description:
    'Keep WokGen free forever. Support the project with a crypto donation — ' +
    'Bitcoin, Ethereum, Solana, Monero, Litecoin, or USDC.',
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
