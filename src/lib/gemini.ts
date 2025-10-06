const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface NewsItem {
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  content?: string;
}

export interface NewsSummary {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  relevanceScore: number;
  actionItems: string[];
}

export interface EmailSummary {
  summary: string;
  urgency: 'low' | 'medium' | 'high';
  actionItems: Array<{ action: string; priority: number }>;
  keyTopics: string[];
}

export async function analyzeNews(news: NewsItem[]): Promise<NewsSummary> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
    return {
      summary: 'Configure your Gemini API key to enable AI-powered news analysis.',
      keyPoints: ['News analysis requires Gemini API key'],
      sentiment: 'neutral',
      relevanceScore: 0,
      actionItems: [],
    };
  }

  const newsText = news
    .map(item => `Title: ${item.title}\nSource: ${item.source}\n${item.content || ''}`)
    .join('\n\n');

  const prompt = `Analyze the following news articles about blockchain, cryptocurrency, and Web3:

${newsText}

Provide a comprehensive analysis in JSON format with:
1. A brief summary (2-3 sentences)
2. Key points (array of 3-5 bullet points)
3. Overall sentiment (positive, neutral, or negative)
4. Relevance score (0-100)
5. Actionable insights (array of specific actions)

Return ONLY valid JSON with this structure:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "sentiment": "positive|neutral|negative",
  "relevanceScore": 85,
  "actionItems": ["...", "..."]
}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Failed to parse Gemini response');
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return {
      summary: 'Unable to analyze news at this time.',
      keyPoints: ['Error occurred during analysis'],
      sentiment: 'neutral',
      relevanceScore: 0,
      actionItems: [],
    };
  }
}

export async function summarizeEmail(
  subject: string,
  from: string,
  body: string
): Promise<EmailSummary> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
    return {
      summary: 'Configure your Gemini API key to enable AI-powered email summaries.',
      urgency: 'low',
      actionItems: [],
      keyTopics: [],
    };
  }

  const prompt = `Analyze this email and provide insights:

From: ${from}
Subject: ${subject}
Body: ${body}

Provide analysis in JSON format:
{
  "summary": "Brief 1-sentence summary",
  "urgency": "low|medium|high",
  "actionItems": [{"action": "specific action", "priority": 1-5}],
  "keyTopics": ["topic1", "topic2"]
}`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Failed to parse Gemini response');
  } catch (error) {
    console.error('Email summary error:', error);
    return {
      summary: subject,
      urgency: 'low',
      actionItems: [],
      keyTopics: [],
    };
  }
}

export async function generateDailyBrief(data: {
  emails: Array<{ subject: string; from: string; body_preview: string }>;
  events: Array<{ title: string; start_time: string }>;
  messages: Array<{ content: string; server_name: string }>;
}): Promise<string> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
    return 'Configure your Gemini API key to enable AI-powered daily briefs.';
  }

  const prompt = `Create a concise daily briefing based on this data:

EMAILS (${data.emails.length}):
${data.emails.slice(0, 5).map(e => `- From ${e.from}: ${e.subject}`).join('\n')}

CALENDAR (${data.events.length} events):
${data.events.slice(0, 5).map(e => `- ${e.title} at ${new Date(e.start_time).toLocaleString()}`).join('\n')}

DISCORD (${data.messages.length} messages):
${data.messages.slice(0, 5).map(m => `- ${m.server_name}: ${m.content.slice(0, 50)}`).join('\n')}

Create a friendly, conversational daily brief (2-3 paragraphs) highlighting:
1. Most important items requiring attention
2. Summary of today's schedule
3. Key updates or action items

Write in second person ("You have...") and keep it concise.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || 'No brief available.';
  } catch (error) {
    console.error('Daily brief error:', error);
    return 'Unable to generate daily brief at this time.';
  }
}
