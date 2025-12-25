# Knight Chase - Online Server Kurulum Rehberi

Bu rehber, oyunu "Gerçek Online" (arkadaşlarınızla farklı evlerden oynayabileceğiniz) hale getirmek için sunucuyu (server) nasıl kurup çalıştıracağınızı adım adım anlatır.

---

## Mantık Nedir?
Bu oyunun iki parçası vardır:
1. **İstemci (Client):** Telefonunuza yüklediğiniz oyun (APK).
2. **Sunucu (Server):** Oyuncuların birbirini bulmasını sağlayan, skorları kaydeden ve oyun odalarını yöneten merkez bilgisayar.

Şu ana kadar sunucuyu kendi bilgisayarınızda (`localhost`) çalıştırdınız. Bu sadece aynı Wi-Fi ağındaki cihazlar için çalışır. **Dünyanın her yerinden erişim için bu sunucuyu internete (Cloud'a) yüklemeniz gerekir.**

---

## ADIM 1: Sunucuyu İnternete Yükleme (Ücretsiz Yöntem: Render.com)

En kolay ve ücretsiz yöntemlerden biri **Render.com** kullanmaktır.

### 1.1. GitHub Hesabı ve Deposu (Repository)
Kodlarınızın bir GitHub hesabında olması gerekir. Eğer yoksa:
1. [GitHub.com](https://github.com) adresine gidin ve üye olun.
2. Bilgisayarınızdaki proje klasörünü GitHub'a yükleyin (VS Code üzerinden "Publish to GitHub" diyerek yapabilirsiniz).

### 1.2. Render.com Hesabı
1. [Render.com](https://render.com) adresine gidin.
2. "Get Started for Free" butonuna basın.
3. "GitHub" ile giriş yapın.

### 1.3. Web Service Oluşturma
1. Render panelinde **"New +"** butonuna basın ve **"Web Service"** seçin.
2. "Connect a repository" kısmından GitHub'daki `knight-chase` projenizi seçin (Connect butonuna basın).
3. Açılan ayar sayfasında şunları yapın:
   - **Name:** `knight-chase-server` (veya istediğiniz bir isim)
   - **Region:** Frankfurt (Türkiye'ye en yakın) veya varsayılan kalabilir.
   - **Branch:** `main` veya `master`
   - **Root Directory:** `server` (Burası çok önemli! Sunucu kodları `server` klasörünün içinde.)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
   - **Free Tier:** "Free" seçeneğini işaretleyin.
4. **"Create Web Service"** butonuna basın.

Render şimdi sunucunuzu kurmaya başlayacak. Bu işlem 1-2 dakika sürer. Bittiğinde size sol üstte şöyle bir adres verecek:
`https://knight-chase-server.onrender.com`

**Bu adresi kopyalayın! Bu sizin gerçek online sunucu adresiniz.**

---

## ADIM 2: Oyunu Sunucuya Bağlama

Şimdi oyunun (APK'nın) bu yeni adresi bilmesi gerekiyor.

1. VS Code'da şu dosyayı açın: `src/lib/api.ts`
2. Dosyanın en üstünde `SERVER CONFIGURATION` bölümünü göreceksiniz.
3. `PRODUCTION_URL` kısmına kopyaladığınız adresi yapıştırın.

Örnek:
```typescript
// 2. PRODUCTION (Online):
const PRODUCTION_URL = 'https://knight-chase-server.onrender.com'; 
```

---

## ADIM 3: Oyunu Güncelleme ve APK Alma

Yaptığınız değişikliğin telefona gitmesi için:

1. Terminali açın.
2. Projeyi derleyin:
   ```bash
   npm run build
   ```
3. Değişiklikleri Android projesine aktarın:
   ```bash
   npx cap copy
   npx cap sync
   ```
4. Android Studio'yu açın:
   ```bash
   npx cap open android
   ```
5. Android Studio'da tekrar **Build > Generate Signed Bundle / APK** diyerek yeni APK'yı oluşturun.

Artık bu yeni APK'yı yükleyen herkes, dünyanın neresinde olursa olsun `Play Online` modunda birbirini görebilir ve skor tablosuna (Leaderboard) adını yazdırabilir!

---

## Önemli Notlar

*   **Uyku Modu:** Render'ın ücretsiz sürümü, 15 dakika işlem yapılmazsa "uyku moduna" geçer. Uyuyan sunucuya ilk giriş 30-40 saniye sürebilir (açılmasını bekleyin).
*   **Veritabanı:** Ücretsiz sunucularda (Render Free Tier gibi) sunucu yeniden başlatıldığında veritabanı (skorlar ve kullanıcılar) **sıfırlanabilir**. Kalıcı veritabanı için Render'da "Disk" eklemek (ücretli) veya MongoDB Atlas gibi harici bir veritabanı kullanmak gerekir. Başlangıç ve test için SQLite (mevcut yapı) yeterlidir.
