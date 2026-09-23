# 🐤 Flappy Math (Math Flap Quest)

Game web 2D interaktif yang menggabungkan mekanisme santai **Flappy Bird** dengan tantangan **Kuis Matematika Kejutan** sebagai fokus utama permainan. Dibangun murni menggunakan **HTML5 Canvas, CSS modern Glassmorphism, dan Vanilla JavaScript (Web Audio API)** tanpa dependensi atau aset eksternal.

---

## 🎮 Fitur Utama

- **Fisika Melayang & Forgiving:**
  - Gravitasi lembut (`0.16`), lompatan halus, dan pembatasan kecepatan jatuh (*terminal velocity*) agar pemain tidak gampang jatuh.
  - Celah pipa sangat lebar (`220px`) dan jarak horizontal lapang (`380px`).
  - Hitbox toleran (~60-70% ukuran visual burung) sehingga sangat bersahabat bagi pemain.
  - *Shield Protection* pasca-kuis selama 1.5 detik agar pemain tidak kaget saat game di-resume.

- **Kuis Matematika Kejutan (Auto-Pause & Interaktif):**
  - Kuis muncul otomatis setiap **3 tower** yang berhasil dilewati.
  - Auto-pause saat kuis muncul dengan **Musik Chiptune Arcade ceria** yang disintesis via Web Audio API.
  - Pilihan ganda dinamis (2 opsi untuk <10 tower, 3 opsi untuk 10-19 tower, 4 opsi untuk ≥20 tower).
  - 2 metode input: bisa **mengetik jawaban** lalu tekan `Enter` atau **klik tombol pilihan / shortcut tombol 1-4**.

- **Variasi Operasi & Kesulitan Adaptif:**
  - Meliputi operasi Pertambahan (`+`), Pengurangan (`-`), Perkalian (`*`), dan Pembagian (`/`).
  - Angka perkalian dan pembagian menghasilkan bilangan bulat yang rapi.

- **Konsekuensi Jawaban:**
  - **Benar:** Tower di depan meledak hancur dengan efek partikel dan memberikan bonus skor serta streak combo.
  - **Salah:** Skor dipotong **100 poin** (`-100 Poin`), streak reset, dan tower tetap utuh.

- **Visual Tema Klasik Flappy Bird:**
  - Langit biru, awan bergerak, siluet kota/semak hijau, pipa hijau klasik, dan animasi tanah rumput bergulir (*scrolling ground*).

---

## 🚀 Cara Menjalankan

Game ini dapat dijalankan langsung di browser apa pun tanpa instalasi:
1. Clone repositori ini:
   ```bash
   git clone https://github.com/divaarlfs/Flappy-Math.git
   ```
2. Buka file `index.html` langsung di browser favorit Anda (Chrome, Edge, Firefox, Safari).

---

## 📂 Struktur File

```
Flappy-Math/
├── index.html       # Struktur game, HUD, dan modal popup kuis/game over
├── style.css        # Desain visual, tema Flappy Bird, dan layout
├── game.js          # Engine Canvas, fisika burung, tower, partikel, & game loop
├── math.js          # Generator soal matematika & penskalaan kesulitan
├── audio.js         # Sound effects & BGM synthesizer via Web Audio API
└── README.md        # Dokumentasi proyek
```

---

Dibuat dengan ❤️ untuk pembelajaran matematika yang menyenangkan!
