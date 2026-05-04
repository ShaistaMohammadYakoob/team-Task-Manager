export const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done'
};

export const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

export const priorityStyles = {
  low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300',
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300'
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

export const formatDate = (date) => {
  if (!date) return 'No date';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
};

export const toDateInput = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 10);
};

export const todayInput = () => new Date().toISOString().slice(0, 10);

export const isOverdue = (task) => {
  if (!task?.dueDate || task.status === 'done') return false;
  const due = new Date(task.dueDate);
  due.setHours(23, 59, 59, 999);
  return due < new Date();
};

export const normalizeTags = (value) =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 8);
