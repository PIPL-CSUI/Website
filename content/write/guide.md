---
layout: layout.njk
title: Panduan Publikasi di website PIPL
date: 2026-15-11
tags: ["meta", "PIPL"]
---

# Panduan Publikasi di website PIPL (Publishing Space)

Publishing Space adalah tempat People berbagi tulisan seputar rekayasa perangkat lunak. Kamu bisa menulis tutorial, catatan belajar, pengalaman mengerjakan proyek, opini, atau hal-hal lain yang menurutmu menarik untuk dibagikan kepada publik.

Semua tulisan "dikirim" melalui GitHub dan akan ditinjau oleh Stewards sebelum muncul di laman PIPL.

(workflow melalui GitHub ini sangat amat primitif tapi ya sudah lah ya)

## Menulis artikel

Artikel ditulis menggunakan Markdown. Kamu bebas menggunakan editor apa pun, selama hasil akhirnya mengikuti struktur direktori berikut:

```
SLUG/
├── index.md
└── attachment/
    ├── image1.png
    └── image2.jpg
```

- `index.md` berisi tulisan dalam format Markdown dengan format berikut:
```md
---
layout: layout.njk
title: Judul
date: YYYY-MM-DD
tags: ["author_posts","tag","lain"]
---

# Judul

Isi tulsan...
```
- `attachment/` berisi gambar yang digunakan dalam artikel. Direktori ini tidak perlu ada jika artikel tidak menggunakan gambar.

Kamu bisa membuat struktur tersebut secara manual menggunakan editor markdown pilihanmu atau [Editor](https://pipl.csui.me/write/) di website PIPL.

Untuk menggunakannya:

1. Buka [~/write/](https://pipl.csui.me/write/).
2. Isi judul, tanggal publikasi, dan tags. Pisahkan tags dengan koma, misalnya `tutorial, opini`.
3. Tulis artikel menggunakan Markdown. Preview tersedia di samping editor, dan kamu juga bisa berganti ke mode WYSIWYG.
4. Tambahkan gambar dengan menempel (`ctrl` + `v`) atau mengunggah file langsung ke editor dengan tombol yang ber-icon gambar.
5. Klik **Export article** untuk mengunduh ZIP dengan struktur direktori seperti di atas.

Hasil eksport bisa langsung digunakan untuk langkah pengiriman artikel melalui GitHub.

## "Mengirim" artikel ke GitHub

Untuk menerbitkan tulisan, kamu perlu akun GitHub dan membuat pull request di repository website PIPL.
### Fork dan clone repositori

- Buka [PIPL-CSUI/Website](https://github.com/PIPL-CSUI/Website).
- Klik **Fork** untuk membuat salinan repositori di akun GitHub-mu.
- Clone repositori hasil fork.

```bash
git clone https://github.com/PIPL-CSUI/Website.git pipl-website
cd pipl-website
```

- Ekstrak ZIP hasil eksport tulisan kamu ke dalam lokasi berikut:

```text
content/
└── authors/
    └── USERNAME/ # buat direktori baru bila belum ada
        └── SLUG  # ekstrak ZIP hasil export tersebut
            ├── index.md
            └── attachment/
                └── image1.png
```

Ganti `USERNAME` dengan username GitHub-mu dan `SLUG` dengan nama singkat artikel. `USERNAME` dan `SLUG` akan digunakan sebagai URL, `https://pipl.csui.me/~USERNAME/SLUG`.

### Periksa dan kirim perubahan

Sebelum mengirim PR, jalankan build untuk memastikan tidak ada masalah:

```bash
npm run dev
```

Bila semua berjalan mulus, commit dan push perubahanmu:

```bash
git add content/authors/USERNAME/SLUG
git commit -m "Add article: SLUG"
git push -u origin master
```

Terakhir, buat pull request ke `PIPL-CSUI/Website` di branch `master`.

## 4\. Sebelum mengirim

Pastikan tulisan dan gambar yang kamu gunakan memang boleh dipublikasikan. Bila mengambil materi/artikel/blog/tulisan dari orang lain, silakan cantumkan source-nya. Tolong hindari memasukkan informasi pribadi atau hal-hal yang seharusnya tidak dipublikasikan.

Setelah PR dibuat, tunggu proses review.

That's it! <3
