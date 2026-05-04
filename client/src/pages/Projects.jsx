import { FolderPlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { projectApi } from '../api/projects.js';
import { AvatarStack } from '../components/AvatarStack.jsx';
import { Button } from '../components/Button.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { ProjectModal } from '../components/ProjectModal.jsx';
import { CardSkeleton } from '../components/Skeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../utils/format.js';
import { getApiError } from '../utils/validators.js';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectApi.list();
      setProjects(data.projects);
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSaved = (project) => {
    setProjects((current) => [project, ...current.filter((item) => item._id !== project._id)]);
    setEditingProject(null);
  };

  const canDelete = (project) => user?.role === 'admin' || project.owner?._id === user?._id;

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await projectApi.remove(deleteProject._id);
      setProjects((current) => current.filter((project) => project._id !== deleteProject._id));
      toast.success('Project deleted');
      setDeleteProject(null);
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="muted mt-2">Browse project spaces and open a board.</p>
        </div>
        <Button icon={FolderPlus} onClick={() => setModalOpen(true)}>
          New project
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : projects.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article key={project._id} className="app-surface group rounded-xl p-5 transition duration-200 hover:-translate-y-1 hover:shadow-glow">
              <div className="mb-5 flex items-start justify-between gap-4">
                <Link to={`/projects/${project._id}`} className="min-w-0 flex-1">
                  <span className="mb-3 block h-2 w-16 rounded-full" style={{ backgroundColor: project.color }} />
                  <h2 className="truncate text-xl font-bold text-slate-950 dark:text-white">{project.title}</h2>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500 dark:text-slate-400">{project.description || 'No description'}</p>
                </Link>
                <div className="flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingProject(project); setModalOpen(true); }} aria-label="Edit project">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {canDelete(project) ? (
                    <Button variant="ghost" size="icon" onClick={() => setDeleteProject(project)} aria-label="Delete project">
                      <Trash2 className="h-4 w-4 text-rose-500" />
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4 dark:border-white/10">
                <AvatarStack members={project.members} />
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-950 dark:text-white">{project.taskCount || 0} tasks</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(project.updatedAt)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No projects yet" message="Create your first project and add your team." actionLabel="New project" onAction={() => setModalOpen(true)} />
      )}

      <ProjectModal
        open={modalOpen}
        project={editingProject}
        onClose={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
        onSaved={handleSaved}
      />
      <ConfirmDialog
        open={Boolean(deleteProject)}
        title="Delete project"
        message="The project and all of its tasks will be removed permanently."
        confirmLabel="Delete project"
        loading={busy}
        onClose={() => setDeleteProject(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Projects;
