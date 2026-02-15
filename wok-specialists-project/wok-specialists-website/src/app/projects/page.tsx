export default function Projects() {
  const projects = [
    {
      title: "Chopsticks",
      subtitle: "Discord Bot",
      description: "A robust, self-hosted Discord bot designed for enhancing server communities with agent-backed music systems, VoiceMaster channels, and comprehensive guild management.",
      features: ["Agent-backed music", "VoiceMaster channels", "Slash & prefix commands", "Admin dashboard"],
      status: "Beta",
      statusColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      href: "#",
    },
    {
      title: "Wok Central",
      subtitle: "Multiplayer Game",
      description: "An ambitious web-based multiplayer game combining farming, exploration, and city simulation. Built with Phaser.js and WebSocket for real-time interaction.",
      features: ["Real-time multiplayer", "WebSocket architecture", "Browser-based", "Expanding world"],
      status: "In Development",
      statusColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      href: "/game",
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <section className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Our Projects
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Explore our open-source projects and contributions to the developer community.
            </p>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <div
                key={project.title}
                className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Card Header */}
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                        {project.title}
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {project.subtitle}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${project.statusColor}`}>
                      {project.status}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <a
                    href={project.href}
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors group-hover:translate-x-1 duration-200"
                  >
                    Learn more
                    <svg
                      className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>

                {/* Card Footer */}
                <div className="px-8 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800" />
                        <div className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-white dark:border-slate-800" />
                        <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs text-slate-600 dark:text-slate-400">
                          +
                        </div>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        Active contributors
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Want to contribute?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            We are always looking for passionate developers to join our projects.
          </p>
          <a
            href="/community"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Join the Community
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
