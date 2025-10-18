const PROXY_CONFIG = {
  "/api/producto": {
    "target": "http://localhost:5003",
    "secure": false,
    "logLevel": "debug",
    "changeOrigin": true,
    "pathRewrite": {
      "^/api/producto": "/producto"
    },
    "onProxyReq": function(proxyReq, req, res) {
      console.log('[Proxy Productos]', req.method, req.url, '->', proxyReq.protocol + '//' + proxyReq.host + proxyReq.path);
    },
    "onProxyRes": function(proxyRes, req, res) {
      console.log('[Proxy Productos Response]', proxyRes.statusCode, req.url);
    },
    "onError": function(err, req, res) {
      console.error('[Proxy Productos Error]', err);
    }
  },
  "/api": {
    "target": "http://localhost:5002",
    "secure": false,
    "logLevel": "debug",
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    },
    "onProxyReq": function(proxyReq, req, res) {
      console.log('[Proxy Mediador]', req.method, req.url, '->', proxyReq.protocol + '//' + proxyReq.host + proxyReq.path);
    },
    "onProxyRes": function(proxyRes, req, res) {
      console.log('[Proxy Mediador Response]', proxyRes.statusCode, req.url);
    },
    "onError": function(err, req, res) {
      console.error('[Proxy Mediador Error]', err);
    }
  }
};

module.exports = PROXY_CONFIG;
