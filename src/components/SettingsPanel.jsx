import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';

export default function SettingsPanel({ apiKey, setApiKey }) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [theme, setTheme] = useState(() => localStorage.getItem('medisense_theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('medisense_theme', theme);
  }, [theme]);

  const save = () => {
    setApiKey(keyInput.trim());
    localStorage.setItem('medisense_api_key', keyInput.trim());
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <Settings /> Settings
      </h2>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Gemini API Key</label>
        <input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="AIza..."
          className="w-full rounded-lg border p-3 bg-white"
        />
        <button onClick={save} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
        <p className="text-xs text-gray-500">Your key is stored locally in your browser and never sent anywhere except Google to generate responses.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Theme</label>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme('light')}
            className={`px-3 py-2 rounded-lg border ${theme === 'light' ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
          >
            Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`px-3 py-2 rounded-lg border ${theme === 'dark' ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
          >
            Dark
          </button>
        </div>
      </div>
    </div>
  );
}
