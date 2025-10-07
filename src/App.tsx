import { useState } from 'react';
import { Flame, Calendar, Sparkles, TrendingUp, Settings as SettingsIcon, Menu, X } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { WalletClarity } from './components/WalletClarity';
import { TaskManager } from './components/TaskManager';
import { Insights } from './components/Insights';
import { Settings } from './components/Settings';
import { DashboardContent } from './components/DashboardContent';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Flame },
    { id: 'wallet', label: 'Wallet Clarity', icon: Sparkles },
    { id: 'tasks', label: 'Task Manager', icon: Calendar },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
              <span className="text-xl sm:text-2xl font-bold tracking-wide">TORCH</span>
            </div>

            <button
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{profile?.full_name || 'User'}</span>
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-800/50">
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{profile?.full_name || 'User'}</span>
                </div>
                <button
                  onClick={signOut}
                  className="text-sm text-slate-300"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="flex pt-16">
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-900/50 backdrop-blur-lg border-r border-slate-800/50 pt-16 lg:pt-8 transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col items-center mb-8 px-4">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-cyan-500/30">
              <Flame className="w-10 h-10 text-cyan-400" />
            </div>
            <span className="text-sm text-white font-medium mb-1">{profile?.full_name || 'User'}</span>
            {profile?.wallet_address && (
              <span className="text-xs text-slate-400 font-mono">
                {profile.wallet_address}
              </span>
            )}
          </div>

          <nav className="flex-1 px-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all duration-200
                    ${activeTab === item.id
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-white'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800/50">
            <div className="text-xs text-slate-500">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Beta Testing Mode</span>
              </div>
              {profile?.wallet_address && (
                <div className="mt-2 p-2 bg-slate-800/50 rounded-lg">
                  <span className="font-mono text-xs break-all">{profile.wallet_address}</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'wallet' && <WalletClarity />}
          {activeTab === 'tasks' && <TaskManager />}
          {activeTab === 'insights' && <Insights />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
