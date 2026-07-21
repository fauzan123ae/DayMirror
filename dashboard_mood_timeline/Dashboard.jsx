import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Sparkle, TrendingUp, MessageSquare, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOOD_OPTIONS } from '../data/constants';

function getMoodTimeline(reflections) {
  const today = new Date();
  const days = [];
  const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const reflection = reflections.find(r => r.date === dateStr);
    days.push({
      dateStr,
      dayLabel: i === 0 ? 'Hari ini' : DAY_LABELS[d.getDay()],
      dayNum: d.getDate(),
      isToday: i === 0,
      reflection: reflection || null,
    });
  }
  return days;
}

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

  const timeline = useMemo(() => getMoodTimeline(reflections), [reflections]);
  const filledDays = timeline.filter(d => d.reflection).length;
  const moodCounts = useMemo(() => {
    const counts = {};
    timeline.forEach(d => {
      if (d.reflection?.mood) counts[d.reflection.mood] = (counts[d.reflection.mood] || 0) + 1;
    });
    return counts;
  }, [timeline]);
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const dominantMoodInfo = MOOD_OPTIONS.find(o => o.value === dominantMood);

  return (
    <div className="space-y-5">

      {/* Welcome banner */}
      <div className="bg-[#FFFDF9] rounded-[28px] md:rounded-[32px] comic-border-thick p-4 md:p-6 comic-shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#FFF6E0] comic-border-thick flex items-center justify-center text-3xl md:text-4xl shrink-0 animate-wobble-slow relative">
              <span>{aiCompanion.avatar}</span>
              <span className="absolute -top-1 -right-1 text-[10px] bg-[#7CA190] text-white p-0.5 rounded-full border border-[#2C3E35] leading-none">AI</span>
            </div>
            <div className="min-w-0">
              <span className="bg-[#F7D3C6] px-2 py-0.5 rounded-full text-[9px] font-black border border-[#2C3E35] text-[#2C3E35] uppercase">Sapaan Hangat</span>
              <h2 className="text-base md:text-xl font-comic-title font-black text-[#2C3E35] mt-1 leading-tight">
                "Hai {user?.name}! Temani aku, {aiCompanion.name}, bercerita malam ini!"
              </h2>
              <p className="text-xs font-bold text-[#7CA190] mt-0.5 hidden sm:block">
                Satu cerita kecil darimu bisa membantuku menyulam diagram kehidupanmu yang indah. 🌸🧸
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/reflect')}
            className="w-full sm:w-auto bg-[#EBB39C] hover:bg-[#F2B8A2] comic-border-thick text-[#2C3E35] font-black py-3 px-5 rounded-2xl comic-shadow-sm transition-all text-xs shrink-0 flex items-center justify-center gap-2 bouncy-hover"
          >
            <MessageSquare className="w-4 h-4" /> Mulai Obrolan
          </button>
        </div>
      </div>

      {/* Mood Timeline */}
      <div className="bg-[#FFFDF9] rounded-[28px] md:rounded-[32px] comic-border-thick p-4 md:p-5 comic-shadow-md">
        <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-dashed border-[#2C3E35]">
          <div>
            <h3 className="font-comic-title font-black text-sm text-[#2C3E35]">🌈 Jejak Mood 7 Hari</h3>
            <p className="text-[10px] font-bold text-[#7CA190]">Pola perasaanmu sepanjang minggu ini</p>
          </div>
          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full comic-border-thin ${
            filledDays >= 5 ? 'bg-[#E2F0D9] text-[#3B6628]' :
            filledDays >= 3 ? 'bg-[#FFF6E0] text-[#745E1B]' :
            'bg-[#FCE4D6] text-[#843C0C]'
          }`}>
            {filledDays}/7 hari ✍️
          </span>
        </div>

        {/* Day dots */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {timeline.map((day) => {
            const mood = MOOD_OPTIONS.find(o => o.value === day.reflection?.mood);
            return (
              <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center text-lg md:text-xl transition-all ${
                  day.reflection
                    ? day.isToday
                      ? 'bg-[#FFF6E0] comic-border-thick comic-shadow-sm scale-110'
                      : 'bg-white comic-border-thin'
                    : 'bg-[#F0EDE8] comic-border-thin'
                }`}>
                  {day.reflection ? (
                    <span title={mood?.label}>{mood?.emoji || '🌈'}</span>
                  ) : (
                    <span className="text-[#C8C0B8] text-xs font-black">—</span>
                  )}
                </div>
                <span className={`text-[9px] font-black text-center leading-tight ${
                  day.isToday ? 'text-[#7CA190]' : 'text-[#B0A898]'
                }`}>
                  {day.dayLabel}
                </span>
                <span className="text-[8px] text-[#C8C0B8] font-bold">{day.dayNum}</span>
              </div>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white comic-border-thin rounded-2xl p-2.5 text-center">
            <span className="block text-base md:text-lg font-black text-[#2C3E35]">{filledDays}</span>
            <span className="text-[9px] font-black text-[#7CA190] leading-tight">Hari nulis</span>
          </div>
          <div className="bg-white comic-border-thin rounded-2xl p-2.5 text-center">
            <span className="block text-base md:text-lg">
              {dominantMoodInfo ? dominantMoodInfo.emoji : '—'}
            </span>
            <span className="text-[9px] font-black text-[#7CA190] leading-tight">Mood dominan</span>
          </div>
          <div className="bg-white comic-border-thin rounded-2xl p-2.5 text-center">
            <span className="block text-base md:text-lg font-black text-[#2C3E35]">{7 - filledDays}</span>
            <span className="text-[9px] font-black text-[#7CA190] leading-tight">Hari skip</span>
          </div>
        </div>

        {/* Nudge kalau belum isi hari ini */}
        {!timeline[6].reflection && (
          <div
            onClick={() => navigate('/reflect')}
            className="mt-3 p-3 bg-[#FFF6E0] comic-border-thin rounded-2xl flex items-center gap-2 cursor-pointer hover:bg-[#FDF3CD] transition-all"
          >
            <span className="text-lg animate-bounce">✍️</span>
            <p className="text-[10px] font-black text-[#745E1B]">
              Kamu belum bercermin hari ini! Yuk isi jurnalmu sekarang →
            </p>
          </div>
        )}
      </div>

      {/* Scrapbook */}
      <div className="bg-[#FFFDF9] rounded-[28px] md:rounded-[32px] comic-border-thick p-4 md:p-5 comic-shadow-md relative overflow-hidden grid-scrapbook min-h-[140px] md:min-h-[160px]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="font-comic-title font-black text-sm text-[#2C3E35] flex items-center gap-1">🎨 Papan Scrapbook</h4>
            <p className="text-[10px] font-bold text-[#7CA190]">Ketuk stiker untuk menempelkan!</p>
          </div>
          <div className="flex items-center gap-1.5">
            {[['🌟','Bintang'],['🥑','Alpukat'],['👑','Juara']].map(([e, l]) => (
              <button
                key={e}
                onClick={() => addSticker(e, l)}
                className="w-8 h-8 rounded-full bg-white hover:bg-[#FFF6E0] comic-border-thin text-base flex items-center justify-center shadow-sm active:scale-90 transition-transform"
              >
                {e}
              </button>
            ))}
            <button
              onClick={clearStickers}
              className="text-[10px] font-black px-2 py-1 bg-red-100 border border-[#2C3E35] rounded-lg text-red-600 hover:bg-red-200 active:scale-95 transition-transform"
            >
              Bersih
            </button>
          </div>
        </div>

        <div className="relative h-20 md:h-24">
          {scrapbookStickers.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 font-bold text-center px-4">
              Papan ini sepi... Ayo tempelkan stiker motivasi! 🌸
            </div>
          ) : (
            scrapbookStickers.map(stk => (
              <div
                key={stk.id}
                style={{ left: `${stk.x}%`, top: `${stk.y - 10}px`, transform: `rotate(${stk.rotate}deg)` }}
                className="absolute bg-white px-2 py-1 rounded-xl comic-border-thin text-xs font-black flex items-center gap-1 comic-shadow-sm select-none cursor-grab active:scale-95"
                onDoubleClick={() => {
                  setScrapbookStickers(prev => prev.filter(s => s.id !== stk.id));
                  triggerToast('Stiker dilepas! 🐾', 'info');
                }}
              >
                <span>{stk.emoji}</span>
                <span className="text-[9px] text-[#7CA190] font-black hidden sm:inline">{stk.label}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Checklist + Latest entry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Checklist */}
        <div className="md:col-span-1 bg-[#FFFDF9] rounded-[28px] comic-border-thick p-4 md:p-5 comic-shadow-md space-y-3 md:space-y-4">
          <div className="flex justify-between items-center pb-2 border-b-2 border-dashed border-[#2C3E35]">
            <h3 className="font-comic-title font-black text-sm text-[#2C3E35] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#7CA190]" /> Misi Hari Ini!
            </h3>
            <span className="text-[9px] bg-[#F7D3C6] px-2 py-0.5 rounded-full font-black border border-[#2C3E35]">Misi</span>
          </div>

          <div className="space-y-2 md:space-y-3">
            {dailyGoals.map(g => (
              <div
                key={g.id}
                onClick={() => toggleGoal(g.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl comic-border-thin cursor-pointer transition-all active:scale-98 bouncy-hover ${
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
            💡 <strong>Tips:</strong> Ubah nama dan wujud AI-ku lewat "Ubah Teman AI"! 🦊
          </div>
        </div>

        {/* Latest reflection */}
        <div className="md:col-span-2 bg-[#FFFDF9] rounded-[28px] comic-border-thick p-4 md:p-5 comic-shadow-md space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2 border-b-2 border-dashed border-[#2C3E35]">
              <h3 className="font-comic-title font-black text-sm text-[#2C3E35] flex items-center gap-1.5">
                <Sparkle className="w-4 h-4 text-[#7CA190]" /> Lembaran Diary Terakhir
              </h3>
              {latest && (
                <span className="text-[10px] bg-[#FFF6E0] px-2.5 py-0.5 rounded-full font-black comic-border-thin">{latest.date}</span>
              )}
            </div>

            {latest ? (
              <div className="space-y-3 mt-2">
                <span className="text-xs bg-[#F7D3C6] px-3 py-1 rounded-full font-black border-2 border-[#2C3E35] comic-shadow-sm inline-block">
                  Mood: {moodInfo?.emoji || '🌈'} {moodInfo?.label || 'Biasa'}
                </span>
                <div className="bg-white p-3 md:p-4 rounded-2xl comic-border-thin relative comic-shadow-sm">
                  <span className="absolute -top-3 -right-2 text-2xl rotate-12">📌</span>
                  <h4 className="text-[9px] font-black text-[#7CA190] uppercase tracking-wider mb-1">Catatan:</h4>
                  <p className="text-xs text-[#2C3E35] font-black italic leading-relaxed">"{latest.good_things}"</p>
                </div>
                <div className="p-3 md:p-4 bg-[#E2F0D9] rounded-2xl comic-border-thick comic-shadow-sm space-y-2">
                  <h4 className="text-xs font-black text-[#3B6628]">✨ Pesan dari {aiCompanion.name}:</h4>
                  <p className="text-xs text-[#3B6628] font-bold leading-relaxed">{latest.ai_summary}</p>
                  <div className="pt-2 border-t border-[#A8D08D] border-dashed">
                    <p className="text-[10px] text-[#3B6628] font-black">🎯 <strong>Rencana Besok:</strong> {latest.ai_advice}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-[#7CA190] space-y-3">
                <span className="text-4xl block">🧸</span>
                <p className="text-xs font-black">Belum ada obrolan terekam. Ketuk "Mulai Obrolan" untuk memulai!</p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/journal')}
            className="w-full text-center text-xs font-black text-[#7CA190] hover:text-[#2C3E35] flex items-center justify-center gap-1 mt-2 transition-all py-2"
          >
            Buka Album Memorimu Selengkapnya →
          </button>
        </div>
      </div>

      {/* Weekly CTA */}
      <div className="bg-[#7CA190] border-4 border-[#2C3E35] rounded-[28px] md:rounded-[32px] p-4 md:p-6 text-white comic-shadow-md flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
        <div className="absolute top-2 right-12 text-7xl opacity-10 font-comic-title font-black select-none rotate-12">TICKET</div>
        <div className="space-y-1 text-center sm:text-left">
          <span className="bg-[#F7D3C6] text-[#2C3E35] border-2 border-[#2C3E35] text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider comic-shadow-sm">
            Laporan Ajaib
          </span>
          <h3 className="text-lg md:text-xl font-comic-title font-black mt-2 text-[#FFFDF9]">
            Petakan Petualanganmu Pekan Ini
          </h3>
          <p className="text-xs text-[#FFF6E0] font-bold">
            Aku akan merangkum seluruh tantangan harianmu menjadi panduan komik yang luar biasa!
          </p>
        </div>
        <button
          onClick={() => navigate('/weekly')}
          className="w-full sm:w-auto bg-[#FFF6E0] hover:bg-[#FDFBF7] comic-border-thick text-[#2C3E35] font-black py-3 px-5 rounded-2xl comic-shadow-sm transition-all text-xs shrink-0 flex items-center justify-center gap-2 bouncy-hover"
        >
          <TrendingUp className="w-4 h-4" /> Tenun Analisis Sekarang
        </button>
      </div>

    </div>
  );
}
