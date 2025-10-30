import { useMemo } from 'react';
import { Stethoscope, MessageSquare, FileText, Lightbulb, Settings, LogOut, User } from 'lucide-react';

export default function Sidebar({ active, onChange, currentUser, onLogout }) {
  const items = useMemo(
    () => [
      { key: 'chat', label: 'Chat', icon: MessageSquare },
      { key: 'reports', label: 'My Reports', icon: FileText },
      { key: 'tips', label: 'Health Tips', icon: Lightbulb },
      { key: 'settings', label: 'Settings', icon: Settings },
    ],
    []
  );

  return (
    <aside className="w-full md:w-64 shrink-0 border-r border-gray-200/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-600 text-white grid place-items-center shadow">
          <Stethoscope size={20} />
        </div>
        <div>
          <p className="text-lg font-semibold text-gray-800">MediSense</p>
          <p className="text-xs text-gray-500">AI Health Assistant</p>
        </div>
      </div>

      <nav className="px-2 pb-4">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left mb-1 ${
              active === key
                ? 'bg-blue-50 text-blue-700'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            aria-current={active === key ? 'page' : undefined}
          >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </nav>

      {currentUser && (
        <div className="mx-4 mb-3 p-3 rounded-lg bg-white border flex items-center gap-2 text-sm text-gray-700">
          <User size={16} className="text-blue-600" />
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{currentUser.name || currentUser.email}</div>
            <div className="text-xs text-gray-500 truncate">{currentUser.email}</div>
          </div>
          {onLogout && (
            <button onClick={onLogout} title="Sign out" className="text-gray-500 hover:text-red-600">
              <LogOut size={16} />
            </button>
          )}
        </div>
      )}

      <div className="px-5 py-4 text-xs text-gray-500">
        <p>
          ⚠️ This chatbot is not a substitute for a doctor. For emergencies, please contact a
          healthcare professional immediately.
        </p>
      </div>
    </aside>
  );
}
