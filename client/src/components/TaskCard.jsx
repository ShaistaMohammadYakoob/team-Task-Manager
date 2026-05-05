import { Calendar, CheckCircle2, Tag, UserRound } from 'lucide-react';
import { Badge } from './Badge.jsx';
import { Avatar } from './AvatarStack.jsx';
import { formatDate, isOverdue, priorityStyles } from '../utils/format.js';

export const TaskCard = ({ task, onClick, dragHandleProps }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-glow dark:border-white/10 dark:bg-slate-950/70 dark:hover:border-cyan-300"
    {...dragHandleProps}
  >
    <div className="mb-3 flex items-start justify-between gap-3">
      <h3 className="line-clamp-2 text-sm font-bold text-slate-950 dark:text-white">{task.title}</h3>
      <Badge className={priorityStyles[task.priority]}>{task.priority}</Badge>
    </div>
    {task.description ? <p className="mb-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{task.description}</p> : null}
    {task.status === 'done' ? (
      <div className="mb-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 dark:border-teal-300/20 dark:bg-teal-300/10 dark:text-teal-200">
        <span className="inline-flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Done by {task.completedBy?.name || task.assignedTo?.name || 'team member'}
        </span>
        {task.completionNote ? <p className="mt-1 line-clamp-2 font-medium">{task.completionNote}</p> : null}
      </div>
    ) : null}
    <div className="flex flex-wrap gap-2">
      {(task.tags || []).slice(0, 3).map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
          <Tag className="h-3 w-3" />
          {tag}
        </span>
      ))}
    </div>
    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
      <span className={`inline-flex items-center gap-1 ${isOverdue(task) ? 'font-semibold text-rose-500' : ''}`}>
        <Calendar className="h-3.5 w-3.5" />
        {formatDate(task.dueDate)}
      </span>
      {task.assignedTo ? (
        <Avatar user={task.assignedTo} size="sm" />
      ) : (
        <span className="inline-flex items-center gap-1">
          <UserRound className="h-3.5 w-3.5" />
          Open
        </span>
      )}
    </div>
  </button>
);
