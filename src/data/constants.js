export const GOAL_OPTIONS = [
  { id: 'productivity',    label: 'Produktivitas',        icon: '⚡', desc: 'Membasmi mager & menyelesaikan to-do list harianmu.',         color: 'bg-[#E3EDF7] text-[#315C87]' },
  { id: 'career',          label: 'Karir & Bisnis',       icon: '💼', desc: 'Menata tangga karir impian & bisnis kecilmu.',                color: 'bg-[#F9E8D9] text-[#7A431D]' },
  { id: 'study',           label: 'Belajar & Akademik',   icon: '📚', desc: 'Konsisten membaca & memahami ilmu baru.',                     color: 'bg-[#E2F0D9] text-[#3B6628]' },
  { id: 'health',          label: 'Kesehatan & Wellness', icon: '🌱', desc: 'Menjaga raga tetap fit & pikiran tetap jernih.',              color: 'bg-[#FDF3CD] text-[#745E1B]' },
  { id: 'self_improvement',label: 'Self Improvement',     icon: '✨', desc: 'Merawat jiwa & menumbuhkan kebiasaan baik harian.',           color: 'bg-[#F4E3F7] text-[#6A2B78]' },
];

export const MOOD_OPTIONS = [
  { value: 'happy',    label: 'Senang', emoji: '🌈', color: 'bg-[#E2F0D9] text-[#3B6628] border-[#A8D08D]' },
  { value: 'neutral',  label: 'Biasa',  emoji: '☁️', color: 'bg-[#FFF6E0] text-[#745E1B] border-[#F4D068]' },
  { value: 'sad',      label: 'Sedih',  emoji: '💧', color: 'bg-[#E3EDF7] text-[#315C87] border-[#9CC3E6]' },
  { value: 'stressed', label: 'Stres',  emoji: '🔥', color: 'bg-[#FCE4D6] text-[#843C0C] border-[#F4B084]' },
];

export const AVATAR_OPTIONS = [
  { emoji: '🥑', label: 'Alpukat Imut' },
  { emoji: '🧸', label: 'Beruang Hangat' },
  { emoji: '🐸', label: 'Katak Ajaib' },
  { emoji: '🐱', label: 'Kucing Cerdas' },
  { emoji: '🦊', label: 'Rubah Cerdik' },
  { emoji: '👻', label: 'Hantu Baik' },
  { emoji: '🦖', label: 'Dino Ceria' },
  { emoji: '🌸', label: 'Bunga Peri' },
];

export const INITIAL_REFLECTIONS = [
  {
    id: 1,
    date: '2026-07-16',
    mood: 'happy',
    good_things: 'Berhasil menyelesaikan 3 modul presentasi utama dan sempat olahraga lari sore selama 30 menit.',
    obstacles: 'Sedikit terganggu dengan meeting dadakan di siang hari, tapi untungnya tugas utama tetap beres.',
    tomorrow_goal: 'Fokus merapikan laporan bulanan dan membatasi media sosial maksimal 30 menit.',
    ai_summary: 'Luar biasa! Keseimbangan antara kerja keras dan aktivitas fisik (lari sore) terbukti mendongkrak energimu. Hambatan meeting dadakan berhasil dimitigasi dengan baik.',
    ai_advice: 'Pertahankan habit transisi kerja-ke-olahraga ini untuk merilis stres harian.'
  },
  {
    id: 2,
    date: '2026-07-17',
    mood: 'neutral',
    good_things: 'Membaca buku pengembangan diri sebanyak 15 halaman dan tidur tepat waktu semalam.',
    obstacles: 'Sangat mengantuk setelah makan siang, menyebabkan produktivitas menurun drastis di jam 2-4 sore.',
    tomorrow_goal: 'Mencoba porsi makan siang yang lebih ringan dan melakukan power nap jika sangat lelah.',
    ai_summary: 'Hari yang seimbang meskipun ada tantangan energi pasca-makan siang. Tidur tepat waktu adalah fondasi yang luar biasa untuk kesehatan jangka panjang.',
    ai_advice: 'Kurangi konsumsi karbohidrat berlebih saat makan siang untuk menghindari sugar crash di sore hari.'
  },
];
