import { useState, useEffect } from 'react';

let showToastFn;

export const showToast = (message, type = 'success') => {
  if (showToastFn) showToastFn(message, type);
};

export default function Toast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    showToastFn = (message, type) => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3500);
    };
  }, []);

  if (!toast) return null;
  return (
    <div className={`toast ${toast.type === 'error' ? 'error' : ''}`}>
      {toast.type === 'error' ? '❌' : '✅'} {toast.message}
    </div>
  );
}
