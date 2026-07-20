import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { AVATAR_OPTIONS } from '../data/constants';
import { useApp } from '../context/AppContext';

export default function CompanionModal({ open, onClose }) {
  const { aiCompanion, setAiCompanion, triggerToast } = useApp();
  const [name, setName]     = useState(aiCompanion.name);
  const [avatar, setAvatar] = useState(aiCompanion.avatar);

  if (!open) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) { triggerToast('Beri nama yang imut dulu! 🐾', 'error'); return; }
    setAiCompanion({ name: name.trim(), avatar });
    triggerToast(`Yay! Sekarang namaku ${name.trim()} ${avatar} ✨`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#FFFDF9] rounded-[36px] comic-border-thick comic-shadow-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4 border-b-4 border-dashed border-[#2C3E35] pb-3">
          <h3 className="text-xl font-comic-title font-bold text-[#2C3E35]">🎨 Adopsi Teman AI-mu!</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-red-100 transition-colors comic-border-thin">
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-[#2C3E35] mb-2 uppercase tracking-wide">🐾 Nama Teman:</label>
            <input
              type="text" maxLength={15} value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Misal: Koko, Bun-bun, Peri Matcha..."
              className="w-full p-3 rounded-2xl comic-border-thin bg-[#FFFDF9] focus:bg-white text-sm font-bold text-[#2C3E35] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-[#2C3E35] mb-2 uppercase tracking-wide">🔮 Pilih Avatar:</label>
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_OPTIONS.map(av => (
                <button
                  key={av.emoji} type="button"
                  onClick={() => setAvatar(av.emoji)}
                  className={`p-3 text-3xl rounded-xl comic-border-thin transition-all flex flex-col items-center ${avatar === av.emoji ? 'bg-[#F7D3C6] scale-105' : 'bg-[#FFFDF9] hover:bg-[#FFF6E0]'}`}
                  title={av.label}
                >
                  <span>{av.emoji}</span>
                  <span className="text-[9px] font-black mt-1 text-[#2C3E35] leading-none text-center truncate w-full">{av.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 bg-white text-slate-700 font-bold py-3 px-4 rounded-xl comic-border-thin">Batal</button>
            <button type="submit" className="flex-1 bg-[#7CA190] text-white font-black py-3 px-4 rounded-xl comic-border-thin comic-shadow-sm flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" /> Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
