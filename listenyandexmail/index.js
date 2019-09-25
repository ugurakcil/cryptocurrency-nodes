'use strict'

const Imap    = require('imap')
const Cryptr  = require('cryptr')
const Mysql   = require('mysql')
const Util    = require("util")

const argv    = require('optimist')
              .usage("Usage: $0 --port [port] --username [username] --password [password] --secret [secret code] --generatehash [true/false]")
              .demand([]) // 'password', 'secret'
              .argv;

const mailParser = require('mailparser').simpleParser;
const htmlParser = require('node-html-parser').parse;

let client
  , mailIds
  , db
  , globalResults

/*
TEMEL AYARLAR
host, username, password, port alanlarınızı IMAP sunucusu bilgilerinize göre ekleyin
"argv." bulunan alanlara node'u çalıştırırken parametre olarak manuel gönderim yapabilirsiniz
network dinlenmesini önlemek için password kısmına gönderilen parolalar hash haline getirilmelidir.

Hash üretmek için;
node index.js --generatehash p*a*r*o*l*a*n

Bu size bir hash code verecektir. Parolanızı şifrelenmiş bir parametre olarak
gönderdiğinizde bu dosyaya açık olarak yazmanıza gerek olmayacak. Ancak networkte
özel gizli anahtarınızla birlikte görüneceği için parolanın dosya üzerinden ayarlanması
tavsiye edilir.

Eğer cryptr değişkenindeki secretCode'dan
farklı olarak manuel bir hash code'u girmek isterseniz;
node index.js --generatehash p*a*r*o*l*a*n --secret "özelBirGizliAnahtar"

Hash code'unuzu kullanarak mail'leri talep etmek için;
node index.js --password "HASHCODE"

Eğer özel anahtar belirterek oluşturduysanız;
node index.js --password "HASHCODE" --secret "özelBirGizliAnahtar"
*/

const cryptr = new Cryptr(argv.secret || '*secretCode*');

const config = {
  host: 'imap.yandex.com.tr',
  username: argv.username || 'enter your email',
  password: argv.password ? cryptr.decrypt(argv.password) : 'enter your pass',
  port: argv.port || 993,
  tls: true,
  senderDomain: 'akbank.com.tr', // Çekilecek e-postaların geldiği etki alanı
  since: 'May 20, 2019', // Hangi tarihten sonraki e-postalara bakılacak
  debug: false,

  mysql: {
    host: 'localhost',
    user: 'root',
    password: 'lion'
  }
}

;(async() => {
  if(argv.generatehash){
    console.log('Write hash code instead of password :', cryptr.encrypt(argv.password))
  } else {
    await start()
  }
})();

async function start() {
  db = await Mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password
  })

  client = await new Imap({
    user: config.username,
    password: config.password,
    host: config.host,
    port: config.port,
    tls: config.tls,
    debug: config.debug ? console.log : null
  })

  client.once('ready', async function() {
    await list()
  });

  client.connect();
}

async function openInbox(cb) {
  await client.openBox('INBOX', false, cb);
}

async function search(cb) {
  await openInbox(async function(err, box) {
    await client.search([ 'UNSEEN', ['SINCE', config.since] ], function(err, results) {
      if (err) throw err;
      if(!results || results.length <= 0){
        console.log("No unseen email available"); client.end(); return;
      }

      cb(results)
    })
  })
}

async function list() {
  await search((results) => {
    var f = client.fetch(results, { bodies: '', markSeen: true })

    f.on('message', function(msg, seqno) {
      msg.on('body', function(stream, info) {
        mailParser(stream, (err, mail) => {
          if (err) {
            console.log('Read mail executor error.', err); client.end(); return;
          }

          const checkDomain = mail.from.value[0].address.split('@')[1]

          /*
          Mail parse işlemleri
          E-posta formatlarında veya domain'de değişiklik olursa ya da
          yeni bir etki alanı için listener yazacaksanız bu bölümde değişiklik yapın
          */
          if(checkDomain !== config.senderDomain) {
            console.log('Received a mail at a non-domain'); client.end(); return;
          }

          const mailDomRoot = htmlParser(mail.textAsHtml)
          const mailRegex = /aÃ§Ä±klamasÄ± ile (.+) tarafÄ±ndan (.+) TL EFT|HAVALE (.+) \s?/.exec(mailDomRoot.text)
          const mailValues = {
            name: mailRegex[1],
            price: mailRegex[2]
          }

          if(mail.subject == 'Hesabınıza nakit girişi olmuştur') {
            mailValues.type = 'in'
          } else if(mail.subject == 'Hesabınızdan nakit çıkışı olmuştur') {
            mailValues.type = 'out'
          } else {
            mailValues.type = 'other'
          }

          console.log(mailValues)
          /*
          ./ Mail parse işlemleri
          */
        });
      });
    });

    f.once('error', function(err) {
      console.log('Fetch error: ' + err);
    })

    f.once('end', function() {
      client.end()
    })
  })
}
