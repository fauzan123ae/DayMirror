import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Trash2, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOOD_OPTIONS } from '../data/constants';

export default function Journal() {
  const { reflections, aiCompanion, deleteReflection } = useApp();
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState(null);

  const handleDelete = (id) => {
    deleteReflection(id);
    setConfirmId(null);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-comic-title font-black text-[#2C3E35] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#7CA190]" /> Album Memorimu Harian
          </h2>
          <p className="text-xs text-[#7CA190] font-black mt-1">Perjalanan panjang dan tumpukan warna emosi yang sukses kamu lalui.</p>
        </div>
        <span className="text-xs bg-[#FFF6E0] comic-border-thick text-[#2C3E35] px-3 py-1.5 rounded-full font-black comic-shadow-sm">
          {reflections.length} Lembar Memori
        </span>
      </div>

      {reflections.length > 0 ? (
        <div className="space-y-6">
          {reflections.map((r, index) => {
            const moodInfo = MOOD_OPTIONS.find(o => o.value === r.mood);
            const isConfirming = confirmId === r.id;

            return (
              <div
                key={r.id}
                style={{ transform: `rotate(${index % 2 === 0 ? 0.5 : -0.5}deg)` }}
                className="bg-[#FFFDF9] rounded-[32px] comic-border-thick p-5 comic-shadow-md space-y-4 hover:border-[#7CA190] transition-all relative"
              >
                <span className="absolute -top-3.5 right-14 text-3xl">🧩</span>

                {/* Tombol hapus dengan konfirmasi */}
                <div className="absolute -top-3 right-4">
                  {isConfirming ? (
                    <div className="flex items-center gap-1.5 bg-white comic-border-thick rounded-2xl px-3 py-1.5 comic-shadow-sm z-10">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span className="text-[10px] font-black text-[#2C3E35]">Yakin hapus?</span>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-[10px] font-black text-white bg-red-500 px-2 py-0.5 rounded-lg hover:bg-red-600 transition-all"
                      >
                        Hapus
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="text-[10px] font-black text-[#7CA190] hover:text-[#2C3E35] transition-all"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(r.id)}
                      className="w-8 h-8 bg-white hover:bg-[#FCE4D6] comic-border-thin rounded-xl flex items-center justify-center transition-all comic-shadow-sm group"
                      title="Hapus jurnal ini"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#7CA190] group-hover:text-red-500 transition-colors" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b-2 border-dashed border-[#2C3E35]">
                  <span className="text-xs font-black text-[#2C3E35] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#7CA190]" /> {r.date}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full comic-border-thin font-black ${moodInfo?.color || 'bg-slate-100'}`}>
                    Mood: {moodInfo?.emoji || '☁️'} {moodInfo?.label || 'Biasa'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-[#E2F0D9] p-3.5 rounded-2xl comic-border-thin comic-shadow-sm">
                    <h4 className="font-comic-title font-black text-[#3B6628] mb-1">✨ Hal Manis:</h4>
                    <p className="text-[#3B6628] font-bold leading-relaxed">"{r.good_things}"</p>
                  </div>
                  <div className="bg-[#FCE4D6] p-3.5 rounded-2xl comic-border-thin comic-shadow-sm">
                    <h4 className="font-comic-title font-black text-[#843C0C] mb-1">🌧️ Tantangan:</h4>
                    <p className="text-[#843C0C] font-bold leading-relaxed">"{r.obstacles}"</p>
                  </div>
                  <div className="bg-[#E3EDF7] p-3.5 rounded-2xl comic-border-thin comic-shadow-sm">
                    <h4 className="font-comic-title font-black text-[#315C87] mb-1">🎯 Jurus Besok:</h4>
                    <p className="text-[#315C87] font-bold leading-relaxed">"{r.tomorrow_goal}"</p>
                  </div>
                </div>

                <div className="bg-[#FFF6E0] p-4 rounded-2xl comic-border-thin space-y-2">
                  <h4 className="text-xs font-black text-[#745E1B] flex items-center gap-1.5">
                    💬 Kata Indah dari {aiCompanion.name}:
                  </h4>
                  <p className="text-xs text-[#745E1B] font-bold leading-relaxed">{r.ai_summary}</p>
                  <div className="pt-2 border-t-2 border-dashed border-[#F4D068] text-[10px] text-[#745E1B] font-black">
                    <strong>🎯 Taktik Lucu Besok:</strong> {r.ai_advice}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#FFFDF9] rounded-[32px] comic-border-thick p-12 text-center space-y-4 comic-shadow-md">
          <span className="text-5xl block animate-bounce">📦</span>
          <div>
            <h3 className="font-comic-title font-black text-lg text-[#2C3E35]">Buku harianmu masih kosong</h3>
            <p className="text-xs text-[#7CA190] font-black mt-1">Mulai bercermin malam ini untuk merekam jejak petualangan berhargamu.</p>
          </div>
          <button
            onClick={() => navigate('/reflect')}
            className="bg-[#EBB39C] hover:bg-[#F2B8A2] text-[#2C3E35] comic-border-thin font-black py-2.5 px-5 rounded-xl text-xs comic-shadow-sm transition-all"
          >
            Buka Cermin Sekarang
          </button>
        </div>
      )}
    </div>
  );
}
