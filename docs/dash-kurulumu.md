# DASH CORE KURULUMU

Dash Coin için full node kurulumu.

## Bağımlılıklar

ZeroMQ servislerinin çalışması veya bağımlılıklardan kaynaklı hatalar almamak için önce bunları yükleyin;

```bash
sudo yum install -y epel-release
sudo yum install -y zeromq-devel
```

## Kurulum

### İndirme

https://www.dash.org/downloads/ adresinden ilgili Linux indirmesinin linkini alın.

Uygun gördüğünüz bir klasör altına (/home/ugurakcil/Downloads) indirme işlemini yapın;

```bash
wget https://github.com/dashpay/dash/releases/download/v0.14.0.3/dashcore-0.14.0.3-x86_64-linux-gnu.tar.gz
```

### Yapılandırma ve Kurulum

Ana dizinizde .dashcore dizini oluşturun ve indirdiğiniz dosyaları çıkartıp taşıyın;

```bash
mkdir ~/.dashcore && mkdir ~/.dashcore/core && mkdir ~/.dashcore/data
tar xvzf dashcore-0.14.0.3-x86_64-linux-gnu.tar.gz -C ~/.dashcore/core  --strip-components 1
chmod 777 ~/.dashcore/core/bin/*
```

Konfigürasyon dosyasını oluşturun;

```bash
nano ~/.dashcore/dash.conf
```

ve içine ekleyin;

```bash
server=1
#testnet=1
#litemode=1
whitelist=0.0.0.0/0
txindex=1
addressindex=1
timestampindex=1
spentindex=1
zmqpubrawtx=tcp://127.0.0.1:28332
zmqpubrawtxlock=tcp://127.0.0.1:28332
zmqpubhashblock=tcp://127.0.0.1:28332
rpcallowip=192.243.102.83
rpcallowip=127.0.0.1
rpcuser=dash
rpcpassword=local321
uacomment=dashcore
debug=1
printtoconsole=0
alerts=1
shrinkdebugfile=1
```

Başlatma işleminde path ayarlarını kesin doğrulukta belirtmek ve ek ayarlar yapmak için bash hazırlayın;

```bash
nano ~/.dashcore/start.sh
```

Bash dosyasına şunları ekleyin;

```bash
#!/bin/bash
COREPATH="${HOME}/.dashcore/core/bin/dashd --conf=${HOME}/.dashcore/dash.conf --datadir=${HOME}/.dashcore/data"
echo "$COREPATH"
echo "DashCore started with your configurations.."
eval "$COREPATH"
```

Yapılandırdığınız dash çekirdek dizinine gidin;

```bash
cd ~/.dashcore
```

Bash scriptinize yetkileri verin;

```bash
chmod -R 777 start.sh
```

## Kullanım

Kurulum ve yapılandırma işlemleri tamamlandıktan sonra senkronizasyon işlemini başlatın;

```bash
./start.sh
```

# Örnek RPC İşlemleri

5 saat - 1.5 gün arası senkronizasyon işlemi sürecektir. Ardından ~/.dashcore/core/bin/dash-cli 'ye parametreler göndererek veya api kullanarak node üzerinde işlemlerinizi gerçekleştirebilirsiniz;

```bash
./dash-cli -rpcuser=dash -rpcpassword=local321 getnewaddress
```

```bash
./dash-cli -rpcuser=dash -rpcpassword=local321 validateaddress <insert-address>
```

```bash
./dash-cli -testnet -rpcuser=dash -rpcpassword=local321 getinfo
```

# Diğer Notlar

## DashCore'u Durdur ve Yeniden Başlat

Çalışan dash'in PID numarasını bulun;

```bash
ps -ax | grep dash
```

Bu PID numarasını girerek işlemi silin (Örn PID: 11123);

```bash
kill -9 11123
```

İhtiyaç duyduğunuz düzenlemeleri yaptıktan sonra start.sh dosyasını tekrar çalıştırın.

## Wallet Notify

Konfigürasyon dosyasını açın

```bash
nano ~/.dashcore/dash.conf
```

Son satıra ekleyin;
```bash
walletnotify=/root/.dashcore/walletnotify.sh %s
```

SH dosyası oluşturun ve çalıştırmak için gereken yetkileri verin;

```bash
nano ~/.dashcore/walletnotify.sh
```

```bash
#!/bin/sh
F = notify_log
D = `date +"%Y%m%d%H%M%S"`
echo ${D} - ${1} >> ${F}
#curl -d "txid=$1" http://127.0.01
```
