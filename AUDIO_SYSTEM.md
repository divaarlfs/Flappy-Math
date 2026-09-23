# 🎵 Dokumentasi Audio Engine (SoundFX & BGM Synthesizer)

Dokumen ini mendokumentasikan seluruh arsitektur audio murni berbasis **Web Audio API** pada `audio.js`. Seluruh efek suara (SFX) dan musik latar (BGM) diproduksi melalui osilator sintesis (*procedural audio*) tanpa memuat berkas audio eksternal (`.mp3`, `.wav`, atau `.ogg`).

---

## 1. Spesifikasi Teknis AudioContext

- **Inisialisasi:** `window.AudioContext` atau `window.webkitAudioContext`.
- **Kebijakan Browser Autoplay:** AudioContext dibuat dalam keadaan `suspended` dan otomatis di-`resume` pada aksi klik / sentuhan pertama pengguna melalui `soundFX.init()`.
- **Mute Toggle:** Variabel `isMuted` mengatur mute instan dan menghentikan loop BGM jika diaktifkan.

---

## 2. Daftar Sound Effects (SFX)

### `playFlap()`
- **Tipe Gelombang:** `sine`
- **Rentang Frekuensi:** Ramp eksponensial dari `320 Hz` ke `580 Hz` dalam waktu `0.08` detik.
- **Envelope:** Gain `0.2` melandai turun ke `0.01`.
- **Karakter Suara:** Lembut, halus, tidak mengganggu telinga meski dipicu berulang-ulang dengan cepat.

### `playScore()`
- **Tipe Gelombang:** `triangle`
- **Harmoni Dua Nada (*Two-tone Chime*):**
  1. Nada 1: `587.33 Hz` (D5) durasi `0.1` detik.
  2. Nada 2: `880.00 Hz` (A5) durasi `0.18` detik (offset +0.07s).
- **Karakter Suara:** Chime jernih dan memuaskan saat burung sukses melewati tower.

### `playCorrect()`
- **Tipe Gelombang:** `triangle`
- **Arpeggio Kemenangan 4 Nada:** `523.25 Hz` (C5) $\rightarrow$ `659.25 Hz` (E5) $\rightarrow$ `783.99 Hz` (G5) $\rightarrow$ `1046.50 Hz` (C6).
- **Karakter Suara:** Fanfare kemenangan ceria yang memberikan kepuasan instan ketika menjawab soal kuis dengan benar.

### `playWrong()`
- **Tipe Gelombang:** `sawtooth`
- **Dua Nada Peringatan Rendah:** `220 Hz` (A3) $\rightarrow$ `164.81 Hz` (E3).
- **Karakter Suara:** Suara *buzz* peringatan arcade yang jelas bahwa jawaban kurang tepat.

### `playHit()` & `playDie()`
- **Tipe Gelombang:** `square` & `sawtooth` dengan *rapid frequency drop*.
- **Frekuensi:** `300 Hz` turun cepat ke `60 Hz` dalam waktu `0.25` detik.
- **Karakter Suara:** Efek tubrukan retro khas game arcade 8-bit.

---

## 3. Chiptune Quiz Background Music (BGM Synthesizer)

Saat kuis terbuka, `startQuizMusic()` dipanggil untuk memutar BGM loop ritmis berenergi tinggi:

### 1. Fanfare Pembuka (Opening Jingle)
Memainkan deretan 5 nada pembuka sebelum melodi utama dimulai:
`C5` (`523.25 Hz`), `E5` (`659.25 Hz`), `G5` (`783.99 Hz`), `C6` (`1046.50 Hz`), `E6` (`1318.51 Hz`).

### 2. Main Melody Loop (C Major Arcade Style)
Loop melodi bertempo `130 ms per beat` menggunakan osilator `triangle` dengan melodi:
```javascript
const melody = [
  523.25, 659.25, 783.99, 880.00,
  783.99, 659.25, 587.33, 523.25,
  659.25, 783.99, 880.00, 1046.50,
  880.00, 783.99, 659.25, 587.33
];
```

### 3. Bassline Harmony (8-bit Bass)
Bass pendamping berirama kuat menggunakan osilator `square` dengan filter frekuensi rendah:
```javascript
const bassline = [
  261.63, 261.63, 329.63, 329.63,
  392.00, 392.00, 329.63, 329.63,
  261.63, 261.63, 349.23, 349.23,
  392.00, 392.00, 261.63, 261.63
];
```

### 4. Penghentian & Pembersihan Resource (`stopQuizMusic()`)
Ketika kuis dijawab atau game di-mute:
- Memanggil `clearInterval(this.bgmInterval)` untuk menghentikan timer loop.
- Memanggil `.stop()` dan `.disconnect()` pada semua osilator aktif untuk mencegah kebocoran memori (*memory leak*).
