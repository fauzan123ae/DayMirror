import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AppContext = createContext(null);

const GROQ_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";
const GEMINI_URL = 'https://api.anthropic.com/v1/messages';

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

const DEFAULT_GOALS = [
  { id: 1, text: 'Waktunya menyapa cermin dirimu (Refleksi) 🌟', done: false },
  { id: 2, text: 'Olahraga ringan atau stretching manja 15 menit 🏃‍♂️', done: false },
  { id: 3, text: 'Membaca atau dengerin podcast ilmu baru 🎧', done: false },
];

const DEFAULT_STICKERS = [
  { id: 1, emoji: '🎉', x: 80, y: 15, rotate: -15, label: 'Super!' },
  { id: 2, emoji: '✨', x: 20, y: 70, rotate: 10, label: 'Ajaib' },
  { id: 3, emoji: '🌸', x: 92, y: 78, rotate: -5, label: 'Damai' },
];

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [reflections, setReflections] = useState([]);
  const [aiCompanion, setAiCompanion] = useState({ name: 'Mirror', avatar: '🥑' });
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [scrapbookStickers, setScrapbookStickers] = useState(DEFAULT_STICKERS);
  const [dailyGoals, setDailyGoals] = useState(DEFAULT_GOALS);
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const triggerToast = useCallback((text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const loadUserData = useCallback(async (supabaseUser) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profile) {
        setUser({
          id: supabaseUser.id,
          name: profile.name,
          email: supabaseUser.email,
          goal: profile.goal,
          joinedAt: profile.joined_at,
          streak: profile.streak || 0,
        });
        setAiCompanion(profile.ai_companion || { name: 'Mirror', avatar: '🥑' });
        setScrapbookStickers(profile.stickers || DEFAULT_STICKERS);
      }

      const { data: refs } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .order('date', { ascending: false });
      setReflections(refs || []);

      const { data: weeklyArr } = await supabase
        .from('weekly_reports')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .order('created_at', { ascending: false })
        .limit(1);

      const weekly = weeklyArr?.[0] || null;
      if (weekly) {
        const diffDays = (Date.now() - new Date(weekly.created_at).getTime()) / (1000 * 60 * 60 * 24);
        setWeeklyReport(diffDays > 7 ? null : weekly);
      } else {
        setWeeklyReport(null);
      }

      const { data: goalsArr } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .eq('date', getTodayStr())
        .limit(1);

      setDailyGoals(goalsArr?.[0]?.items || DEFAULT_GOALS);

    } catch (err) {
      console.error('[Daymirror] loadUserData error:', err);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUser(session.user);
        loadUserData(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthUser(session.user);
        loadUserData(session.user);
      } else {
        setAuthUser(null);
        setUser(null);
        setReflections([]);
        setWeeklyReport(null);
        setDailyGoals(DEFAULT_GOALS);
        setScrapbookStickers(DEFAULT_STICKERS);
        setAiCompanion({ name: 'Mirror', avatar: '🥑' });
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  useEffect(() => {
    if (!authUser) return;
    const save = async () => {
      await supabase
        .from('daily_goals')
        .upsert({ user_id: authUser.id, date: getTodayStr(), items: dailyGoals }, { onConflict: 'user_id,date' });
    };
    const timer = setTimeout(save, 800);
    return () => clearTimeout(timer);
  }, [dailyGoals, authUser]);

  useEffect(() => {
    if (!authUser) return;
    const save = async () => {
      await supabase.from('profiles').update({ ai_companion: aiCompanion }).eq('id', authUser.id);
    };
    const timer = setTimeout(save, 800);
    return () => clearTimeout(timer);
  }, [aiCompanion, authUser]);

  useEffect(() => {
    if (!authUser) return;
    const save = async () => {
      await supabase.from('profiles').update({ stickers: scrapbookStickers }).eq('id', authUser.id);
    };
    const timer = setTimeout(save, 800);
    return () => clearTimeout(timer);
  }, [scrapbookStickers, authUser]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    triggerToast('Dadaahh! Jaga diri baik-baik ya! 🧸', 'info');
  }, [triggerToast]);

  const calculateStreak = useCallback((reflectionList) => {
    if (!reflectionList || reflectionList.length === 0) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = [...new Set(reflectionList.map(r => r.date))]
      .map(d => { const dt = new Date(d); dt.setHours(0, 0, 0, 0); return dt; })
      .sort((a, b) => b - a);
    let streak = 0;
    let checkDate = new Date(today);
    for (const date of dates) {
      const diffDays = Math.round((checkDate - date) / (1000 * 60 * 60 * 24));
      if (diffDays === 0 || diffDays === 1) {
        streak++;
        checkDate = new Date(date);
        checkDate.setDate(checkDate.getDate() - 1);
      } else break;
    }
    return streak;
  }, []);

  const deleteReflection = useCallback(async (id) => {
    const { error } = await supabase.from('reflections').delete().eq('id', id).eq('user_id', authUser.id);
    if (error) { triggerToast('Gagal hapus jurnal 😢', 'error'); return; }
    setReflections(prev => {
      const updated = prev.filter(r => r.id !== id);
      const newStreak = calculateStreak(updated);
      setUser(u => u ? { ...u, streak: newStreak } : u);
      supabase.from('profiles').update({ streak: newStreak }).eq('id', authUser.id);
      return updated;
    });
    triggerToast('Lembar memori dihapus! 🗑️', 'info');
  }, [authUser, calculateStreak, triggerToast]);

  const fetchWithRetry = useCallback(async (url, options, retries = 3, delay = 1200) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) {
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
      if (retries > 0 && err.name !== 'AbortError') {
        const jitter = Math.random() * 500;
        await new Promise(r => setTimeout(r, delay + jitter));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw err;
    }
  }, []);

  return (
    <AppContext.Provider value={{
      user, setUser,
      authUser,
      loading,
      reflections, setReflections,
      aiCompanion, setAiCompanion,
      weeklyReport, setWeeklyReport,
      scrapbookStickers, setScrapbookStickers,
      dailyGoals, setDailyGoals,
      toastMessage,
      triggerToast,
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