import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';
const DIST_DIR = path.join(__dirname, 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.zip': 'application/zip',
};

const server = http.createServer((req, res) => {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Cloud Run Health checks & head requests
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  let safeUrl = '/';
  try {
    safeUrl = decodeURI((req.url || '/').split('?')[0]);
  } catch {
    safeUrl = '/';
  }

  // Dedicated handling for project zip download
  if (safeUrl === '/kaiquest-piano-deploy.zip') {
    const candidatePaths = [
      path.join(DIST_DIR, 'kaiquest-piano-deploy.zip'),
      path.join(__dirname, 'public', 'kaiquest-piano-deploy.zip'),
      path.join(__dirname, 'kaiquest-piano-deploy.zip'),
    ];
    const zipPath = candidatePaths.find(p => fs.existsSync(p));
    if (zipPath) {
      try {
        const stats = fs.statSync(zipPath);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename="kaiquest-piano-deploy.zip"');
        res.setHeader('Content-Length', stats.size);
        res.setHeader('Cache-Control', 'no-cache');
        if (req.method === 'HEAD') {
          res.end();
          return;
        }
        fs.createReadStream(zipPath).pipe(res);
        return;
      } catch (err) {
        console.error('Error streaming zip file:', err);
      }
    }
  }

  if (safeUrl === '/') {
    safeUrl = '/index.html';
  }

  // Normalize path to prevent directory traversal
  const normalizedPath = path.normalize(safeUrl).replace(/^(\.\.[/\\])+/, '');
  let filePath = path.join(DIST_DIR, normalizedPath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback: serve index.html for client-side routing
      filePath = path.join(DIST_DIR, 'index.html');
    }

    fs.stat(filePath, (fallbackErr, fallbackStats) => {
      if (fallbackErr || !fallbackStats.isFile()) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end('<!DOCTYPE html><html><body><h1>KaiQuest Piano Adventure</h1><p>Building or static assets loading...</p></body></html>');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', fallbackStats.size);

      // Cache immutable assets
      if (filePath.includes('/assets/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }

      if (req.method === 'HEAD') {
        res.end();
        return;
      }

      const stream = fs.createReadStream(filePath);
      stream.on('error', (streamErr) => {
        console.error('Stream error:', streamErr);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      });
      stream.pipe(res);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 KaiQuest Production Server listening on http://${HOST}:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    process.exit(0);
  });
});
