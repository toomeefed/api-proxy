const url = require('url');
const util = require('util');
const http = require('http');
const https = require('https');
const qs = require('querystring');
const getPort = require('get-port');

exports.host = 'localhost';
const { host } = exports;

exports.createServer = async (all = false) => {
  const port = await getPort();

  const s = http.createServer((req, res) => {
    const { pathname, query } = url.parse(req.url);
    req.pathname = pathname;
    req.query = qs.parse(query);
    if (all) {
      s.emit('*', req, res);
    } else {
      s.emit(pathname, req, res);
    }
  });

  s.host = host;
  s.port = port;
  s.url = `http://${host}:${port}`;
  s.protocol = 'http';

  s.listen = util.promisify(s.listen);
  s.close = util.promisify(s.close);

  return s;
};

exports.createSSLServer = async (options) => {
  const port = await getPort();

  const s = https.createServer(options, (req, res) => {
    const { pathname, query } = url.parse(req.url);
    req.pathname = pathname;
    req.query = qs.parse(query);
    if (options.all) {
      s.emit('*', req, res);
    } else {
      s.emit(pathname, req, res);
    }
  });

  s.host = host;
  s.port = port;
  s.url = `https://${host}:${port}`;
  s.protocol = 'https';

  s.listen = util.promisify(s.listen);
  s.close = util.promisify(s.close);

  return s;
};
