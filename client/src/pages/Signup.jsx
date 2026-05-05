import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button.jsx';
import { Input, Select } from '../components/Input.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { jobRoleOptions } from '../utils/teamRoles.js';
import { getApiError, isEmail, isEmployeeId, isStrongPassword } from '../utils/validators.js';

const Signup = () => {
  const { signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    employeeId: '',
    jobRole: 'frontend-developer',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!isEmail(form.email)) next.email = 'Enter a valid email';
    if (!isEmployeeId(form.employeeId)) next.employeeId = 'Use 2-40 letters, numbers, hyphen, or underscore';
    if (!isStrongPassword(form.password)) next.password = 'Password must be 8 characters and include a number';
    if (form.password !== form.confirmPassword) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await signup({
        name: form.name.trim(),
        email: form.email,
        employeeId: form.employeeId.trim(),
        jobRole: form.jobRole,
        password: form.password
      });
      navigate(data.requiresApproval ? '/login' : '/dashboard', { replace: true });
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_1fr]">
        <section className="hidden lg:block">
          <div className="max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700 dark:border-teal-300/20 dark:bg-teal-300/10 dark:text-teal-200">
              <CheckCircle2 className="h-4 w-4" />
              First account becomes admin
            </div>
            <h1 className="text-5xl font-extrabold leading-tight text-slate-950 dark:text-white">Create your workspace</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Invite teammates, organize projects, and keep every due date visible.
            </p>
          </div>
        </section>
        <section className="glass-panel mx-auto w-full max-w-md rounded-2xl p-6 sm:p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-950 dark:text-white">Sign up</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Start managing team tasks.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Name" value={form.name} onChange={(event) => update('name', event.target.value)} error={errors.name} />
            <Input label="Email" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} error={errors.email} />
            <Input
              label="Employee ID"
              value={form.employeeId}
              onChange={(event) => update('employeeId', event.target.value)}
              error={errors.employeeId}
              placeholder="EMP-1024"
            />
            <Select label="Team role" value={form.jobRole} onChange={(event) => update('jobRole', event.target.value)}>
              {jobRoleOptions.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </Select>
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              error={errors.password}
            />
            <Input
              label="Confirm password"
              type="password"
              value={form.confirmPassword}
              onChange={(event) => update('confirmPassword', event.target.value)}
              error={errors.confirmPassword}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </Button>
          </form>
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-200">
            New employee accounts stay pending until an admin confirms they belong to your team/company.
          </p>
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-cyan-700 hover:text-cyan-600 dark:text-cyan-300">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
};

export default Signup;
