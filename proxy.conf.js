const PROXY_CONFIG = {
  "/api/proveedores": {
    "target": "http://localhost:5002",
    "secure": false,
    "logLevel": "debug",
    "changeOrigin": true,
    "onProxyReq": function(proxyReq, req, res) {
      console.log('[Proxy Proveedores]', req.method, req.url, '->', proxyReq.protocol + '//' + proxyReq.host + proxyReq.path);
    },
    "onProxyRes": function(proxyRes, req, res) {
      console.log('[Proxy Proveedores Response]', proxyRes.statusCode, req.url);
    },
    "onError": function(err, req, res) {
      console.error('[Proxy Proveedores Error]', err);
    }
  },
  "/api": {
    "target": "http://localhost:5003",
    "secure": false,
    "logLevel": "debug",
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    },
    "onProxyReq": function(proxyReq, req, res) {
      console.log('[Proxy Auth]', req.method, req.url, '->', proxyReq.protocol + '//' + proxyReq.host + proxyReq.path);
    },
    "onProxyRes": function(proxyRes, req, res) {
      console.log('[Proxy Auth Response]', proxyRes.statusCode, req.url);
    },
    "onError": function(err, req, res) {
      console.error('[Proxy Auth Error]', err);
    }
  }
};

module.exports = PROXY_CONFIG;
