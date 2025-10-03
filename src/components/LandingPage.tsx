import { Flame, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onConnect: () => void;
}

export function LandingPage({ onConnect }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <nav className="fixed top-0 w-full z-50 bg-slate-950/50 backdrop-blur-lg border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
              <span className="text-xl sm:text-2xl font-bold tracking-wide">TORCH</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-6">
              <button className="text-sm sm:text-base text-slate-300 hover:text-white transition-colors">
                Login
              </button>
              <button
                onClick={onConnect}
                className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-white/10 hover:bg-white/20 border border-white/30 rounded-full transition-all duration-300 font-medium"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative pt-24 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <div className="relative inline-block mb-8 sm:mb-12">
              <div className="absolute inset-0 blur-3xl bg-cyan-500/30 animate-pulse"></div>
              <Flame className="relative w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 text-white mx-auto drop-shadow-2xl" />
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6 leading-tight">
              Clarity in the Hashgraph.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Guided by AI.
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Torch synthesizes your on-chain data and HCS messages
              into actionable daily audio briefs.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
              <button
                onClick={onConnect}
                className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-lg bg-white/10 hover:bg-white/20 border-2 border-white/40 rounded-full transition-all duration-300 font-semibold flex items-center justify-center gap-2 group"
              >
                Connect Wallet
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-lg text-white hover:text-cyan-400 transition-colors font-medium underline underline-offset-4">
                See Play Demo Video
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto mt-16 sm:mt-24">
            <div className="text-center p-6 sm:p-8 bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-800/50">
              <img src="https://cryptologos.cc/logos/hashpack-pack-logo.png" alt="HashPack" className="h-8 sm:h-10 mx-auto mb-3 opacity-80" />
              <span className="text-sm sm:text-base text-slate-400 font-medium">HashPack</span>
            </div>
            <div className="text-center p-6 sm:p-8 bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-800/50">
              <div className="h-8 sm:h-10 mx-auto mb-3 flex items-center justify-center">
                <span className="text-lg sm:text-xl font-bold text-cyan-400">✓</span>
              </div>
              <span className="text-sm sm:text-base text-slate-400 font-medium">CertiK</span>
            </div>
            <div className="text-center p-6 sm:p-8 bg-slate-900/50 backdrop-blur rounded-2xl border border-slate-800/50">
              <img src="https://cryptologos.cc/logos/hedera-hbar-logo.png" alt="Hedera" className="h-8 sm:h-10 mx-auto mb-3 opacity-80" />
              <span className="text-sm sm:text-base text-slate-400 font-medium">Hedera</span>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent pointer-events-none"></div>
      </main>
    </div>
  );
}
