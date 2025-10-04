import { Mail, Calendar, MessageSquare, Link, Bell, Volume2, Shield, CheckCircle2, RefreshCw, Apple } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getIntegrations, deleteIntegration, type Integration } from '../lib/integrations';
import { getOAuthUrl, openOAuthWindow, triggerSync, type IntegrationService } from '../lib/oauth';

export function Settings() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<IntegrationService | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const userId = 'mock-user-id';
      const data = await getIntegrations(userId);
      setIntegrations(data);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (service: IntegrationService) => {
    try {
      setConnecting(service);
      const authUrl = await getOAuthUrl(service);
      openOAuthWindow(authUrl, () => {
        setConnecting(null);
        loadIntegrations();
      });
    } catch (error) {
      console.error('Failed to connect integration:', error);
      setConnecting(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      await deleteIntegration(integrationId);
      await loadIntegrations();
    } catch (error) {
      console.error('Failed to disconnect integration:', error);
    }
  };

  const handleSync = async (integration: Integration) => {
    try {
      setSyncing(integration.id);
      await triggerSync(integration.service as IntegrationService, integration.id);
      await loadIntegrations();
    } catch (error) {
      console.error('Failed to sync integration:', error);
    } finally {
      setSyncing(null);
    }
  };

  const getIntegrationIcon = (service: string) => {
    switch (service) {
      case 'gmail':
        return Mail;
      case 'google_calendar':
        return Calendar;
      case 'apple_calendar':
        return Apple;
      case 'discord':
        return MessageSquare;
      default:
        return Link;
    }
  };

  const getIntegrationName = (service: string) => {
    switch (service) {
      case 'gmail':
        return 'Gmail';
      case 'google_calendar':
        return 'Google Calendar';
      case 'apple_calendar':
        return 'Apple Calendar';
      case 'discord':
        return 'Discord';
      default:
        return service;
    }
  };

  const getIntegrationDescription = (service: string) => {
    switch (service) {
      case 'gmail':
        return 'Sync your inbox and get AI summaries';
      case 'google_calendar':
        return 'Import events and task deadlines';
      case 'apple_calendar':
        return 'Sync iCloud calendar events';
      case 'discord':
        return 'Track mentions and important messages';
      default:
        return 'Connect this service';
    }
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return null;
    const date = new Date(lastSync);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const availableServices: IntegrationService[] = ['gmail', 'google_calendar', 'discord'];
  const connectedServices = new Set(integrations.map(i => i.service));
  const availableIntegrations = availableServices.filter(s => !connectedServices.has(s));

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

          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading integrations...</div>
          ) : (
            <div className="space-y-4">
              {integrations.map((integration) => {
                const Icon = getIntegrationIcon(integration.service);
                return (
                  <div
                    key={integration.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-all gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{getIntegrationName(integration.service)}</span>
                          {integration.is_active && (
                            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-sm text-slate-400">{getIntegrationDescription(integration.service)}</div>
                        {integration.last_sync && (
                          <div className="text-xs text-slate-500 mt-1">
                            Last synced: {formatLastSync(integration.last_sync)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleSync(integration)}
                        disabled={syncing === integration.id}
                        className="px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <RefreshCw className={`w-4 h-4 ${syncing === integration.id ? 'animate-spin' : ''}`} />
                        Sync
                      </button>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                );
              })}

              {availableIntegrations.length > 0 && (
                <>
                  <div className="pt-4 border-t border-slate-700/50">
                    <h3 className="text-sm font-medium text-slate-400 mb-3">Available Integrations</h3>
                  </div>
                  {availableIntegrations.map((service) => {
                    const Icon = getIntegrationIcon(service);
                    return (
                      <div
                        key={service}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-all gap-4"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-6 h-6 text-slate-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold mb-1">{getIntegrationName(service)}</div>
                            <div className="text-sm text-slate-400">{getIntegrationDescription(service)}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleConnect(service)}
                          disabled={connecting === service}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 border border-cyan-500/50 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {connecting === service ? 'Connecting...' : 'Connect'}
                        </button>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
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
