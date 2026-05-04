import { CalendarClock, CheckCircle2, FolderKanban, Plus, TimerReset } from 'lucide-react';
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
