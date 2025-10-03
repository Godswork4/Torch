import { Mail, Calendar, MessageSquare, Twitter, Link, Bell, Volume2, Shield, CheckCircle2 } from 'lucide-react';

export function Settings() {
  const integrations = [
    {
      icon: Mail,
      name: 'Gmail',
      description: 'Sync your inbox and get AI summaries',
      connected: true,
      lastSync: '2 minutes ago',
    },
    {
      icon: Calendar,
      name: 'Google Calendar',
      description: 'Import events and task deadlines',
      connected: true,
      lastSync: '1 hour ago',
    },
    {
      icon: MessageSquare,
      name: 'Discord',
      description: 'Track mentions and important messages',
      connected: false,
      lastSync: null,
    },
    {
      icon: Twitter,
      name: 'Twitter / X',
      description: 'Monitor mentions and community updates',
      connected: false,
      lastSync: null,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Settings</h1>
        <p className="text-slate-400">Manage your integrations and preferences</p>
      </div>

      <div className="space-y-6">
        <section className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Link className="w-5 h-5 text-cyan-400" />
            Integrations
          </h2>

          <div className="space-y-4">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <div
                  key={integration.name}
                  className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{integration.name}</span>
                        {integration.connected && (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      <div className="text-sm text-slate-400">{integration.description}</div>
                      {integration.connected && integration.lastSync && (
                        <div className="text-xs text-slate-500 mt-1">
                          Last synced: {integration.lastSync}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      integration.connected
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50'
                        : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/50'
                    }`}
                  >
                    {integration.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            Notification Preferences
          </h2>

          <div className="space-y-4">
            {[
              { label: 'Task Reminders', description: 'Get notified about upcoming tasks and deadlines', enabled: true },
              { label: 'Wallet Alerts', description: 'Receive alerts for unusual wallet activity', enabled: true },
              { label: 'News Summaries', description: 'Daily digest of important ecosystem news', enabled: true },
              { label: 'AI Suggestions', description: 'Recommendations for task prioritization', enabled: false },
            ].map((pref) => (
              <div
                key={pref.label}
                className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl"
              >
                <div>
                  <div className="font-medium mb-1">{pref.label}</div>
                  <div className="text-sm text-slate-400">{pref.description}</div>
                </div>
                <button
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    pref.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      pref.enabled ? 'right-1' : 'left-1'
                    }`}
                  ></div>
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-cyan-400" />
            AI & Audio Settings
          </h2>

          <div className="space-y-4">
            {[
              { label: 'Audio Briefs', description: 'Enable daily audio summaries', enabled: true },
              { label: 'Auto-play Briefs', description: 'Automatically play morning briefing', enabled: false },
              { label: 'Voice Selection', description: 'Choose your preferred AI voice', value: 'Natural Female' },
            ].map((setting) => (
              <div
                key={setting.label}
                className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl"
              >
                <div>
                  <div className="font-medium mb-1">{setting.label}</div>
                  <div className="text-sm text-slate-400">{setting.description}</div>
                </div>
                {setting.value ? (
                  <button className="px-4 py-2 bg-slate-700/50 rounded-lg text-sm hover:bg-slate-700 transition-all">
                    {setting.value}
                  </button>
                ) : (
                  <button
                    className={`w-12 h-6 rounded-full transition-all relative ${
                      setting.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        setting.enabled ? 'right-1' : 'left-1'
                      }`}
                    ></div>
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Security & Privacy
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-slate-800/30 rounded-xl">
              <div className="font-medium mb-1">Connected Wallet</div>
              <div className="text-sm text-slate-400 mb-3">0.0.12345</div>
              <button className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-sm transition-all">
                Disconnect Wallet
              </button>
            </div>

            <div className="p-4 bg-slate-800/30 rounded-xl">
              <div className="font-medium mb-1">Data Storage</div>
              <div className="text-sm text-slate-400 mb-3">
                All your task and wallet data is encrypted and stored securely
              </div>
              <button className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm transition-all">
                View Privacy Policy
              </button>
            </div>

            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="font-medium mb-1 text-red-400">Danger Zone</div>
              <div className="text-sm text-slate-400 mb-3">
                Permanently delete your account and all associated data
              </div>
              <button className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-sm transition-all">
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
