# arac/ — ölçüm takımı

Bu projenin tek kuralı: **göz kararı yanıltıyor, ölçmeden konuşma.** Bu klasördeki
araçlar o kuralı uygulanabilir kılıyor. Hepsi bu oturumda sıfırdan yazıldı.

```bash
npm i terser roadroller canvas          # arac/ içinde
pip install zopfli
```

| araç | ne yapar | kullanım |
|---|---|---|
| `paket.js` | teslim zip'ini üretir, **tek doğru boyut** | `node paket.js ../rainwormhole.html out.zip` |
| `goruntu.js` | oyunu node-canvas'ta çalıştırıp **gerçek PNG kare** yazar | `node goruntu.js ../rainwormhole.html 4 40 kare.png spawn` |
| `coz-all.js` | **18 bölümün scriptli çözümü** — regresyon takımı | `node coz-all.js ../rainwormhole.html` |
| `cozum.js` | çözüm harness'ı (DSL: key/aim/fire/jump/grab/wait/check) | kütüphane |
| `isinlanma.js` | tüm portal çiftlerini deneyip sıkışma arar | `node isinlanma.js ../rainwormhole.html 21` |
| `wcag.js` | gerçek karelerden çakan alan ölçer | `node wcag.js ../rainwormhole.html 21` |
| `ziplama-olc.js` | zıplama menzilini ölçer | `node ziplama-olc.js` |
| `ses-sikligi.js` | hangi ses saniyede kaç kez çalıyor | `node ses-sikligi.js` |
| `zzfx-lab.js` | ZzFX örneklerini üretip perde/zarf konturu çıkarır | kütüphane |
| `sure.js` | ms/kare | `LV=4 node sure.js ../rainwormhole.html 120` |
| `konsol.js` | paketlenmiş sürümü koşturup konsol çıktısını yakalar | `node konsol.js` |
| `kapak.js` | mağaza görselleri (800×500, 320×320) | `node kapak.js` |

## Sıralama — motorda bir şey değiştirdiysen

```bash
node coz-all.js ../rainwormhole.html      # 18/18 gecmeli
node isinlanma.js ../rainwormhole.html 21 # 0 kotu olmali
node paket.js ../rainwormhole.html ../Rainwormhole.zip
```

Işığa duyarlılıkla ilgili bir şeye dokunduysan `wcag.js` de.

## Node'da oyunu çalıştırmanın dört tuzağı

1. `const`/`let` vm bağlamına **sızmaz**. Betiğin sonuna açık dışa aktarım gerekiyor —
   `goruntu.js` bunu kendi ekliyor.
2. **Yeniden atanan dizileri getter'la aktar**: `get cubes(){return cubes}`. `load()`
   diziyi yeniden atıyor; doğrudan referans eski diziye bakar ve ölçümün yalan olur.
3. node-canvas'ta **`Path2D` yok**. `goruntu.js` içinde vekili var: SVG yolunu ayrıştırıp
   komutları kaydediyor, `fill`/`stroke` çağrısında yeniden oynatıyor.
4. **`Function` ve `eval`'i host'tan geçirme** — Roadroller'ın kendini açan kodu host
   kapsamında çalışıp `document` bulamaz.

## Ölçüm aracının kendisi de yanılabilir

İki kez oldu, ikisi de burada yazılı dursun:

- Perdeyi **sıfır geçişiyle** sayıyordum; testere dalgası çevrim başına bir kez sıfırı
  geçtiği için frekansı yarım, `tan` dalgası onlarca kez geçtiği için altı kat okudu.
  Otokorelasyona geçildi.
- Kürelsel sızıntı testini `Object.keys(sandbox)` ile yapıyordum; `let` ile açılan
  globaller orada **görünmüyor**, test yanlış olumlu verdi. Doğrusu: betiği aynı
  bağlamda iki kez çalıştır, `let` bırakıyorsa ikincisi "already been declared" atar.
