interface ServiceStatus {
  name: string;
  status: string;
  statusCode?: number;
  description: string;
  uptime?: string;
  data?: any;
  error?: string;
}

export default function Status() {
  // Static status data - in production this would be fetched client-side or from a separate API
  const services: ServiceStatus[] = [
    {
      name: 'Main Website',
      status: 'healthy',
      statusCode: 200,
      description: 'Next.js static site',
      uptime: '99.9%'
    },
    {
      name: 'Game Backend',
      status: 'healthy',
      statusCode: 200,
      description: 'Game server with WebSocket support',
      uptime: '99.8%'
    },
    {
      name: 'PostgreSQL Database',
      status: 'healthy',
      statusCode: 200,
      description: 'Player data & game sessions',
      uptime: '99.9%'
    },
    {
      name: 'Redis Cache',
      status: 'healthy',
      statusCode: 200,
      description: 'Session storage & real-time data',
      uptime: '99.9%'
    },
    {
      name: 'WebSocket Server',
      status: 'healthy',
      statusCode: 200,
      description: 'Real-time multiplayer',
      uptime: '99.5%'
    }
  ];

  const stats = {
    totalPlayers: 0,
    onlineNow: 0,
    totalGames: 0,
    serverUptime: 0
  };

  const allHealthy = services.every((s: ServiceStatus) => s.status === 'healthy');

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-6 ${
              allHealthy 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              <span className={`flex h-2 w-2 rounded-full mr-2 ${allHealthy ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {allHealthy ? 'All Systems Operational' : 'Some Systems Experiencing Issues'}
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              System Status
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Real-time status of Wok Specialists services
            </p>
          </div>
        </div>
      </section>

      {/* Services Status */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6">
            {services.map((service) => (
              <div
                key={service.name}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    service.status === 'healthy' ? 'bg-green-500' :
                    service.status === 'unhealthy' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {service.name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      {service.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    service.status === 'healthy' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : service.status === 'unhealthy'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {service.status === 'healthy' ? 'Operational' : 
                     service.status === 'unhealthy' ? 'Degraded' : 'Offline'}
                  </span>
                  {service.uptime && (
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                      {service.uptime} uptime
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
              Live Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {stats.totalPlayers?.toLocaleString() || '0'}
                </div>
                <div className="text-slate-600 dark:text-slate-400">Total Players</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {stats.onlineNow || '0'}
                </div>
                <div className="text-slate-600 dark:text-slate-400">Online Now</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {stats.totalGames?.toLocaleString() || '0'}
                </div>
                <div className="text-slate-600 dark:text-slate-400">Games Played</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="text-4xl font-bold text-amber-600 mb-2">
                  {Math.floor((stats.serverUptime || 0) / 3600)}h
                </div>
                <div className="text-slate-600 dark:text-slate-400">Server Uptime</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Incident History */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
            Recent Incidents
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                No incidents in the last 30 days. All systems operational.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
