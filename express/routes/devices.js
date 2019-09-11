var express = require('express');
var useragent = require('useragent');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  var agent = useragent.parse(req.headers['user-agent']);

  var data = '<strong>UserAgent JSON Parse</strong><br>';
  data += JSON.stringify(agent)

  /*
  add to app that 'app.set('trust proxy', true)' if it doesnt work

  for like the CloudFlare Layer;
  var ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress
  */
  data += '<hr><strong>User IP</strong><br>'
  data += req.ip.split(':').pop();

  data += '<hr><strong>Browser</strong><br>'
  data += agent.family;
  data += '<hr><strong>Device</strong><br>'
  data += agent.device.family;
  data += '<hr><strong>OS</strong><br>'
  data += agent.os.family;

  data += '<hr><strong>All Browser Information</strong><br>'
  data += agent.toAgent();
  data += '<hr><strong>Browser Version</strong><br>'
  data += agent.toVersion();

  data += '<hr><strong>Operation System Parse JSON</strong><br>'
  data += JSON.stringify(agent.os);
  data += '<hr><strong>OS Version</strong><br>'
  data += agent.os.toVersion();

  data += '<hr><strong>All Operation System Information</strong><br>'
  data += agent.os.toString();
  data += '<hr><strong>Device Version</strong><br>'
  data += agent.device.toVersion();

  res.send(data);
});

/*
# IP getting note about the cloudflare, ngnix x-real-ip support

var user_ip;
if(req.headers['cf-connecting-ip'] && req.headers['cf-connecting-ip'].split(', ').length) {
  let first = req.headers['cf-connecting-ip'].split(', ');
  user_ip = first[0];
} else {
  let user_ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
}
*/


module.exports = router;
