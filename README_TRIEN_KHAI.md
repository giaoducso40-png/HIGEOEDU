# HIGEOEDU – bản GitHub Pages + API Gemini

## Đã sửa lỗi trang trắng

`index.html` ở **thư mục gốc gói này** đã biên dịch và nhúng JS/CSS. Có thể mở trực tiếp bằng cách nhấp đúp tệp để kiểm tra giao diện, hoặc đặt trực tiếp ở gốc nhánh GitHub Pages. Không dùng `source/index.html` để mở trực tiếp: đó là mã nguồn Vite và sẽ trắng nếu không build.

Trợ lí AI **không thể chỉ chạy bằng GitHub Pages**: mã gọi Gemini và khóa bí mật cần chạy trên dịch vụ Node.js. Gói gồm cả phần trang tĩnh ở gốc và mã nguồn/API ở `source/` để triển khai riêng.

## Bước 1 – Đưa giao diện lên GitHub Pages

1. Giải nén ZIP. Tạo repository mới trên GitHub, ví dụ `higeoedu`, có nhánh `main`.
2. Chọn **Add file → Upload files** và tải **các mục bên trong thư mục đã giải nén** lên gốc repository: `index.html`, `config.js`, `.nojekyll`, `README_TRIEN_KHAI.md` và cả thư mục `source/`. **Đừng chỉ tải ZIP**, đừng đưa toàn bộ vào một thư mục con `HIGEOEDU_GitHub_Pages_ready`.
3. Vào **Settings → Pages → Build and deployment → Deploy from a branch**; chọn nhánh `main`, thư mục `/(root)`, **Save**. Chờ GitHub báo trang đã xuất bản.
4. Địa chỉ trang sẽ có dạng `https://TEN-TAI-KHOAN.github.io/higeoedu/` (thay đúng tên tài khoản và repository). Lúc này giao diện hiện đầy đủ; nhãn AI vẫn **CHƯA KẾT NỐI** cho đến khi hoàn thành hai bước tiếp theo.

## Bước 2 – Chạy API trên dịch vụ hỗ trợ Node.js

Ví dụ với Render: tạo **New → Web Service**, kết nối repository vừa tạo, dùng cấu hình:

| Trường | Giá trị |
| --- | --- |
| Root Directory | `source` |
| Runtime | `Node` |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm run start` |
| `NODE_VERSION` | `22.16.0` (nếu cần chọn phiên bản) |
| `NODE_ENV` | `production` |
| `GEMINI_API_KEY` | Khóa thật lấy từ Google AI Studio, đặt **chỉ trong Environment của dịch vụ** |
| `CORS_ORIGIN` | `https://TEN-TAI-KHOAN.github.io` (đúng origin của Pages, **không thêm `/higeoedu/` hay dấu `/` cuối**) |

Không tạo tệp `.env` chứa khóa trong GitHub. Dịch vụ thường cung cấp biến `PORT`; mã tự lắng nghe cổng này. Khi deploy xong, mở `https://TEN-DICH-VU.onrender.com/api/health`; kết quả phải có `"status":"ok"` và `"geminiConfigured":true`. Health chỉ xác nhận đã có khóa, **chưa xác nhận khóa hợp lệ hoặc Gemini trả lời được**.

## Bước 3 – Nối trang tĩnh với API

Trên GitHub, mở **`config.js` ở gốc repo** → bấm chỉnh sửa → thay dòng cuối thành:

```js
window.HIGEOEDU_CONFIG = { apiBaseUrl: 'https://TEN-DICH-VU.onrender.com' };
```

Chỉ điền **địa chỉ HTTPS gốc của API**, không thêm `/api`, không thêm dấu `/` cuối; tuyệt đối **không dán khóa API** vào `config.js` (tệp này công khai). Commit thay đổi, chờ Pages cập nhật rồi làm mới trang. Nhãn AI sẽ thành **ACTIVE** khi `/api/health` trả về đã cấu hình khóa. Gửi một câu hỏi thực tế và thử **Tạo Đề Nhanh** để xác nhận Gemini hoạt động. Nếu lỗi, xem nhật ký Web Service và kiểm tra khóa/model/quyền truy cập Gemini.

## Lưu ý vận hành

- Mở `index.html` trực tiếp từ ổ đĩa chỉ kiểm tra giao diện; trình duyệt có thể chặn gọi API cross-origin từ `file://`. Hãy kiểm tra AI trên URL GitHub Pages sau khi nối API.
- API công khai có nguy cơ bị gọi ngoài ý muốn và phát sinh chi phí; `CORS_ORIGIN` chỉ kiểm soát trình duyệt, **không thay thế xác thực hoặc giới hạn tần suất**. Cần bổ sung bảo vệ trước khi quảng bá công khai.
- Góp ý hiện chỉ lưu trong bộ nhớ server, không phải cơ sở dữ liệu lâu dài.
- Khi sửa mã trong `source/`, chạy `npm ci`, `npm run lint`, `npm run build:static`, `npm run verify:package`; cập nhật lại `index.html` ở gốc từ `source/dist/index.html` và `config.js` nếu cần.
