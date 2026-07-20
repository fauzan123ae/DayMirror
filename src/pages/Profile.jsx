import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Target, Calendar, Flame, Trash2, AlertTriangle, Save, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GOAL_OPTIONS } from '../data/constants';

export default function Profile() {
  const { user, setUser, logout, triggerToast } = useApp();
  const navigate = useNavigate();

  const [newName, setNewName] = useState(user?.name || '');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [selectedGoal, setSelectedGoal] = useState(user?.goal || '');
  const [password, setPassword] = useState(user?.password || '');
  
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  if (!user) return null;

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    const cleanName = newName.trim();
    const cleanEmail = newEmail.trim();

    if (!cleanName) {
      triggerToast('Nama tidak boleh kosong! 🌸', 'error');
      return;
    }
    if (!cleanEmail) {
      triggerToast('Email tidak boleh kosong! 📧', 'error');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      triggerToast('Format email tidak valid! 📧', 'error');
      return;
    }

    try {
      const usersStr = localStorage.getItem('dm_users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      const oldName = user.name;
      const isRename = oldName.toLowerCase() !== cleanName.toLowerCase();

      // If renaming, check if new name is taken
      if (isRename) {
        const taken = users.some(u => u.name.toLowerCase() === cleanName.toLowerCase());
        if (taken) {
          triggerToast('Nama tersebut sudah digunakan oleh akun lain! 🦊', 'error');
          return;
        }
      }

      // Check if new email is taken by another account
      const isEmailChange = (user.email || '').toLowerCase() !== cleanEmail.toLowerCase();
      if (isEmailChange) {
        const emailTaken = users.some(u => u.email && u.email.toLowerCase() === cleanEmail.toLowerCase());
        if (emailTaken) {
          triggerToast('Email tersebut sudah digunakan oleh akun lain! 📧', 'error');
          return;
        }
      }

      // Find and update in the list
      const updatedUsers = users.map(u => {
        if (u.name.toLowerCase() === oldName.toLowerCase()) {
          return { ...u, name: cleanName, email: cleanEmail, goal: selectedGoal, password: password };
        }
        return u;
      });

      // Save list back to localStorage
      localStorage.setItem('dm_users', JSON.stringify(updatedUsers));

      // Handle file key migrations if user renamed their account
      if (isRename) {
        // Copy keys
        const keys = ['reflections', 'companion', 'weekly', 'stickers', 'goals'];
        keys.forEach(key => {
          const val = localStorage.getItem(`dm_${key}_${oldName}`);
          if (val !== null) {
            localStorage.setItem(`dm_${key}_${cleanName}`, val);
            localStorage.removeItem(`dm_${key}_${oldName}`);
          }
        });
      }

      // Update active user in state
      const updatedUser = { ...user, name: cleanName, email: cleanEmail, goal: selectedGoal, password: password };
      setUser(updatedUser);
      localStorage.setItem('dm_user', JSON.stringify(updatedUser));

      triggerToast('Profil berhasil diperbarui! ✨🎨', 'success');
    } catch (err) {
      console.error(err);
      triggerToast('Gagal memperbarui profil.', 'error');
    }
  };

  const handleDeleteAccount = (e) => {
    e.preventDefault();
    if (deletePassword !== user.password) {
      triggerToast('Kata sandi salah! Konfirmasi hapus dibatalkan. 🗝️', 'error');
      return;
    }

    try {
      const usersStr = localStorage.getItem('dm_users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      // Filter out this user
      const filteredUsers = users.filter(u => u.name.toLowerCase() !== user.name.toLowerCase());
      localStorage.setItem('dm_users', JSON.stringify(filteredUsers));

      // Delete scoped keys
      const keys = ['reflections', 'companion', 'weekly', 'stickers', 'goals'];
      keys.forEach(key => {
        localStorage.removeItem(`dm_${key}_${user.name}`);
      });

      triggerToast('Akun dan memori berhasil dihapus selamanya. Sampai jumpa lagi! 🐾', 'info');
      logout();
      navigate('/');
    } catch (err) {
      console.error(err);
      triggerToast('Gagal menghapus akun.', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div>
        <h2 className="text-xl font-comic-title font-black text-[#2C3E35] flex items-center gap-2">
          <User className="w-6 h-6 text-[#7CA190]" /> Pengaturan Profil
        </h2>
        <p className="text-xs text-[#7CA190] font-black mt-1">Sesuaikan identitas, impianmu, dan kelola akun DayMirror-mu.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Info Card */}
        <div className="lg:col-span-1 bg-[#FFFDF9] rounded-[32px] comic-border-thick p-6 comic-shadow-md space-y-4 text-center">
          <div className="w-20 h-20 bg-[#F7D3C6] rounded-full comic-border-thick flex items-center justify-center text-4xl mx-auto comic-shadow-sm font-black text-[#7A3F35] transform -rotate-3">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h3 className="font-comic-title font-black text-lg text-[#2C3E35] leading-tight">{user.name}</h3>
            {user.email && <p className="text-xs text-[#7CA190] font-bold truncate max-w-full">{user.email}</p>}
            <p className="text-[10px] text-[#7CA190] font-black uppercase tracking-wider block mt-1">Anggota Sejak {user.joinedAt}</p>
          </div>

          <div className="pt-4 border-t-2 border-dashed border-[#2C3E35] grid grid-cols-2 gap-4">
            <div className="bg-[#FFF6E0] p-3 rounded-2xl comic-border-thin comic-shadow-sm">
              <Flame className="w-6 h-6 text-[#EBB39C] mx-auto mb-1 animate-pulse" />
              <span className="block text-[10px] font-black text-[#7CA190]">STREAK</span>
              <strong className="text-sm font-black text-[#2C3E35]">{user.streak || 0} Hari</strong>
            </div>
            <div className="bg-[#E2F0D9] p-3 rounded-2xl comic-border-thin comic-shadow-sm">
              <Target className="w-6 h-6 text-[#7CA190] mx-auto mb-1" />
              <span className="block text-[9px] font-black text-[#7CA190]">TARGET UTAMA</span>
              <strong className="text-[10px] block font-black text-[#2C3E35] truncate">
                {GOAL_OPTIONS.find(o => o.id === user.goal)?.label || 'Mindfulness'}
              </strong>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white hover:bg-[#FCE4D6] text-xs font-black text-[#2C3E35] hover:text-[#843C0C] comic-border-thin transition-all comic-shadow-sm bouncy-hover"
          >
            <LogOut className="w-4 h-4" /> Keluar dari Akun (Logout)
          </button>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 bg-[#FFFDF9] rounded-[32px] comic-border-thick p-6 comic-shadow-md space-y-6">
          <h4 className="font-comic-title font-black text-base text-[#2C3E35] border-b-2 border-dashed border-[#2C3E35] pb-2">
            ✏️ Sunting Identitas Petualangan
          </h4>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="block text-xs font-black text-[#2C3E35] mb-2 uppercase tracking-wider">
                🌟 Nama Pengguna
              </label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full p-4 rounded-2xl comic-border-thin bg-white focus:bg-[#FFFDF9] text-base font-bold text-[#2C3E35] focus:outline-none focus:ring-2 focus:ring-[#7CA190]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#2C3E35] mb-2 uppercase tracking-wider">
                📧 Alamat Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="w-full p-4 rounded-2xl comic-border-thin bg-white focus:bg-[#FFFDF9] text-base font-bold text-[#2C3E35] focus:outline-none focus:ring-2 focus:ring-[#7CA190]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#2C3E35] mb-2 uppercase tracking-wider">
                🔒 Ubah Kata Sandi Akun
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-4 rounded-2xl comic-border-thin bg-white focus:bg-[#FFFDF9] text-base font-bold text-[#2C3E35] focus:outline-none focus:ring-2 focus:ring-[#7CA190]"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#2C3E35] mb-3 uppercase tracking-wider">
                🎯 Target & Fokus Utama Pekan Ini
              </label>
              <div className="space-y-3">
                {GOAL_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedGoal(opt.id)}
                    className={`w-full text-left p-4 rounded-2xl comic-border-thin transition-all flex items-start gap-3 bouncy-hover ${
                      selectedGoal === opt.id ? `${opt.color} comic-shadow-sm` : 'bg-white hover:bg-[#FDFBF7]'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{opt.icon}</span>
                    <div>
                      <p className="font-black text-xs md:text-sm">{opt.label}</p>
                      <p className="text-[10px] md:text-xs opacity-75 font-bold mt-0.5">{opt.desc}</p>
                    </div>
                    {selectedGoal === opt.id && <span className="ml-auto text-lg">✅</span>}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#7CA190] hover:bg-[#6A8B7C] text-white font-black py-4 px-6 rounded-2xl comic-border-thick comic-shadow-md transition-all flex items-center justify-center gap-3 text-base bouncy-hover"
            >
              <Save className="w-5 h-5" /> Simpan Perubahan Profil
            </button>
          </form>
        </div>
      </div>

      {/* Account Deletion Section */}
      <div className="bg-[#FFFDF9] rounded-[32px] comic-border-thick p-6 comic-shadow-md border-red-200">
        <div className="flex items-center gap-2 text-red-500 mb-3">
          <AlertTriangle className="w-5 h-5" />
          <h4 className="font-comic-title font-black text-sm uppercase tracking-wider">Area Bahaya (Danger Zone)</h4>
        </div>

        <p className="text-xs font-bold text-[#7CA190] mb-4">
          Tindakan ini permanen. Seluruh isi buku harian, status streak, stiker, dan laporan analisis yang dikelola akun ini akan terhapus selamanya dari memori penyimpanan.
        </p>

        {confirmDelete ? (
          <form onSubmit={handleDeleteAccount} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-black text-[#2C3E35] mb-2 uppercase tracking-wider">
                Masukkan Kata Sandi untuk Mengonfirmasi Penghapusan
              </label>
              <input
                type="password"
                required
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                placeholder="Kata sandi saat ini..."
                className="w-full p-4 rounded-2xl comic-border-thin bg-white text-base font-bold text-[#2C3E35] focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-red-500 hover:bg-red-600 text-white font-black py-2.5 px-5 rounded-2xl text-xs comic-shadow-sm transition-all bouncy-hover"
              >
                Hapus Akun Selamanya 🗑️
              </button>
              <button
                type="button"
                onClick={() => { setConfirmDelete(false); setDeletePassword(''); }}
                className="bg-white hover:bg-gray-100 comic-border-thin text-[#2C3E35] font-black py-2.5 px-5 rounded-2xl text-xs transition-all bouncy-hover"
              >
                Batal
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-xs font-black text-red-600 comic-border-thin border-red-300 transition-all bouncy-hover"
          >
            <Trash2 className="w-4 h-4" /> Hapus Akun & Data DayMirror
          </button>
        )}
      </div>
    </div>
  );
}
