import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Plus, Search, UserPlus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { projectApi } from '../api/projects.js';
import { taskApi } from '../api/tasks.js';
import { Avatar } from '../components/AvatarStack.jsx';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { Input, Select } from '../components/Input.jsx';
import { CardSkeleton } from '../components/Skeleton.jsx';
import { TaskCard } from '../components/TaskCard.jsx';
import { TaskModal } from '../components/TaskModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { cn } from '../utils/cn.js';
import { isOverdue, statusLabels } from '../utils/format.js';
import { getJobRoleLabel } from '../utils/teamRoles.js';
import { getApiError } from '../utils/validators.js';

const columns = ['todo', 'in-progress', 'done'];

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ priority: '', assignee: '', due: '', search: '' });
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState('todo');
  const [selectedTask, setSelectedTask] = useState(null);
  const [memberForm, setMemberForm] = useState({ email: '', role: 'member' });
  const [memberBusy, setMemberBusy] = useState(false);
  const debouncedSearch = useDebouncedValue(filters.search, 180);

  const loadProject = async () => {
    setLoading(true);
    try {
      const [projectData, taskData] = await Promise.all([projectApi.get(id), taskApi.list({ projectId: id })]);
      setProject(projectData.project);
      setTasks(taskData.tasks);
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const canManageMembers = useMemo(() => {
    if (!project || !user) return false;
    if (user.role === 'admin' || project.owner?._id === user._id) return true;
    return project.members?.some((member) => member.user?._id === user._id && member.role === 'admin');
  }, [project, user]);

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.assignee && (task.assignedTo?._id || '') !== filters.assignee) return false;
      if (filters.due === 'overdue' && !isOverdue(task)) return false;
      if (filters.due === 'no-date' && task.dueDate) return false;
      if (filters.due === 'upcoming' && (!task.dueDate || isOverdue(task))) return false;
      if (debouncedSearch && !task.title.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      return true;
    });
  }, [tasks, filters, debouncedSearch]);

  const tasksByStatus = useMemo(
    () =>
      columns.reduce((acc, status) => {
        acc[status] = visibleTasks.filter((task) => task.status === status);
        return acc;
      }, {}),
    [visibleTasks]
  );

  const upsertTask = (task) => {
    setTasks((current) => [task, ...current.filter((item) => item._id !== task._id)]);
  };

  const removeTask = (taskId) => {
    setTasks((current) => current.filter((task) => task._id !== taskId));
  };

  const openNewTask = (status) => {
    setDefaultStatus(status);
    setSelectedTask(null);
    setTaskModalOpen(true);
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const taskId = result.draggableId;
    const nextStatus = result.destination.droppableId;
    const task = tasks.find((item) => item._id === taskId);
    if (!task || task.status === nextStatus) return;

    const previous = tasks;
    setTasks((current) => current.map((item) => (item._id === taskId ? { ...item, status: nextStatus } : item)));

    try {
      const data = await taskApi.update(taskId, { status: nextStatus });
      upsertTask(data.task);
      toast.success('Task moved');
    } catch (error) {
      setTasks(previous);
      toast.error(getApiError(error));
    }
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    if (!memberForm.email.trim()) {
      toast.error('Email is required');
      return;
    }
    setMemberBusy(true);
    try {
      const data = await projectApi.addMember(project._id, memberForm);
      setProject(data.project);
      setMemberForm({ email: '', role: 'member' });
      toast.success('Member saved');
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setMemberBusy(false);
    }
  };

  const handleRemoveMember = async (member) => {
    setMemberBusy(true);
    try {
      const data = await projectApi.removeMember(project._id, member.user._id);
      setProject(data.project);
      setTasks((current) =>
        current.map((task) => (task.assignedTo?._id === member.user._id ? { ...task, assignedTo: null } : task))
      );
      toast.success('Member removed');
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setMemberBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid gap-5 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!project) {
    return <EmptyState title="Project unavailable" message="The project could not be loaded." />;
  }

  return (
    <div className="space-y-6">
      <section className="app-surface rounded-xl p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="min-w-0">
            <span className="mb-3 block h-2 w-20 rounded-full" style={{ backgroundColor: project.color }} />
            <h1 className="page-title truncate">{project.title}</h1>
            <p className="muted mt-2 max-w-3xl">{project.description || 'No description'}</p>
          </div>
          <Button icon={Plus} onClick={() => openNewTask('todo')}>
            Add task
          </Button>
        </div>
      </section>

      <section className="grid gap-4 rounded-xl border border-slate-200 bg-white/70 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 md:grid-cols-2 xl:grid-cols-4">
        <label className="relative block">
          <span className="label">Search</span>
          <Search className="pointer-events-none absolute bottom-2.5 left-3 h-4 w-4 text-slate-400" />
          <input
            className="field pl-9"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Task title"
          />
        </label>
        <Select label="Priority" value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}>
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
        <Select label="Assignee" value={filters.assignee} onChange={(event) => setFilters((current) => ({ ...current, assignee: event.target.value }))}>
          <option value="">All assignees</option>
          {project.members.map((member) => (
            <option key={member.user?._id} value={member.user?._id}>
              {member.user?.name}
            </option>
          ))}
        </Select>
        <Select label="Due date" value={filters.due} onChange={(event) => setFilters((current) => ({ ...current, due: event.target.value }))}>
          <option value="">All due dates</option>
          <option value="upcoming">Upcoming</option>
          <option value="overdue">Overdue</option>
          <option value="no-date">No date</option>
        </Select>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid gap-5 lg:grid-cols-3">
            {columns.map((status) => (
              <Droppable droppableId={status} key={status}>
                {(provided, snapshot) => (
                  <section
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'min-h-[420px] rounded-xl border border-slate-200 bg-slate-100/80 p-3 transition dark:border-white/10 dark:bg-slate-900/70',
                      snapshot.isDraggingOver && 'border-cyan-300 bg-cyan-50 dark:bg-cyan-300/10'
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3 px-1">
                      <div>
                        <h2 className="font-bold text-slate-950 dark:text-white">{statusLabels[status]}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{tasksByStatus[status].length} tasks</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => openNewTask(status)} aria-label="Add task">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {tasksByStatus[status].map((task, index) => (
                        <Draggable draggableId={task._id} index={index} key={task._id}>
                          {(dragProvided) => (
                            <div ref={dragProvided.innerRef} {...dragProvided.draggableProps}>
                              <TaskCard
                                task={task}
                                dragHandleProps={dragProvided.dragHandleProps}
                                onClick={() => {
                                  setSelectedTask(task);
                                  setTaskModalOpen(true);
                                }}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </section>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>

        <aside className="app-surface rounded-xl p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Members</h2>
            <Badge className="bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300">{project.members.length}</Badge>
          </div>
          <div className="space-y-3">
            {project.members.map((member) => (
              <div key={member.user?._id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-950/70">
                <Avatar user={member.user} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{member.user?.name}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{getJobRoleLabel(member.user?.jobRole)}</p>
                </div>
                <span className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300">
                  {member.role}
                </span>
                {canManageMembers && project.owner?._id !== member.user?._id ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member)}
                    disabled={memberBusy}
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-400/10"
                    aria-label="Remove member"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          {canManageMembers ? (
            <form onSubmit={handleAddMember} className="mt-5 space-y-3 border-t border-slate-200 pt-5 dark:border-white/10">
              <Input
                label="Email"
                type="email"
                value={memberForm.email}
                onChange={(event) => setMemberForm((current) => ({ ...current, email: event.target.value }))}
              />
              <Select
                label="Role"
                value={memberForm.role}
                onChange={(event) => setMemberForm((current) => ({ ...current, role: event.target.value }))}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </Select>
              <Button icon={UserPlus} type="submit" className="w-full" disabled={memberBusy}>
                {memberBusy ? 'Saving...' : 'Add member'}
              </Button>
            </form>
          ) : null}
        </aside>
      </div>

      <TaskModal
        open={taskModalOpen}
        task={selectedTask}
        project={project}
        defaultStatus={defaultStatus}
        onClose={() => {
          setTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSaved={upsertTask}
        onDeleted={removeTask}
      />
    </div>
  );
};

export default ProjectDetail;
