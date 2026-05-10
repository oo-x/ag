import { createServer } from 'node:http';
import { createApp } from 'h3';
import { WebSocketServer } from 'ws';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToBonPath(import.meta.url));
function fileURLToBonPath(url) { return fileURLToPath(url); }

const app = createApp();
const server = createServer();

// Basic static file server using h3
app.use(async (event) => {
  const url = event.path;
  let filePath = path.join(process.cwd(), 'public', url === '/' ? 'index.html' : url);

  // If it's a directory, try to append index.html
  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath);
    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.ts': 'text/javascript',
    }[ext] || 'text/plain';

    event.setHeaders({ 'Content-Type': contentType });
    return content;
  }

  event.setResponseStatus(404);
  return 'Not Found';
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  const shell = spawn('/bin/bash', [], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: process.env,
  });

  shell.stdout.on('data', (data) => ws.send(data));
  shell.stderr.on('data', (data) => ws.send(data));

  ws.on('message', (message) => {
    shell.stdin.write(message);
        });

  shell.on('exit', () => ws.close());
  ws.on('close', () => shell.kill());
});

const PORT = 3000;
server.on('request', (req, res) => {
  app.handleRequest(req, res);
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
