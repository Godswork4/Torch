const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface VoiceSummaryOptions {
  userName: string;
  newsArticles: Array<{ title: string; source: string; content: string }>;
  personalData?: {
    emailCount?: number;
    upcomingEvents?: number;
    discordMessages?: number;
  };
}

export async function generateDailySummaryScript(options: VoiceSummaryOptions): Promise<string> {
  const { userName, newsArticles, personalData } = options;

  const greeting = getTimeBasedGreeting();
  const newsText = newsArticles
    .slice(0, 5)
    .map((article, i) => `${i + 1}. ${article.title} from ${article.source}. ${article.content.slice(0, 100)}`)
    .join('\n\n');

  const prompt = `You are Torch, an AI assistant host delivering a daily briefing. Create a natural, conversational script (2-3 minutes when spoken) with these sections:

1. Warm greeting: "${greeting}, ${userName}!"
2. Quick personal overview: ${personalData?.emailCount || 0} unread emails, ${personalData?.upcomingEvents || 0} calendar events today, ${personalData?.discordMessages || 0} Discord updates
3. Top Hedera blockchain news highlights (make it engaging and explain significance):

${newsText}

4. Closing with a motivational note about the day ahead

Write as if you're a friendly, knowledgeable AI host. Use natural transitions, occasional enthusiasm, and make complex topics accessible. Keep it conversational and under 400 words.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate summary');
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || getFallbackScript(userName);
  } catch (error) {
    console.error('Error generating summary:', error);
    return getFallbackScript(userName);
  }
}

export async function synthesizeSpeech(text: string): Promise<string | null> {
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();

    const preferredVoice = voices.find(voice =>
      voice.name.includes('Google') ||
      voice.name.includes('Natural') ||
      voice.name.includes('Premium')
    ) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    speechSynthesis.speak(utterance);

    return 'Playing via browser speech synthesis';
  } catch (error) {
    console.error('Speech synthesis error:', error);
    return null;
  }
}

export function stopSpeech() {
  speechSynthesis.cancel();
}

export function isPaused(): boolean {
  return speechSynthesis.paused;
}

export function pauseSpeech() {
  speechSynthesis.pause();
}

export function resumeSpeech() {
  speechSynthesis.resume();
}

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFallbackScript(userName: string): string {
  const greeting = getTimeBasedGreeting();

  return `${greeting}, ${userName}! Welcome to your Torch AI daily briefing.

Today in the Hedera ecosystem, we're seeing exciting developments. The network continues to process millions of transactions with industry-leading efficiency, while new DeFi protocols and NFT projects are launching across the ecosystem.

Major partnerships are strengthening Hedera's position in enterprise blockchain, with growing adoption from Fortune 500 companies. The community remains vibrant with active development and innovation happening daily.

HBAR markets are responding positively to these developments, with increased trading volume and growing interest from institutional investors. The Hedera Governing Council continues to expand, bringing more decentralization and expertise to network governance.

Remember, you're early to one of the most technically advanced blockchain networks. Stay informed, stay engaged, and let's make today count. Have a productive day ahead!`;
}

export const INTRO_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export async function playIntroSound(): Promise<void> {
  try {
    const audio = new Audio(INTRO_SOUND_URL);
    audio.volume = 0.3;
    await audio.play();

    return new Promise((resolve) => {
      audio.onended = () => resolve();
    });
  } catch (error) {
    console.error('Error playing intro sound:', error);
  }
}
