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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">LC Tracker</h1>
          <p className="text-gray-500 text-sm mt-1">Interview Prep</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className={`w-full bg-white border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 transition-colors ${
                  error
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                }`}
                placeholder="Enter password"
              />
              {error && (
                <p className="text-xs text-red-500 mt-1">Incorrect password.</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
