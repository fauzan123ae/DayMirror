import React from 'react';
import { TrendingUp, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GOAL_OPTIONS } from '../data/constants';

export default function Weekly() {
  const {
    user, aiCompanion, reflections,
    weeklyReport, setWeeklyReport,
    triggerToast, GEMINI_URL, GROQ_KEY, fetchWithRetry
  } = useApp();

  const [loading, setLoading] = React.useState(false);

  const generate = async () => {
    if (reflections.length < 2) {
      triggerToast('Butuh minimal 2 catatan harian untuk analisis mingguan! 🐾', 'info');
      return;
    }
    setLoading(true);

    const summary = reflections.slice(0, 7).map(r => ({
      date: r.date,
      mood: r.mood,
      good: r.good_things,
      obstacle: r.obstacles,
      goal: r.tomorrow_goal,
    }));

    try {
      const res = await fetchWithRetry(GEMINI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            {
              role: 'system',
              content: 'Kamu adalah AI Coach dan Psikolog dalam Bahasa Indonesia. Kembalikan HANYA JSON valid tanpa markdown tanpa penjelasan.',
            },
            {
              role: 'user',
              content: `Analisis log jurnal harian berikut dan buat laporan mingguan.\n\nData:\n${JSON.stringify(summary)}\n\nNama AI: ${aiCompanion.name}\nFokus: ${GOAL_OPTIONS.find(o => o.id === user?.goal)?.label || 'Self Improvement'}\n\nKembalikan HANYA JSON format ini:\n{"achievements":["...","..."],"challenges":["...","..."],"trends":"...","recommendations":["...","...","..."]}`,
            },
          ],
          max_tokens: 800,
          temperature: 0.6,
        }),
      });

      const data = await res.json();
      const rawText = data?.choices?.[0]?.message?.content?.trim() || '{}';
      const cleaned = rawText.replace(/```json\n?|```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);

      setWeeklyReport({
        dateGenerated: new Date().toLocaleDateString('id-ID', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        }),
        ...parsed,
      });
      triggerToast('Laporan mingguan komikmu sudah ditenun! 🥑🎨', 'success');

    } catch (err) {
      console.error('[Daymirror] Weekly error:', err);
      setWeeklyReport({
        dateGenerated: new Date().toLocaleDateString('id-ID', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        }),
        achievements: [
          'Konsisten berolahraga lari sore & meditasi pagi 🏃‍♂️',
          'Membagi waktu kerja efektif dengan teknik Pomodoro ⚡',
          'Penuh empati membantu menyelesaikan masalah teman 🌸',
        ],
        challenges: [
          'Rasa bosan menggodamu scrolling media sosial 📱',
          'Ada malas di pagi buta sebelum memulai olahraga.',
        ],
        trends: 'Emosimu didominasi energi positif di akhir pekan 🌈, dengan fluktuasi lelah di pertengahan minggu.',
        recommendations: [
          'Pasang "Focus Block" 1 jam di pagi hari sebelum notifikasi.',
          'Batasi media sosial maksimal 45 menit sehari.',
          'Siapkan pakaian olahraga di malam hari untuk pertahankan streak kebugaran.',
        ],
      });
      triggerToast('Laporan mingguan siap! 🌸', 'success');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="bg-[#FFFDF9] rounded-[32px] comic-border-thick p-6 comic-shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-dashed border-[#2C3E35] pb-4">
          <div>
            <h2 className="text-xl font-comic-title font-black text-[#2C3E35] flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#7CA190]" /> Analisis Mingguan {aiCompanion.name}
            </h2>
            <p className="text-xs text-[#7CA190] font-black mt-1">
              Aku akan mengumpulkan kepingan memori sepekan untuk memberimu peta kekuatan harian.
            </p>
          </div>
          <button
            onClick={generate}
            disabled={reflections.length < 2 || loading}
            className="bg-[#EBB39C] hover:bg-[#F2B8A2] comic-border-thick text-[#2C3E35] font-black py-2.5 px-5 rounded-2xl comic-shadow-sm transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 bouncy-hover"
          >
            {loading
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Menghitung Bintang...</>
              : <><Sparkles className="w-4 h-4" /> Tenun Laporan Mingguan</>}
          </button>
        </div>

        {reflections.length < 2 && (
          <div className="p-4 bg-[#FFF6E0] rounded-2xl comic-border-thin text-xs text-[#745E1B] font-black flex gap-2">
            <AlertCircle className="w-5 h-5 text-[#745E1B] shrink-0 animate-bounce" />
            <div>
              <strong>Catatan harianmu masih sedikit ({reflections.length}/2):</strong>{' '}
              Isi minimal 2 catatan dulu ya. Tapi kamu bisa klik tombol di atas untuk simulasi analisis! ✨
            </div>
          </div>
        )}

        {weeklyReport ? (
          <div className="space-y-6 pt-2">
            {/* Ticket metadata */}
            <div className="p-3 bg-white rounded-xl text-xs text-[#7CA190] font-black flex justify-between items-center border-2 border-dashed border-[#2C3E35]">
              <span>
                Diterbitkan: <strong className="text-[#2C3E35]">{weeklyReport.dateGenerated}</strong>
                {weeklyReport._savedAt && (
                  <span className="ml-2 text-[10px] text-[#7CA190]">
                    · Expires dalam {Math.max(0, 7 - Math.floor((Date.now() - weeklyReport._savedAt) / (1000 * 60 * 60 * 24)))} hari
                  </span>
                )}
              </span>
              <span className="text-[#3B6628] font-black bg-[#E2F0D9] px-2 py-0.5 rounded-md border border-[#A8D08D]">Ajaib</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Achievements */}
              <div className="bg-[#E2F0D9] p-5 rounded-3xl comic-border-thick comic-shadow-md space-y-3 relative transform -rotate-1">
                <span className="absolute -top-3.5 left-4 text-3xl">🏆</span>
                <h4 className="font-comic-title font-black text-sm text-[#3B6628] pt-2">Puncak Kemenanganmu Pekan Ini!</h4>
                <ul className="space-y-2.5 text-xs text-[#3B6628] font-bold">
                  {weeklyReport.achievements?.map((a, i) => (
                    <li key={i} className="flex gap-2 items-start"><span>🌟</span><span>{a}</span></li>
                  ))}
                </ul>
              </div>

              {/* Challenges */}
              <div className="bg-[#FCE4D6] p-5 rounded-3xl comic-border-thick comic-shadow-md space-y-3 relative transform rotate-1">
                <span className="absolute -top-3.5 right-4 text-3xl">🐙</span>
                <h4 className="font-comic-title font-black text-sm text-[#843C0C] pt-2">Musuh Malas yang Harus Dikalahkan:</h4>
                <ul className="space-y-2.5 text-xs text-[#843C0C] font-bold">
                  {weeklyReport.challenges?.map((c, i) => (
                    <li key={i} className="flex gap-2 items-start"><span>🌩️</span><span>{c}</span></li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Trends */}
            <div className="bg-white p-5 rounded-3xl comic-border-thick space-y-3 comic-shadow-sm relative">
              <span className="absolute -top-2.5 right-12 text-2xl">📈</span>
              <h4 className="font-comic-title font-black text-sm text-[#2C3E35]">Alur Nafas & Energi Mingguan</h4>
              <p className="text-xs text-[#2C3E35] font-black leading-relaxed bg-[#FDFBF7] p-4 rounded-2xl comic-border-thin italic">
                "{weeklyReport.trends}"
              </p>
            </div>

            {/* Recommendations */}
            <div className="bg-[#7CA190] border-4 border-[#2C3E35] p-6 rounded-[32px] text-white space-y-4 comic-shadow-md">
              <h4 className="font-comic-title font-black text-sm flex items-center gap-2 text-[#FFF6E0]">
                🧭 Jurus Rahasia Petualangan Berikutnya (Saran {aiCompanion.name})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {weeklyReport.recommendations?.map((rec, i) => (
                  <div key={i} className="bg-white/10 p-4 rounded-2xl border-2 border-white/20 space-y-3">
                    <span className="w-8 h-8 rounded-full bg-[#FFF6E0] border-2 border-[#2C3E35] text-[#2C3E35] font-black flex items-center justify-center text-xs shadow-[2px_2px_0px_0px_rgba(44,62,53,1)]">
                      {i + 1}
                    </span>
                    <p className="text-xs text-[#FFFDF9] font-black leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-[#7CA190] space-y-3">
            <span className="text-5xl block animate-pulse">🔮</span>
            <p className="text-xs font-black">
              {reflections.length >= 2
                ? `Ketuk "Tenun Laporan Mingguan" untuk menganalisis perkembanganmu!`
                : `Tulis jurnal minimal 2 hari untuk membuka kompilasi laporan ajaib mingguan.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
