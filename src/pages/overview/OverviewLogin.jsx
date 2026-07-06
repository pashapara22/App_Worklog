import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye as EyeIcon, EyeOff, ShieldCheck, AlertCircle, ArrowLeft, Lock } from 'lucide-react';

const OVERVIEW_PASSWORD = 'NW0004027P';

export default function OverviewLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    setTimeout(() => {
      if (password === OVERVIEW_PASSWORD) {
        sessionStorage.setItem('overview_access', 'granted');
        navigate('/overview');
      } else {
        setError('Invalid access password. Please try again.');
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Back to Login */}
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/25">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary">Overview Dashboard</h2>
          <p className="text-text-secondary mt-2 text-sm">Enter the access password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Password Field */}
          <div>
            <label htmlFor="overviewPassword" className="block text-sm font-semibold text-text-primary mb-2">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-text-muted" />
                Access Password
              </span>
            </label>
            <div className="relative">
              <input
                id="overviewPassword"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Enter access password"
                autoFocus
                className={`
                  w-full px-4 py-3 pr-12 rounded-xl border text-base font-mono tracking-wider
                  focus-ring placeholder:text-text-muted placeholder:font-sans placeholder:tracking-normal
                  ${error ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-white hover:border-primary-300'}
                `}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 animate-slide-down">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !password}
            className={`
              w-full flex items-center justify-center gap-2 py-3 rounded-xl text-base font-semibold transition-all
              ${isSubmitting || !password
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20 hover:shadow-xl hover:-translate-y-0.5'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Access Overview
              </>
            )}
          </button>
        </form>

        <div className="mt-8 p-4 bg-violet-50 rounded-xl border border-violet-100">
          <p className="text-xs font-semibold text-violet-800 mb-1">🔒 Restricted Access</p>
          <p className="text-xs text-violet-600/80">
            This dashboard is for system oversight only. Contact your system administrator if you need access credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
