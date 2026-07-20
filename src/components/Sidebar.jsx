import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Calendar, TrendingUp, Palette, Flame, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CompanionModal from './CompanionModal';

const NAV_ITEMS = [
  { path: '/dashboard',  icon: Flame,      label: 'Dashboard'        },
  { path: '/reflect',    icon: BookOpen,   label: 'Cermin Harian'    },
  { path: '/journal',    icon: Calendar,   label: 'Buku Jurnal'      },
  { path: '/weekly',     icon: TrendingUp, label: 'Laporan Mingguan' },
  { path: '/profile',    icon: User,       label: 'Profil'           },
];

export default function Sidebar() {
  const { user, aiCompanion } = useApp();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [showModal, setShowModal] = useState(false);

  if (!user) return null;

  return (
    <>
      <aside className="hidden md:flex w-56 shrink-0 flex-col gap-2">
        <nav className="bg-[#FFFDF9] rounded-[32px] comic-border-thick p-4 comic-shadow-md space-y-2 sticky top-28">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-black transition-all text-left bouncy-hover ${
                  active
                    ? 'bg-[#7CA190] text-white comic-border-thin comic-shadow-sm'
                    : 'bg-white hover:bg-[#F8F5EE] text-[#2C3E35] comic-border-thin'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t-4 border-dashed border-[#2C3E35]">
            <div className="p-4 bg-[#FFF6E0] rounded-2xl comic-border-thick comic-shadow-sm text-center">
              <div className="inline-block text-4xl animate-bounce mb-1">🔥</div>
              <h5 className="font-comic-title font-black text-lg text-[#2C3E35]">{user.streak || 0} Hari!</h5>
              <p className="text-[10px] text-[#7CA190] font-black uppercase tracking-wider mt-1">Jangan padam! 🥑</p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#E2F0D9] hover:bg-[#D4E8CB] text-xs font-black text-[#2C3E35] comic-border-thin rounded-xl transition-all"
          >
            <Palette className="w-4 h-4 text-[#3B6628]" />
            Ubah Teman AI
          </button>
        </nav>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF9] border-t-4 border-[#2C3E35] flex justify-around items-center py-2 px-2">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all ${
                active ? 'bg-[#7CA190] text-white' : 'text-[#7CA190]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="truncate max-w-[56px] text-center">{label}</span>
            </button>
          );
        })}
      </nav>

      <CompanionModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
