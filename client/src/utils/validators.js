export const isEmail = (value) => /^\S+@\S+\.\S+$/.test(value);

export const isEmployeeId = (value) => /^[A-Za-z0-9_-]{2,40}$/.test(value.trim());

export const isStrongPassword = (value) => value.length >= 8 && /\d/.test(value);

export const validateDueDate = (value) => {
  if (!value) return true;
  const selected = new Date(value);
  selected.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected >= today;
};

export const getApiError = (error) => error?.response?.data?.error || error?.message || 'Something went wrong';
