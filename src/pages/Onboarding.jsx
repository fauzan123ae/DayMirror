import React, { useState } from 'react';
import { Sparkles, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { GOAL_OPTIONS } from '../data/constants';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

export default function Onboarding() {
  const { triggerToast } = useApp();

  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) { triggerToast('Email harus diisi ya! 🐾', 'error'); return; }
    if (!password) { triggerToast('Kata sandinya diisi dulu ya! 🔒', 'error'); return; }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        if (
          error.message.includes('Invalid login credentials') ||
          error.message.includes('invalid_credentials')
        ) {
          triggerToast('Email atau kata sandi salah! 🗝️', 'error');
        } else if (error.message.includes('Email not confirmed')) {
          triggerToast('Email belum dikonfirmasi. Cek inbox kamu! 📧', 'error');
        } else {
          triggerToast(error.message, 'error');
        }
        return;
      }

      triggerToast('Selamat datang kembali! 🚀', 'success');
    } catch {
      triggerToast('Gagal masuk. Coba lagi!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (!cleanUsername) { triggerToast('Mau dipanggil siapa? 🐾', 'error'); return; }
    if (cleanUsername.length < 3) { triggerToast('Nama minimal 3 karakter! 🌸', 'error'); return; }
    if (!cleanEmail || !cleanEmail.includes('@')) { triggerToast('Format email tidak valid! 📧', 'error'); return; }
    if (!password || password.length < 6) { triggerToast('Kata sandi minimal 6 karakter! 🔒', 'error'); return; }
    if (!goal) { triggerToast('Pilih impian besarmu dulu! 🌟', 'error'); return; }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            name: cleanUsername,
            goal: goal,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          triggerToast('Email ini sudah terdaftar! Coba login. 📧', 'error');
        } else {
          triggerToast(error.message, 'error');
        }
        return;
      }

      // Email sudah terdaftar tapi identities kosong
      if (data?.user && data.user.identities?.length === 0) {
        triggerToast('Email ini sudah terdaftar! Coba login. 📧', 'error');
        return;
      }

      // ✅ Insert ke tabel profiles setelah signup berhasil
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            name: cleanUsername,
            goal: goal,
            streak: 0,
            joined_at: new Date().toISOString().split('T')[0],
            ai_companion: { name: 'Mirror', avatar: '🥑' },
            stickers: [
              { id: 1, emoji: '🎉', x: 80, y: 15, rotate: -15, label: 'Super!' },
              { id: 2, emoji: '✨', x: 20, y: 70, rotate: 10, label: 'Ajaib' },
              { id: 3, emoji: '🌸', x: 92, y: 78, rotate: -5, label: 'Damai' },
            ],
          }, { onConflict: 'id' });

        if (profileError) {
          console.error('[Daymirror] Gagal insert profile:', profileError);
        }
      }

      // Email confirmation aktif → session null
      if (data?.user && !data.session) {
        triggerToast('Akun berhasil dibuat! Cek email kamu untuk konfirmasi sebelum masuk. 📧✨', 'info');
        setTab('login');
        return;
      }

      // Email confirmation nonaktif → langsung masuk
      triggerToast(`Akun berhasil dibuat! Halo ${cleanUsername}! 🥑🚀`, 'success');
    } catch {
      triggerToast('Gagal mendaftar. Coba lagi!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-4 my-6">
      <div className="max-w-xl w-full bg-[#FFFDF9] rounded-[40px] comic-border-thick comic-shadow-lg overflow-hidden transition-all duration-300">

        {/* Banner */}
        <div className="bg-[#7CA190] border-b-4 border-[#2C3E35] p-6 text-center relative">
          <div className="absolute top-2 left-2 text-2xl opacity-20 select-none">🐱</div>
          <div className="absolute top-4 right-4 text-2xl opacity-20 select-none">🐸</div>
          <div className="absolute bottom-2 left-6 text-2xl opacity-20 select-none">🦖</div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white rounded-full comic-border-thick flex items-center justify-center text-4xl mx-auto mb-3 comic-shadow-md animate-wobble-slow">🥑</div>
            <h1 className="text-2xl font-comic-title font-black text-white mb-1">DayMirror</h1>
            <p className="text-xs text-white/80 font-bold max-w-sm mx-auto leading-relaxed">
              Buku harian ajaib bergaya komik yang mendengarkan keluh kesahmu & merangkumnya dengan AI yang hangat! 🌿✨
            </p>
          </div>
        </div>

        {/* Tab Selectors */}
        <div className="flex border-b-4 border-[#2C3E35] bg-white">
          <button
            type="button"
            onClick={() => { setTab('login'); setUsername(''); setEmail(''); setPassword(''); }}
            className={`flex-1 py-4 text-sm font-black flex items-center justify-center gap-2 border-r-4 border-[#2C3E35] transition-colors ${tab === 'login' ? 'bg-[#FFF6E0] text-[#2C3E35]' : 'bg-white text-[#7CA190] hover:bg-[#FFFDF9]'}`}
          >
            <LogIn className="w-4 h-4" /> Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setUsername(''); setEmail(''); setPassword(''); }}
            className={`flex-1 py-4 text-sm font-black flex items-center justify-center gap-2 transition-colors ${tab === 'register' ? 'bg-[#FFF6E0] text-[#2C3E35]' : 'bg-white text-[#7CA190] hover:bg-[#FFFDF9]'}`}
          >
            <UserPlus className="w-4 h-4" /> Daftar Baru
          </button>
        </div>

        {/* Form Login */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div>
              <label className="block text-xs font-black text-[#2C3E35] mb-2 uppercase tracking-wider">📧 Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Tulis alamat emailmu..."
                className="w-full p-4 rounded-2xl comic-border-thin bg-white focus:bg-[#FFFDF9] text-base font-bold text-[#2C3E35] focus:outline-none focus:ring-2 focus:ring-[#7CA190]"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#2C3E35] mb-2 uppercase tracking-wider">🔒 Kata Sandi</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Tulis kata sandi pengamanmu..."
                className="w-full p-4 rounded-2xl comic-border-thin bg-white focus:bg-[#FFFDF9] text-base font-bold text-[#2C3E35] focus:outline-none focus:ring-2 focus:ring-[#7CA190]"
              />
            </div>
            <button
              type="submit" disabled={isLoading}
              className="w-full bg-[#7CA190] hover:bg-[#6A8B7C] disabled:opacity-60 text-white font-black py-4 px-6 rounded-2xl comic-border-thick comic-shadow-md transition-all flex items-center justify-center gap-3 text-base bouncy-hover"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {isLoading ? 'Sedang masuk...' : 'Mulai Petualangan!'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="p-8 space-y-6 max-h-[500px] overflow-y-auto">
            <div>
              <label className="block text-xs font-black text-[#2C3E35] mb-2 uppercase tracking-wider">🌟 Nama Panggilan</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Mau dipanggil siapa..."
                className="w-full p-4 rounded-2xl comic-border-thin bg-white focus:bg-[#FFFDF9] text-base font-bold text-[#2C3E35] focus:outline-none focus:ring-2 focus:ring-[#7CA190]"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#2C3E35] mb-2 uppercase tracking-wider">📧 Alamat Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Tulis alamat emailmu..."
                className="w-full p-4 rounded-2xl comic-border-thin bg-white focus:bg-[#FFFDF9] text-base font-bold text-[#2C3E35] focus:outline-none focus:ring-2 focus:ring-[#7CA190]"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#2C3E35] mb-2 uppercase tracking-wider">🔒 Buat Kata Sandi</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter..."
                className="w-full p-4 rounded-2xl comic-border-thin bg-white focus:bg-[#FFFDF9] text-base font-bold text-[#2C3E35] focus:outline-none focus:ring-2 focus:ring-[#7CA190]"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#2C3E35] mb-3 uppercase tracking-wider">🎯 Impian Terbesarmu</label>
              <div className="space-y-3">
                {GOAL_OPTIONS.map(opt => (
                  <button key={opt.id} type="button" onClick={() => setGoal(opt.id)}
                    className={`w-full text-left p-4 rounded-2xl comic-border-thin transition-all flex items-start gap-3 bouncy-hover ${goal === opt.id ? `${opt.color} comic-shadow-sm` : 'bg-white hover:bg-[#FDFBF7]'}`}
                  >
                    <span className="text-2xl shrink-0">{opt.icon}</span>
                    <div>
                      <p className="font-black text-xs md:text-sm">{opt.label}</p>
                      <p className="text-[10px] md:text-xs opacity-75 font-bold mt-0.5">{opt.desc}</p>
                    </div>
                    {goal === opt.id && <span className="ml-auto text-lg">✅</span>}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit" disabled={isLoading}
              className="w-full bg-[#EBB39C] hover:bg-[#E0A288] disabled:opacity-60 text-[#2C3E35] font-black py-4 px-6 rounded-2xl comic-border-thick comic-shadow-md transition-all flex items-center justify-center gap-3 text-base bouncy-hover"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {isLoading ? 'Membuat akun...' : 'Buat Akun & Mulai!'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}