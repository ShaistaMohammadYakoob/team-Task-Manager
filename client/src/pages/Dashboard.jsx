import { BarChart3, CalendarClock, CheckCircle2, ClipboardCheck, FolderKanban, Plus, TimerReset, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { projectApi } from '../api/projects.js';
import { taskApi } from '../api/tasks.js';
import { Button } from '../components/Button.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { CardSkeleton } from '../components/Skeleton.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { TaskModal } from '../components/TaskModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, isOverdue, priorityStyles, statusLabels } from '../utils/format.js';
import { getApiError } from '../utils/validators.js';

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsData, tasksData, myTasksData] = await Promise.all([
        projectApi.list(),
        taskApi.list(),
        taskApi.list({ assignee: 'me' })
      ]);
      setProjects(projectsData.projects);
      setTasks(tasksData.tasks);
      setMyTasks(myTasksData.tasks);
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = useMemo(
    () => ({
      projects: projects.length,
      myTasks: myTasks.filter((task) => task.status !== 'done').length,
      overdue: tasks.filter(isOverdue).length,
      completed: tasks.filter((task) => task.status === 'done').length
    }),
    [projects, tasks, myTasks]
  );

  const upcoming = useMemo(
    () =>
      [...myTasks]
        .filter((task) => task.status !== 'done')
        .sort((a, b) => new Date(a.dueDate || '2999-12-31') - new Date(b.dueDate || '2999-12-31'))
        .slice(0, 5),
    [myTasks]
  );

  const projectBreakdown = useMemo(
    () =>
      projects.map((project) => {
        const projectTasks = tasks.filter((task) => task.project?._id === project._id || task.project === project._id);
        const completed = projectTasks.filter((task) => task.status === 'done');
        const total = projectTasks.length;
        const latestCompletion = completed
          .slice()
          .sort((a, b) => new Date(b.completedAt || b.updatedAt) - new Date(a.completedAt || a.updatedAt))[0];

        return {
          project,
          total,
          completed: completed.length,
          pending: total - completed.length,
          progress: total ? Math.round((completed.length / total) * 100) : 0,
          latestCompletion
        };
      }),
    [projects, tasks]
  );

  const completionLog = useMemo(
    () =>
      tasks
        .filter((task) => task.status === 'done')
        .sort((a, b) => new Date(b.completedAt || b.updatedAt) - new Date(a.completedAt || a.updatedAt))
        .slice(0, 8),
    [tasks]
  );

  const teamPerformance = useMemo(() => {
    const map = new Map();

    for (const task of tasks) {
      const assignee = task.assignedTo;
      if (!assignee?._id) continue;
      const current = map.get(assignee._id) || { user: assignee, total: 0, completed: 0 };
      current.total += 1;
      if (task.status === 'done') current.completed += 1;
      map.set(assignee._id, current);
    }

    return [...map.values()]
      .map((item) => ({
        ...item,
        pending: item.total - item.completed,
        progress: item.total ? Math.round((item.completed / item.total) * 100) : 0
      }))
      .sort((a, b) => b.completed - a.completed || b.total - a.total)
      .slice(0, 6);
  }, [tasks]);

  const recentActivity = useMemo(
    () => [...tasks].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 6),
    [tasks]
  );

  const upsertTask = (task) => {
    setTasks((current) => [task, ...current.filter((item) => item._id !== task._id)]);
    if (task.assignedTo?._id === user?._id) {
      setMyTasks((current) => [task, ...current.filter((item) => item._id !== task._id)]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="muted mt-2">Track work across every project you can access.</p>
        </div>
        <Button icon={Plus} onClick={() => setTaskModalOpen(true)} disabled={!projects.length}>
          Quick task
        </Button>
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
          <StatCard title="Total Projects" value={summary.projects} icon={FolderKanban} tone="cyan" />
          <StatCard title="My Tasks" value={summary.myTasks} icon={CalendarClock} tone="teal" />
          <StatCard title="Overdue Tasks" value={summary.overdue} icon={TimerReset} tone="rose" />
          <StatCard title="Completed Tasks" value={summary.completed} icon={CheckCircle2} tone="amber" />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_0.82fr]">
        <section className="app-surface rounded-xl p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">My Tasks</h2>
            <Link to="/projects" className="text-sm font-semibold text-cyan-700 hover:text-cyan-600 dark:text-cyan-300">
              View projects
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : upcoming.length ? (
            <div className="space-y-3">
              {upcoming.map((task) => (
                <Link
                  key={task._id}
                  to={`/projects/${task.project?._id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-cyan-300 dark:border-white/10 dark:bg-slate-950/70"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-950 dark:text-white">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{task.project?.title}</p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}>{task.priority}</span>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{formatDate(task.dueDate)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No assigned tasks" message="Your upcoming assigned work will appear here." />
          )}
        </section>

        <section className="app-surface rounded-xl p-5">
          <h2 className="mb-5 text-lg font-bold text-slate-950 dark:text-white">Recent Activity</h2>
          {loading ? (
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : recentActivity.length ? (
            <div className="space-y-4">
              {recentActivity.map((task) => (
                <div key={task._id} className="flex gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{task.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {statusLabels[task.status]} in {task.project?.title || 'Project'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No activity yet" message="Create a project and add a task to start the feed." />
          )}
        </section>
      </div>

      <section className="app-surface rounded-xl p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Project Completion Details</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {user?.role === 'admin' ? 'Company-wide project progress and latest completion proof.' : 'Your accessible project progress and completion proof.'}
            </p>
          </div>
          <BarChart3 className="h-6 w-6 text-cyan-600 dark:text-cyan-300" />
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : projectBreakdown.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projectBreakdown.map((item) => (
              <Link
                key={item.project._id}
                to={`/projects/${item.project._id}`}
                className="rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-cyan-300 dark:border-white/10 dark:bg-slate-950/70"
              >
                <span className="mb-3 block h-2 w-16 rounded-full" style={{ backgroundColor: item.project.color }} />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-950 dark:text-white">{item.project.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {item.completed}/{item.total} done, {item.pending} pending
                    </p>
                  </div>
                  <span className="rounded-full bg-cyan-100 px-3 py-1 text-sm font-black text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300">
                    {item.progress}%
                  </span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-full rounded-full bg-cyan-500" style={{ width: `${item.progress}%` }} />
                </div>
                <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm dark:bg-white/5">
                  <p className="font-semibold text-slate-700 dark:text-slate-200">Latest completion</p>
                  <p className="mt-1 line-clamp-2 text-slate-500 dark:text-slate-400">
                    {item.latestCompletion
                      ? `${item.latestCompletion.title}: ${item.latestCompletion.completionNote || 'No note added'}`
                      : 'No completed task yet'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No project details yet" message="Create a project and tasks to see completion analytics." />
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.82fr]">
        <section className="app-surface rounded-xl p-5">
          <div className="mb-5 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-teal-500" />
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Completion Log</h2>
          </div>
          {loading ? (
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : completionLog.length ? (
            <div className="space-y-3">
              {completionLog.map((task) => (
                <Link
                  key={task._id}
                  to={`/projects/${task.project?._id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-teal-300 dark:border-white/10 dark:bg-slate-950/70"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-950 dark:text-white">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {task.project?.title} - Completed by {task.completedBy?.name || task.assignedTo?.name || 'team member'}
                      </p>
                    </div>
                    <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
                      Done
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                    {task.completionNote || 'No completion note added.'}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No completed work yet" message="When tasks are marked done, proof notes will appear here." />
          )}
        </section>

        <section className="app-surface rounded-xl p-5">
          <div className="mb-5 flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              {user?.role === 'admin' ? 'Team Performance' : 'My Work Snapshot'}
            </h2>
          </div>
          {loading ? (
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : user?.role === 'admin' && teamPerformance.length ? (
            <div className="space-y-3">
              {teamPerformance.map((item) => (
                <div key={item.user._id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/70">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-950 dark:text-white">{item.user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Employee ID: {item.user.employeeId || 'Not set'}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                      {item.progress}%
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    {item.completed} completed, {item.pending} pending out of {item.total}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-950/70">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Assigned to you</p>
              <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{myTasks.length}</p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {myTasks.filter((task) => task.status === 'done').length} completed,{' '}
                {myTasks.filter((task) => task.status !== 'done').length} pending.
              </p>
              <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Employee ID: {user?.employeeId || 'Not set'}</p>
            </div>
          )}
        </section>
      </div>

      <TaskModal
        open={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        projects={projects}
        onSaved={upsertTask}
        onDeleted={() => {}}
      />
    </div>
  );
};

export default Dashboard;
