import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wok Specialists - Building the Future",
  description: "A passionate group of developers crafting innovative web experiences and games. Join us in building the future.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <a href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <span className="font-bold text-xl text-slate-900 dark:text-white">
                  Wok Specialists
                </span>
              </a>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="/" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  Home
                </a>
                <a href="/projects" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  Projects
                </a>
                <a href="/chopsticks" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  Chopsticks
                </a>
                <a href="/game" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  Game
                </a>
                <a href="/docs" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  Docs
                </a>
                <a href="/status" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  Status
                </a>
                <a href="/community" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                  Community
                </a>
              </div>

              {/* CTA Button */}
              <a
                href="/community"
                className="hidden md:inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Join Us
              </a>

              {/* Mobile menu button */}
              <button className="md:hidden p-2 text-slate-600 dark:text-slate-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">W</span>
                  </div>
                  <span className="font-bold text-xl text-slate-900 dark:text-white">
                    Wok Specialists
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-sm">
                  Building innovative web experiences and games. Join our community of passionate developers.
                </p>
              </div>

              {/* Links */}
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="/projects" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">Projects</a></li>
                  <li><a href="/game" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">Game</a></li>
                  <li><a href="/community" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">Community</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Connect</h3>
                <ul className="space-y-2">
                  <li><a href="https://github.com/WokSpecialists" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">GitHub</a></li>
                  <li><a href="https://discord.gg/your-invite-link" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 transition-colors">Discord</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-slate-500 dark:text-slate-500 text-sm">
                © 2026 Wok Specialists. All rights reserved.
              </p>
              <p className="text-slate-500 dark:text-slate-500 text-sm mt-2 md:mt-0">
                Built with passion and Next.js
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
