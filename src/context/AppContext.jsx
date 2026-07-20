import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_REFLECTIONS } from '../data/constants';

const AppContext = createContext(null);

// Taruh di luar komponen agar tidak re-define setiap render
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GEMINI_URL = 'https://api.groq.com/openai/v1/chat/completions';

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function loadGoalsForUser(username) {
  try {
    const saved = localStorage.getItem(`dm_goals_${username}`);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    // Reset done-status jika hari sudah berbeda
    if (parsed.date !== getTodayStr()) {
      return {
        date: getTodayStr(),
        items: parsed.items.map(g => ({ ...g, done: false })),
      };
    }
    return parsed;
  } catch {
    return null;
  }
}

const DEFAULT_GOALS = [
  { id: 1, text: 'Waktunya menyapa cermin dirimu (Refleksi) 🌟', done: false },
  { id: 2, text: 'Olahraga ringan atau stretching manja 15 menit 🏃‍♂️', done: false },
  { id: 3, text: 'Membaca atau dengerin podcast ilmu baru 🎧', done: false },
];

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem('dm_user'); return s ? JSON.parse(s) : null; } catch { return null; }
  });

  const [reflections, setReflections] = useState(() => {
    try {
      const u = localStorage.getItem('dm_user');
      if (u) {
        const parsedUser = JSON.parse(u);
        const s = localStorage.getItem(`dm_reflections_${parsedUser.name}`);
        return s ? JSON.parse(s) : [];
      }
      return [];
    } catch { return []; }
  });

  const [aiCompanion, setAiCompanion] = useState(() => {
    try {
      const u = localStorage.getItem('dm_user');
      if (u) {
        const parsedUser = JSON.parse(u);
        const s = localStorage.getItem(`dm_companion_${parsedUser.name}`);
        return s ? JSON.parse(s) : { name: 'Mirror', avatar: '🥑' };
      }
      return { name: 'Mirror', avatar: '🥑' };
    } catch { return { name: 'Mirror', avatar: '🥑' }; }
  });

  const [weeklyReport, setWeeklyReport] = useState(() => {
    try {
      const u = localStorage.getItem('dm_user');
      if (u) {
        const parsedUser = JSON.parse(u);
        const s = localStorage.getItem(`dm_weekly_${parsedUser.name}`);
        if (!s) return null;
        const parsed = JSON.parse(s);
        // Expired setelah 7 hari
        if (parsed._savedAt) {
          const diffDays = (Date.now() - parsed._savedAt) / (1000 * 60 * 60 * 24);
          if (diffDays > 7) return null;
        }
        return parsed;
      }
      return null;
    } catch { return null; }
  });

  const [scrapbookStickers, setScrapbookStickers] = useState(() => {
    try {
      const u = localStorage.getItem('dm_user');
      if (u) {
        const parsedUser = JSON.parse(u);
        const s = localStorage.getItem(`dm_stickers_${parsedUser.name}`);
        return s ? JSON.parse(s) : [
          { id: 1, emoji: '🎉', x: 80, y: 15, rotate: -15, label: 'Super!' },
          { id: 2, emoji: '✨', x: 20, y: 70, rotate: 10, label: 'Ajaib' },
          { id: 3, emoji: '🌸', x: 92, y: 78, rotate: -5, label: 'Damai' },
        ];
      }
      return [
        { id: 1, emoji: '🎉', x: 80, y: 15, rotate: -15, label: 'Super!' },
        { id: 2, emoji: '✨', x: 20, y: 70, rotate: 10, label: 'Ajaib' },
        { id: 3, emoji: '🌸', x: 92, y: 78, rotate: -5, label: 'Damai' },
      ];
    } catch { return []; }
  });

  const [dailyGoals, setDailyGoals] = useState(() => {
    try {
      const u = localStorage.getItem('dm_user');
      if (u) {
        const parsedUser = JSON.parse(u);
        const saved = loadGoalsForUser(parsedUser.name);
        return saved ? saved.items : DEFAULT_GOALS;
      }
      return DEFAULT_GOALS;
    } catch {
      return DEFAULT_GOALS;
    }
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Persist
  useEffect(() => {
    if (!user) return;
    try { localStorage.setItem(`dm_reflections_${user.name}`, JSON.stringify(reflections)); } catch {}
  }, [reflections, user]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem('dm_user', JSON.stringify(user));
      else localStorage.removeItem('dm_user');
    } catch {}
  }, [user]);

  useEffect(() => {
    if (!user) return;
    try { localStorage.setItem(`dm_companion_${user.name}`, JSON.stringify(aiCompanion)); } catch {}
  }, [aiCompanion, user]);

  useEffect(() => {
    if (!user || !weeklyReport) return;
    try {
      localStorage.setItem(`dm_weekly_${user.name}`, JSON.stringify({ ...weeklyReport, _savedAt: Date.now() }));
    } catch {}
  }, [weeklyReport, user]);

  useEffect(() => {
    if (!user) return;
    try { localStorage.setItem(`dm_stickers_${user.name}`, JSON.stringify(scrapbookStickers)); } catch {}
  }, [scrapbookStickers, user]);

  // Persist dailyGoals dengan tanggal
  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(`dm_goals_${user.name}`, JSON.stringify({ date: getTodayStr(), items: dailyGoals }));
    } catch {}
  }, [dailyGoals, user]);

  const triggerToast = useCallback((text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('dm_user', JSON.stringify(userData));
    try {
      const sRef = localStorage.getItem(`dm_reflections_${userData.name}`);
      setReflections(sRef ? JSON.parse(sRef) : []);
      
      const sComp = localStorage.getItem(`dm_companion_${userData.name}`);
      setAiCompanion(sComp ? JSON.parse(sComp) : { name: 'Mirror', avatar: '🥑' });

      const sWeekly = localStorage.getItem(`dm_weekly_${userData.name}`);
      if (sWeekly) {
        const parsed = JSON.parse(sWeekly);
        if (parsed._savedAt && (Date.now() - parsed._savedAt) / (1000 * 60 * 60 * 24) > 7) {
          setWeeklyReport(null);
        } else {
          setWeeklyReport(parsed);
        }
      } else {
        setWeeklyReport(null);
      }

      const sStickers = localStorage.getItem(`dm_stickers_${userData.name}`);
      setScrapbookStickers(sStickers ? JSON.parse(sStickers) : [
        { id: 1, emoji: '🎉', x: 80, y: 15, rotate: -15, label: 'Super!' },
        { id: 2, emoji: '✨', x: 20, y: 70, rotate: 10, label: 'Ajaib' },
        { id: 3, emoji: '🌸', x: 92, y: 78, rotate: -5, label: 'Damai' },
      ]);

      const sGoals = loadGoalsForUser(userData.name);
      setDailyGoals(sGoals ? sGoals.items : DEFAULT_GOALS);
    } catch {}
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setReflections([]);
    setWeeklyReport(null);
    setDailyGoals(DEFAULT_GOALS);
    setScrapbookStickers([
      { id: 1, emoji: '🎉', x: 80, y: 15, rotate: -15, label: 'Super!' },
      { id: 2, emoji: '✨', x: 20, y: 70, rotate: 10, label: 'Ajaib' },
      { id: 3, emoji: '🌸', x: 92, y: 78, rotate: -5, label: 'Damai' },
    ]);
    setAiCompanion({ name: 'Mirror', avatar: '🥑' });
    triggerToast('Dadaahh! Jaga diri baik-baik ya! 🧸', 'info');
  }, [triggerToast]);

  /**
   * fetchWithRetry yang diperbaiki:
   * - Retry untuk semua error (network + 429 + 5xx), bukan hanya 429
   * - Timeout 15 detik per request agar tidak hang selamanya
   * - Exponential backoff dengan jitter
   */
  const fetchWithRetry = useCallback(async (url, options, retries = 3, delay = 1200) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        // Retry untuk 429 (rate limit) dan 5xx (server error)
        if ((res.status === 429 || res.status >= 500) && retries > 0) {
          const jitter = Math.random() * 500;
          await new Promise(r => setTimeout(r, delay + jitter));
          return fetchWithRetry(url, options, retries - 1, delay * 2);
        }
        const errBody = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${errBody.slice(0, 200)}`);
      }
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      // Retry untuk error jaringan (AbortError dari timeout, NetworkError, dsb)
      if (retries > 0 && err.name !== 'AbortError') {
        const jitter = Math.random() * 500;
        await new Promise(r => setTimeout(r, delay + jitter));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw err;
    }
  }, []);

  // Hitung streak dari daftar refleksi
  const calculateStreak = (reflectionList) => {
    if (!reflectionList || reflectionList.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = [...new Set(reflectionList.map(r => r.date))]
      .map(d => { const dt = new Date(d); dt.setHours(0,0,0,0); return dt; })
      .sort((a, b) => b - a);

    let streak = 0;
    let checkDate = new Date(today);

    for (const date of dates) {
      const diffDays = Math.round((checkDate - date) / (1000 * 60 * 60 * 24));
      if (diffDays === 0 || diffDays === 1) {
        streak++;
        checkDate = new Date(date);
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  // Hapus satu entri jurnal dan recalculate streak
  const deleteReflection = (id) => {
    setReflections(prev => {
      const updated = prev.filter(r => r.id !== id);
      const newStreak = calculateStreak(updated);
      setUser(u => u ? { ...u, streak: newStreak } : u);
      return updated;
    });
    triggerToast('Lembar memori dihapus! 🗑️', 'info');
  };

  return (
    <AppContext.Provider value={{
      user, setUser,
      reflections, setReflections,
      aiCompanion, setAiCompanion,
      weeklyReport, setWeeklyReport,
      scrapbookStickers, setScrapbookStickers,
      dailyGoals, setDailyGoals,
      toastMessage,
      triggerToast,
      login,
      logout,
      deleteReflection,
      calculateStreak,
      GEMINI_URL,
      GROQ_KEY,
      fetchWithRetry,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
