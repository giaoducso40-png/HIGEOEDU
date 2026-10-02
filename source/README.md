# HIGEOEDU

Nền tảng học Lịch sử – Địa lí cho học sinh THCS. Mã nguồn xuất từ [Google AI Studio](https://ai.studio/apps/c41fef1a-d355-4d52-811b-bda2514b67a0).

## Chạy trên máy

Yêu cầu Node.js và npm.

1. Chạy `npm install`.
2. Sao chép `.env.example` thành `.env`, điền `GEMINI_API_KEY` của bạn. Không công khai khóa này.
3. Chạy `npm run dev`, rồi mở `http://localhost:3000`.

Kiểm tra kiểu TypeScript bằng `npm run lint`; tạo bản giao diện bằng `npm run build`. Để chạy bản build cùng các API, đặt `NODE_ENV=production` và chạy `npm run start` trên một dịch vụ hỗ trợ Node.js, với biến môi trường `GEMINI_API_KEY` được cấu hình ở phía máy chủ.

## Lưu ý triển khai

Ứng dụng có máy chủ Express tại `server.ts` và API ở `/api/chat`, `/api/generate-quiz`, `/api/feedback`. GitHub Pages chỉ phục vụ trang tĩnh; để trợ lí hoạt động, triển khai máy chủ Node.js riêng và đặt `CORS_ORIGIN` bằng nguồn gốc trang Pages (ví dụ `https://ten-tai-khoan.github.io`, không thêm tên repo). Tại trang tĩnh, đặt `apiBaseUrl` trong `config.js` bằng URL HTTPS của máy chủ, không kèm `/api`.

Không đưa `.env.local` hoặc khóa API vào GitHub. Trước khi mở quyền sử dụng công khai, cần thêm giới hạn tần suất/yêu cầu xác thực cho các API AI để kiểm soát chi phí. Góp ý tại `/api/feedback` hiện chỉ lưu trong bộ nhớ khi chạy bản production, mất khi khởi động lại máy chủ; ở chế độ dev, lớp API trong `vite.config.ts` chỉ trả về thông báo thành công.
