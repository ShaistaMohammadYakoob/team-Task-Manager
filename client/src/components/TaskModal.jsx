import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { taskApi } from '../api/tasks.js';
import { formatDate, normalizeTags, todayInput, toDateInput } from '../utils/format.js';
import { getJobRoleLabel } from '../utils/teamRoles.js';
import { getApiError, validateDueDate } from '../utils/validators.js';
import { Button } from './Button.jsx';
import { ConfirmDialog } from './ConfirmDialog.jsx';
import { Input, Select, Textarea } from './Input.jsx';
import { Modal } from './Modal.jsx';

const defaultForm = {
  title: '',
  description: '',
  project: '',
  assignedTo: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  tags: '',
  completionNote: ''
};

const emptyProjects = [];

export const TaskModal = ({
  open,
  task,
  projects = emptyProjects,
  project,
  defaultStatus = 'todo',
  onClose,
  onSaved,
  onDeleted
}) => {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selectedProject = useMemo(() => {
    const projectId = project?._id || form.project;
    return project || projects.find((item) => item._id === projectId);
  }, [project, projects, form.project]);

  const members = selectedProject?.members || [];

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        project: task.project?._id || task.project || project?._id || '',
        assignedTo: task.assignedTo?._id || '',
        status: task.status || defaultStatus,
        priority: task.priority || 'medium',
        dueDate: toDateInput(task.dueDate),
        tags: (task.tags || []).join(', '),
        completionNote: task.completionNote || ''
      });
    } else {
      setForm({
        ...defaultForm,
        project: project?._id || projects[0]?._id || '',
        status: defaultStatus
      });
    }
    setErrors({});
    setConfirmOpen(false);
  }, [task, project, projects, defaultStatus, open]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Task title is required';
    if (!form.project) next.project = 'Project is required';
    if (!task && !validateDueDate(form.dueDate)) next.dueDate = 'Due date cannot be in the past';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        project: form.project,
        assignedTo: form.assignedTo || null,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || null,
        tags: normalizeTags(form.tags),
        completionNote: form.status === 'done' ? form.completionNote.trim() : ''
      };
      const data = task ? await taskApi.update(task._id, payload) : await taskApi.create(payload);
      toast.success(task ? 'Task updated' : 'Task created');
      onSaved(data.task);
      onClose();
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await taskApi.remove(task._id);
      toast.success('Task deleted');
      onDeleted(task._id);
      setConfirmOpen(false);
      onClose();
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title={task ? 'Task detail' : 'New task'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input label="Title" value={form.title} onChange={(event) => update('title', event.target.value)} error={errors.title} maxLength={120} />
          <Textarea label="Description" value={form.description} onChange={(event) => update('description', event.target.value)} maxLength={1200} />
          <div className="grid gap-4 sm:grid-cols-2">
            {!project ? (
              <Select label="Project" value={form.project} onChange={(event) => update('project', event.target.value)} error={errors.project}>
                <option value="">Select project</option>
                {projects.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.title}
                  </option>
                ))}
              </Select>
            ) : null}
            <Select label="Status" value={form.status} onChange={(event) => update('status', event.target.value)}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </Select>
            <Select label="Priority" value={form.priority} onChange={(event) => update('priority', event.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
            <Input
              label="Due date"
              type="date"
              min={!task ? todayInput() : undefined}
              value={form.dueDate}
              onChange={(event) => update('dueDate', event.target.value)}
              error={errors.dueDate}
            />
            <Select label="Assignee" value={form.assignedTo} onChange={(event) => update('assignedTo', event.target.value)}>
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.user?._id} value={member.user?._id}>
                  {member.user?.name} - {getJobRoleLabel(member.user?.jobRole)}
                </option>
              ))}
            </Select>
          </div>
          <Input label="Tags" value={form.tags} onChange={(event) => update('tags', event.target.value)} placeholder="design, launch, qa" />
          {form.status === 'done' ? (
            <Textarea
              label="Completion note / how it was done"
              value={form.completionNote}
              onChange={(event) => update('completionNote', event.target.value)}
              placeholder="Example: API integration completed, QA checklist passed, screenshots shared in project channel."
              maxLength={1000}
            />
          ) : null}
          {task?.completedAt ? (
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-800 dark:border-teal-300/20 dark:bg-teal-300/10 dark:text-teal-200">
              Completed by <span className="font-bold">{task.completedBy?.name || 'Team member'}</span> on {formatDate(task.completedAt)}
            </div>
          ) : null}
          <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
            {task ? (
              <Button variant="danger" onClick={() => setConfirmOpen(true)} disabled={loading}>
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save task'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete task"
        message="This task will be removed permanently."
        confirmLabel="Delete task"
        loading={loading}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};
