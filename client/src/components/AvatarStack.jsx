import { initials } from '../utils/format.js';

export const Avatar = ({ user, size = 'md' }) => {
  const dimension = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';

  return user?.avatar ? (
    <img
      src={user.avatar}
      alt={user.name}
      className={`${dimension} rounded-full border-2 border-white object-cover dark:border-slate-900`}
    />
  ) : (
    <span
      className={`${dimension} inline-flex items-center justify-center rounded-full border-2 border-white bg-cyan-100 font-bold text-cyan-700 dark:border-slate-900 dark:bg-cyan-400/15 dark:text-cyan-200`}
      title={user?.name}
    >
      {initials(user?.name)}
    </span>
  );
};

export const AvatarStack = ({ members = [], limit = 4 }) => {
  const visible = members.slice(0, limit);
  const extra = members.length - visible.length;

  return (
    <div className="flex -space-x-2">
      {visible.map((member) => (
        <Avatar key={member.user?._id || member._id} user={member.user || member} size="sm" />
      ))}
      {extra > 0 ? (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-bold text-slate-600 dark:border-slate-900 dark:bg-slate-800 dark:text-slate-200">
          +{extra}
        </span>
      ) : null}
    </div>
  );
};
