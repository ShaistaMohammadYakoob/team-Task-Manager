export const StatCard = ({ title, value, icon: Icon, tone = 'cyan' }) => {
  const tones = {
    cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300',
    teal: 'bg-teal-100 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300'
  };

  return (
    <div className="app-surface rounded-xl p-5 transition duration-200 hover:-translate-y-1 hover:shadow-glow">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};
