import { useState } from 'react';
import { Sparkles, Wallet, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { detectWallets, verifyHederaAccount } from '../lib/walletConnect';

export function Login() {
  const { signInWithGoogle, signInWithWallet } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const [fullName, setFullName] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleWalletConnect = async (walletName: string) => {
    if (!fullName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedWallet(walletName);

    try {
      const wallets = detectWallets();
      const wallet = wallets.find(w => w.name === walletName);

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const accountId = await wallet.connect();

      const isValid = await verifyHederaAccount(accountId);
      if (!isValid) {
        throw new Error('Invalid Hedera account. Please check your account ID.');
      }

      await signInWithWallet(accountId, fullName.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      setLoading(false);
      setSelectedWallet(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.1),transparent_50%)]"></div>

      <div className="relative max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-4">
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Welcome to Torch AI
          </h1>
          <p className="text-slate-400">Your AI-powered personal assistant for Web3</p>

          <div className="mt-4 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-sm text-yellow-400">
              <AlertCircle className="w-4 h-4" />
              <span>Beta Testing Mode - Features in Development</span>
            </div>
          </div>
        </div>

        {!showWalletConnect ? (
          <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-8 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-slate-900 rounded-xl font-medium hover:bg-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900/50 text-slate-400">or</span>
              </div>
            </div>

            <button
              onClick={() => setShowWalletConnect(true)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Wallet className="w-5 h-5" />
              Connect Hedera Wallet
            </button>

            <p className="text-xs text-slate-500 text-center mt-4">
              By continuing, you agree to Torch AI's Terms of Service and Privacy Policy
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-8">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                disabled={loading}
              />
            </div>

            <div className="space-y-3 mb-4">
              <p className="text-sm text-slate-400 mb-3">Choose connection method:</p>

              {detectWallets().map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleWalletConnect(wallet.name)}
                  disabled={loading}
                  className="w-full flex items-center justify-between px-6 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <span className="font-medium">{wallet.name}</span>
                  </div>
                  {loading && selectedWallet === wallet.name && (
                    <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setShowWalletConnect(false);
                setError(null);
              }}
              disabled={loading}
              className="w-full px-6 py-3 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Back to login options
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Torch AI is currently in beta testing. Some features may be limited or under development.
          </p>
        </div>
      </div>
    </div>
  );
}
