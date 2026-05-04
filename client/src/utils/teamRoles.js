export const accessRoleLabels = {
  admin: 'Admin - Full Access',
  member: 'Member - Project Access'
};

export const jobRoleOptions = [
  { value: 'frontend-developer', label: 'Frontend Developer' },
  { value: 'backend-developer', label: 'Backend Developer' },
  { value: 'full-stack-developer', label: 'Full Stack Developer' },
  { value: 'ui-ux-designer', label: 'UI/UX Designer' },
  { value: 'qa-tester', label: 'QA Tester' },
  { value: 'task-manager', label: 'Task Manager' },
  { value: 'project-manager', label: 'Project Manager' },
  { value: 'devops-engineer', label: 'DevOps Engineer' },
  { value: 'business-analyst', label: 'Business Analyst' },
  { value: 'product-owner', label: 'Product Owner' },
  { value: 'other', label: 'Other' }
];

export const jobRoleLabels = jobRoleOptions.reduce((acc, role) => {
  acc[role.value] = role.label;
  return acc;
}, {});

export const getJobRoleLabel = (value) => jobRoleLabels[value] || 'Not assigned';
