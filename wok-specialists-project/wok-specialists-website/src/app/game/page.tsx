export default function Game() {
  return (
    <div className="bg-slate-950 min-h-[calc(100vh-4rem)]">
      {/* Game Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Wok Central</h1>
              <p className="text-slate-400 text-sm">Multiplayer browser game</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-slate-400 text-sm">
                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                <span>Online</span>
              </div>
              <a
                href="/projects"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                About the Game →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Game Container */}
      <div className="h-[calc(100vh-10rem)]">
        <iframe
          src={process.env.NEXT_PUBLIC_GAME_CLIENT_URL || 'http://localhost:3002'}
          className="w-full h-full border-0 bg-black"
          title="Wok Central Game"
          allow="fullscreen"
          sandbox="allow-same-origin allow-scripts"
        />
      </div>

      {/* Game Instructions */}
      <div className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-slate-800 rounded text-xs border border-slate-700">↑</kbd>
              <kbd className="px-2 py-1 bg-slate-800 rounded text-xs border border-slate-700">↓</kbd>
              <kbd className="px-2 py-1 bg-slate-800 rounded text-xs border border-slate-700">←</kbd>
              <kbd className="px-2 py-1 bg-slate-800 rounded text-xs border border-slate-700">→</kbd>
              <span>to move</span>
            </div>
            <span className="hidden sm:inline text-slate-600">•</span>
            <div className="flex items-center space-x-2">
              <span>Multiplayer enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
