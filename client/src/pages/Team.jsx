import { BriefcaseBusiness, Crown, Search, ShieldCheck, Trash2, UserCheck, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { usersApi } from '../api/users.js';
import { Avatar } from '../components/AvatarStack.jsx';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { Select } from '../components/Input.jsx';
import { CardSkeleton } from '../components/Skeleton.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../utils/format.js';
import { accessRoleLabels, getJobRoleLabel, jobRoleOptions } from '../utils/teamRoles.js';
import { getApiError } from '../utils/validators.js';

const Team = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteUser, setDeleteUser] = useState(null);
  const [busy, setBusy] = useState(false);
  const [filters, setFilters] = useState({ search: '', accessRole: '', jobRole: '' });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await usersApi.list();
      setUsers(data.users);
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const stats = useMemo(() => {
    const roleCount = new Set(users.map((item) => item.jobRole).filter(Boolean)).size;

    return {
      total: users.length,
      admins: users.filter((item) => item.role === 'admin').length,
      members: users.filter((item) => item.role === 'member').length,
      roleCount
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return users.filter((item) => {
      const jobRoleLabel = getJobRoleLabel(item.jobRole).toLowerCase();
      const matchesSearch =
        !search ||
        item.name?.toLowerCase().includes(search) ||
        item.email?.toLowerCase().includes(search) ||
        jobRoleLabel.includes(search);
      const matchesAccess = !filters.accessRole || item.role === filters.accessRole;
      const matchesJobRole = !filters.jobRole || item.jobRole === filters.jobRole;

      return matchesSearch && matchesAccess && matchesJobRole;
    });
  }, [users, filters]);

  const updateUserField = async (targetUser, field, value) => {
    setUsers((current) => current.map((item) => (item._id === targetUser._id ? { ...item, [field]: value } : item)));

    try {
      const data = await usersApi.update(targetUser._id, { [field]: value });
      setUsers((current) => current.map((item) => (item._id === targetUser._id ? data.user : item)));
      toast.success(field === 'role' ? 'Access role updated' : 'Team role updated');
    } catch (error) {
      setUsers((current) => current.map((item) => (item._id === targetUser._id ? targetUser : item)));
      toast.error(getApiError(error));
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await usersApi.remove(deleteUser._id);
      setUsers((current) => current.filter((item) => item._id !== deleteUser._id));
      toast.success('User deleted');
      setDeleteUser(null);
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-200">
            <ShieldCheck className="h-4 w-4" />
            Admin Panel
          </div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="muted mt-2">Manage access permissions and professional team roles.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          Signed in as <span className="text-cyan-700 dark:text-cyan-300">Admin</span>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Users" value={stats.total} icon={UsersRound} tone="cyan" />
          <StatCard title="Admins" value={stats.admins} icon={Crown} tone="amber" />
          <StatCard title="Members" value={stats.members} icon={UserCheck} tone="teal" />
          <StatCard title="Team Roles" value={stats.roleCount} icon={BriefcaseBusiness} tone="rose" />
        </div>
      )}

      <section className="app-surface rounded-xl p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_240px]">
          <label className="relative block">
            <span className="label">Search users</span>
            <Search className="pointer-events-none absolute bottom-2.5 left-3 h-4 w-4 text-slate-400" />
            <input
              className="field pl-9"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Name, email, role"
            />
          </label>
          <Select
            label="Access"
            value={filters.accessRole}
            onChange={(event) => setFilters((current) => ({ ...current, accessRole: event.target.value }))}
          >
            <option value="">All access</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </Select>
          <Select
            label="Team role"
            value={filters.jobRole}
            onChange={(event) => setFilters((current) => ({ ...current, jobRole: event.target.value }))}
          >
            <option value="">All team roles</option>
            {jobRoleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </Select>
        </div>
      </section>

      {loading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : users.length ? (
        <section className="app-surface overflow-hidden rounded-xl">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">User Access Matrix</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Access role controls permissions. Team role describes the person&apos;s work responsibility.
            </p>
          </div>
          {filteredUsers.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left">
                <thead className="bg-slate-100 text-xs uppercase text-slate-500 dark:bg-white/5 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-bold">User</th>
                    <th className="px-5 py-4 font-bold">Access Role</th>
                    <th className="px-5 py-4 font-bold">Team Role</th>
                    <th className="px-5 py-4 font-bold">Status</th>
                    <th className="px-5 py-4 font-bold">Joined</th>
                    <th className="px-5 py-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                  {filteredUsers.map((item) => (
                    <tr key={item._id} className="transition hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar user={item} />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-slate-950 dark:text-white">{item.name}</span>
                              {item.role === 'admin' ? (
                                <Badge className="bg-cyan-100 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300">Admin</Badge>
                              ) : null}
                            </div>
                            <p className="truncate text-sm text-slate-500 dark:text-slate-400">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Select
                          value={item.role}
                          onChange={(event) => updateUserField(item, 'role', event.target.value)}
                          disabled={item._id === user?._id}
                          className="max-w-52"
                        >
                          <option value="admin">Admin - Full Access</option>
                          <option value="member">Member - Project Access</option>
                        </Select>
                        {item._id === user?._id ? (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Your own admin access is locked.</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4">
                        <Select
                          value={item.jobRole || ''}
                          onChange={(event) => updateUserField(item, 'jobRole', event.target.value)}
                          className="max-w-56"
                        >
                          <option value="" disabled>
                            Assign team role
                          </option>
                          {jobRoleOptions.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-2">
                          <Badge
                            className={
                              item.role === 'admin'
                                ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                            }
                          >
                            {accessRoleLabels[item.role]}
                          </Badge>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{getJobRoleLabel(item.jobRole)}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">{formatDate(item.createdAt)}</td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteUser(item)}
                          disabled={item._id === user?._id}
                          aria-label="Delete user"
                        >
                          <Trash2 className="h-4 w-4 text-rose-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5">
              <EmptyState title="No matching users" message="Try a different search or filter." />
            </div>
          )}
        </section>
      ) : (
        <EmptyState title="No users found" message="Users will appear here after signup." />
      )}

      <ConfirmDialog
        open={Boolean(deleteUser)}
        title="Delete user"
        message="This user will be removed from project members and unassigned from tasks."
        confirmLabel="Delete user"
        loading={busy}
        onClose={() => setDeleteUser(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Team;
