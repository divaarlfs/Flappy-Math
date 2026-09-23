# 💡 Panduan Troubleshooting, QA Checklist, dan Pemeliharaan (Troubleshooting & QA)

Dokumen ini ditujukan untuk panduan penyelesaian masalah (*troubleshooting*), checklist kualitas (*Quality Assurance*), serta tips memperluas fitur di masa depan.

---

## 1. Panduan Penyelesaian Masalah (Troubleshooting Guide)

### 🔴 Masalah 1: Suara / Audio Tidak Berbunyi di Browser
- **Penyebab:** Kebijakan browser modern (seperti Google Chrome / Apple Safari) memblokir `AudioContext` otomatis diputar sebelum ada interaksi fisik pengguna (*Autoplay Policy*).
- **Solusi:**
  - Pastikan method `soundFX.init()` dipanggil di event listener klik, tombol start, atau keypress pertama.
  - Periksa apakah tombol audio di pojok kanan atas sedang dalam status mute (`🔇`).

### 🔴 Masalah 2: Burung Menembus Pipa atau Tabrakan Terasa Tidak Adil
- **Penyebab:** Nilai `bird.hitboxRadius` atau kalkulasi bounding box pipa tidak presisi.
- **Solusi:**
  - Di `game.js`, ukuran visual burung adalah `17px`, tetapi `hitboxRadius` diatur `10px` (~60%) agar toleran.
  - Jika ingin memperketat, ubah `bird.hitboxRadius` mendekati `14-16`.
  - Jika burung tidak mati pasca-kuis, itu adalah fitur normal `SHIELD_DURATION = 1500` (1.5 detik kebal).

### 🔴 Masalah 3: Kuis Menghasilkan Pembagian Berkoma / Desimal
- **Penyebab:** Soal pembagian tidak dihitung dari perkalian bulat terbalik.
- **Solusi:**
  - Pastikan di `math.js`, angka pembagi (`divisor`) dan hasil bagi (`answer`) dibangkitkan terlebih dahulu sebagai integer, kemudian pembilang dihitung `num1 = divisor * answer`.

### 🔴 Masalah 4: Input Kuis Tidak Terbaca Saat Mengetik Jawaban
- **Penyebab:** Fokus kursor tidak berpindah ke input form saat modal kuis terbuka.
- **Solusi:**
  - Di `game.js`, pastikan `setTimeout(() => quizInputField.focus(), 80);` terpanggil setiap kali `openQuiz()` dijalankan.

---

## 2. Checklist Pengujian Lengkap (Complete QA Checklist)

Lakukan verifikasi berkala terhadap daftar berikut:

| No | Modul / Skenario | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| 1 | **Layar Awal (Start Screen)** | Buka `index.html`. | Canvas menampilkan burung mengambang lembut, awan bergerak, tanah berputar. | [ ] |
| 2 | **Inisialisasi Game** | Klik "Mulai Petualangan" atau tekan Spasi. | Permainan berganti ke status `PLAYING`, burung melompat, tower mulai muncul dari kanan. | [ ] |
| 3 | **Audio FX** | Melakukan lompatan (flap) dan melewati pipa. | Suara kepakan sayap lembut dan suara chime poin terdengar. | [ ] |
| 4 | **Pemicu Kuis Otomatis** | Lewati 3 tower berturut-turut. | Game otomatis pause, BGM kuis chiptune berputar, modal kuis terbuka, kursor aktif di kotak input. | [ ] |
| 5 | **Input Jawaban Teks** | Ketik angka jawaban di input field dan tekan `Enter`. | Jawaban diproses; jika benar tower meledak + skor combo + shield aktif; jika salah -100 poin. | [ ] |
| 6 | **Input Pilihan Tombol (1-4)** | Klik kartu pilihan jawaban atau tekan angka `1`-`4` pada keyboard. | Jawaban langsung diproses seketika tanpa harus klik tombol kirim. | [ ] |
| 7 | **Shield Grace Period** | Sesaat setelah menjawab kuis, tabrakkan burung ke pipa dalam kurun 1.5 detik. | Burung terlindungi gelembung neon dan tidak mati. | [ ] |
| 8 | **Game Over & Akurasi** | Tabrakkan burung ke pipa setelah shield padam. | Modal Game Over muncul, kalkulasi akurasi persentase matematika, skor akhir, rekor combo streak ditampilkan dengan benar. | [ ] |
| 9 | **Tombol Main Lagi** | Klik "Main Lagi" atau tekan Spasi pada layar Game Over. | Semua state ter-reset (skor 0, streak 0, tower kosong), dan game dimulai ulang dengan mulus. | [ ] |

---

## 3. Ide Pengembangan Fitur Masa Depan (Feature Roadmap Ideas)

Jika ingin memperluas game ini di masa mendatang, berikut beberapa rekomendasi arsitektur:
1. **Penyimpanan Skor Tertinggi (*High Score LocalStorage*):**
   - Simpan `localStorage.getItem('flappy_math_highscore')` untuk menampilkan rekor sepanjang masa pemain.
2. **Kustomisasi Karakter & Skin Burung:**
   - Tambahkan opsi pemilihan warna bulu burung (misal Burung Biru, Burung Merah, Burung Emas) dengan mengganti warna `ctx.fillStyle` pada `drawBird()`.
3. **Pilihan Kategori Matematika di Awal Permainan:**
   - Izinkan pemain memilih mode belajar: "Hanya Penjumlahan & Pengurangan", "Hanya Perkalian", atau "Campuran Semua Operasi".
4. **Power-Up Items di Udara:**
   - Menambahkan koin bintang apung yang memberikan *Double Score* atau *Slow Motion* selama beberapa detik.
