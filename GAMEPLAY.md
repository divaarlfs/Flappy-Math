# 🎮 Dokumentasi Mekanika Gameplay & Keseimbangan Game (Game Mechanics & Balancing)

Dokumen ini mencakup rumus matematis, variabel tuning gameplay, konstanta fisika, dan sistem skor pada **Flappy Math**.

---

## 1. Parameter Fisika Burung (Bird Physics)

Semua pergerakan burung diperbarui per-frame (60 FPS) pada fungsi `updatePlaying()`:

| Parameter | Variabel di `game.js` | Nilai Default | Penjelasan Desain |
|---|---|---|---|
| **Gravitasi** | `bird.gravity` | `0.16 px/frame²` | Nilai sangat rendah untuk memberikan sensasi melayang (*floaty*) dan tidak cepat jatuh. |
| **Kekuatan Lompatan** | `bird.jumpForce` | `-4.5 px/frame` | Mendorong burung ke atas secara terkontrol dan tidak melenting terlalu tinggi. |
| **Kecepatan Jatuh Maksimum** | `bird.maxFallSpeed` | `3.8 px/frame` | *Terminal velocity* dibatasi agar burung tidak menukik secara agresif. |
| **Radius Visual Burung** | `bird.radius` | `17 px` | Ukuran penggambaran visual tubuh burung pada canvas. |
| **Radius Hitbox Toleran** | `bird.hitboxRadius` | `10 px` | **~60% dari radius visual**. Menghindari tabrakan frustasi di tepi pipa (*forgiving hitbox*). |

### Rumus Update Posisi Vertikal Burung
```javascript
bird.velocity += bird.gravity;
if (bird.velocity > bird.maxFallSpeed) {
  bird.velocity = bird.maxFallSpeed;
}
bird.y += bird.velocity;
```

---

## 2. Parameter Rintangan Tower / Pipa (Obstacle Spacing & Speed)

| Parameter | Variabel di `game.js` | Nilai Default | Penjelasan Desain |
|---|---|---|---|
| **Kecepatan Gerak Dasar** | `baseSpeed` | `1.4 px/frame` | Kecepatan stabil dan tenang agar pemain memiliki waktu reaksi luas. |
| **Celah Vertikal Pipa** | `baseGap` | `220 px` | Jarak celah atas-bawah sangat lapang (tinggi burung hanya ~34px). |
| **Jarak Horizontal Antar Tower** | `towerDistance` | `380 px` | Jarak antar tower lapang sehingga pemain tidak terburu-buru. |
| **Lebar Pipa** | `towerWidth` | `54 px` | Lebar standar grafis pipa retro. |

---

## 3. Sistem Skor & Multiplier Combo

| Kondisi | Poin yang Diperoleh / Dikenakan | Catatan |
|---|---|---|
| **Melewati 1 Tower Biasa** | `+10 Poin` | Suara chime halus (`soundFX.playScore()`). |
| **Menjawab Kuis BENAR** | `+200 + (streak * 50) Poin` | Tower meledak menjadi partikel, streak bertambah (+1), efek suara fanfare menang. |
| **Menjawab Kuis SALAH** | `-100 Poin` (Minimum 0) | Streak di-reset ke 0, efek suara peringatan salah. |

### Rumus Akurasi Akhir (Game Over Screen)
$$\text{Accuracy (\%)} = \left( \frac{\text{correctQuizzes}}{\text{totalQuizzes}} \right) \times 100$$
*(Jika $\text{totalQuizzes} == 0$, maka akurasi $100\%$).*

---

## 4. Mekanika Kuis & Transisi Pelindung (Shield Grace Period)

- **Frekuensi Pemicu:** Kuis muncul setiap **3 tower** (`towersPassed % 3 === 0`).
- **Durasi Perlindungan Shield:** `SHIELD_DURATION = 1500 ms` (1.5 detik).
- **Mekanisme Shield:**
  - Saat kuis selesai dijawab (baik benar maupun salah), mode beralih ke `RESUME_COUNTDOWN`.
  - Burung dilindungi lingkaran energi neon bercahaya.
  - Jika burung bersentuhan dengan pipa atau tanah selama durasi shield, fungsi deteksi tabrakan dilewati (`collision ignored`).
  - Pemain memiliki waktu adaptasi 1.5 detik untuk menstabilkan ketinggian burung kembali.
