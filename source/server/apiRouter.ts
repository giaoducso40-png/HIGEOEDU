import { Router, Request, Response } from 'express';
import { askHigeoAI, generateQuizAI } from './geminiService.ts';

export const apiRouter = Router();

// Store feedback in memory for demo/evaluation
interface FeedbackItem {
  id: string;
  email: string;
  content: string;
  createdAt: string;
}

const feedbacks: FeedbackItem[] = [
  {
    id: 'fb-1',
    email: 'thcsbinhchuan2@edu.vn',
    content: 'Ứng dụng HIGEOEDU rất trực quan, giao diện thám hiểm cuốn hút các em học sinh rất nhiều!',
    createdAt: new Date().toISOString(),
  },
];

// POST /api/chat
apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, fileContext } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Nội dung tin nhắn không được để trống.' });
      return;
    }

    const reply = await askHigeoAI({ message, history, fileContext });
    res.json({ reply });
  } catch (error: any) {
    console.error('API /chat error:', error);
    res.status(500).json({ error: error.message || 'Lỗi xử lý AI' });
  }
});

// POST /api/generate-quiz
apiRouter.post('/generate-quiz', async (req: Request, res: Response) => {
  try {
    const { subject, grade, topic, count, difficulty } = req.body;
    const questions = await generateQuizAI({
      subject: subject || 'history',
      grade: grade || 'Lớp 7',
      topic: topic || 'Khí hậu Việt Nam',
      count: Number(count) || 5,
      difficulty: difficulty || 'medium',
    });

    res.json({ questions });
  } catch (error: any) {
    console.error('API /generate-quiz error:', error);
    res.status(500).json({ error: error.message || 'Lỗi tạo câu hỏi' });
  }
});

// POST /api/feedback
apiRouter.post('/feedback', (req: Request, res: Response) => {
  try {
    const { email, content } = req.body;
    if (!content || typeof content !== 'string') {
      res.status(400).json({ error: 'Vui lòng nhập ý kiến đóng góp của bạn.' });
      return;
    }

    const item: FeedbackItem = {
      id: `fb-${Date.now()}`,
      email: email || 'Học sinh ẩn danh',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    feedbacks.unshift(item);

    res.json({
      success: true,
      message: 'Cảm ơn bạn! Góp ý đã được gửi đến đội ngũ HIGEOEDU. 💙',
      item,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Lỗi lưu góp ý' });
  }
});

// GET /api/health
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'HIGEOEDU',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});
