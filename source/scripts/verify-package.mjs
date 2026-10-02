import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { Script } from 'node:vm';

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
assert.match(html, /<div id="root"><\/div>/);
assert.match(html, /<script src="\.\/config\.js"><\/script>/);
assert.doesNotMatch(html, /<script[^>]+type="module"|\/src\/main\.tsx|src="\.\/assets\//);
const inline = [...html.matchAll(/<script>\s*([\s\S]*?)\s*<\/script>/g)];
assert.equal(inline.length, 1, 'Phải có một script JS đã biên dịch và nhúng vào HTML.');
new Script(inline[0][1]); // Mã chạy dạng script cổ điển, không cần module/file server.
assert(html.indexOf('src="./config.js"') < html.indexOf(inline[0][0]));
assert(html.indexOf('<style>') < html.indexOf('<div id="root">'));
console.log('PASS: index.html chứa CSS/JS hợp lệ, không tham chiếu mã nguồn Vite.');

const port = 32479;
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['--import', 'tsx', 'server.ts'], {
  cwd: new URL('..', import.meta.url),
  env: {
    ...process.env,
    NODE_ENV: 'production',
    GEMINI_API_KEY: '',
    CORS_ORIGIN: 'https://test.github.io',
    PORT: String(port),
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let logs = '';
child.stdout.on('data', (chunk) => { logs += chunk; });
child.stderr.on('data', (chunk) => { logs += chunk; });

try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    if (child.exitCode !== null) throw new Error(`Server stopped: ${logs}`);
    try {
      const health = await fetch(`${base}/api/health`, { headers: { Origin: 'https://test.github.io' } });
      assert.equal(health.status, 200);
      assert.equal(health.headers.get('access-control-allow-origin'), 'https://test.github.io');
      assert.equal((await health.json()).geminiConfigured, false);
      ready = true;
      break;
    } catch (error) {
      if (attempt === 39) throw error;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  assert(ready);

  const preflight = await fetch(`${base}/api/chat`, {
    method: 'OPTIONS',
    headers: { Origin: 'https://test.github.io', 'Access-Control-Request-Method': 'POST' },
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), 'https://test.github.io');

  const denied = await fetch(`${base}/api/chat`, {
    method: 'OPTIONS',
    headers: { Origin: 'https://other.example', 'Access-Control-Request-Method': 'POST' },
  });
  assert.equal(denied.status, 403);

  const chat = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { Origin: 'https://test.github.io', 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Xin chào' }),
  });
  assert.equal(chat.status, 500);
  assert.match((await chat.json()).error, /GEMINI_API_KEY/);
  console.log('PASS: API health, CORS đúng/sai nguồn, báo thiếu khóa thật (không giả lập AI).');
} finally {
  child.kill('SIGTERM');
}
