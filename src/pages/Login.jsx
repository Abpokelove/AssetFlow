import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Boxes, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

// POST /api/auth/login  → { token, user }
// POST /api/auth/signup → { token, user }
// POST /api/auth/forgot-password { email } → 204

const TABS = ['login', 'signup', 'forgot'];

export default function Login() {
  const [tab, setTab] = useState('login');
  const [showPw, setShowPw] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  /* ---- Login form ---- */
  const {
    register: regLogin,
    handleSubmit: handleLogin,
    formState: { errors: loginErrors },
  } = useForm();

  /* ---- Signup form ---- */
  const {
    register: regSignup,
    handleSubmit: handleSignup,
    formState: { errors: signupErrors },
    watch: watchSignup,
  } = useForm();

  /* ---- Forgot form ---- */
  const {
    register: regForgot,
    handleSubmit: handleForgot,
    formState: { errors: forgotErrors },
  } = useForm();

  const onLogin = async ({ email, password }) => {
    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error('Invalid email or password');
    }
  };

  const onSignup = async ({ name, email, password }) => {
    // TODO: await axios.post('/api/auth/signup', { name, email, password })
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Account created! Please log in.');
    setTab('login');
  };

  const onForgot = async ({ email }) => {
    // TODO: await axios.post('/api/auth/forgot-password', { email })
    await new Promise((r) => setTimeout(r, 600));
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* ---- Left branding panel (desktop) ---- */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-primary p-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
            <Boxes size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">AssetFlow</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-white leading-snug">
            Manage every asset.<br />
            <span className="text-accent">From one place.</span>
          </h2>
          <p className="text-white/60 mt-4 text-sm leading-relaxed">
            Enterprise-grade asset tracking, allocation, maintenance, and auditing — built for modern organisations.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { label: 'Track 460+ assets in real time' },
              { label: 'Manage allocations & transfers' },
              { label: 'Schedule and approve maintenance' },
              { label: 'Audit cycles with discrepancy reports' },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <span className="text-white/80 text-sm">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">© 2024 AssetFlow. Enterprise Asset Management.</p>
      </div>

      {/* ---- Right form panel ---- */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Boxes size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg text-primary">AssetFlow</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-border rounded-button mb-8">
            {[['login', 'Sign In'], ['signup', 'Sign Up'], ['forgot', 'Reset Password']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setTab(key); setForgotSent(false); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-[8px] transition-all duration-200 ${
                  tab === key
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ---- LOGIN ---- */}
            {tab === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-2xl font-bold text-text-primary mb-1">Welcome back</h1>
                <p className="text-sm text-text-secondary mb-6">Sign in to your AssetFlow account</p>

                <form onSubmit={handleLogin(onLogin)} className="space-y-4" noValidate>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@company.com"
                    icon={<Mail size={15} />}
                    error={loginErrors.email?.message}
                    {...regLogin('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                    })}
                  />

                  <div>
                    <Input
                      label="Password"
                      type={showPw ? 'text' : 'password'}
                      placeholder="••••••••"
                      icon={<Lock size={15} />}
                      iconRight={
                        <button type="button" onClick={() => setShowPw((v) => !v)} className="hover:text-primary transition-colors">
                          {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      }
                      error={loginErrors.password?.message}
                      {...regLogin('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                    />
                    <button
                      type="button"
                      onClick={() => setTab('forgot')}
                      className="mt-1.5 text-xs text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button type="submit" variant="primary" className="w-full mt-2" loading={isLoading} iconRight={<ArrowRight size={15} />}>
                    Sign In
                  </Button>
                </form>

                {/* Demo hint */}
                <div className="mt-6 p-3.5 bg-primary/5 rounded-button border border-primary/15">
                  <p className="text-xs text-primary font-medium mb-1">Demo credentials</p>
                  <p className="text-xs text-text-secondary">Email: <span className="font-mono">admin@assetflow.io</span></p>
                  <p className="text-xs text-text-secondary">Password: <span className="font-mono">any value</span></p>
                </div>
              </motion.div>
            )}

            {/* ---- SIGNUP ---- */}
            {tab === 'signup' && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-2xl font-bold text-text-primary mb-1">Create account</h1>
                <p className="text-sm text-text-secondary mb-6">Join your organisation on AssetFlow</p>

                <form onSubmit={handleSignup(onSignup)} className="space-y-4" noValidate>
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="Sarah Mitchell"
                    error={signupErrors.name?.message}
                    {...regSignup('name', { required: 'Full name is required', minLength: { value: 2, message: 'Name too short' } })}
                  />
                  <Input
                    label="Work Email"
                    type="email"
                    placeholder="you@company.com"
                    icon={<Mail size={15} />}
                    error={signupErrors.email?.message}
                    {...regSignup('email', {
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                    })}
                  />
                  <Input
                    label="Password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    icon={<Lock size={15} />}
                    iconRight={
                      <button type="button" onClick={() => setShowPw((v) => !v)} className="hover:text-primary transition-colors">
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                    error={signupErrors.password?.message}
                    hint="Must be at least 8 characters"
                    {...regSignup('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-enter password"
                    icon={<Lock size={15} />}
                    error={signupErrors.confirmPassword?.message}
                    {...regSignup('confirmPassword', {
                      required: 'Please confirm password',
                      validate: (v) => v === watchSignup('password') || 'Passwords do not match',
                    })}
                  />

                  <Button type="submit" variant="primary" className="w-full mt-2" iconRight={<ArrowRight size={15} />}>
                    Create Account
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ---- FORGOT PASSWORD ---- */}
            {tab === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                {forgotSent ? (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                      <Mail size={24} className="text-status-available" />
                    </div>
                    <h2 className="text-xl font-bold text-text-primary">Check your inbox</h2>
                    <p className="text-sm text-text-secondary mt-2">
                      We've sent password reset instructions to your email.
                    </p>
                    <button onClick={() => { setForgotSent(false); setTab('login'); }} className="mt-6 text-sm text-primary hover:underline font-medium">
                      Back to sign in
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-text-primary mb-1">Reset password</h1>
                    <p className="text-sm text-text-secondary mb-6">
                      Enter your work email and we'll send reset instructions.
                    </p>
                    <form onSubmit={handleForgot(onForgot)} className="space-y-4" noValidate>
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="you@company.com"
                        icon={<Mail size={15} />}
                        error={forgotErrors.email?.message}
                        {...regForgot('email', {
                          required: 'Email is required',
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                        })}
                      />
                      <Button type="submit" variant="primary" className="w-full" iconRight={<ArrowRight size={15} />}>
                        Send Reset Link
                      </Button>
                    </form>
                    <button onClick={() => setTab('login')} className="mt-4 text-xs text-text-secondary hover:text-text-primary transition-colors">
                      ← Back to sign in
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
