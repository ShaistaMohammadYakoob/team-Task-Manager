import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { projectApi } from '../api/projects.js';
import { getApiError } from '../utils/validators.js';
import { Button } from './Button.jsx';
import { Input, Textarea } from './Input.jsx';
import { Modal } from './Modal.jsx';

const colors = ['#0ea5e9', '#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

export const ProjectModal = ({ open, project, onClose, onSaved }) => {
  const [form, setForm] = useState({ title: '', description: '', color: colors[0] });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || '',
        description: project.description || '',
        color: project.color || colors[0]
      });
    } else {
      setForm({ title: '', description: '', color: colors[0] });
    }
    setErrors({});
  }, [project, open]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Project title is required';
    if (form.title.length > 80) next.title = 'Project title cannot exceed 80 characters';
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
        color: form.color
      };
      const data = project ? await projectApi.update(project._id, payload) : await projectApi.create(payload);
      toast.success(project ? 'Project updated' : 'Project created');
      onSaved(data.project);
      onClose();
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={project ? 'Edit project' : 'New project'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input label="Title" value={form.title} onChange={(event) => update('title', event.target.value)} error={errors.title} maxLength={80} />
        <Textarea label="Description" value={form.description} onChange={(event) => update('description', event.target.value)} maxLength={600} />
        <div>
          <span className="label">Color</span>
          <div className="flex flex-wrap items-center gap-3">
            {colors.map((color) => (
              <button
                type="button"
                key={color}
                aria-label={color}
                onClick={() => update('color', color)}
                className={`h-9 w-9 rounded-full border-2 transition hover:scale-105 ${
                  form.color === color ? 'border-slate-950 dark:border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
            <input
              type="color"
              value={form.color}
              onChange={(event) => update('color', event.target.value)}
              className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-slate-900"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
