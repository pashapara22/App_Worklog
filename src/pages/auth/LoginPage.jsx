import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, BookOpen, AlertCircle, ArrowRight, User, Shield } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('instructor'); // 'instructor' | 'admin'
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validate based on active tab
    const idToSubmit = employeeId.trim();
    if (activeTab === 'admin' && idToSubmit !== 'A0000') {
      setError('Invalid Admin ID. Only A0000 is allowed.');
      setIsSubmitting(false);
      return;
    }
    if (activeTab === 'instructor' && !/^I\d{4}$/.test(idToSubmit)) {
      setError('Instructor ID must match format I followed by 4 digits (e.g., I0001).');
      setIsSubmitting(false);
      return;
    }

    setTimeout(() => {
      const result = login(idToSubmit);
      if (result.success) {
        navigate(result.user.role === 'admin' ? '/admin' : '/instructor');
      } else {
        setError(result.error);
      }
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">WorkLog Platform</h1>
          <p className="text-white/80 text-lg max-w-md mx-auto leading-relaxed">
            Track your daily activities, manage your schedule, and stay on top of your worklog — all in one place.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">60s</div>
              <div className="text-white/70 text-xs mt-1">To fill daily log</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">10+</div>
              <div className="text-white/70 text-xs mt-1">Time slots</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">Auto</div>
              <div className="text-white/70 text-xs mt-1">Save enabled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-text-primary">WorkLog Platform</h1>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary">Welcome back</h2>
            <p className="text-text-secondary mt-2">Select your portal to continue</p>
          </div>

          {/* Portal Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button
              onClick={() => { setActiveTab('instructor'); setEmployeeId(''); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'instructor' 
                  ? 'bg-white text-primary-700 shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <User className="w-4 h-4" />
              Instructor
            </button>
            <button
              onClick={() => { setActiveTab('admin'); setEmployeeId(''); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'admin' 
                  ? 'bg-white text-primary-700 shadow-sm' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Shield className="w-4 h-4" />
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Employee ID Field */}
            <div>
              <label htmlFor="employeeId" className="block text-sm font-semibold text-text-primary mb-2">
                {activeTab === 'admin' ? 'Admin ID' : 'Employee ID'}
              </label>
              <input
                id="employeeId"
                type="text"
                value={employeeId}
                onChange={(e) => {
                  setEmployeeId(e.target.value.toUpperCase());
                  setError('');
                }}
                placeholder={activeTab === 'admin' ? 'A0000' : 'e.g., I0001'}
                autoFocus
                className={`
                  w-full px-4 py-3 rounded-xl border text-base font-mono tracking-wider
                  focus-ring placeholder:text-text-muted placeholder:font-sans placeholder:tracking-normal
                  ${error ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-white hover:border-primary-300'}
                `}
                maxLength={5}
              />
              <p className="mt-1.5 text-xs text-text-muted">
                {activeTab === 'admin' 
                  ? 'Format: A0000' 
                  : 'Format: I followed by 4 digits (e.g., I0001)'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 animate-slide-down">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !employeeId.trim()}
              className={`
                w-full flex items-center justify-center gap-2 py-3 rounded-xl text-base font-semibold transition-all
                ${isSubmitting || !employeeId.trim()
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'gradient-primary text-white shadow-lg shadow-primary-600/20 hover:shadow-xl hover:-translate-y-0.5'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In as {activeTab === 'admin' ? 'Admin' : 'Instructor'}
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link (Only for Instructors) */}
          {activeTab === 'instructor' && (
            <div className="mt-6 text-center animate-fade-in">
              <p className="text-sm text-text-secondary">
                New instructor?{' '}
                <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1">
                  Request access <ArrowRight className="w-3 h-3" />
                </Link>
              </p>
            </div>
          )}

          {/* Demo Hint */}
          <div className="mt-8 p-4 bg-primary-50 rounded-xl border border-primary-100">
            <p className="text-xs font-semibold text-primary-800 mb-1">💡 Demo Accounts</p>
            <p className="text-xs text-primary-600/80">
              {activeTab === 'admin' ? (
                <>Use <span className="font-mono font-bold">A0000</span> to access the Admin Dashboard.</>
              ) : (
                <>Use <span className="font-mono font-bold">I0001</span> (Dr. Sarah Johnson) or <span className="font-mono font-bold">I0002</span>.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
