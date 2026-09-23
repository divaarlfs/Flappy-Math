# AGENTS.md - Flappy Math Development Guidelines & Architecture

Dokumen ini dirancang sebagai panduan komprehensif bagi AI Agent maupun Developer yang bekerja pada repositori **Flappy Math (Math Flap Quest)**.

---

## 📌 Project Overview
- **Nama Game:** Flappy Math (Math Flap Quest)
- **Genre:** 2D Arcade Flappy Bird + Math Educational Quiz
- **Teknologi Utama:** HTML5 Canvas, Vanilla CSS (Glassmorphism & Pixel-Art Style), Vanilla JavaScript (ES6+), Web Audio API (Chiptune Synthesizer).
- **Filosofi Desain:** Zero-dependency (tidak membutuhkan library eksternal atau build tools), instant-load, gameplay santai & melayang (*floaty/forgiving*), dengan fokus utama edukasi matematika responsif.

---

## 🏗 Arsitektur Sistem & Struktur File

```
Flappy-Math/
├── index.html        # Struktur UI, HUD, Canvas container, dan Popup Modals (Start, Quiz, Game Over)
├── style.css         # Desain responsif, Palet Tema Klasik Flappy Bird, Glassmorphism, Animasi UI
├── game.js           # Game Engine Canvas, Physics, Object Lifecycle (Bird, Towers, Particles), Input Handling, State Machine
├── math.js           # Math Quiz Generator (MathQuizEngine), Adaptive Difficulty, Soal +, -, *, /
├── audio.js          # Audio Engine (SoundFX) berbasis Web Audio API (Synthesizer Chiptune BGM, SFX Flap, Win, Hit, Combo)
├── README.md         # Dokumentasi umum untuk pengguna / GitHub
├── AGENTS.md         # Panduan developer & AI agent (file ini)
└── ARCHITECTURE.md   # Spesifikasi teknis mendalam & alur state machine
```

---

## 🕹 Game State Machine

State permainan dikelola di `game.js` melalui variabel global `gameState`:

| State | Deskripsi | Aksi / Input |
|---|---|---|
| `START` | Tampilan awal sebelum permainan dimulai. Burung melayang tenang. | Tombol "Mulai Petualangan" atau tombol Spasi/Tap. |
| `PLAYING` | Mode terbang reguler. Burung melompat, tower bergerak, cek collision, scoring & streak. | Spasi, Panah Atas, Klik/Tap Canvas untuk flap/lompat. |
| `QUIZ` | Game paused otomatis saat mencapai kelipatan 3 tower. BGM kuis menyala, modal kuis aktif. | Ketik angka + Enter, klik tombol pilihan (1-4), atau tekan key 1-4. |
| `RESUME_COUNTDOWN` | Transisi setelah menjawab kuis. Burung kebal (*Shield Protection* aktif selama 1.5 detik). | Melanjutkan gameplay otomatis ke `PLAYING`. |
| `GAMEOVER` | Burung menabrak pipa atau jatuh ke tanah tanpa shield aktif. Statistik akhir ditampilkan. | Tombol "Main Lagi" atau tekan Spasi. |

---

## ⚙️ Modul & Komponen Kunci

### 1. `game.js` (Canvas & Game Engine)
- **Fisika Burung (`bird`):**
  - `gravity: 0.16` (sangat lembut agar pemain tidak cepat jatuh).
  - `jumpForce: -4.5` (lompatan terkendali).
  - `maxFallSpeed: 3.8` (mencegah tukikan tajam).
  - `hitboxRadius: 10` (~60-70% ukuran visual burung untuk hitbox toleran).
- **Rintangan Tower (`towers`):**
  - `baseGap: 220` (celah vertikal sangat lebar).
  - `towerDistance: 380` (jarak horizontal lapang).
  - `baseSpeed: 1.4` (kecepatan gerak stabil dan santai).
  - Pemicu Kuis: Dipicu setiap `towersPassed % 3 === 0`.
- **Sistem Perlindungan (`Shield`):**
  - Durasi: `SHIELD_DURATION = 1500` (1.5 detik).
  - Efek: Burung terlindungi gelembung neon dan tidak mati jika menabrak pipa/tanah pasca-kuis.

### 2. `math.js` (MathQuizEngine)
- **Generator Soal:**
  - Operasi seimbang: Penjumlahan (`+`), Pengurangan (`-`), Perkalian (`*`), Pembagian (`/`).
  - Perkalian & Pembagian selalu menghasilkan angka bulat yang masuk akal untuk *mental math* cepat (hasil perkalian ≤ 50).
- **Skalabilitas Opsi Jawaban:**
  - `< 10` tower: 2 pilihan ganda.
  - `10 - 19` tower: 3 pilihan ganda.
  - `≥ 20` tower: 4 pilihan ganda (maksimal 4).
- **Generator Pengecoh (Distractors):**
  - Pengecoh dibuat realistis (selisih kecil ±1 s/d ±4, atau jebakan puluhan ±10).

### 3. `audio.js` (SoundFX Web Audio API)
- **Zero Asset:** Semua suara dihasilkan murni melalui osilator sintesis (*Sine*, *Square*, *Triangle* wave).
- **Daftar Sound FX:**
  - `playFlap()`: Suara kepakan sayap lembut.
  - `playScore()`: Suara chime manis saat melewati pipa.
  - `playCorrect()`: Nada ceria bertingkat saat menjawab kuis benar.
  - `playWrong()`: Nada peringatan saat salah menjawab.
  - `playHit()` & `playDie()`: Efek tabrakan / game over.
  - `startQuizMusic()` & `stopQuizMusic()`: Chiptune BGM loop ceria gaya arcade retro selama mode kuis.

---

## 🛠 Aturan Pengembangan & Konvensi Kode (Coding Guidelines)

1. **Tanpa Dependencies Eksternal:**
   - Pertahankan game tetap berjalan murni dengan vanilla JavaScript dan Web standard APIs tanpa `npm install` atau script CDN berat.
2. **Hitbox & Forgiving Gameplay:**
   - Jangan membuat game terlalu sulit secara mendadak. Filosofi game ini adalah media belajar yang santai dan memotivasi, bukan rage-game.
3. **Audio Context Safety:**
   - Selalu panggil `soundFX.init()` pada interaksi user pertama (misal klik/tap/keypress) untuk mematuhi kebijakan browser Autoplay AudioContext.
4. **Responsive & Mobile Friendly:**
   - Canvas dan modal harus mendukung touch-action di mobile (tap to flap, sentuh opsi kuis, dsb).
5. **Dukungan Dual-Input pada Kuis:**
   - Pemain harus selalu bisa menjawab dengan dua cara: mengetik angka bebas lalu tekan `Enter`, atau memilih tombol kartu pilihan / shortcut keyboard `1`, `2`, `3`, `4`.

---

## 🧪 Panduan Pengujian Manual (QA Checklist)

- [ ] Buka `index.html` langsung di browser via `file://` atau live server lokal.
- [ ] Tekan Spasi / Tombol Mulai: Pastikan burung melompat dan audio terdengar.
- [ ] Lewati 3 tower: Pastikan game otomatis pause dan modal kuis muncul dengan BGM kuis.
- [ ] Uji input kuis dengan keyboard (ketik angka + Enter) dan klik mouse / angka 1-4.
- [ ] Jawab Benar: Pastikan tower meledak jadi partikel, skor bertambah, combo streak bertambah, shield 1.5s aktif, dan game resume.
- [ ] Jawab Salah: Pastikan penalti -100 poin, streak reset ke 0, tower tetap utuh, dan game resume.
- [ ] Tabrak tower tanpa shield: Pastikan modal Game Over muncul dengan statistik lengkap dan tombol restart berfungsi normal.
