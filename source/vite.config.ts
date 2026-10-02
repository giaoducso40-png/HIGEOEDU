import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { askHigeoAI, generateQuizAI } from './server/geminiService.ts';

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Parse JSON body if POST
        let body: any = {};
        if (req.method === 'POST') {
          body = await new Promise((resolve) => {
            let data = '';
            req.setEncoding('utf-8');
            req.on('data', (chunk: string) => {
              data += chunk;
            });
            req.on('end', () => {
              try {
                resolve(data ? JSON.parse(data) : {});
              } catch {
                resolve({});
              }
            });
            req.on('error', () => resolve({}));
          });
        }

        res.setHeader('Content-Type', 'application/json');

        if (req.url === '/api/chat' && req.method === 'POST') {
          try {
            const { message, history, fileContext } = body;
            const reply = await askHigeoAI({ message, history, fileContext });
            res.end(JSON.stringify({ reply }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || 'Lỗi xử lý AI' }));
          }
          return;
        }

        if (req.url === '/api/generate-quiz' && req.method === 'POST') {
          try {
            const { subject, grade, topic, count, difficulty } = body;
            const questions = await generateQuizAI({
              subject: subject || 'history',
              grade: grade || 'Lớp 7',
              topic: topic || 'Khí hậu Việt Nam',
              count: Number(count) || 5,
              difficulty: difficulty || 'medium',
            });
            res.end(JSON.stringify({ questions }));
          } catch (err: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || 'Lỗi tạo câu hỏi' }));
          }
          return;
        }

        if (req.url === '/api/feedback' && req.method === 'POST') {
          res.end(JSON.stringify({
            success: true,
            message: 'Cảm ơn bạn! Góp ý đã được gửi đến đội ngũ HIGEOEDU. 💙',
          }));
          return;
        }

        if (req.url === '/api/health') {
          res.end(JSON.stringify({
            status: 'ok',
            app: 'HIGEOEDU',
            geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
          }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
