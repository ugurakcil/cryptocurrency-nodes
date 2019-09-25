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

const cryptr = new Cryptr(argv.secret || '*secretCode*');

const config = {
  host: 'imap.yandex.com.tr',
  username: argv.username || 'enter your email',
  password: argv.password ? cryptr.decrypt(argv.password) : '>enter your pass<',
  port: argv.port || 993,
  debug: false,
  tls: true,

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
  if (config.debug) console.log('.           ################# STARTING #################')

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
    tls: config.tls
  })

  client.once('ready', async function() {
    await list()
  });

  client.once('error', function(err) {
    console.log(err);
  });

  client.once('end', function() {
    console.log('Connection ended');
  });

  client.connect();
}

async function openInbox(cb) {
  await client.openBox('INBOX', true, cb);
}

async function search(cb) {
  await openInbox(async function(err, box) {
    await client.search([ 'UNSEEN', ['SINCE', 'May 20, 2019'] ], function(err, results) {
      if (err) throw err;
      cb(results)
    })
  })
}

async function list() {
  await search((results) => {
    var f = client.fetch(results, { bodies: '' })

    f.on('message', function(msg, seqno) {
      const prefix = '(#' + seqno + ') ';
      msg.on('body', function(stream, info) {
        mailParser(stream, (err, mail) => {
          if (err) {
            console.log('Read mail executor error.', err);
            this.emit(EXECUTOR_EVENTS.STOPPED, { reason: END_REASON.ERROR, error: err });
          }

          const checkDomain = mail.from.value[0].address.split('@')[1]

          if(checkDomain !== 'icrypex.com') {
            this.emit(EXECUTOR_EVENTS.STOPPED, { reason: END_REASON.ERROR, error: 'Received a non-domain mail' });
          }

          const mailDomRoot = htmlParser(mail.textAsHtml);
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
        });
      });

      msg.once('attributes', function(attrs) {
        //console.log(prefix + 'Attributes: %s', Util.inspect(attrs, false, 8));
      });

      msg.once('end', function() {
        //console.log(prefix + 'Finished');
      });

    });

    f.once('error', function(err) {
      console.log('Fetch error: ' + err);
    });

    f.once('end', function() {
      console.log('Done fetching all messages!');
      client.end();
    });
  })
}

/*
async function list() {
  openInbox(function(err, box) {

    if (err) throw err;

    var f = client.seq.fetch('1:3', {
      bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
      struct: true
    });

    f.on('message', function(msg, seqno) {
      console.log('Message #%d', seqno);
      var prefix = '(#' + seqno + ') ';

      msg.on('body', function(stream, info) {
        var buffer = '';
        stream.on('data', function(chunk) {
          buffer += chunk.toString('utf8');
        });
        stream.once('end', function() {
          console.log(prefix + 'Parsed header: %s', Util.inspect(Imap.parseHeader(buffer)));
        });
      });

      msg.once('attributes', function(attrs) {
        console.log(prefix + 'Attributes: %s', Util.inspect(attrs, false, 8));
      });

      msg.once('end', function() {
        console.log(prefix + 'Finished');
      });

    });

    f.once('error', function(err) {
      console.log('Fetch error: ' + err);
    });

    f.once('end', function() {
      console.log('Done fetching all messages!');
      client.end();
    });

  });
}
*/
