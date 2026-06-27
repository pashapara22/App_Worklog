import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, BookOpen, AlertCircle, ArrowLeft, Check, X, Clock } from 'lucide-react';

const EMPLOYEE_ID_REGEX = /^I\d{4}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', employeeId: '', email: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [isSuccess, setIsSuccess] = useState(false); // Track success state

  const updateField = (field, value) => {
    const v = field === 'employeeId' ? value.toUpperCase() : value;
    setForm(prev => ({ ...prev, [field]: v }));
    setSubmitError('');
    // Live validation on touched fields
    if (touched[field]) {
      validateField(field, v);
    }
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    switch (field) {
      case 'fullName':
        if (!value.trim()) newErrors.fullName = 'Full name is required';
        else if (value.trim().length < 2) newErrors.fullName = 'Name must be at least 2 characters';
        else delete newErrors.fullName;
        break;
      case 'employeeId':
        if (!value.trim()) newErrors.employeeId = 'Employee ID is required';
        else if (!EMPLOYEE_ID_REGEX.test(value)) newErrors.employeeId = 'Must match format I followed by 4 digits (e.g., I0001)';
        else delete newErrors.employeeId;
        break;
      case 'email':
        if (!value.trim()) newErrors.email = 'Email is required';
        else if (!EMAIL_REGEX.test(value)) newErrors.email = 'Please enter a valid email address';
        else delete newErrors.email;
        break;
    }
    setErrors(newErrors);
    return newErrors;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, form[field]);
  };

  const isEmployeeIdValid = EMPLOYEE_ID_REGEX.test(form.employeeId);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError('');

    // Validate all fields
    const allTouched = { fullName: true, employeeId: true, email: true };
    setTouched(allTouched);
    let allErrors = {};
    Object.keys(form).forEach(field => {
      allErrors = { ...allErrors, ...validateField(field, form[field]) };
    });

    if (Object.keys(allErrors).length > 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const result = signUp(form.fullName.trim(), form.employeeId.trim(), form.email.trim());
      if (result.success) {
        setIsSuccess(true);
      } else {
        setSubmitError(result.error);
      }
      setIsSubmitting(false);
    }, 500);
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
          <h1 className="text-4xl font-bold text-white mb-4">Join WorkLog</h1>
          <p className="text-white/80 text-lg max-w-md mx-auto leading-relaxed">
            Create your account and start tracking your daily activities with ease and precision.
          </p>
          <div className="mt-10 space-y-3 text-left max-w-xs mx-auto">
            {['Fill your daily log in under 60 seconds', 'Auto-save keeps your work safe', 'Copy routines from previous days'].map((text, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                <Check className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="text-white/90 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form / Success State */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">
          
          {isSuccess ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Request Submitted!</h2>
              <p className="text-text-secondary leading-relaxed mb-8">
                Your account creation request for <span className="font-semibold text-text-primary">{form.employeeId}</span> has been sent to the System Administrator. You will be able to log in once your access is approved.
              </p>
              <Link 
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl text-base font-semibold bg-slate-100 text-text-primary hover:bg-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              {/* Back to Login */}
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary-600 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-text-primary">Request Instructor Access</h2>
                <p className="text-text-secondary mt-2">Register with your institute credentials</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-text-primary mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    placeholder="Dr. Jane Smith"
                    autoFocus
                    className={`
                      w-full px-4 py-3 rounded-xl border text-sm
                      focus-ring placeholder:text-text-muted
                      ${errors.fullName && touched.fullName ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-white hover:border-primary-300'}
                    `}
                  />
                  {errors.fullName && touched.fullName && (
                    <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 animate-slide-down">
                      <X className="w-3 h-3" />{errors.fullName}
                    </p>
                  )}
                </div>

                {/* Employee ID */}
                <div>
                  <label htmlFor="employeeId" className="block text-sm font-semibold text-text-primary mb-2">
                    Instructor ID
                  </label>
                  <div className="relative">
                    <input
                      id="employeeId"
                      type="text"
                      value={form.employeeId}
                      onChange={(e) => updateField('employeeId', e.target.value)}
                      onBlur={() => handleBlur('employeeId')}
                      placeholder="e.g. I0001"
                      maxLength={5}
                      className={`
                        w-full px-4 py-3 rounded-xl border text-sm font-mono tracking-wider
                        focus-ring placeholder:text-text-muted placeholder:font-sans placeholder:tracking-normal
                        ${errors.employeeId && touched.employeeId ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-white hover:border-primary-300'}
                      `}
                    />
                    {form.employeeId && (
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${isEmployeeIdValid ? 'text-emerald-500' : 'text-rose-400'}`}>
                        {isEmployeeIdValid ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </span>
                    )}
                  </div>
                  <p className={`mt-1.5 text-xs ${errors.employeeId && touched.employeeId ? 'text-rose-600' : 'text-text-muted'}`}>
                    {errors.employeeId && touched.employeeId ? (
                      <span className="flex items-center gap-1 animate-slide-down"><X className="w-3 h-3" />{errors.employeeId}</span>
                    ) : (
                      <>Pattern: I followed by 4 digits (regex: <code className="bg-slate-100 px-1 rounded">{'I\\d{4}'}</code>)</>
                    )}
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">
                    Email ID
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    placeholder="jane.smith@institute.edu"
                    className={`
                      w-full px-4 py-3 rounded-xl border text-sm
                      focus-ring placeholder:text-text-muted
                      ${errors.email && touched.email ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-white hover:border-primary-300'}
                    `}
                  />
                  {errors.email && touched.email && (
                    <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 animate-slide-down">
                      <X className="w-3 h-3" />{errors.email}
                    </p>
                  )}
                </div>

                {/* Submit Error */}
                {submitError && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 animate-slide-down">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-700">{submitError}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    w-full flex items-center justify-center gap-2 py-3 rounded-xl text-base font-semibold transition-all
                    ${isSubmitting
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'gradient-primary text-white shadow-lg shadow-primary-600/20 hover:shadow-xl hover:-translate-y-0.5'
                    }
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Request Access
                    </>
                  )}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-text-secondary">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
