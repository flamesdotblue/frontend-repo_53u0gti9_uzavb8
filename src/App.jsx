import { useEffect, useMemo, useState } from 'react';
import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';

import Sidebar from './components/Sidebar.jsx';
import ChatArea from './components/ChatArea.jsx';
import ReportsPanel from './components/ReportsPanel.jsx';
import HealthTips from './components/HealthTips.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import Login from './components/Login.jsx';

function useApiKey() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('medisense_api_key') || '');
  useEffect(() => {
    if (apiKey) localStorage.setItem('medisense_api_key', apiKey);
  }, [apiKey]);
  return [apiKey, setApiKey];
}

function useCurrentUser() {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('medisense_current_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const login = (profile) => setUser(profile);
  const logout = () => {
    localStorage.removeItem('medisense_current_user');
    setUser(null);
  };
  return { user, login, logout };
}

export default function App() {
  const [apiKey, setApiKey] = useApiKey();
  const { user, login, logout } = useCurrentUser();
  const [active, setActive] = useState('chat');
  const [reports, setReports] = useState(() => {
    try {
      const saved = localStorage.getItem('medisense_reports');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addReport = async (files) => {
    const items = await Promise.all(
      files.map(
        (f) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ name: f.name, preview: reader.result });
            reader.readAsDataURL(f);
          })
      )
    );
    setReports((prev) => {
      const next = [...items, ...prev];
      localStorage.setItem('medisense_reports', JSON.stringify(next));
      return next;
    });
  };

  const Panel = useMemo(() => {
    if (!user) return <Login onAuth={login} />;
    switch (active) {
      case 'chat':
        return <ChatArea apiKey={apiKey} onAddReport={addReport} currentUser={user} />;
      case 'reports':
        return <ReportsPanel />;
      case 'tips':
        return <HealthTips apiKey={apiKey} />;
      case 'settings':
        return <SettingsPanel apiKey={apiKey} setApiKey={setApiKey} />;
      default:
        return null;
    }
  }, [active, apiKey, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-gray-900">
      {/* Hero with Spline */}
      <div className="relative w-full h-[300px] md:h-[380px] overflow-hidden">
        <Spline scene="https://prod.spline.design/2fSS9b44gtYBt4RI/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center px-6 md:px-10">
          <div className="max-w-2xl text-white">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-5xl font-bold tracking-tight"
            >
              Your caring AI health companion
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-3 text-sm md:text-base text-slate-200"
            >
              Ask about symptoms, nutrition, fitness, and first-aid. Upload reports for helpful insights — always with a gentle, factual tone.
            </motion.p>
          </div>
        </div>
      </div>

      {/* App Shell */}
      <div className="relative -mt-10 md:-mt-16 z-10">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 px-4 md:px-8">
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <Sidebar active={active} onChange={setActive} currentUser={user} onLogout={logout} />
          </div>

          <div className="rounded-2xl overflow-hidden shadow-lg bg-gray-50 min-h-[60vh]">
            {Panel}
          </div>
        </div>
      </div>
    </div>
  );
}
