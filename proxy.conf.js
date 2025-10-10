const PROXY_CONFIG = {
  "/api": {
    "target": "http://localhost:5003",
    "secure": false,
    "logLevel": "debug",
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    },
    "onProxyReq": function(proxyReq, req, res) {
      console.log('[Proxy]', req.method, req.url, '->', proxyReq.protocol + '//' + proxyReq.host + proxyReq.path);
    },
    "onProxyRes": function(proxyRes, req, res) {
      console.log('[Proxy Response]', proxyRes.statusCode, req.url);
    },
    "onError": function(err, req, res) {
      console.error('[Proxy Error]', err);
    }
  }
};

module.exports = PROXY_CONFIG;
