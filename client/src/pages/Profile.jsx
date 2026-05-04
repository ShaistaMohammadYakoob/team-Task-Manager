import { Save, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { Avatar } from '../components/AvatarStack.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getJobRoleLabel } from '../utils/teamRoles.js';
import { getApiError, isEmail, isStrongPassword } from '../utils/validators.js';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [profile, setProfile] = useState({ name: '', email: '', avatar: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setProfile({
      name: user?.name || '',
      email: user?.email || '',
      avatar: user?.avatar || ''
    });
  }, [user]);

  const updateProfileField = (field, value) => setProfile((current) => ({ ...current, [field]: value }));
  const updatePasswordField = (field, value) => setPasswords((current) => ({ ...current, [field]: value }));

  const submitProfile = async (event) => {
    event.preventDefault();
    const next = {};
    if (!profile.name.trim()) next.name = 'Name is required';
    if (!isEmail(profile.email)) next.email = 'Enter a valid email';
    setProfileErrors(next);
    if (Object.keys(next).length) return;

    setSavingProfile(true);
    try {
      await updateProfile({
        name: profile.name.trim(),
        email: profile.email,
        avatar: profile.avatar.trim()
      });
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setSavingProfile(false);
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    const next = {};
    if (!passwords.currentPassword) next.currentPassword = 'Current password is required';
    if (!isStrongPassword(passwords.newPassword)) next.newPassword = 'Password must be 8 characters and include a number';
    if (passwords.newPassword !== passwords.confirmPassword) next.confirmPassword = 'Passwords do not match';
    setPasswordErrors(next);
    if (Object.keys(next).length) return;

    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Profile</h1>
        <p className="muted mt-2">Update your account details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1fr]">
        <section className="app-surface rounded-xl p-5">
          <div className="flex flex-col items-center text-center">
            <Avatar user={{ ...user, ...profile }} />
            <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1 text-sm font-semibold text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300">
              <ShieldCheck className="h-4 w-4" />
              {user?.role === 'admin' ? 'Admin - Full Access' : 'Member - Project Access'}
            </span>
            <span className="mt-3 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
              {getJobRoleLabel(user?.jobRole)}
            </span>
          </div>
        </section>

        <section className="app-surface rounded-xl p-5">
          <h2 className="mb-5 text-lg font-bold text-slate-950 dark:text-white">Account</h2>
          <form onSubmit={submitProfile} className="space-y-5">
            <Input label="Name" value={profile.name} onChange={(event) => updateProfileField('name', event.target.value)} error={profileErrors.name} />
            <Input label="Email" type="email" value={profile.email} onChange={(event) => updateProfileField('email', event.target.value)} error={profileErrors.email} />
            <Input label="Avatar URL" value={profile.avatar} onChange={(event) => updateProfileField('avatar', event.target.value)} placeholder="https://..." />
            <Button type="submit" icon={Save} disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </section>
      </div>

      <section className="app-surface rounded-xl p-5">
        <h2 className="mb-5 text-lg font-bold text-slate-950 dark:text-white">Password</h2>
        <form onSubmit={submitPassword} className="grid gap-5 lg:grid-cols-3">
          <Input
            label="Current password"
            type="password"
            value={passwords.currentPassword}
            onChange={(event) => updatePasswordField('currentPassword', event.target.value)}
            error={passwordErrors.currentPassword}
          />
          <Input
            label="New password"
            type="password"
            value={passwords.newPassword}
            onChange={(event) => updatePasswordField('newPassword', event.target.value)}
            error={passwordErrors.newPassword}
          />
          <Input
            label="Confirm password"
            type="password"
            value={passwords.confirmPassword}
            onChange={(event) => updatePasswordField('confirmPassword', event.target.value)}
            error={passwordErrors.confirmPassword}
          />
          <div className="lg:col-span-3">
            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? 'Saving...' : 'Change password'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Profile;
