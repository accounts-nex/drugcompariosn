import { useState } from 'react';
import { Mail } from 'lucide-react';

interface EmailInputProps {
  onEmailSubmit: (email: string) => void;
}

export default function EmailInput({ onEmailSubmit }: EmailInputProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    onEmailSubmit(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 px-8 py-6 border-b border-slate-200 text-center">
            <img src="/image.png" alt="Drug Comparison" className="h-14 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900">Data Report Portal</h1>
            <p className="text-slate-600 mt-2">Enter your email to access your reports</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2.5 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white ${
                  error ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400'
                }`}
                placeholder="john@example.com"
                autoFocus
              />
              {error && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <span className="font-medium">{error}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Continue
            </button>
          </form>

          <div className="px-8 pb-8 pt-4 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-600 text-center">
              Your email is used to access and manage your report configurations
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@drugcomparison.co.uk" className="text-blue-600 hover:text-blue-700 font-medium">
              support@drugcomparison.co.uk
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
