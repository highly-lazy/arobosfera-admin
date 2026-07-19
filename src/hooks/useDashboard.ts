import { useEffect, useState } from 'react';
import { ApiError, getDashboardAnalytics, type DashboardAnalytics } from '../lib/api';

// Boshqaruv paneli va Analitika sahifalari uchun analitika ma'lumotini yuklaydi.
export function useDashboard() {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getDashboardAnalytics()
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Ma’lumotni yuklab bo’lmadi'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return { data, loading, error, reload: load };
}

// Metrikani chiroyli matnга aylantiradi: "12.4% o'tgan davrga nisbatan"
export function formatChange(change: number, unit: string) {
  const sign = change > 0 ? '+' : '';
  if (unit === 'Points') return `${sign}${change} ball`;
  return `${sign}${change}% o‘tgan davrga nisbatan`;
}
