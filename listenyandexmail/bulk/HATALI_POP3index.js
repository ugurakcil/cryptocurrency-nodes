'use strict'

const POP3Client = require("mailpop3")
const Cryptr = require('cryptr')
const Mysql = require('mysql')
var Util = require("util")
const simpleParser = require('mailparser').simpleParser;
const argv = require('optimist')
            .usage("Usage: $0 --port [port] --username [username] --password [password] --secret [secret code] --generatehash [true/false]")
            .demand([]) // 'password', 'secret'
            .argv;
const cryptr = new Cryptr(argv.secret || '*secretCode*');
let client
  , mailIds
  , db

const config = {
  host: 'pop3.yandex.com.tr',
  username: argv.username || 'enter your email',
  password: argv.password ? cryptr.decrypt(argv.password) : '>enter ur pass<',
  port: argv.port || 995,
  debug: false,
  enabletls: true,
  msgnumber: 3,

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

  await db.connect(function(err) {
    if (err) throw err;
    console.log("Connected to MySQL");
  })

  client = await new POP3Client(config.port, config.host, {
    enabletls: config.enabletls,
    debug: config.debug
  }).on("error", function(err) {
    if (err.errno === 111) console.log("Unable to connect to server")
    else console.log("Server error occurred")
    console.log(err);
  }).on("connect", async function() {
    console.log("Connected to YandexMail");
    await login()
  }).on("quit", function(status, rawdata) {
    if (status === true) console.log("QUIT success");
    else console.log("QUIT failed");
  });
}

async function login() {
  if (config.debug) console.log('.           ################# LOGIN #################')
  await client.login(config.username, config.password)

  client.on("login", async function(status, rawdata) {
    if (status) {
      console.log("LOGIN/PASS success");
      await list()
    } else {
      console.log("LOGIN/PASS failed");
      client.quit();
    }
  });
}

async function list() {
  await client.list(1)

  client.on("list", function(status, msgcount, msgnumber, data, rawdata) {
    if (config.debug) console.log('.           ################# LIST #################')
    if (status === false) {
      if (msgnumber !== undefined) console.log("LIST failed for msgnumber " + msgnumber);
      else console.log("LIST failed");
      client.quit();
    } else if (msgcount === 0) {
      console.log("LIST success with 0 elements");
      client.quit();
    } else {
      console.log("LIST success with " + msgcount + " element(s)");
      if (config.debug) console.log('LIST rawdata', rawdata)
      console.log('LIST data', JSON.stringify(data))
      console.log('LIST rawdata', JSON.stringify(rawdata))
      client.uidl();
    }
  }).on("uidl", function(status, msgnumber, data, rawdata) {
    if (config.debug) console.log('.           ################# UIDL #################')
    if (status === true) {
      console.log("UIDL success");
      if (config.debug) console.log("Parsed data: " + data);
      if (config.debug) console.log("Parsed rawdata: " + rawdata);
      //client.top(1,1000);
      //console.log(data, typeof data)
      for(let loop=1;loop<=data.length-1;loop++) {
        console.log(data[loop])
      }
      /*
      mailIds = data.split(',')
      for(let loop=1;loop<=mailIds.length;loop++) {
        console.log(mailIds[loop])
      }
      */
    } else {
      console.log("UIDL failed for msgnumber " + msgnumber);
      client.quit();
    }
  }).on("top", function(status, msgnumber, data, rawdata) {
    if (config.debug) console.log('.           ################# TOP #################')
  	if (status === true) {
  		console.log("TOP success for msgnumber " + msgnumber);
  		if (config.debug) console.log("Parsed data: " + data);
  		//if (config.debug) console.log("Parsed rawdata: " + rawdata);
  	} else {
  		console.log("TOP failed for msgnumber " + msgnumber);
  		client.quit();
  	}
  });
}


/*
async function start() {
  client = await new POP3Client(config.port, config.host, {
      enabletls: config.enabletls,
      debug: config.debug
  }).on("error", function(err) {
    console.log('.           ################# ERROR #################')
    if (err.errno === 111) console.log("Unable to connect to server")
    else console.log("Server error occurred")
    console.log(err);
  }).on("invalid-state", function(cmd) {
    console.log('.           ################# STATE #################')
    console.log("Invalid state. You tried calling " + cmd);
  }).on("locked", function(cmd) {
    console.log('.           ################# LOCKED #################')
    console.log("Current command has not finished yet. You tried calling " + cmd);
  }).on("connect", async function() {
    console.log('.           ################# CONNECT #################')
    console.log("CONNECT success");
    await login()
  }).on("quit", function(status, rawdata) {
    console.log('.           ################# QUIT #################')
    if (status === true) console.log("QUIT success");
    else console.log("QUIT failed");
  });
}

async function login() {
  await client.login(config.username, config.password)

  client.on("login", async function(status, rawdata) {
    console.log('.           ################# LOGIN #################')
    console.log(rawdata);
    if (status) {
      console.log("LOGIN/PASS success");
	    client.capa();
    } else {
      console.log("LOGIN/PASS failed");
      client.quit();
    }
  }).on("capa", function(status, data, rawdata) {
    console.log('.           ################# CAPA #################')
    console.log(rawdata);
    if (status) {
      console.log("CAPA success");
      if (config.debug) console.log("Parsed data: " + Util.inspect(data));
      client.noop();
    } else {
      console.log("CAPA failed");
      client.quit();
    }
  }).on("noop", function(status, rawdata) {
    console.log('.           ################# NOOP #################')
    console.log(rawdata);
    if (status) {
      console.log("NOOP success");
      client.stat();
    } else {
      console.log("NOOP failed");
      client.quit();
    }
  }).on("stat", async function(status, data, rawdata) {
    console.log('.           ################# STAT #################')
    if (status === true) {
      console.log("STAT success");
      if (config.debug) console.log("Parsed data: " + Util.inspect(data));
      if (config.debug) console.log("Parsed rawdata: " + rawdata);
      await list()
    } else {
      console.log("STAT failed");
      client.quit();
    }
  });
}

async function list() {
  await client.list(1)

  client.on("list", function(status, msgcount, msgnumber, data, rawdata) {
    console.log('.           ################# LIST #################')
    if (status === false) {
      if (msgnumber !== undefined) console.log("LIST failed for msgnumber " + msgnumber);
      else console.log("LIST failed");
      client.quit();
    } else if (msgcount === 0) {
      console.log("LIST success with 0 elements");
      client.quit();
    } else {
      console.log("LIST success with " + msgcount + " element(s)");
      console.log('LIST-RAWDATA ::: ', rawdata)
      client.uidl();
    }
  }).on("uidl", function(status, msgnumber, data, rawdata) {
    console.log('.           ################# UIDL #################')
    if (status === true) {
      console.log("UIDL success");
      if (config.debug) console.log("Parsed data: " + data);
      if (config.debug) console.log("Parsed rawdata: " + rawdata);
      //client.top(1, 10);
    } else {
      console.log("UIDL failed for msgnumber " + msgnumber);
      client.quit();
    }
  }).on("top", function(status, msgnumber, data, rawdata) {
    console.log('.           ################# TOP #################')
  	if (status === true) {
  		console.log("TOP success for msgnumber " + msgnumber);
  		if (config.debug) console.log("Parsed data: " + data);
  		//if (config.debug) console.log("Parsed rawdata: " + rawdata);
  		//client.retr(msgnumber);
  	} else {
  		console.log("TOP failed for msgnumber " + msgnumber);
  		client.quit();
  	}
  }).on("retr", function(status, msgnumber, data, rawdata) {
    console.log('.           ################# RETR #################')
  	if (status === true) {
  		console.log("RETR success for msgnumber " + msgnumber);
      console.log('.           ################# RETR (DATA) #################')
  		if (config.debug) console.log("Parsed data: " + data);
        console.log('.           ################# RETR (RAWDATA) #################')
  		if (config.debug) console.log("Parsed data: " + rawdata);
          //if (msgnumber !== undefined) client.dele(msgnumber);
          //else client.quit();
  	} else {
  		console.log("RETR failed for msgnumber " + msgnumber);
  		client.quit();
  	}
  });
}
*/
