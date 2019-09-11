# ICRYPEX PRICEPOOL 2

OneForge, CoinCap vb. sağlayıcı API'larından alınan verilerin kaydedilmesi ve günlük, haftalık, aylık analizlerinin sorgulanması için hazırlanmıştır.

## Gereksinimler

MongoDB, NodeJS ES6, Filtre Kahve

## Kurulum

### config.js
Veritabanı bağlantısı, sağlayıcı ayarları, yardımcı fonksiyonlar, veritabanı şemaları vb. temel konfigürasyonlar bulunur

### main.js 
Sağlayıcılardan gelen veriler veritabanına burada işlenir. Systemctl olarak sürekli çalıştırılmalı.

### fetch.js 
Veritabanına kaydedilmiş verileri getirmek için gerekli sorgular bulunur. Son kullanıcıya gereken veriler bu kütüphane kullanılarak çekilmeli.

```bash
cd pricepool
npm install

npm start
# or 
node main.js

# Sistem servisi olarak yaratabilirsiniz
```

## Kullanım

```js
const pricePool = require('pricepool/fetch.js')

pricePool.getToday()
```

# Önemli Ayrıntılar

CoinCap API'ınden maxSupply datalarından bazıları null olarak geliyor. Bu dataları kaydederken NaN olarak kaydettik. 

Dataları çekerken NaN kontrolü yapmayı unutmayın.

# Olası Sorunlar

CoinCap üzerinden 3'den fazla sembol'ün verisi çekilecekse günlük fiyat güncellemeleri toplu update için tekrar düzenlenmeli. Bunun için config'de tanımlanan semboller toplu olarak çekilip, döngü içerisinde kontroller yapılabilir. Böylece ne kadar sembol çekilirse çekilsin 3 sorguyla günlük veriler güncellenir.

