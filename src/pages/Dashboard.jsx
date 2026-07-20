import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Sparkle, TrendingUp, MessageSquare, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOOD_OPTIONS } from '../data/constants';

export default function Dashboard() {
  const {
    user, aiCompanion, reflections,
    dailyGoals, setDailyGoals,
    scrapbookStickers, setScrapbookStickers,
    triggerToast
  } = useApp();
  const navigate = useNavigate();

  const toggleGoal = (id) => {
    setDailyGoals(prev => prev.map(g => g.id === id ? { ...g, done: !g.done } : g));
    triggerToast('Yeeeay! Target diperbarui! 🎉', 'success');
  };

  const addSticker = (emoji, label) => {
    const x = Math.floor(Math.random() * 70) + 10;
    const y = Math.floor(Math.random() * 60) + 15;
    const rotate = Math.floor(Math.random() * 40) - 20;
    setScrapbookStickers(prev => [...prev, { id: Date.now(), emoji, x, y, rotate, label }]);
    triggerToast(`Stiker ${emoji} ditempel! 🌸`, 'success');
  };

  const clearStickers = () => {
    setScrapbookStickers([]);
    triggerToast('Papan dibersihkan! ✨', 'info');
  };

  const latest = reflections[0];
  const moodInfo = MOOD_OPTIONS.find(o => o.value === latest?.mood);

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="bg-[#FFFDF9] rounded-[32px] comic-border-thick p-6 comic-shadow-md flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#FFF6E0] comic-border-thick flex items-center justify-center text-4xl shrink-0 animate-wobble-slow relative">
            <span>{aiCompanion.avatar}</span>
            <span className="absolute -top-1 -right-1 text-xs bg-[#7CA190] text-white p-1 rounded-full border border-[#2C3E35] leading-none">AI</span>
          </div>
          <div>
            <span className="bg-[#F7D3C6] px-2 py-0.5 rounded-full text-[9px] font-black border border-[#2C3E35] text-[#2C3E35] uppercase">Sapaan Hangat</span>
            <h2 className="text-xl font-comic-title font-black text-[#2C3E35] mt-1">
              "Hai {user?.name}! Temani aku, {aiCompanion.name}, bercerita malam ini!"
            </h2>
            <p className="text-xs font-bold text-[#7CA190]">Satu cerita kecil darimu bisa membantuku menyulam diagram kehidupanmu yang indah. 🌸🧸</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/reflect')}
          className="flex-1 md:flex-none bg-[#EBB39C] hover:bg-[#F2B8A2] comic-border-thick text-[#2C3E35] font-black py-3.5 px-6 rounded-2xl comic-shadow-sm transition-all text-xs shrink-0 flex items-center justify-center gap-2 bouncy-hover"
        >
          <MessageSquare className="w-4 h-4" /> Mulai Obrolan
        </button>
      </div>

      {/* Scrapbook */}
      <div className="bg-[#FFFDF9] rounded-[32px] comic-border-thick p-5 comic-shadow-md relative overflow-hidden grid-scrapbook min-h-[160px]">
        <div className="absolute top-2 right-4 flex items-center gap-2 z-10">
          {[['🌟','Bintang'],['🥑','Alpukat'],['👑','Juara']].map(([e,l]) => (
            <button key={e} onClick={() => addSticker(e, l)}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#FFF6E0] comic-border-thin text-xs font-black flex items-center justify-center shadow-sm">
              {e}
            </button>
          ))}
          <button onClick={clearStickers} className="text-[10px] font-black px-2 py-1 bg-red-100 border border-[#2C3E35] rounded-lg text-red-600 hover:bg-red-200">
            Bersihkan
          </button>
        </div>

        <div className="mb-2">
          <h4 className="font-comic-title font-black text-sm text-[#2C3E35] flex items-center gap-1">🎨 Papan Scrapbook Impian</h4>
          <p className="text-[10px] font-bold text-[#7CA190]">Ketuk tombol di atas untuk menempelkan stiker lucu!</p>
        </div>

        <div className="relative h-24">
          {scrapbookStickers.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 font-bold">
              Papan ini sepi... Ayo tempelkan stiker motivasi! 🌸
            </div>
          ) : (
            scrapbookStickers.map(stk => (
              <div
                key={stk.id}
                style={{ left: `${stk.x}%`, top: `${stk.y - 10}px`, transform: `rotate(${stk.rotate}deg)` }}
                className="absolute bg-white px-2 py-1 rounded-xl comic-border-thin text-xs font-black flex items-center gap-1 comic-shadow-sm select-none cursor-grab"
                title="Klik ganda untuk melepas"
                onDoubleClick={() => {
                  setScrapbookStickers(prev => prev.filter(s => s.id !== stk.id));
                  triggerToast('Stiker dilepas! 🐾', 'info');
                }}
              >
                <span>{stk.emoji}</span>
                <span className="text-[9px] text-[#7CA190] font-black">{stk.label}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Checklist + Latest entry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Checklist */}
        <div className="md:col-span-1 bg-[#FFFDF9] rounded-3xl comic-border-thick p-5 comic-shadow-md space-y-4">
          <div className="flex justify-between items-center pb-2 border-b-2 border-dashed border-[#2C3E35]">
            <h3 className="font-comic-title font-black text-sm text-[#2C3E35] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#7CA190]" /> Misi Hari Ini!
            </h3>
            <span className="text-[9px] bg-[#F7D3C6] px-2 py-0.5 rounded-full font-black border border-[#2C3E35]">Misi</span>
          </div>

          <div className="space-y-3">
            {dailyGoals.map(g => (
              <div
                key={g.id}
                onClick={() => toggleGoal(g.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl comic-border-thin cursor-pointer transition-all bouncy-hover ${
                  g.done ? 'bg-slate-100 text-slate-400 line-through' : 'bg-white text-[#2C3E35] comic-shadow-sm'
                }`}
              >
                <span className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                  g.done ? 'bg-[#7CA190] border-[#2C3E35] text-white' : 'border-[#2C3E35] bg-white'
                }`}>
                  {g.done && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                </span>
                <span className="text-xs font-black leading-tight">{g.text}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#FFF6E0] rounded-xl comic-border-thin text-[10px] text-[#745E1B] font-black leading-relaxed">
            💡 <strong>Tips:</strong> Kamu bisa ubah nama dan wujud AI-ku lewat menu "Ubah Teman AI"! 🦊
          </div>
        </div>

        {/* Latest reflection */}
        <div className="md:col-span-2 bg-[#FFFDF9] rounded-3xl comic-border-thick p-5 comic-shadow-md space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2 border-b-2 border-dashed border-[#2C3E35]">
              <h3 className="font-comic-title font-black text-sm text-[#2C3E35] flex items-center gap-1.5">
                <Sparkle className="w-4 h-4 text-[#7CA190]" /> Lembaran Diary Terakhir
              </h3>
              {latest && <span className="text-[10px] bg-[#FFF6E0] px-2.5 py-0.5 rounded-full font-black comic-border-thin">{latest.date}</span>}
            </div>

            {latest ? (
              <div className="space-y-4 mt-2">
                <span className="text-xs bg-[#F7D3C6] px-3 py-1 rounded-full font-black border-2 border-[#2C3E35] comic-shadow-sm inline-block">
                  Mood: {moodInfo?.emoji || '🌈'} {moodInfo?.label || 'Biasa'}
                </span>
                <div className="bg-white p-4 rounded-2xl comic-border-thin relative comic-shadow-sm">
                  <span className="absolute -top-3 -right-2 text-2xl rotate-12">📌</span>
                  <h4 className="text-[9px] font-black text-[#7CA190] uppercase tracking-wider mb-1">Catatan:</h4>
                  <p className="text-xs text-[#2C3E35] font-black italic leading-relaxed">"{latest.good_things}"</p>
                </div>
                <div className="p-4 bg-[#E2F0D9] rounded-2xl comic-border-thick comic-shadow-sm space-y-2">
                  <h4 className="text-xs font-black text-[#3B6628]">✨ Pesan dari {aiCompanion.name}:</h4>
                  <p className="text-xs text-[#3B6628] font-bold leading-relaxed">{latest.ai_summary}</p>
                  <div className="pt-2 border-t border-[#A8D08D] border-dashed">
                    <p className="text-[10px] text-[#3B6628] font-black">🎯 <strong>Rencana Besok:</strong> {latest.ai_advice}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-[#7CA190] space-y-3">
                <span className="text-4xl block">🧸</span>
                <p className="text-xs font-black">Belum ada obrolan terekam. Ketuk "Mulai Obrolan" untuk memulai!</p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/journal')}
            className="w-full text-center text-xs font-black text-[#7CA190] hover:text-[#2C3E35] flex items-center justify-center gap-1 mt-4 transition-all"
          >
            Buka Album Memorimu Selengkapnya →
          </button>
        </div>
      </div>

      {/* Weekly CTA */}
      <div className="bg-[#7CA190] border-4 border-[#2C3E35] rounded-[32px] p-6 text-white comic-shadow-md flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-2 right-12 text-7xl opacity-10 font-comic-title font-black select-none rotate-12">TICKET</div>
        <div className="space-y-1 text-center md:text-left">
          <span className="bg-[#F7D3C6] text-[#2C3E35] border-2 border-[#2C3E35] text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider comic-shadow-sm">Laporan Ajaib</span>
          <h3 className="text-xl font-comic-title font-black mt-2 text-[#FFFDF9]">Petakan Petualanganmu Pekan Ini</h3>
          <p className="text-xs text-[#FFF6E0] font-bold">Aku akan merangkum seluruh tantangan harianmu menjadi panduan komik yang luar biasa!</p>
        </div>
        <button
          onClick={() => navigate('/weekly')}
          className="bg-[#FFF6E0] hover:bg-[#FDFBF7] comic-border-thick text-[#2C3E35] font-black py-3.5 px-6 rounded-2xl comic-shadow-sm transition-all text-xs shrink-0 flex items-center gap-2 bouncy-hover"
        >
          <TrendingUp className="w-4 h-4" /> Tenun Analisis Sekarang
        </button>
      </div>

    </div>
  );
}
