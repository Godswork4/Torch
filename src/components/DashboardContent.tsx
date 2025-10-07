import { Mail, Calendar, Sparkles, Play, Pause, Loader2, Volume2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { fetchHederaNews, getTimeBasedGreeting } from '../lib/newsService';
import { generateDailySummaryScript, synthesizeSpeech, stopSpeech, pauseSpeech, resumeSpeech, playIntroSound } from '../lib/voiceService';

export function DashboardContent() {
  const { profile } = useAuth();
  const [emailCount, setEmailCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [discordCount, setDiscordCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [briefScript, setBriefScript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [generatingBrief, setGeneratingBrief] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [emailsData, eventsData, discordData] = await Promise.all([
        supabase.from('gmail_messages').select('id', { count: 'exact', head: true }),
        supabase.from('calendar_events').select('id', { count: 'exact', head: true }),
        supabase.from('discord_messages').select('id', { count: 'exact', head: true }),
      ]);

      setEmailCount(emailsData.count || 0);
      setEventsCount(eventsData.count || 0);
      setDiscordCount(discordData.count || 0);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayBrief = async () => {
    if (isPlaying && !isPaused) {
      pauseSpeech();
      setIsPaused(true);
      return;
    }

    if (isPaused) {
      resumeSpeech();
      setIsPaused(false);
      return;
    }

    setGeneratingBrief(true);

    try {
      await playIntroSound();

      const news = await fetchHederaNews();

      const script = await generateDailySummaryScript({
        userName: profile?.full_name || 'there',
        newsArticles: news.slice(0, 5),
        personalData: {
          emailCount,
          upcomingEvents: eventsCount,
          discordMessages: discordCount,
        },
      });

      setBriefScript(script);

      await synthesizeSpeech(script);
      setIsPlaying(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Error playing brief:', error);
    } finally {
      setGeneratingBrief(false);
    }
  };

  const handleStopBrief = () => {
    stopSpeech();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const greeting = getTimeBasedGreeting();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          {greeting}, <span className="text-cyan-400">{profile?.full_name || 'User'}</span>
        </h1>
        <p className="text-slate-400">Here's your clarity brief for today</p>
      </div>

      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-lg border border-cyan-500/30 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
                <Volume2 className="w-6 h-6 text-cyan-400" />
                The Daily Torch Brief
              </h2>
              {briefScript ? (
                <div className="space-y-3 text-slate-300 text-sm sm:text-base">
                  <p>{briefScript.slice(0, 300)}...</p>
                  {isPlaying && (
                    <div className="flex items-center gap-2 text-cyan-400 text-sm">
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }}></div>
                        ))}
                      </div>
                      <span>{isPaused ? 'Paused' : 'Playing...'}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 text-slate-300">
                  <p className="text-sm sm:text-base">
                    <span className="font-semibold text-cyan-400">Your Personal AI Brief:</span> Get real-time updates from Gmail, Calendar, Discord, and Hedera blockchain news.
                  </p>
                  <p className="text-sm sm:text-base">
                    <span className="font-semibold text-cyan-400">Today's Digest:</span> {emailCount} emails, {eventsCount} calendar events, {discordCount} Discord messages.
                  </p>
                  <p className="text-sm sm:text-base">
                    <span className="font-semibold text-cyan-400">News:</span> Latest Hedera ecosystem updates powered by Gemini AI.
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handlePlayBrief}
              disabled={generatingBrief}
              className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-full flex items-center justify-center transition-all group disabled:opacity-50"
            >
              {generatingBrief ? (
                <Loader2 className="relative w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 animate-spin" />
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 blur-md bg-cyan-400 opacity-50 group-hover:opacity-75"></div>
                  {isPlaying && !isPaused ? (
                    <Pause className="relative w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
                  ) : (
                    <Play className="relative w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
                  )}
                </div>
              )}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayBrief}
              disabled={generatingBrief}
              className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <span>{isPlaying ? (isPaused ? 'Resume Brief' : 'Pause Brief') : 'Play Brief'}</span>
              {!isPlaying && (
                <div className="flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-1 h-4 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }}></div>
                  ))}
                </div>
              )}
            </button>
            {isPlaying && (
              <button
                onClick={handleStopBrief}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Stop
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-6">
          <h3 className="text-slate-400 text-sm mb-2">Email Messages</h3>
          <div className="text-3xl sm:text-4xl font-bold text-cyan-400">
            {loading ? '...' : emailCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">Total synced</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-6">
          <h3 className="text-slate-400 text-sm mb-2">Calendar Events</h3>
          <div className="text-3xl sm:text-4xl font-bold text-cyan-400">
            {loading ? '...' : eventsCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">Total events</p>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-6">
          <h3 className="text-slate-400 text-sm mb-2">Discord Messages</h3>
          <div className="text-3xl sm:text-4xl font-bold text-cyan-400">
            {loading ? '...' : discordCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">Total messages</p>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-lg border border-slate-800/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button className="flex flex-col items-center justify-center p-6 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all border border-slate-700/50 group">
            <Mail className="w-8 h-8 mb-3 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium mb-1">Gmail Messages</span>
            <span className="text-xs text-slate-400">{emailCount} total messages</span>
          </button>
          <button className="flex flex-col items-center justify-center p-6 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all border border-slate-700/50 group">
            <Calendar className="w-8 h-8 mb-3 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium mb-1">Calendar Events</span>
            <span className="text-xs text-slate-400">{eventsCount} events</span>
          </button>
        </div>
      </div>

      <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
        <p className="text-sm text-yellow-400 text-center">
          Beta Testing Mode - Connect your accounts in Settings to sync real-time data
        </p>
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
