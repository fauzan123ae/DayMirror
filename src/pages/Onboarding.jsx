import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';
import { GOAL_OPTIONS } from '../data/constants';
import { useApp } from '../context/AppContext';

export default function Onboarding() {
  const { login, triggerToast } = useApp();
  const navigate = useNavigate();

  // Tab State: 'login' | 'register'
  const [tab, setTab] = useState('login');

  // Form States
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [goal, setGoal]         = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const identifier = username.trim(); // can be username or email
    if (!identifier) {
      triggerToast('Nama pengguna atau email harus diisi ya! 🐾', 'error');
      return;
    }
    if (!password) {
      triggerToast('Sstt! Kata sandinya diisi dulu ya! 🔒', 'error');
      return;
    }

    try {
      const usersStr = localStorage.getItem('dm_users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      const foundUser = users.find(
        u => u.name.toLowerCase() === identifier.toLowerCase() ||
             (u.email && u.email.toLowerCase() === identifier.toLowerCase())
      );

      if (!foundUser) {
        triggerToast('Hmm, akun tidak ditemukan. Daftar dulu yuk! ✨', 'error');
        return;
      }

      if (foundUser.password !== password) {
        triggerToast('Aduh, kata sandimu salah. Coba periksa lagi! 🗝️', 'error');
        return;
      }

      // Success Login
      login(foundUser);
      triggerToast(`Selamat datang kembali, ${foundUser.name}! 🚀`, 'success');
      navigate('/dashboard');
    } catch {
      triggerToast('Gagal masuk. Silakan coba lagi!', 'error');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim();
    
    if (!cleanUsername) {
      triggerToast('Mau dipanggil siapa nih? Tulis namamu ya! 🐾', 'error');
      return;
    }
    if (cleanUsername.length < 3) {
      triggerToast('Nama panggilan minimal 3 karakter ya! 🌸', 'error');
      return;
    }
    if (!cleanEmail) {
      triggerToast('Alamat email harus diisi ya! 📧', 'error');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      triggerToast('Format email tidak valid! 📧', 'error');
      return;
    }
    if (!password) {
      triggerToast('Buat kata sandi pengamanmu dulu! 🔒', 'error');
      return;
    }
    if (!goal) {
      triggerToast('Pilih salah satu impian besarmu! 🌟', 'error');
      return;
    }

    try {
      const usersStr = localStorage.getItem('dm_users');
      const users = usersStr ? JSON.parse(usersStr) : [];

      const nameExists = users.some(
        u => u.name.toLowerCase() === cleanUsername.toLowerCase()
      );
      if (nameExists) {
        triggerToast('Nama ini sudah dipakai petualang lain. Coba nama lain! 🦊', 'error');
        return;
      }

      const emailExists = users.some(
        u => u.email && u.email.toLowerCase() === cleanEmail.toLowerCase()
      );
      if (emailExists) {
        triggerToast('Email ini sudah terdaftar. Gunakan email lain! 📧', 'error');
        return;
      }

      // Create new user profile
      const newUser = {
        name: cleanUsername,
        email: cleanEmail,
        password: password,
        goal: goal,
        joinedAt: new Date().toISOString().split('T')[0],
        streak: 0
      };

      // Save to users list
      users.push(newUser);
      localStorage.setItem('dm_users', JSON.stringify(users));

      // Login immediately
      login(newUser);
      triggerToast(`Akun berhasil dibuat! Halo ${cleanUsername}! 🥑🚀`, 'success');
      navigate('/dashboard');
    } catch {
      triggerToast('Gagal mendaftar. Silakan coba lagi!', 'error');
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
            <h1 className="text-2xl font-comic-title font-black text-white mb-1">
              DayMirror
            </h1>
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
            className={`flex-1 py-4 text-sm font-black flex items-center justify-center gap-2 border-r-4 border-[#2C3E35] transition-colors ${
              tab === 'login' ? 'bg-[#FFF6E0] text-[#2C3E35]' : 'bg-white text-[#7CA190] hover:bg-[#FFFDF9]'
            }`}
          >
            <LogIn className="w-4 h-4" /> Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setUsername(''); setEmail(''); setPassword(''); }}
            className={`flex-1 py-4 text-sm font-black flex items-center justify-center gap-2 transition-colors ${
              tab === 'register' ? 'bg-[#FFF6E0] text-[#2C3E35]' : 'bg-white text-[#7CA190] hover:bg-[#FFFDF9]'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Daftar Baru
          </button>
        </div>

        {/* Form Body */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div>
              <label className="block text-xs font-black text-[#2C3E35] mb-2 uppercase tracking-wider">
                🌟 Nama Pengguna atau Email
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Tulis nama pengguna atau email..."
                className="w-full p-4 rounded-2xl comic-border-thin bg-white focus:bg-[#FFFDF9] text-base font-bold text-[#2C3E35] focus:outline-none focus:ring-2 focus:ring-[#7CA190]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#2C3E35] mb-2 uppercase tracking-wider">
                🔒 Kata Sandi
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Tulis kata sandi pengamanmu..."
                className="w-full p-4 rounded-2xl comic-border-thin bg-white focus:bg-[#FFFDF9] text-base font-bold text-[#2C3E35] focus:outline-none focus:ring-2 focus:ring-[#7CA190]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#7CA190] hover:bg-[#6A8B7C] text-white font-black py-4 px-6 rounded-2xl comic-border-thick comic-shadow-md transition-all flex items-center justify-center gap-3 text-base bouncy-hover"
            >
              <LogIn className="w-5 h-5" />
              Mulai Petualangan!
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="p-8 space-y-6 max-h-[500px] overflow-y-auto">
            <div>
              <label className="block text-xs font-black text-[#2C3E35] mb-2 uppercase tracking-wider">
                🌟 Nama Panggilan Baru
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Mau dipanggil siapa..."
                className="w-full p-4 rounded-2xl comic-border-thin bg-white focus:bg-[#FFFDF9] text-base font-bold text-[#2C3E35] focus:outline-none focus:ring-2 focus:ring-[#7CA190]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#2C3E35] mb-2 uppercase tracking-wider">
                📧 Alamat Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Tulis alamat emailmu..."
                className="w-full p-4 rounded-2xl comic-border-thin bg-white focus:bg-[#FFFDF9] text-base font-bold text-[#2C3E35] focus:outline-none focus:ring-2 focus:ring-[#7CA190]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#2C3E35] mb-2 uppercase tracking-wider">
                🔒 Buat Kata Sandi
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Buat sandi yang aman..."
                className="w-full p-4 rounded-2xl comic-border-thin bg-white focus:bg-[#FFFDF9] text-base font-bold text-[#2C3E35] focus:outline-none focus:ring-2 focus:ring-[#7CA190]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#2C3E35] mb-3 uppercase tracking-wider">
                🎯 Impian Terbesarmu Pekan Ini
              </label>
              <div className="space-y-3">
                {GOAL_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setGoal(opt.id)}
                    className={`w-full text-left p-4 rounded-2xl comic-border-thin transition-all flex items-start gap-3 bouncy-hover ${
                      goal === opt.id ? `${opt.color} comic-shadow-sm` : 'bg-white hover:bg-[#FDFBF7]'
                    }`}
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
              type="submit"
              className="w-full bg-[#EBB39C] hover:bg-[#E0A288] text-[#2C3E35] font-black py-4 px-6 rounded-2xl comic-border-thick comic-shadow-md transition-all flex items-center justify-center gap-3 text-base bouncy-hover"
            >
              <Sparkles className="w-5 h-5" />
              Buat Akun & Mulai!
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
