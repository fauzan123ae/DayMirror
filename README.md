# 🪞 DayMirror — Your Comic Diary & AI Companion

Aplikasi jurnal harian bergaya komik dengan AI companion yang hangat dan lucu, dibangun dengan **React + Vite** dan siap di-deploy ke **Vercel**.

## 🗂️ Struktur Halaman

| Route | Halaman | Deskripsi |
|---|---|---|
| `/` | Onboarding | Login & pilih tujuan hidup |
| `/dashboard` | Dashboard | Ringkasan harian, scrapbook stiker, misi |
| `/reflect` | Cermin Harian | Chat AI atau form jurnal manual |
| `/journal` | Buku Jurnal | Album semua entri jurnal |
| `/weekly` | Laporan Mingguan | Analisis AI mingguan |

## 🚀 Cara Jalankan Lokal

```bash
# 1. Install dependencies
npm install

# 2. Salin env file
cp .env.example .env.local

# 3. Isi API key Gemini di .env.local
# Dapatkan gratis di: https://aistudio.google.com/apikey
VITE_GEMINI_API_KEY=your_api_key

# 4. Jalankan dev server
npm run dev
```

## ☁️ Deploy ke Vercel

### Cara 1 — Via GitHub (Rekomendasi)

1. Push project ini ke GitHub
2. Buka [vercel.com](https://vercel.com) → **New Project**
3. Import repo GitHub-mu
4. Di **Environment Variables**, tambahkan:
   - `VITE_GEMINI_API_KEY` = API key Gemini kamu
5. Klik **Deploy** → selesai! ✨

### Cara 2 — Via Vercel CLI

```bash
npm install -g vercel
vercel
# Ikuti instruksi, lalu set env var:
vercel env add VITE_GEMINI_API_KEY
```

## 🔑 API Key Gemini

Aplikasi ini menggunakan Google Gemini API (gratis).
1. Buka [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Klik **Create API Key**
3. Salin key dan isi di Vercel Environment Variables

**Tanpa API key**, app tetap berjalan dengan mode fallback (respons simulasi).

## 🛠️ Tech Stack

- **React 18** + **React Router v6**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **Lucide React** (icons)
- **Google Gemini API** (AI companion)
- **localStorage** (penyimpanan data lokal)
