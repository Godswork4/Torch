import { Search, TrendingUp, AlertTriangle, Clock, Sparkles } from 'lucide-react';
import { useState } from 'react';

export function WalletClarity() {
  const [searchAddress, setSearchAddress] = useState('');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Wallet Clarity</h1>
        <p className="text-slate-400">Track and analyze wallet activity with AI-powered insights</p>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Enter Hedera wallet address (0.0.xxxxx)"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none"
          />
          <button className="px-6 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-full transition-all text-sm font-medium">
            Analyze
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Your Tracked Wallets
          </h3>
          <div className="space-y-3">
            {[
              { address: '0.0.12345', alias: 'Main Wallet', balance: '1,250 HBAR', change: '+5.2%' },
              { address: '0.0.67890', alias: 'Trading Wallet', balance: '850 HBAR', change: '-2.1%' },
              { address: '0.0.11223', alias: 'Savings', balance: '5,000 HBAR', change: '+0.8%' },
            ].map((wallet) => (
              <div
                key={wallet.address}
                className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
              >
                <div>
                  <div className="font-medium mb-1">{wallet.alias}</div>
                  <div className="text-xs text-slate-400 font-mono">{wallet.address}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold mb-1">{wallet.balance}</div>
                  <div className={`text-xs ${wallet.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {wallet.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-3 border border-slate-700/50 rounded-xl hover:bg-slate-800/50 transition-all text-sm font-medium">
            + Add Wallet to Track
          </button>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            AI Insights
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium mb-1">Unusual Activity Detected</div>
                  <div className="text-sm text-slate-400">
                    Your main wallet received 500 HBAR from a new address. Transaction verified on Hedera network.
                  </div>
                  <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    2 hours ago
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium mb-1">Portfolio Growing</div>
                  <div className="text-sm text-slate-400">
                    Your total portfolio value increased by 12% this week across all tracked wallets.
                  </div>
                  <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    1 day ago
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-6 sm:p-8">
        <h3 className="text-xl font-semibold mb-6">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-400 border-b border-slate-800">
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">From/To</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { type: 'Received', address: '0.0.98765', amount: '+500 HBAR', time: '2h ago', status: 'Success' },
                { type: 'Sent', address: '0.0.54321', amount: '-150 HBAR', time: '5h ago', status: 'Success' },
                { type: 'Token Transfer', address: '0.0.11111', amount: '+1000 USDC', time: '1d ago', status: 'Success' },
                { type: 'Received', address: '0.0.22222', amount: '+75 HBAR', time: '2d ago', status: 'Success' },
              ].map((tx, i) => (
                <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4">{tx.type}</td>
                  <td className="py-4 font-mono text-xs">{tx.address}</td>
                  <td className={`py-4 font-semibold ${tx.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.amount}
                  </td>
                  <td className="py-4 text-slate-400">{tx.time}</td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
