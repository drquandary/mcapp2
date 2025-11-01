/**
 * Combined server for ngrok - serves frontend and proxies backend API
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const BACKEND_URL = 'http://localhost:5001';

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // Proxy API requests to backend
    if (parsedUrl.pathname.startsWith('/api/')) {
        console.log(`[Proxy] ${req.method} ${parsedUrl.pathname}`);

        const options = {
            hostname: 'localhost',
            port: 5001,
            path: parsedUrl.pathname + (parsedUrl.search || ''),
            method: req.method,
            headers: req.headers
        };

        const proxyReq = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (e) => {
            console.error(`[Proxy Error] ${e.message}`);
            res.writeHead(502);
            res.end('Backend API not available');
        });

        req.pipe(proxyReq);
        return;
    }

    // Serve static files
    let filePath = '.' + parsedUrl.pathname;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║          NewsMode Ngrok Server                            ║
╠═══════════════════════════════════════════════════════════╣
║  Frontend: http://localhost:${PORT}                         ║
║  Backend Proxy: http://localhost:${PORT}/api/*              ║
║  Backend Direct: ${BACKEND_URL}                ║
║                                                           ║
║  Ready for ngrok!                                         ║
║  Run: ngrok http ${PORT}                                    ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
