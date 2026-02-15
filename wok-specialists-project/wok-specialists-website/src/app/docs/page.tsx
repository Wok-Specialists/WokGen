export default function Docs() {
  const sections = [
    {
      title: "Getting Started",
      items: [
        { title: "Quick Start", href: "#quick-start", description: "Get up and running in 5 minutes" },
        { title: "Installation", href: "#installation", description: "Detailed installation guide" },
        { title: "Configuration", href: "#configuration", description: "Environment variables and settings" }
      ]
    },
    {
      title: "Game Development",
      items: [
        { title: "Architecture", href: "#architecture", description: "System design and components" },
        { title: "WebSocket Protocol", href: "#websocket", description: "Real-time communication" },
        { title: "Authentication", href: "#auth", description: "GitHub OAuth integration" },
        { title: "Database Schema", href: "#database", description: "PostgreSQL structure" }
      ]
    },
    {
      title: "API Reference",
      items: [
        { title: "REST Endpoints", href: "#rest-api", description: "HTTP API documentation" },
        { title: "WebSocket Events", href: "#ws-events", description: "Real-time event reference" },
        { title: "Error Codes", href: "#errors", description: "Troubleshooting guide" }
      ]
    },
    {
      title: "Deployment",
      items: [
        { title: "Docker", href: "#docker", description: "Container orchestration" },
        { title: "Monitoring", href: "#monitoring", description: "Prometheus & Grafana" },
        { title: "Security", href: "#security", description: "Best practices" }
      ]
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Documentation
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
              Everything you need to know about building with Wok Specialists
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#quick-start" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                Quick Start
              </a>
              <a href="#api-reference" className="inline-flex items-center justify-center px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-colors">
                API Reference
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Docs Grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section) => (
              <div key={section.title} className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  {section.title}
                </h2>
                <ul className="space-y-4">
                  {section.items.map((item) => (
                    <li key={item.title}>
                      <a
                        href={item.href}
                        className="group block p-4 -mx-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                          {item.description}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Content */}
      <section id="quick-start" className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Quick Start</h2>
          
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">1. Clone the Repository</h3>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto">
              <code>git clone https://github.com/WokSpecialists/wok-specialists-project.git
cd wok-specialists-project</code>
            </pre>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 mt-8">2. Install Dependencies</h3>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto">
              <code>npm run install:all</code>
            </pre>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 mt-8">3. Start with Docker</h3>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto">
              <code>docker compose up --build -d</code>
            </pre>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 mt-8">4. Access the Services</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
              <li>Website: http://localhost:3000</li>
              <li>Game: http://localhost:3000/game</li>
              <li>API: http://localhost:3001</li>
              <li>Status: http://localhost:3000/status</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Architecture</h2>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">System Overview</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              The Wok Specialists platform consists of multiple services working together to provide a seamless experience:
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">W</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Website (Next.js)</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Static site generation with React, served by nginx</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">G</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Game Client (Phaser.js)</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Browser-based game engine with WebGL rendering</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold">S</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Game Server (Node.js)</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">WebSocket server handling real-time multiplayer</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-bold">D</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Database (PostgreSQL)</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Persistent storage for players, sessions, and leaderboards</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-bold">C</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Cache (Redis)</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Session management and real-time data caching</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section id="rest-api" className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">API Reference</h2>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-mono">GET</span>
                <code className="text-slate-900 dark:text-white font-mono">/health</code>
              </div>
              <p className="text-slate-600 dark:text-slate-400">Health check endpoint. Returns status of all services.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-mono">GET</span>
                <code className="text-slate-900 dark:text-white font-mono">/api/stats</code>
              </div>
              <p className="text-slate-600 dark:text-slate-400">Get platform statistics: total players, online count, games played.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-mono">GET</span>
                <code className="text-slate-900 dark:text-white font-mono">/api/leaderboard</code>
              </div>
              <p className="text-slate-600 dark:text-slate-400">Get top 100 players sorted by score.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-mono">GET</span>
                <code className="text-slate-900 dark:text-white font-mono">/api/auth/github</code>
              </div>
              <p className="text-slate-600 dark:text-slate-400">Initiate GitHub OAuth authentication flow.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
