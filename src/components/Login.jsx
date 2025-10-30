import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock } from 'lucide-react';

export default function Login({ onAuth }) {
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [mode]);

  const usersKey = 'medisense_users';

  const getUsers = () => {
    try {
      const raw = localStorage.getItem(usersKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const setUsers = (users) => {
    localStorage.setItem(usersKey, JSON.stringify(users));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const key = (email || '').trim().toLowerCase();
    if (!key || !password) {
      setError('Please enter email and password.');
      return;
    }

    const users = getUsers();

    if (mode === 'signup') {
      if (users[key]) {
        setError('An account with this email already exists.');
        return;
      }
      const profile = { id: key, email: key, name: name || key.split('@')[0], createdAt: new Date().toISOString() };
      users[key] = { profile, password };
      setUsers(users);
      localStorage.setItem('medisense_current_user', JSON.stringify(profile));
      onAuth(profile);
    } else {
      const record = users[key];
      if (!record || record.password !== password) {
        setError('Invalid email or password.');
        return;
      }
      localStorage.setItem('medisense_current_user', JSON.stringify(record.profile));
      onAuth(record.profile);
    }
  };

  return (
    <div className="w-full h-full grid place-items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur shadow-xl border border-white/40 p-6"
      >
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
          <p className="text-sm text-gray-500">Sign {mode === 'signup' ? 'up' : 'in'} to continue to MediSense.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jane Doe"
                />
                <User className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                required
              />
              <User className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
              <Lock className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
            </div>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button type="submit" className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5">
            {mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          {mode === 'signup' ? (
            <p>
              Already have an account?{' '}
              <button className="text-blue-600 hover:underline" onClick={() => setMode('signin')}>Sign in</button>
            </p>
          ) : (
            <p>
              New to MediSense?{' '}
              <button className="text-blue-600 hover:underline" onClick={() => setMode('signup')}>Create an account</button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
