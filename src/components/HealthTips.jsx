import { useEffect, useState } from 'react';
import { Lightbulb } from 'lucide-react';

const TIPS_PROMPT = `Share one concise, practical daily wellness tip (diet, fitness, sleep, stress, hydration, posture). Keep it under 40 words. Tone: friendly, encouraging, factual.`;

async function getTip(apiKey) {
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  const body = { contents: [{ role: 'user', parts: [{ text: TIPS_PROMPT }] }] };
  const res = await fetch(`${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to fetch tip');
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('\n') || '';
  return text;
}

export default function HealthTips({ apiKey }) {
  const [tip, setTip] = useState('');
  const [dateKey, setDateKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const key = new Date().toISOString().slice(0, 10);
    setDateKey(key);
    const saved = localStorage.getItem(`medisense_tip_${key}`);
    if (saved) {
      setTip(saved);
      return;
    }
    if (!apiKey) return; // wait until user adds key
    setLoading(true);
    getTip(apiKey)
      .then((t) => {
        setTip(t);
        localStorage.setItem(`medisense_tip_${key}`, t);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiKey]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Lightbulb className="text-amber-500" /> Daily Health Tip
      </h2>
      {!apiKey && !tip && (
        <p className="text-gray-500">Add your Gemini API key in Settings to receive a fresh wellness tip each day.</p>
      )}
      {loading && <p className="text-gray-500 animate-pulse">Fetching today\'s tip...</p>}
      {tip && (
        <div className="bg-white rounded-xl border p-4 text-gray-800">{tip}</div>
      )}
    </div>
  );
}
