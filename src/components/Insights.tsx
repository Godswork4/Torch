import { Newspaper, TrendingUp, Play, Volume2, Rss, ExternalLink } from 'lucide-react';

export function Insights() {
  const newsItems = [
    {
      title: 'Hedera announces major DeFi partnerships',
      summary: 'Three leading protocols integrate with Hedera network, bringing advanced DeFi capabilities...',
      source: 'Hedera Blog',
      time: '2 hours ago',
      category: 'Partnership',
    },
    {
      title: 'Network activity surges 25% amid token launch',
      summary: 'Transaction volume on Hedera reaches all-time high as new token launches gain traction...',
      source: 'CoinDesk',
      time: '5 hours ago',
      category: 'Network',
    },
    {
      title: 'HashPack wallet introduces new staking features',
      summary: 'Users can now stake HBAR directly through the HashPack interface with improved rewards...',
      source: 'HashPack',
      time: '1 day ago',
      category: 'Tools',
    },
    {
      title: 'Enterprise adoption grows with new council members',
      summary: 'Major corporations join Hedera Governing Council, signaling institutional confidence...',
      source: 'Hedera',
      time: '2 days ago',
      category: 'Enterprise',
    },
  ];

  const audioSummaries = [
    { title: "Today's Hedera Ecosystem Recap", duration: '5:23', date: 'Today' },
    { title: 'Weekly DeFi Trends Analysis', duration: '8:45', date: 'Yesterday' },
    { title: 'Top 5 Protocol Updates This Week', duration: '6:12', date: '2 days ago' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Insights Hub</h1>
        <p className="text-slate-400">AI-curated news and summaries from the Hedera ecosystem</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl p-6">
          <TrendingUp className="w-8 h-8 text-cyan-400 mb-3" />
          <div className="text-3xl font-bold mb-1">+25%</div>
          <div className="text-sm text-slate-300">Network Activity</div>
          <div className="text-xs text-slate-400 mt-1">vs. last week</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6">
          <Newspaper className="w-8 h-8 text-green-400 mb-3" />
          <div className="text-3xl font-bold mb-1">47</div>
          <div className="text-sm text-slate-300">News Articles</div>
          <div className="text-xs text-slate-400 mt-1">filtered this week</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6">
          <Volume2 className="w-8 h-8 text-purple-400 mb-3" />
          <div className="text-3xl font-bold mb-1">12</div>
          <div className="text-sm text-slate-300">Audio Briefs</div>
          <div className="text-xs text-slate-400 mt-1">ready to play</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-cyan-400" />
              Latest News
            </h2>
            <button className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
              <Rss className="w-4 h-4" />
              Manage Sources
            </button>
          </div>

          <div className="space-y-4">
            {newsItems.map((item, i) => (
              <div
                key={i}
                className="p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.category === 'Partnership' ? 'bg-blue-500/20 text-blue-400' :
                    item.category === 'Network' ? 'bg-green-500/20 text-green-400' :
                    item.category === 'Tools' ? 'bg-cyan-500/20 text-cyan-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {item.category}
                  </span>
                  <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-cyan-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 mb-3">
                  {item.summary}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-3 border border-slate-700/50 rounded-xl hover:bg-slate-800/50 transition-all text-sm font-medium">
            Load More News
          </button>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            Audio Briefs
          </h2>

          <div className="space-y-3">
            {audioSummaries.map((audio, i) => (
              <div
                key={i}
                className="p-4 bg-slate-800/30 hover:bg-slate-800/50 rounded-xl transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <button className="w-10 h-10 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-full flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110">
                    <Play className="w-4 h-4 text-cyan-400 ml-0.5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium mb-1 text-sm group-hover:text-cyan-400 transition-colors">
                      {audio.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{audio.duration}</span>
                      <span>•</span>
                      <span>{audio.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Volume2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold mb-1 text-sm">Torch Lens</div>
                <div className="text-xs text-slate-300 mb-3">
                  AI commentary on today's most important developments in the Hedera ecosystem.
                </div>
                <button className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-full text-xs font-medium transition-all flex items-center gap-2">
                  <Play className="w-3 h-3" />
                  Play Today's Lens
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">AI Analysis</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-slate-300 mb-4">
            Based on today's news and on-chain data, Torch AI has identified several key trends:
          </p>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong className="text-white">DeFi Growth:</strong> Hedera's DeFi ecosystem is experiencing rapid expansion with new protocol integrations and increased TVL.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong className="text-white">Enterprise Adoption:</strong> Major corporations continue joining the governing council, validating Hedera's enterprise appeal.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">•</span>
              <span><strong className="text-white">Developer Activity:</strong> GitHub activity and new dApp launches indicate growing developer interest.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
