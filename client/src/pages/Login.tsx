import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const ok = login(password);
    if (!ok) {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 bg-indigo-600 rounded-xl mb-5 shadow-lg shadow-indigo-950/50">
            <span className="text-white text-sm font-bold tracking-tight">LC</span>
          </div>
          <h1 className="text-xl font-semibold text-white">LC Tracker</h1>
          <p className="text-zinc-500 text-sm mt-1">Interview Prep</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className={`w-full bg-zinc-800 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 transition-colors ${
                  error
                    ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                }`}
                placeholder="Enter password"
              />
              {error && (
                <p className="text-xs text-red-400 mt-1.5">Incorrect password.</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors mt-1"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
