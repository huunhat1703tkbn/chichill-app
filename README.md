# ☕ ChiChill AI — Trợ Lý Tài Chính & Quản Lý Chi Tiêu Văn Phòng Thông Minh

> **"Chi có kế hoạch · Chill không âu lo ✨"**
> 
> *Ứng dụng Trợ lý Quản lý Chi tiêu Cá nhân & Chia Bill Nhóm thế hệ mới, tích hợp Trí tuệ Nhân tạo Google Gemini 3.6 Flash và triển khai Serverless trên Google Cloud Run & Zalo Mini App.*

---

## 🏆 Dự Án Tham Gia AI Riser Vietnam 2026: #BuildwithGoogleAI

ChiChill AI được xây dựng và tối ưu hóa 100% theo 3 trụ cột cốt lõi của chương trình **AI Riser Vietnam 2026**:

```
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                    AI Riser Vietnam 2026: #BuildwithGoogleAI                │
  ├─────────────────────────────────────────────────────────────────────────────┤
  │                                                                             │
  │  🧠 1. Brainstorm with Gemini:                                              │
  │     - Giải quyết bài toán quản lý tài chính văn phòng & chia bill nhóm.    │
  │     - Cố vấn sức khỏe tài chính, phân bổ ngân sách 50/30/20 & Wrapped AI.   │
  │                                                                             │
  │  🛠️ 2. Build in Google AI Studio:                                           │
  │     - Workspace: https://ai.studio/apps/df0c0c1e-63cf-4a6a-89c9-874b60d43c1b│
  │     - Prompt Engineering tiếng lóng Việt Nam (củ, lít, xị, tr, k, quẹt...).│
  │     - Structured JSON Schema bóc tách đa giao dịch & Question Guardrails.   │
  │                                                                             │
  │  ☁️ 3. Deploy to Google Cloud Run:                                          │
  │     - Production URL: https://chichill-app-701475997592.asia-southeast1.run.app│
  │     - Đóng gói Docker Container nhẹ chuẩn `node:20-alpine`.                 │
  │     - Serverless Auto-scale 0 ➡️ N instances, Region `asia-southeast1`.     │
  │                                                                             │
  └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Giới Thiệu Tổng Quan (Overview)

Quản lý tài chính cá nhân và chi tiêu nhóm thường đem lại cảm giác áp lực, nhàm chán và tốn thời gian. Dân văn phòng và giới trẻ thường xuyên gặp phải các rắc rối:
- **Lười nhập liệu:** Mở app lên phải bấm hàng chục bước chọn danh mục, gõ số tiền, ghi chú.
- **Tiếng lóng & Nhiều khoản cùng lúc:** Thói quen chat/nói bằng tiếng lóng (*"cơm 45k, cafe 35k", "quẹt thẻ 1 củ 2", "sếp ứng 1.5 củ"*) mà các app truyền thống không hiểu được.
- **Chia bill ăn trưa / du lịch rối rắm:** Một người trả trước cho cả nhóm, sau đó phải ngồi cộng trừ thủ công, chia tiền lẻ, gửi số tài khoản nhắc từng người rất ngại.
- **Sổ nợ khó đòi:** Tiền cho đồng nghiệp mượn lặt vặt ăn trưa, trà sữa quên không ghi lại hoặc ngại mở lời nhắc nợ.

---

## 📸 Hình Ảnh Giao Diện Thực Tế (App Showcase)

<div align="center">

| 📱 Giao diện chính ChiChill AI | ⚙️ Cài đặt Cảnh báo & Đồng bộ Zalo | 💬 Tin nhắn Chia Bill & Nhắc Nợ |
| :---: | :---: | :---: |
| <img src="./assets/screenshots/zalo_main_screen.png" width="250" alt="Giao diện chính ChiChill AI" /> | <img src="./assets/screenshots/zalo_notification_settings.png" width="250" alt="Cài đặt Cảnh báo" /> | <img src="./assets/screenshots/zalo_share_messages.png" width="250" alt="Mẫu Tin Nhắn Zalo" /> |
| *Chat AI tư vấn sức khỏe tài chính & theo dõi số dư ví* | *Tùy chỉnh ngưỡng cảnh báo 80%/100% & Zalo ID* | *Tổng kết chia bill du lịch & link cộng tác Zalo* |

</div>

---

## 🚀 Các Tính Năng Nổi Bật (Key Features)

### 🤖 1. Trợ Lý & Cố Vấn Tài Chính AI Thông Minh (AI Financial Coach & Advisor)
- **Bóc tách tiếng lóng Việt Nam chuẩn xác:** Tự động nhận diện các đơn vị tiền tệ dân dã như *củ, lít, xị, tr, k, đồng*, các thuật ngữ *cà bao, quẹt thẻ giùm, ứng trước, chia bill, vay mượn*.
- **Bóc tách đa giao dịch (Multi-Transactions) trong 1 câu:**
  - *Ví dụ:* `"Cơm trưa 45k, cafe Highland 35k và Grab 50k"` ➡️ Tự động tạo 3 giao dịch riêng biệt đúng danh mục và số tiền trong chớp mắt.
- **Cố vấn & Đánh giá sức khỏe tài chính:**
  - 📊 *"Đánh giá tài chính tháng này của tôi thế nào?"* ➡️ AI phân tích tương quan giữa tiến độ tháng, tỷ lệ tiết kiệm, cảnh báo các nhóm chi tiêu vượt hạn mức.
  - 🛍️ *"Đang tính mua tai nghe 2.5 củ, có nên không?"* ➡️ AI phân tích số dư khả dụng, số ngày còn lại trong tháng để đưa ra lời khuyên khách quan (*Nên mua / Nên đợi sau ngày nhận lương*).
  - 💡 *"Lương 20 triệu nên phân bổ thế nào để tiết kiệm 5 củ?"* ➡️ Gợi ý công thức phân bổ 50/30/20 hoặc 6 hũ tài chính trực tiếp trên thu nhập thực tế.
  - 👛 *"Giải thích vì sao số dư ví lại chênh lệch với thu chi tháng này?"* ➡️ Giải thích chi tiết sự khác nhau giữa số dư tích lũy trọn đời và giao dịch tháng hiện tại.
- **Spotify/ChiChill Wrapped Tổng Kết Cuối Tháng:**
  - Nhận xét chi tiêu mang phong cách *"Roast & Toast"* hài hước, mặn mòi (*"Chiến thần quẹt thẻ", "Chúa tể trà sữa"*), tạo cảm giác hào hứng khi quản lý tài chính.
- **Động cơ suy luận kép (Dual Engine):**
  - **Google Gemini 3.6 Flash Cloud AI:** Phân tích ngôn ngữ tự nhiên sâu sắc, tư vấn thông minh.
  - **Local Heuristic Fallback Engine:** Bộ phân tích Regex Heuristic tiếng Việt cục bộ chạy siêu tốc (< 10ms) đảm bảo ứng dụng không bao giờ bị gián đoạn.

---

### 👥 2. Chia Bill Nhóm & Cộng Tác Zalo Đa Người Dùng (Collaborative Bill Splitting)
- **Tạo nhóm & Phân chia linh hoạt:**
  - Hỗ trợ chia đều cho cả nhóm, chia theo món từng người ăn, hoặc chia theo tỷ lệ/số tiền tùy chỉnh.
- **Cộng tác Zalo thời gian thực (Real-time Collaboration):**
  - Mỗi nhóm có một mã chia sẻ độc nhất (VD: `CHILL-7X2K`) và đường link Zalo Mini App sâu (`https://zalo.me/s/{APP_ID}/?bill={shareCode}`).
  - Nhiều thành viên cùng tham gia 1 nhóm, tự thêm khoản chi của mình (hiển thị Avatar & Tên Zalo thật của từng người).
  - Đồng bộ tức thì giữa các thành viên qua Google Cloud Run server.
- **Tối ưu hóa thanh toán (Smart Settlement) & VietQR:**
  - Thuật toán tự động tính toán bù trừ công nợ để số lượt chuyển tiền giữa các thành viên là ít nhất.
  - Tích hợp tạo mã **VietQR** chuẩn Napas 24/7 (tự động điền số tài khoản trưởng nhóm, số tiền chính xác từng người cần trả và nội dung chuyển khoản).

---

### 📒 3. Sổ Nợ Văn Phòng & Nhắc Nợ Khéo Léo (Office Debt & Receivable Tracker)
- **Quản lý công nợ 2 chiều:**
  - 🟢 **Người khác nợ mình (Receivables):** Tiền ăn trưa, cafe, tiền mua đồ hộ.
  - 🔴 **Mình nợ người khác (Payables):** Các khoản vay, tiền ứng trước cần trả đúng hẹn.
- **Nhắc nợ tế nhị 1 chạm qua Zalo:**
  - Tự động tạo mẫu tin nhắn nhắc nợ vui vẻ, khéo léo, đính kèm số tiền và thông tin STK/QR.
  - Mở trực tiếp Zalo Share Sheet để gửi cho bạn bè hoặc sao chép vào clipboard.

---

### 📊 4. Quản Lý Hạn Mức Ngân Sách (Budget Limits & Smart Alerts)
- **Thiết lập hạn mức linh hoạt:** Đặt hạn mức chi tiêu hàng tháng cho từng nhóm danh mục (*Ăn uống, Đi lại, Mua sắm, Công việc, Tiện ích, Giải trí...*).
- **Hệ thống cảnh báo 3 cấp độ:**
  - 🟢 **An toàn (< 80%):** Trạng thái "Rất Chill".
  - 🟡 **Cảnh báo (80% - 99%):** Nhắc nhở cân đối chi tiêu cho những ngày còn lại.
  - 🔴 **Báo động (≥ 100%):** Vượt hạn mức tháng.
- **Kênh thông báo đa dạng:**
  - Banner Toast nổi bật trực tiếp trong app.
  - Chuông âm thanh Web Audio sinh động.
  - Thông báo đẩy Zalo Mini App Push Notification (qua Zalo OA Template API).

---

### 📈 5. Báo Cáo & Phân Tích Tài Chính Trực Quan (Analytics & Insights)
- Biểu đồ phân bổ chi tiêu tròn (Donut Chart) theo tỷ lệ % từng danh mục.
- Theo dõi tỷ lệ tiết kiệm (Savings Rate) thực tế so với mục tiêu.
- Thống kê diễn biến thu nhập, chi tiêu, các khoản nợ cần thu theo từng chu kỳ tháng.

---

## 💻 Trải Nghiệm Trên Các Nền Tảng (Multi-Platform Experience)

```
                       ┌─────────────────────────────────┐
                       │     Google Gemini 3.6 Flash     │
                       └────────────────┬────────────────┘
                                        │
                       ┌────────────────┴────────────────┐
                       │        Google Cloud Run         │
                       │     Node.js + Express + APIs    │
                       └───────┬─────────────────┬───────┘
                               │                 │
              ┌────────────────┴──────┐   ┌──────┴───────────────┐
              │   Web Application     │   │   Zalo Mini App      │
              │  (Máy tính / Laptop)  │   │  (iOS & Android Zalo)│
              └───────────────────────┘   └──────────────────────┘
```

### 📱 1. Trên Zalo Mini App (Điện thoại)
- **Truy cập:** Mở trực tiếp trong ứng dụng Zalo tại 👉 [https://zalo.me/s/3359280154790783177/](https://zalo.me/s/3359280154790783177/).
- **Trải nghiệm tức thì (Zero-Barrier Guest Mode):** Vào thẳng app sử dụng ngay không cần đăng nhập, **100% không có popup xin quyền gây phiền toái khi khởi động**.
- **Đăng nhập 1 chạm:** Bấm nút Zalo để liên kết tài khoản và đồng bộ dữ liệu lên Google Cloud.

### 🌐 2. Trên Web (Máy tính / Trình duyệt)
- **Truy cập:** Mở trực tiếp trên trình duyệt tại 👉 [https://chichill-app-701475997592.asia-southeast1.run.app](https://chichill-app-701475997592.asia-southeast1.run.app).
- **Đăng nhập & Đồng bộ:** Xác thực bảo mật chuẩn **Zalo OAuth 2.0 PKCE** để tự động đồng bộ dữ liệu 2 chiều với Zalo Mini App trên điện thoại.
- **Nhập mã chia bill:** Bấm *"Nhập mã"* để xem và chỉnh sửa nhóm chia bill cùng đồng nghiệp trên màn hình lớn.

---

## 🤖 Tích Hợp Google AI Studio & Google Cloud Generative AI

ChiChill AI tận dụng tối đa sức mạnh của hệ sinh thái **Google AI Studio** và **Google Cloud Generative AI** để mang đến trải nghiệm trợ lý tài chính thông minh, nhạy bén và hiểu sâu sắc ngữ cảnh người dùng Việt Nam.

```
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                           Google AI Studio App                              │
  │      🔗 https://ai.studio/apps/df0c0c1e-63cf-4a6a-89c9-874b60d43c1b         │
  └──────────────────────────────────────┬──────────────────────────────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
  ┌─────────────────────────────────┐         ┌─────────────────────────────────┐
  │     Google Gen AI SDK v2        │         │      Gemini 3.6 Flash Model     │
  │       (`@google/genai`)         │         │   (Low Latency · Multimodal)    │
  └────────────────┬────────────────┘         └────────────────┬────────────────┘
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         ▼
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                    Prompt Engineering & System Instructions                 │
  │   - Few-Shot Learning: Hiểu tiếng lóng Việt Nam (củ, lít, xị, tr, k...)     │
  │   - Structured JSON Schema: Trích xuất Đa giao dịch chính xác tuyệt đối    │
  │   - Question Guardrails: Phân biệt câu hỏi tư vấn & lệnh ghi sổ chi tiêu    │
  │   - Financial Health Diagnosis: Đánh giá sức khỏe & phân bổ ngân sách       │
  └─────────────────────────────────────────────────────────────────────────────┘
```

### 1. Mô hình Cốt lõi: Google Gemini 3.6 Flash
- Sử dụng mô hình **`gemini-3.6-flash`** từ Google DeepMind — dòng mô hình thế hệ mới với tốc độ phản hồi cực nhanh (< 500ms), khả năng suy luận logic xuất sắc và tối ưu hóa chi phí token.
- Trực tiếp chạy và thử nghiệm prompt trên [Google AI Studio Workspace](https://ai.studio/apps/df0c0c1e-63cf-4a6a-89c9-874b60d43c1b).

### 2. Thư viện Chính thức: Google Gen AI SDK (`@google/genai`)
- Tích hợp thông qua SDK chính thức `@google/genai` của Google, hỗ trợ cấu hình an toàn (Lazy Initialization), quản lý khóa API linh hoạt và tương thích chuẩn `User-Agent: aistudio-build`.

### 3. Kỹ thuật Prompt Engineering & Structured Outputs
- **Bóc tách đa giao dịch tự động:** Nhận diện đồng thời nhiều khoản thu/chi trong một câu nói tự nhiên và định dạng theo **JSON Schema** chuẩn:
  ```json
  {
    "replyText": "Đã ghi nhận 2 khoản: Cơm trưa (45.000 ₫) và Cafe (35.000 ₫)",
    "action": "ADD_TRANSACTION",
    "transactions": [
      { "category": "FOOD", "amount": 45000, "description": "Cơm trưa", "type": "expense" },
      { "category": "FOOD", "amount": 35000, "description": "Cafe", "type": "expense" }
    ],
    "financialHealth": "CHILL"
  }
  ```
- **Hàng rào bảo vệ câu hỏi (Question & Inquiry Guardrails):** Hệ thống được tinh chỉnh để nhận diện các câu hỏi thắc mắc (*"Sao ví tôi có 28tr trong khi thu 20.5tr và chi 12.5tr?"*) để đưa ra lời giải thích chi tiết, tuyệt đối **không** tạo nhầm giao dịch mới.
- **Tư vấn tài chính cá nhân hóa:** Phân tích tỷ lệ chi tiêu/thu nhập, tư vấn quyết định mua sắm lớn và gợi ý phân bổ ngân sách 50/30/20.

---

## ☁️ Triển Khai Thực Tế Trên Google Cloud Run (Official Live Deployment)

Dự án đã được triển khai chính thức trên nền tảng **Google Cloud Run (GCP)**, sẵn sàng phục vụ người dùng và ban giám khảo cuộc thi **AI Riser Vietnam 2026 (#BuildwithGoogleAI)**:

- 🌐 **Google Cloud Run Live URL:** [https://chichill-app-701475997592.asia-southeast1.run.app](https://chichill-app-701475997592.asia-southeast1.run.app)
- 📍 **Region:** `asia-southeast1` (Singapore - Tốc độ cao & Độ trễ cực thấp cho người dùng Việt Nam)
- ⚙️ **Hạ tầng:** Serverless Docker Container (`node:20-alpine`), Tự động Auto-scale 0 ➡️ N instances, Tích hợp sẵn chứng chỉ SSL/HTTPS của Google.

```bash
# Lệnh cập nhật/triển khai phiên bản mới lên Google Cloud Run
gcloud run deploy chichill-app \
  --source . \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="AQ.Ab8RN6...",VITE_ZALO_APP_ID="737758941600774697",ZALO_SECRET_KEY="Qc5X228..."
```

---

## 🛠️ Kiến Trúc Công Nghệ (Tech Stack)

| Thành phần | Công nghệ sử dụng |
| :--- | :--- |
| **Trí tuệ Nhân tạo (AI)** | Google Gen AI SDK (`@google/genai`), Google Gemini 3.6 Flash, Google AI Studio |
| **Hạ tầng Đám mây (Cloud)** | Google Cloud Run, Google Cloud Build, Google Artifact Registry, Google Cloud Firestore |
| **Frontend UI** | React 19, TypeScript, TailwindCSS, Lucide Icons, Vite |
| **Mobile SDK** | Zalo Mini App SDK (`zmp-sdk`), ZMP UI APIs |
| **Backend API** | Node.js, Express, TypeScript, Esbuild, Docker |
| **Đồng bộ Dữ liệu** | Cloud Storage JSON Engine / Firestore + Smart Merge Engine |
| **Triển khai (Deployment)** | Google Cloud Run (Web Serverless) + Zalo Mini App Platform (Mobile) |

---

## 📋 Tuân Thủ Chính Sách Kiểm Duyệt Zalo Mini App (ZMA Policy Compliance)

ChiChill AI được xây dựng tuân thủ **100% Chính sách Kiểm duyệt ZMA (Guidelines v6.1 - v6.3)**:

1. ✅ **Mục 6.1 (Ngữ cảnh xin quyền):** Tuyệt đối không tự động kích hoạt consent xin thông tin cá nhân (`getUserInfo`) hoặc quyền thông báo (`requestSendNotification`) khi vừa mở Mini App.
2. ✅ **Mục 6.2 (Minh bạch mục đích):** Chỉ xin quyền khi người dùng chủ động bấm nút (*Đăng nhập*, *Bật thông báo*) kèm thông điệp giải thích rõ ràng.
3. ✅ **Mục 6.3 (Xử lý khi từ chối quyền):** Nếu người dùng bấm *"Từ chối"*, app vẫn hoạt động bình thường ở chế độ Khách, không bị gián đoạn tính năng.
4. ✅ **Chuẩn Safe Area:** Header tùy biến không che khuất các nút điều hướng hệ thống của Zalo (`···` và `X`).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local Development)

### 1. Yêu cầu môi trường
- **Node.js:** Phiên bản `>= 18.0.0` (Khuyên dùng Node 20 LTS).
- **Trình quản lý gói:** `npm` hoặc `bun` / `yarn`.

### 2. Cài đặt Dependencies
```bash
# Clone repository
git clone https://github.com/huunhat1703tkbn/chichill-app.git
cd chichill-app

# Cài đặt thư viện
npm install
```

### 3. Cấu hình biến môi trường (.env)
Tạo file `.env` tại thư mục gốc với các thông số:
```env
# Google Gemini API Key từ Google AI Studio
GEMINI_API_KEY=your_gemini_api_key_here

# Zalo Web OAuth & Mini App Config
VITE_ZALO_APP_ID=737758941600774697
ZALO_APP_ID=737758941600774697
ZALO_MINIAPP_ID=3359280154790783177
ZALO_SECRET_KEY=your_zalo_secret_key_here

# Backend URL Cloud Run
VITE_BACKEND_URL=https://chichill-app-701475997592.asia-southeast1.run.app

# Port Server
PORT=3000
```

### 4. Khởi chạy ứng dụng

```bash
# Chạy đồng thời Frontend Vite và Backend Express
npm run dev
```
- **Web App:** Mở `http://localhost:3000` trên trình duyệt.

### 5. Build và Deploy

```bash
# 1. Build production bundle
npm run build

# 2. Deploy lên Google Cloud Run
gcloud run deploy chichill-app --source . --platform managed --region asia-southeast1 --allow-unauthenticated

# 3. Deploy lên Zalo Mini App
npx zmp deploy
```

---

## 📁 Cấu Trúc Thư Mục Dự Án (Project Structure)

```text
├── Dockerfile                      # Production Dockerfile tối ưu cho Google Cloud Run
├── .dockerignore                   # Danh sách loại trừ khi build container
├── src/
│   ├── components/                 # Các Component giao diện chính
│   │   ├── AIChatView.tsx          # Giao diện Chat AI & Cố vấn tài chính
│   │   ├── TransactionListView.tsx # Danh sách & Bộ lọc giao dịch thu/chi
│   │   ├── BudgetView.tsx          # Quản lý & Cảnh báo hạn mức ngân sách
│   │   ├── DebtTrackerView.tsx     # Sổ nợ văn phòng
│   │   ├── BillSplitView.tsx       # Chia bill nhóm & Cộng tác Zalo
│   │   ├── AnalyticsView.tsx       # Biểu đồ & Thống kê tài chính & Spotify Wrapped AI
│   │   ├── Header.tsx              # Thanh điều hướng đầu trang & Profile badge
│   │   ├── AccountProfileModal.tsx # Modal Hồ sơ Zalo & Trạng thái đồng bộ
│   │   ├── NotificationSettingsModal.tsx # Cài đặt thông báo & Zalo OA push
│   │   ├── BudgetAlertToast.tsx    # Banner cảnh báo hạn mức nội bộ
│   │   └── LoginView.tsx           # Modal đăng nhập Zalo OAuth 2.0 PKCE
│   ├── utils/                      # Các Module xử lý nghiệp vụ
│   │   ├── aiParser.ts             # Bộ tách ngữ nghĩa AI & Heuristic Fallback
│   │   ├── billSyncService.ts      # Dịch vụ đồng bộ & Deep link chia bill
│   │   ├── notificationService.ts  # Xử lý thông báo Zalo OA & Web Audio
│   │   ├── api.ts                  # Routing API thông minh (Cloud Run / Local / ZMP)
│   │   └── pkce.ts                 # Mã hóa PKCE bảo mật cho OAuth 2.0
│   ├── types.ts                    # Toàn bộ Type Definitions của hệ thống
│   ├── App.tsx                     # Main Application Controller & State Engine
│   └── main.tsx                    # Entry point React
├── server.ts                       # Backend Express REST API & Gemini 3.6 Flash Service
├── app-config.json                 # Cấu hình Zalo Mini App Platform
├── prepare-zmp.js                  # Script tự động trích xuất asset cho ZMP bundle
├── vite.config.ts                  # Cấu hình Vite Build
└── README.md                       # Tài liệu hướng dẫn dự án chuẩn #BuildwithGoogleAI
```

---

## 📄 Bản Quyền & Giấy Phép (License)

Dự án được phát triển và vận hành bởi **ChiChill Team**. Mọi quyền được bảo lưu.

*☕ ChiChill AI — Chi có kế hoạch, Chill không âu lo!*
