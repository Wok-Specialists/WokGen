import QRCode from 'qrcode';
import { CopyButton } from './_CopyButton';

/* ── Wallet data ────────────────────────────────────────────────────────────── */

const WALLETS = [
  {
    id: 'btc',
    name: 'Bitcoin',
    ticker: 'BTC',
    network: 'Bitcoin Network',
    address: '[BTC_ADDRESS_PLACEHOLDER]',
    color: '#f7931a',
    bgColor: 'rgba(247,147,26,0.12)',
    label: '₿',
  },
  {
    id: 'eth',
    name: 'Ethereum',
    ticker: 'ETH',
    network: 'Ethereum Mainnet',
    address: '[ETH_ADDRESS_PLACEHOLDER]',
    color: '#627eea',
    bgColor: 'rgba(98,126,234,0.12)',
    label: 'Ξ',
  },
  {
    id: 'sol',
    name: 'Solana',
    ticker: 'SOL',
    network: 'Solana Mainnet',
    address: '[SOL_ADDRESS_PLACEHOLDER]',
    color: '#9945ff',
    bgColor: 'rgba(153,69,255,0.12)',
    label: '◎',
  },
  {
    id: 'xmr',
    name: 'Monero',
    ticker: 'XMR',
    network: 'Monero Network',
    address: '[XMR_ADDRESS_PLACEHOLDER]',
    color: '#ff6600',
    bgColor: 'rgba(255,102,0,0.12)',
    label: 'ɱ',
  },
  {
    id: 'ltc',
    name: 'Litecoin',
    ticker: 'LTC',
    network: 'Litecoin Network',
    address: '[LTC_ADDRESS_PLACEHOLDER]',
    color: '#bfbbbb',
    bgColor: 'rgba(191,187,187,0.1)',
    label: 'Ł',
  },
  {
    id: 'usdc',
    name: 'USDC',
    ticker: 'USDC',
    network: 'Ethereum / Solana',
    address: '[USDC_ADDRESS_PLACEHOLDER]',
    color: '#2775ca',
    bgColor: 'rgba(39,117,202,0.12)',
    label: '$',
  },
] as const;

/* ── Truncate address helper ─────────────────────────────────────────────── */

function truncateAddress(addr: string): string {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

/* ── Server component ────────────────────────────────────────────────────── */

export default async function SupportPage() {
  // Generate QR code data URLs server-side
  const walletsWithQR = await Promise.all(
    WALLETS.map(async (w) => {
      const qrDataUrl = await QRCode.toDataURL(w.address, {
        width: 224,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
      return { ...w, qrDataUrl };
    }),
  );

  return (
    <main className="support-page">

      {/* Hero */}
      <section className="pricing-header">
        <p className="pricing-eyebrow">Open Source · Community Funded</p>
        <h1 className="pricing-h1">
          Keep WokGen{' '}
          <span className="pricing-h1-accent">Free</span>
        </h1>
        <p className="pricing-sub">
          Every tool, every studio, every model. Free forever. Supported by the community.
        </p>
      </section>

      {/* Mission */}
      <section className="support-mission">
        <h2 className="landing-h2" style={{ marginBottom: '1rem' }}>Our open-source mission</h2>
        <p>
          WokGen is built on the belief that AI creative tools should be accessible to everyone —
          indie developers, artists, students, and hobbyists alike. Every model we run is open-source,
          every line of code is public, and every feature is free to use.
        </p>
        <p>
          Running GPU inference, hosting model weights, and keeping the platform fast costs real money.
          We cover it through community donations — no investors, no ads, no paywalls.
          If WokGen has saved you time or money, consider sending a small donation to keep the
          servers running and volunteer compute alive.
        </p>
      </section>

      {/* Wallet grid */}
      <section className="support-wallet-section">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p className="pricing-eyebrow">Donate Crypto</p>
          <h2 className="landing-h2">Choose your coin</h2>
          <p className="pricing-sub">
            Send any amount — every contribution goes directly toward server costs and model hosting.
          </p>
        </div>

        <div className="support-wallet-grid">
          {walletsWithQR.map((wallet) => (
            <div key={wallet.id} className="support-wallet-card">
              <div className="support-wallet-header">
                <div
                  className="support-coin-icon"
                  style={{ background: wallet.bgColor, color: wallet.color }}
                >
                  {wallet.label}
                </div>
                <div>
                  <div className="support-coin-name">{wallet.name}</div>
                  <div className="support-coin-network">{wallet.network}</div>
                </div>
              </div>

              <div className="support-wallet-qr">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={wallet.qrDataUrl}
                  alt={`${wallet.name} QR code`}
                  width={112}
                  height={112}
                />
              </div>

              <div className="support-wallet-address">
                <span style={{ flex: 1 }}>{truncateAddress(wallet.address)}</span>
              </div>

              <CopyButton address={wallet.address} />
            </div>
          ))}
        </div>
      </section>

      {/* Why we do this */}
      <section className="support-values-section">
        <div style={{ textAlign: 'center' }}>
          <p className="pricing-eyebrow">Why we do this</p>
          <h2 className="landing-h2">Built on principles, not profit</h2>
        </div>

        <div className="support-values-grid">
          <div className="card">
            <div className="support-values-icon">Open</div>
            <div className="support-values-title">Open Source</div>
            <p className="support-values-desc">
              Every model, every API route, every UI component is public on GitHub.
              Fork it, self-host it, audit it. MIT licensed, no strings attached.
            </p>
          </div>
          <div className="card">
            <div className="support-values-icon">Web</div>
            <div className="support-values-title">Community Powered</div>
            <p className="support-values-desc">
              WokGen runs on volunteer compute and community donations. No VC funding,
              no data harvesting, no hidden agenda. Just tools that work.
            </p>
          </div>
          <div className="card">
            <div className="support-values-icon">Secure</div>
            <div className="support-values-title">Privacy First</div>
            <p className="support-values-desc">
              We don&apos;t train on your generations, sell your data, or track
              your creative work. Your prompts and outputs are yours.
            </p>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <div className="support-footer-note">
        100% of donations go toward server costs and model hosting. No middlemen.
      </div>

    </main>
  );
}
