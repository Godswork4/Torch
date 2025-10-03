import { Mail, Calendar, Sparkles } from 'lucide-react';

export function DashboardContent() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Good Morning, <span className="text-cyan-400">WalletAlias</span>
        </h1>
        <p className="text-slate-400">Here's your clarity brief for today</p>
      </div>

      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-lg border border-cyan-500/30 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4">The Daily Torch Brief</h2>
              <div className="space-y-3 text-slate-300">
                <p className="text-sm sm:text-base">
                  <span className="font-semibold text-cyan-400">The Block Brief:</span> Your whale wallet just received 12 ETH from verified Arbitrum bridge.
                </p>
                <p className="text-sm sm:text-base">
                  <span className="font-semibold text-cyan-400">Task Alert:</span> Protocol X Audit Report is now available. Review needed.
                </p>
                <p className="text-sm sm:text-base">
                  <span className="font-semibold text-cyan-400">News Digest:</span> Hedera announces new DeFi partnerships, +15% network activity.
                </p>
              </div>
            </div>
            <button className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-full flex items-center justify-center transition-all group">
              <div className="relative">
                <div className="absolute inset-0 blur-md bg-cyan-400 opacity-50 group-hover:opacity-75"></div>
                <Sparkles className="relative w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
              </div>
            </button>
          </div>
          <button className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors">
            <span>Play Brief</span>
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }}></div>
              ))}
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-6">
          <h3 className="text-slate-400 text-sm mb-2">Portfolio Change</h3>
          <div className="text-3xl sm:text-4xl font-bold text-green-400">+1.23%</div>
          <p className="text-xs text-slate-500 mt-1">(24H)</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-6">
          <h3 className="text-slate-400 text-sm mb-2">Portfolio Users</h3>
          <div className="text-3xl sm:text-4xl font-bold">5,502</div>
          <p className="text-xs text-slate-500 mt-1">Top Gas Users: 3</p>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-6">Task Manager</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button className="flex flex-col items-center justify-center p-6 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all border border-slate-700/50 group">
            <Mail className="w-8 h-8 mb-3 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium mb-1">Gmail - Inbox Zero</span>
            <span className="text-xs text-slate-400">3 unread messages</span>
          </button>
          <button className="flex flex-col items-center justify-center p-6 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all border border-slate-700/50 group">
            <Calendar className="w-8 h-8 mb-3 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium mb-1">Calendar Today's Agenda</span>
            <span className="text-xs text-slate-400">5 events scheduled</span>
          </button>
        </div>
      </div>

      <div className="mt-6 bg-slate-900/30 backdrop-blur rounded-2xl p-4 border border-slate-800/50">
        <input
          type="text"
          placeholder="Ask Torch..."
          className="w-full bg-transparent text-white placeholder-slate-500 outline-none text-sm sm:text-base"
        />
      </div>
    </div>
  );
}
