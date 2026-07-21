import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BrainCircuit, Bell, Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GOAL_OPTIONS } from '../data/constants';
import CompanionModal from './CompanionModal';

export default function Header() {
  const { user, aiCompanion, triggerToast } = useApp();
  const navigate = useNavigate();

  const [showModal, setShowModal]  = useState(false);
  const [showNotif, setShowNotif]  = useState(false);
  const [notifications, setNotifs] = useState([
    { id: 1, text: 'Waktunya bercermin hari ini! ✨', time: '20:00', read: false }
  ]);

  const unread = notifications.some(n => !n.read);

  return (
    <>
      <header className="bg-[#FFFDF9] border-b-4 border-[#2C3E35] sticky top-0 z-40 shadow-[0_4px_0_0_rgba(44,62,53,1)]">
        <div className="max-w-6xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-3">

          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer shrink-0"
            onClick={() => navigate(user ? '/dashboard' : '/')}
          >
            <div className="bg-[#7CA190] comic-border-thick p-1.5 md:p-2 rounded-2xl text-white comic-shadow-sm hover:rotate-6 transition-all duration-300">
              <BrainCircuit className="w-5 h-5 md:w-6 md:h-6 text-[#FFFDF9]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-comic-title font-black text-xl md:text-2xl tracking-tight text-[#2C3E35]">
                  Day<span className="text-[#EBB39C]">Mirror</span>
                </span>
                <span className="text-lg md:text-xl animate-bounce">🪞</span>
              </div>
              <p className="hidden md:block text-[10px] text-[#7CA190] font-black tracking-wider uppercase">
                Your Comic Diary & AI Companion
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2 md:gap-4">
              {/* Companion badge — desktop only */}
              <div
                onClick={() => setShowModal(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#FFF6E0] hover:bg-[#FDF3CD] comic-border-thin rounded-2xl cursor-pointer text-xs font-black text-[#2C3E35] transition-all comic-shadow-sm hover:-translate-y-0.5"
              >
                <span className="text-lg animate-pulse">{aiCompanion.avatar}</span>
                <span>Companion: <span className="text-[#7CA190]">{aiCompanion.name}</span></span>
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              </div>

              {/* Companion avatar mobile — tap to edit */}
              <button
                onClick={() => setShowModal(true)}
                className="md:hidden w-8 h-8 rounded-xl bg-[#FFF6E0] comic-border-thin flex items-center justify-center text-lg comic-shadow-sm"
                title="Ubah Companion"
              >
                {aiCompanion.avatar}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotif(!showNotif)}
                  className="p-2 md:p-2.5 rounded-xl bg-white comic-border-thin hover:bg-[#F8F5EE] transition-all text-[#2C3E35] relative comic-shadow-sm hover:scale-105"
                >
                  <Bell className="w-4 h-4 md:w-5 md:h-5" />
                  {unread && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-[#EBB39C] rounded-full border-2 border-[#2C3E35]" />
                  )}
                </button>
                {showNotif && (
                  <div className="absolute right-0 mt-3 w-72 md:w-80 bg-[#FFFDF9] comic-border-thick rounded-3xl comic-shadow-md p-4 md:p-5 z-50">
                    <div className="flex justify-between items-center mb-3 border-b-2 border-dashed border-[#2C3E35] pb-2">
                      <h4 className="font-comic-title font-black text-sm text-[#2C3E35]">📢 Kabar Baru!</h4>
                      <button
                        onClick={() => { setNotifs(n => n.map(x => ({ ...x, read: true }))); setShowNotif(false); }}
                        className="text-[10px] font-black text-[#7CA190] hover:underline"
                      >
                        Baca semua
                      </button>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-3 rounded-2xl text-xs comic-border-thin ${n.read ? 'bg-[#FFFDF9]' : 'bg-[#FFF6E0]'}`}>
                          <div className="flex justify-between items-start gap-1 mb-1">
                            <span className="font-bold text-[#2C3E35]">{n.text}</span>
                            <span className="text-[9px] text-[#7CA190] font-black whitespace-nowrap">{n.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User badge */}
              <div
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 md:gap-3.5 md:border-l-4 md:border-dashed md:border-[#2C3E35] md:pl-4 cursor-pointer group"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#F7D3C6] comic-border-thin text-[#7A3F35] font-black flex items-center justify-center comic-shadow-sm transform -rotate-3 text-sm md:text-base group-hover:scale-105 transition-transform">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-black text-[#2C3E35] leading-3 group-hover:text-[#7CA190] transition-colors">
                    {user.name}
                  </p>
                  <span className="text-[9px] text-[#2C3E35] font-black bg-[#FDE8E2] px-2 py-0.5 rounded-full comic-border-thin mt-1.5 inline-block uppercase">
                    {GOAL_OPTIONS.find(o => o.id === user.goal)?.label || 'Mindfulness'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <CompanionModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}