export default function Chopsticks() {
  const features = [
    {
      title: "Agent-Backed Music",
      description: "Distributed music system with agent-based audio processing. No single point of failure.",
      icon: "🎵"
    },
    {
      title: "VoiceMaster",
      description: "Dynamic voice channel creation. Users create their own channels on demand.",
      icon: "🎙️"
    },
    {
      title: "Dual Commands",
      description: "Support for both modern slash commands and classic prefix commands.",
      icon: "⌨️"
    },
    {
      title: "Admin Dashboard",
      description: "Web-based dashboard for server management and configuration.",
      icon: "📊"
    },
    {
      title: "Metrics & Health",
      description: "Built-in Prometheus metrics and health monitoring endpoints.",
      icon: "📈"
    },
    {
      title: "Self-Hosted",
      description: "Full control over your bot. Host on your own infrastructure.",
      icon: "🖥️"
    }
  ];

  const techStack = [
    { name: "Discord.js", category: "Core" },
    { name: "TypeScript", category: "Language" },
    { name: "Lavalink", category: "Audio" },
    { name: "PostgreSQL", category: "Database" },
    { name: "Redis", category: "Cache" },
    { name: "Docker", category: "Deployment" }
  ];

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2"></span>
                v2.0 Now Available
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                Chopsticks
              </h1>
              <p className="text-xl text-white/90 mb-4">
                The ultimate self-hosted Discord bot for serious communities
              </p>
              <p className="text-lg text-white/80 mb-8">
                Built with scalability in mind. Features agent-backed music, VoiceMaster channels, 
                and comprehensive admin controls.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#installation"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </a>
                <a
                  href="https://github.com/WokSpecialists/chopsticks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  View on GitHub
                </a>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                <pre className="text-sm text-white/90 overflow-x-auto">
                  <code>{`$ docker compose up -d
[+] Running 5/5
 ✔ Container chopsticks-db      Running
 ✔ Container chopsticks-redis   Running  
 ✔ Container chopsticks-bot     Running
 ✔ Container chopsticks-agents  Running
 ✔ Container chopsticks-web     Running

🎵 Chopsticks Bot Online!
🌐 Dashboard: http://localhost:8080`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-slate-400 text-sm">Commands</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">99.9%</div>
              <div className="text-slate-400 text-sm">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">0ms</div>
              <div className="text-slate-400 text-sm">Main Bot Audio</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">MIT</div>
              <div className="text-slate-400 text-sm">License</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              A complete solution for Discord server management, from music to moderation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Built with Modern Tech
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              TypeScript-first architecture with enterprise-grade tools
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {techStack.map((tech) => (
              <div
                key={tech.name}
                className="px-6 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <span className="text-slate-500 dark:text-slate-400 text-sm block">{tech.category}</span>
                <span className="text-slate-900 dark:text-white font-semibold">{tech.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation */}
      <section id="installation" className="py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Quick Start</h2>
            <p className="text-slate-400">Get Chopsticks running in minutes with Docker</p>
          </div>

          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">1. Clone and Configure</h3>
            <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl overflow-x-auto mb-6">
              <code>git clone https://github.com/WokSpecialists/chopsticks.git
cd chopsticks
cp .env.example .env
# Edit .env with your Discord bot token</code>
            </pre>

            <h3 className="text-lg font-semibold text-white mb-4">2. Start Services</h3>
            <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl overflow-x-auto mb-6">
              <code>docker compose up --build -d</code>
            </pre>

            <h3 className="text-lg font-semibold text-white mb-4">3. Access Dashboard</h3>
            <p className="text-slate-400 mb-4">
              Visit http://localhost:8080 to access the admin dashboard and configure your bot.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-6">
            Ready to Upgrade Your Discord Server?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Join thousands of communities using Chopsticks for reliable, feature-rich bot functionality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/WokSpecialists/chopsticks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              View on GitHub
            </a>
            <a
              href="/docs"
              className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-purple-300 transition-colors"
            >
              Read Documentation
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
