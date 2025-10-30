import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Send, Loader2 } from 'lucide-react';

const SYSTEM_PROMPT = `You are MediSense, an AI Healthcare Assistant. Your role is to help users with medical, fitness, and wellness-related queries only. If the query is outside this scope, respond: "I'm sorry, I can only assist with health-related questions." Capabilities: - You can analyze text-based symptom descriptions. - You can interpret uploaded medical images or reports to give possible insights. - You can suggest preventive care, healthy diets, exercises, and stress management tips. - Always encourage users to seek professional medical advice for final diagnosis. Tone: Polite, caring, and factual. Avoid any misleading or unsafe medical advice.`;

const allowedTopics = [
  'health','wellness','diet','nutrition','fitness','exercise','first aid','first-aid','medical','medicine','mental health','stress','sleep','hydration','injury','symptom','doctor','physician','rash','report','lab','blood test','cholesterol','diabetes','bp','blood pressure','pain','fever','cough','cold','flu'
];

function isAllowedTopic(text) {
  const t = (text || '').toLowerCase();
  return allowedTopics.some((k) => t.includes(k));
}

function base64FromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function callGemini(apiKey, { text, images }) {
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  const parts = [];
  parts.push({ text: SYSTEM_PROMPT });
  if (text) parts.push({ text });

  if (images && images.length > 0) {
    for (const img of images) {
      const b64 = await base64FromFile(img);
      const mimeType = img.type || 'image/png';
      parts.push({ inlineData: { data: b64, mimeType } });
    }
  }

  const body = { contents: [{ role: 'user', parts }] };

  const res = await fetch(`${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const output = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('\n') || 'I could not generate a response.';
  return output;
}

function ChatBubble({ role, text, time }) {
  const isUser = role === 'user';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm ${
        isUser ? 'bg-blue-600 text-white self-end rounded-br-md' : 'bg-white text-gray-800 self-start rounded-bl-md'
      }`}
    >
      <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{text}</p>
      <div className={`mt-2 text-[10px] ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>{time}</div>
    </motion.div>
  );
}

export default function ChatArea({ apiKey, onAddReport }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('medisense_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const listRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('medisense_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const timestamp = () => new Date().toLocaleString();

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed && files.length === 0) return;

    // Check topic restriction
    if (!isAllowedTopic(trimmed) && files.length === 0) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: "I'm sorry, I can only assist with health-related questions.", time: timestamp() },
      ]);
      setInput('');
      return;
    }

    const userMsg = { role: 'user', text: trimmed || (files.length ? '[Image uploaded] 🖼️' : ''), time: timestamp() };
    setMessages((prev) => [...prev, userMsg]);

    // Add uploaded files to reports and clear local selection
    if (files.length > 0) {
      onAddReport(files);
    }

    setLoading(true);

    try {
      if (!apiKey) {
        await new Promise((r) => setTimeout(r, 400));
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text:
              '🔒 Please add your Gemini API key in Settings to enable smart health guidance. In the meantime, you can still organize your reports and read daily tips. ❤',
            time: timestamp(),
          },
        ]);
      } else {
        const reply = await callGemini(apiKey, { text: trimmed, images: files });
        const safeReply = reply + '\n\n🙏 This is general guidance. Please consult a healthcare professional for a diagnosis.';
        setMessages((prev) => [...prev, { role: 'assistant', text: safeReply, time: timestamp() }]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `⚠️ There was an issue contacting the AI service. ${e.message}`, time: timestamp() },
      ]);
    } finally {
      setLoading(false);
      setInput('');
      setFiles([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onFileChange = (e) => {
    const f = Array.from(e.target.files || []);
    setFiles(f);
  };

  return (
    <section className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3" ref={listRef}>
        <AnimatePresence initial={false}>
          {messages.map((m, idx) => (
            <ChatBubble key={idx} role={m.role} text={m.text} time={m.time} />
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="animate-spin" size={16} />
            <span>MediSense is thinking...</span>
          </div>
        )}
      </div>

      <div className="border-t bg-white p-3 md:p-4">
        <div className="flex items-end gap-2">
          <label className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-gray-50 text-gray-700 hover:bg-gray-100 cursor-pointer">
            <ImageIcon size={18} />
            <span className="hidden sm:block text-sm">Add image</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={onFileChange} />
          </label>
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your symptoms, diet goals, or first-aid question..."
              rows={2}
              className="w-full resize-none rounded-xl border bg-white/90 backdrop-blur p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              onClick={handleSend}
              className="absolute right-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2 disabled:opacity-50"
              disabled={loading || (!input.trim() && files.length === 0)}
              aria-label="Send"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        {files.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">{files.length} file(s) ready to send</div>
        )}
      </div>
    </section>
  );
}
