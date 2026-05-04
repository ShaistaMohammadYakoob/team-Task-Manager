import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getApiError, isEmail } from '../utils/validators.js';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const validate = () => {
    const next = {};
    if (!isEmail(form.email)) next.email = 'Enter a valid email';
    if (!form.password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-200">
              <CheckCircle2 className="h-4 w-4" />
              Organized work for modern teams
            </div>
            <h1 className="text-5xl font-extrabold leading-tight text-slate-950 dark:text-white">Team Task Manager</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Plan projects, assign tasks, and move work across a polished Kanban workspace.
            </p>
          </div>
        </section>
        <section className="glass-panel mx-auto w-full max-w-md rounded-2xl p-6 sm:p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-950 dark:text-white">Sign in</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Continue to your workspace.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} error={errors.email} />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              error={errors.password}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            New here?{' '}
            <Link to="/signup" className="font-semibold text-cyan-700 hover:text-cyan-600 dark:text-cyan-300">
              Create account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};

export default Login;
