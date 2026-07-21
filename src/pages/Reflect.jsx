import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, BookOpen, Sparkles, RefreshCw,
  Send, HelpCircle, PlusCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GOAL_OPTIONS, MOOD_OPTIONS } from '../data/constants';
import { supabase } from '../lib/supabase';

export default function Reflect() {
  const {
    user, authUser, aiCompanion, reflections, setReflections,
    setDailyGoals, triggerToast, GEMINI_URL, GROQ_KEY, fetchWithRetry,
    calculateStreak, setUser,
  } = useApp();
  const navigate = useNavigate();

  const [method, setMethod]           = useState('chat');
  const [chatMessages, setMessages]   = useState([]);
  const [inputText, setInputText]     = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isSummarizing, setSummarizing] = useState(false);
  const [aiLoading, setAiLoading]     = useState(false);
  const chatEndRef = useRef(null);

  const [formData, setFormData] = useState({
    mood: 'happy', good_things: '', obstacles: '', tomorrow_goal: ''
  });

  // Init chat greeting
  useEffect(() => {
    if (method === 'chat' && chatMessages.length === 0) {
      setMessages([{
        id: 'sys-1', sender: 'ai',
        text: `Halo ${user?.name}! Selamat datang di ruang refleksimu 🌿 Aku ${aiCompanion.name}, teman ngobrolmu di sini.\n\nGimana harimu hari ini? Ceritain dong, ada hal yang bikin kamu senang atau bangga nggak?`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [method]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const sendChat = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || chatLoading || isSummarizing) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    const allMsgs = [...chatMessages, userMsg];
    setMessages(allMsgs);
    setInputText('');
    setChatLoading(true);

    const systemPrompt = `Kamu adalah "${aiCompanion.name}", teman jurnal harian dalam Bahasa Indonesia. Gaya bicaramu: hangat, empatik, santai seperti teman dekat. Sesekali pakai emoji secukupnya (maksimal 1-2 per pesan), tidak berlebihan. Jangan pakai onomatope seperti *puf!* atau *cling!* — bicara natural saja seperti manusia. Fokus pengguna: ${GOAL_OPTIONS.find(o => o.id === user?.goal)?.label || 'Self Improvement'}. Nama pengguna: ${user?.name}.

Tugasmu: tuntun pengguna mengevaluasi harinya secara bertahap dalam urutan ini:
1. Tanya hal baik atau pencapaian hari ini
2. Tanya hambatan atau kesulitan yang dihadapi
3. Tanya rencana atau target untuk besok

Setelah ketiga topik terbahas, minta pengguna klik tombol "Kumpulkan & Rangkum Memori" di atas. Jangan melompat topik. Respons maksimal 2-3 kalimat per giliran agar percakapan terasa seperti ngobrol nyata.`;

    // Format multi-turn OpenAI-compatible untuk Groq
    const messages = [
      { role: 'system', content: systemPrompt },
      ...allMsgs
        .filter(m => m.id !== 'sys-1')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
    ];

    try {
      const res = await fetchWithRetry(GEMINI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          max_tokens: 700,
          temperature: 0.8,
        }),
      });

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content?.trim();

      if (!text) throw new Error('Empty response dari Groq');

      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch (err) {
      console.error('[Daymirror] Chat error:', err);
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Aduh, koneksiku terganggu sebentar ${user?.name} 😅 Coba kirim ulang pesanmu ya, aku masih di sini!`,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const finalizeChat = async () => {
    if (chatMessages.length < 3) {
      triggerToast('Cerita dulu lebih banyak ya! 🧸', 'error');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (reflections.find(r => r.date === today)) {
      triggerToast('Kamu sudah bercermin hari ini! Lihat di Buku Jurnal ya. ✨', 'info');
      return;
    }

    setSummarizing(true);

    const fullTranscript = chatMessages
      .filter(m => m.id !== 'sys-1')
      .map(m => `${m.sender === 'user' ? 'Pengguna' : 'AI'}: ${m.text}`)
      .join('\n');

    try {
      const res = await fetchWithRetry(GEMINI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'Kamu adalah ekstraktor data jurnal. Kembalikan HANYA objek JSON valid tanpa markdown, tanpa kode block, tanpa penjelasan apapun.',
            },
            {
              role: 'user',
              content: `Baca transkrip percakapan jurnal harian ini dan ekstrak menjadi JSON.\n\nTranskrip:\n${fullTranscript}\n\nKembalikan HANYA JSON dengan format persis ini:\n{"mood":"happy|neutral|sad|stressed","good_things":"...","obstacles":"...","tomorrow_goal":"...","ai_summary":"ringkasan hangat 2 kalimat dalam bahasa Indonesia","ai_advice":"saran konkret 1 kalimat untuk besok"}`,
            },
          ],
          max_tokens: 600,
          temperature: 0.3,
        }),
      });

      const data = await res.json();
      const rawText = data?.choices?.[0]?.message?.content?.trim() || '{}';
      const cleaned = rawText.replace(/```json\n?|```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (!parsed.good_things && !parsed.ai_summary) throw new Error('Parsed JSON kosong');
      saveReflection(parsed);

    } catch (err) {
      console.error('[Daymirror] Summarize error:', err);
      const replies = chatMessages.filter(m => m.sender === 'user').map(m => m.text);
      saveReflection({
        mood: 'happy',
        good_things: replies[0] || 'Cerita hangat hari ini.',
        obstacles: replies[1] || 'Ada sedikit tantangan.',
        tomorrow_goal: replies[replies.length - 1] || 'Fokus hal bermakna!',
        ai_summary: `Obrolan kita hari ini sungguh berharga, ${user?.name}! Aku bangga kamu mau meluangkan waktu untuk bercermin. 🧸✨`,
        ai_advice: 'Mulai pagi esok dengan satu langkah kecil yang pasti bisa kamu lakukan!',
      });
    } finally {
      setSummarizing(false);
    }
  };

  const saveReflection = async (data) => {
    const today = new Date().toISOString().split('T')[0];

    const entry = {
      user_id: authUser.id,
      date: today,
      mood: data.mood || 'neutral',
      good_things: data.good_things,
      obstacles: data.obstacles,
      tomorrow_goal: data.tomorrow_goal,
      ai_summary: data.ai_summary,
      ai_advice: data.ai_advice,
    };

    const { data: saved, error } = await supabase
      .from('reflections')
      .upsert(entry, { onConflict: 'user_id,date' })
      .select()
      .single();

    if (error) {
      console.error('[Daymirror] saveReflection error:', error);
      triggerToast('Gagal menyimpan jurnal 😢', 'error');
      return;
    }

    setReflections(prev => {
      const updated = [saved, ...prev.filter(r => r.date !== today)];
      const newStreak = calculateStreak(updated);
      setUser(u => u ? { ...u, streak: newStreak } : u);
      supabase.from('profiles').update({ streak: newStreak }).eq('id', authUser.id);
      return updated;
    });

    setDailyGoals(prev => prev.map(g => g.id === 1 ? { ...g, done: true } : g));
    setMessages([]);
    triggerToast('Hooray! Jurnal harianmu berhasil diringkas! 📚🎨', 'success');
    navigate('/dashboard');
  };

  const submitForm = async (e) => {
    e.preventDefault();
    const { good_things, obstacles, tomorrow_goal } = formData;
    if (!good_things || !obstacles || !tomorrow_goal) {
      triggerToast('Isi semua kotak cerita dulu ya! 🌸', 'error'); return;
    }
    const today = new Date().toISOString().split('T')[0];
    if (reflections.find(r => r.date === today)) {
      triggerToast('Kamu sudah bercermin hari ini! Lihat di Buku Jurnal ya. ✨', 'info'); return;
    }
    setAiLoading(true);

    try {
      const res = await fetchWithRetry(GEMINI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `Kamu adalah "${aiCompanion.name}" ${aiCompanion.avatar}, asisten refleksi hangat dalam Bahasa Indonesia. Kembalikan HANYA JSON valid tanpa markdown: {"summary":"...","advice":"..."}`,
            },
            {
              role: 'user',
              content: `Mood: ${formData.mood}\nHal baik: "${good_things}"\nHambatan: "${obstacles}"\nTarget besok: "${tomorrow_goal}"`,
            },
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      const data = await res.json();
      const rawText = data?.choices?.[0]?.message?.content?.trim() || '{}';
      const cleaned = rawText.replace(/```json\n?|```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);

      saveReflection({
        ...formData,
        ai_summary: parsed.summary || `Meskipun ada rintangan "${obstacles || 'hari ini'}", perjuanganmu sangat hebat! ⭐`,
        ai_advice: parsed.advice || `Biar jurus esok "${tomorrow_goal}" sukses, siapkan istirahat cukup malam ini!`,
      });

    } catch (err) {
      console.error('[Daymirror] Form submit error:', err);
      saveReflection({
        ...formData,
        ai_summary: `Meskipun ada rintangan "${obstacles || 'hari ini'}", perjuanganmu sangat hebat! ⭐`,
        ai_advice: `Biar jurus esok "${tomorrow_goal}" sukses, siapkan istirahat cukup malam ini!`,
      });
    } finally {
      setAiLoading(false);
      setFormData({ mood: 'happy', good_things: '', obstacles: '', tomorrow_goal: '' });
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Method selector */}
      <div className="bg-[#FFFDF9] rounded-2xl comic-border-thick p-4 comic-shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-comic-title font-black text-sm text-[#2C3E35]">Pilih Wujud Buku Jurnalmu Malam Ini:</h4>
          <p className="text-[10px] text-[#7CA190] font-black uppercase">Metode mana yang ingin kamu coba?</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setMethod('chat')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black comic-border-thin transition-all ${method === 'chat' ? 'bg-[#7CA190] text-white comic-shadow-sm' : 'bg-white text-[#2C3E35] hover:bg-[#F8F5EE]'}`}
          >
            <MessageSquare className="w-4 h-4" /> Chat Ajaib
          </button>
          <button
            onClick={() => setMethod('form')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black comic-border-thin transition-all ${method === 'form' ? 'bg-[#7CA190] text-white comic-shadow-sm' : 'bg-white text-[#2C3E35] hover:bg-[#F8F5EE]'}`}
          >
            <BookOpen className="w-4 h-4" /> Form Manual
          </button>
        </div>
      </div>

      {/* CHAT MODE */}
      {method === 'chat' && (
        <div className="bg-[#FFFDF9] rounded-[32px] comic-border-thick comic-shadow-md overflow-hidden flex flex-col" style={{ minHeight: '520px' }}>
          {/* Chat header */}
          <div className="bg-[#7CA190] border-b-4 border-[#2C3E35] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFF6E0] comic-border-thin flex items-center justify-center text-2xl animate-wobble-slow">{aiCompanion.avatar}</div>
              <div>
                <h3 className="font-comic-title font-black text-sm text-white">{aiCompanion.name}</h3>
                <span className="text-[9px] text-[#D4EDE4] font-black">● Online & siap mendengar</span>
              </div>
            </div>
            <button
              onClick={finalizeChat}
              disabled={chatMessages.length < 3 || isSummarizing}
              className="bg-[#EBB39C] hover:bg-[#F2B8A2] comic-border-thin text-[#2C3E35] font-black py-2 px-3.5 rounded-xl text-xs transition-all flex items-center gap-1.5 disabled:opacity-40"
            >
              {isSummarizing
                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Merangkum...</>
                : <><Sparkles className="w-3.5 h-3.5" /> Kumpulkan & Rangkum</>}
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-[#FDFBF7]">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-[24px] p-4 relative comic-border-thin comic-shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-[#F7D3C6] text-[#50281F] rounded-tr-none chat-bubble-user'
                    : 'bg-white text-[#2C3E35] rounded-tl-none chat-bubble-ai'
                }`}>
                  <p className="text-xs font-black whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <span className={`text-[9px] block text-right mt-1.5 font-black ${msg.sender === 'user' ? 'text-[#8C5248]' : 'text-[#7CA190]'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-white comic-border-thin rounded-[24px] rounded-tl-none p-4 comic-shadow-sm flex items-center gap-1.5">
                  {[0,200,400].map(d => (
                    <div key={d} className="w-2.5 h-2.5 bg-[#7CA190] rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {chatMessages.length < 3 && (
            <div className="px-5 py-2 bg-[#FFF6E0] border-t-2 border-[#2C3E35] text-[10px] text-[#745E1B] font-black flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#745E1B]" />
              Ketik ceritamu di bawah. Setelah 3+ pesan, klik tombol rangkum di atas!
            </div>
          )}

          <form onSubmit={sendChat} className="p-3 bg-white border-t-4 border-[#2C3E35] flex gap-2">
            <input
              type="text" value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={`Sapa ${aiCompanion.name} atau ceritakan harimu...`}
              disabled={chatLoading || isSummarizing}
              className="flex-1 px-4 py-3.5 comic-border-thin rounded-xl focus:outline-none text-xs font-black text-[#2C3E35] placeholder-[#D9E4DD]"
            />
            <button
              type="submit"
              disabled={chatLoading || !inputText.trim() || isSummarizing}
              className="bg-[#7CA190] hover:bg-[#688D7D] text-white p-3.5 comic-border-thin rounded-xl comic-shadow-sm transition-all active:translate-y-1"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* FORM MODE */}
      {method === 'form' && (
        <div className="bg-[#FFFDF9] rounded-[32px] comic-border-thick p-6 comic-shadow-md space-y-4">
          <div>
            <h2 className="text-xl font-comic-title font-black text-[#2C3E35] flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-[#7CA190]" /> Tulis Jurnal Harian
            </h2>
            <p className="text-xs text-[#7CA190] font-black mt-1">Luangkan 2 menit saja. Merapikan keluh kesah membantu esok yang segar! ✨</p>
          </div>

          <form onSubmit={submitForm} className="space-y-5 pt-2">
            {/* Mood */}
            <div>
              <label className="block text-[10px] font-black text-[#2C3E35] uppercase tracking-wider mb-2">Warna Emosimu Hari Ini? 🌈</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {MOOD_OPTIONS.map(mood => (
                  <button key={mood.value} type="button"
                    onClick={() => setFormData(p => ({ ...p, mood: mood.value }))}
                    className={`flex items-center justify-center gap-2 p-3.5 rounded-2xl comic-border-thin transition-all bouncy-hover ${
                      formData.mood === mood.value ? mood.color + ' scale-[1.03] font-black' : 'bg-white text-[#2C3E35] hover:bg-[#FFF6E0]'
                    }`}
                  >
                    <span className="text-3xl">{mood.emoji}</span>
                    <span className="text-xs font-black">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {[
              { key: 'good_things', label: '1. Hal manis atau pencapaian apa yang berjalan baik hari ini? 🥑✨', placeholder: 'Menyeduh teh hangat, menyelesaikan tugas penting...' },
              { key: 'obstacles',   label: '2. Apa rintangan yang sempat menghambat ketenanganmu? ⚠️☁️',       placeholder: 'Terjebak scrolling reels, rapat beruntun...' },
              { key: 'tomorrow_goal', label: '3. Satu jurus rahasia apa yang mau kamu latih besok? 🎯🌸',      placeholder: 'Aktifkan mode jangan ganggu dari jam 9-11...' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-[10px] font-black text-[#2C3E35] uppercase tracking-wider mb-2">{label}</label>
                <textarea
                  required rows="3"
                  value={formData[key]}
                  onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full p-4 rounded-2xl comic-border-thin bg-white focus:outline-none text-xs font-black text-[#2C3E35] placeholder-[#D9E4DD]"
                />
              </div>
            ))}

            <div className="pt-2">
              <button type="submit" disabled={aiLoading}
                className="w-full bg-[#EBB39C] hover:bg-[#F2B8A2] comic-border-thick text-[#2C3E35] font-black py-4 rounded-2xl comic-shadow-sm transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50">
                {aiLoading
                  ? <><RefreshCw className="w-5 h-5 animate-spin" /> Meramu analisis...</>
                  : <><Sparkles className="w-5 h-5" /> Simpan Jurnal & Racik Analisis</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}