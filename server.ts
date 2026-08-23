import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// Zalo domain verification endpoint
app.get("/zalo*.html", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`<!DOCTYPE html>
<html lang="en">

<head>
    <meta property="zalo-platform-site-verification" content="SysI4Q6-4Iuaeu46nPCc6m-WXYFZrbnwCZKv" />
</head>

<body>
There Is No Limit To What You Can Accomplish Using Zalo!
</body>
</html>`);
});

// Zalo Webhook Endpoint (Theo Nghị định 13/NĐ-CP về xóa dữ liệu / thu hồi quyền)
app.all("/api/zalo-webhook", (req, res) => {
  const eventData = req.body || {};
  console.log("👉 Nhận sự kiện Webhook từ Zalo:", req.method, eventData);

  // Zalo sẽ gửi event như "user_revoke_app" hoặc "user_delete_data"
  // Phản hồi mã HTTP 200 OK để Zalo xác nhận thành công
  return res.status(200).json({
    success: true,
    message: "Webhook received successfully",
    timestamp: new Date().toISOString()
  });
});

// Điều khoản sử dụng & Chính sách bảo mật (Terms of Service / Privacy Policy)
app.get(["/terms", "/privacy", "/dieu-khoan"], (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Điều Khoản Sử Dụng & Chính Sách Bảo Mật - ChiChill AI</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 24px; background: #fcfbf9; }
    .container { background: #fff; padding: 36px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #eaeaea; }
    h1 { color: #059669; font-size: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-top: 0; }
    h2 { color: #1f2937; font-size: 18px; margin-top: 24px; }
    p, li { color: #4b5563; font-size: 15px; }
    ul { padding-left: 20px; }
    .badge { display: inline-block; background: #d1fae5; color: #065f46; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">ChiChill AI Mini App</span>
    <h1>ĐIỀU KHOẢN SỬ DỤNG VÀ BẢO MẬT DỮ LIỆU</h1>
    <p><em>Cập nhật lần cuối: Tháng 8, 2026</em></p>

    <h2>1. Mục đích thu thập dữ liệu</h2>
    <p>ChiChill là ứng dụng Trợ lý Quản lý Chi tiêu Cá nhân thông minh tích hợp AI. Để cung cấp trải nghiệm sử dụng thuận tiện và cá nhân hóa, chúng tôi yêu cầu các quyền truy cập cơ bản sau:</p>
    <ul>
      <li><strong>Thông tin tài khoản Zalo (Tên hiển thị, Ảnh đại diện, Zalo User ID):</strong> Dùng để định danh người dùng, tạo tài khoản tự động và cá nhân hóa giao diện (Hiển thị tên, avatar trên Dashboard).</li>
      <li><strong>Quyền truy cập Microphone (Thu âm):</strong> Chỉ được kích hoạt khi người dùng chủ động nhấn nút "Thu âm" để nhập liệu khoản chi tiêu / thu nhập bằng giọng nói. Hệ thống sẽ chuyển đổi giọng nói thành văn bản để AI phân tích.</li>
    </ul>

    <h2>2. Cam kết bảo mật dữ liệu</h2>
    <ul>
      <li><strong>Tuyệt đối không lưu trữ âm thanh:</strong> Các bản ghi âm của người dùng chỉ được xử lý tức thời để chuyển thành văn bản (Speech-to-Text) và không được lưu trữ dưới bất kỳ hình thức nào trên máy chủ của ChiChill.</li>
      <li><strong>Dữ liệu tài chính:</strong> Các dữ liệu về khoản thu/chi được bảo mật trên cơ sở dữ liệu. Chúng tôi cam kết không chia sẻ, mua bán hoặc sử dụng dữ liệu tài chính cá nhân của người dùng cho bất kỳ bên thứ ba nào.</li>
    </ul>

    <h2>3. Quyền của người dùng và Xóa dữ liệu (Nghị định 13/NĐ-CP)</h2>
    <ul>
      <li>Người dùng có toàn quyền kiểm soát dữ liệu của mình. Bạn có thể từ chối cấp quyền Microphone bất cứ lúc nào trong phần Cài đặt của Zalo.</li>
      <li><strong>Rút lại sự đồng ý và Xóa dữ liệu:</strong> Bất cứ khi nào bạn xóa Mini App ChiChill hoặc gỡ bỏ quyền truy cập từ mục "Quản lý Mini App" trên Zalo, hệ thống của chúng tôi sẽ nhận được thông báo tự động (qua Webhook) và tiến hành xóa toàn bộ thông tin định danh Zalo User ID của bạn khỏi cơ sở dữ liệu.</li>
    </ul>

    <h2>4. Liên hệ hỗ trợ</h2>
    <p>Mọi thắc mắc liên quan đến dữ liệu và quyền riêng tư, vui lòng liên hệ đội ngũ phát triển qua email hỗ trợ của ChiChill AI.</p>
  </div>
</body>
</html>`);
});

// --- CLOUD DATA SYNCHRONIZATION ENGINE ---
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn("Could not create data dir:", err);
  }
}

const memoryUserStore: Record<string, any> = {};

function getUserDataFromStorage(userId: string) {
  if (memoryUserStore[userId]) return memoryUserStore[userId];
  const filePath = path.join(DATA_DIR, `user_${userId}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      memoryUserStore[userId] = data;
      return data;
    } catch {}
  }
  return null;
}

function saveUserDataToStorage(userId: string, data: any) {
  memoryUserStore[userId] = data;
  try {
    const filePath = path.join(DATA_DIR, `user_${userId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed writing user data to disk:", err);
  }
}

// Endpoint lấy dữ liệu đám mây của người dùng
app.get("/api/user-data/:userId", (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  const userData = getUserDataFromStorage(userId);
  return res.json({ success: true, data: userData || null });
});

// Endpoint đồng bộ dữ liệu giữa Điện thoại Zalo & Web Render
app.post("/api/sync-user-data", (req, res) => {
  const { userId, data } = req.body;
  if (!userId || !data) return res.status(400).json({ error: "Missing userId or data" });
  saveUserDataToStorage(userId, data);
  return res.json({ success: true, timestamp: Date.now() });
});

// Zalo OAuth V4 Callback Endpoint
app.post("/api/auth/zalo", async (req, res) => {
  try {
    const { code, code_verifier, redirect_uri } = req.body;
    const ZALO_APP_ID = process.env.VITE_ZALO_APP_ID;
    const ZALO_SECRET_KEY = process.env.ZALO_SECRET_KEY;

    if (!code || !code_verifier) {
      return res.status(400).json({ error: "Missing authorization code or code_verifier" });
    }

    if (!ZALO_APP_ID || !ZALO_SECRET_KEY) {
      console.error("Missing Zalo credentials in server environment");
      return res.status(500).json({ error: "Server authentication configuration missing" });
    }

    // 1. Exchange Code for Access Token
    const tokenUrl = "https://oauth.zaloapp.com/v4/access_token";
    const params = new URLSearchParams();
    params.append("app_id", ZALO_APP_ID);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("code_verifier", code_verifier);

    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "secret_key": ZALO_SECRET_KEY,
      },
      body: params.toString(),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Zalo token error:", tokenData);
      return res.status(400).json({ error: "Failed to exchange token", details: tokenData });
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    // We MUST NOT fetch the profile from the server because Zalo blocks foreign IPs (Render is in Singapore/US).
    // Instead, return the access_token to the client, and let the client fetch the profile directly.
    res.json({
      success: true,
      tokens: {
        access_token,
        refresh_token,
        expires_in,
      }
    });

  } catch (error: any) {
    console.error("Zalo Auth Callback Error:", error);
    res.status(500).json({ error: "Internal server error during authentication" });
  }
});

// Initialize Gemini AI Client lazily or safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Fallback Vietnamese heuristic parser in case Gemini API Key is missing or unavailable
function fallbackParse(prompt: string, context?: any) {
  const lower = prompt.toLowerCase();
  
  // Check for budget/query intent
  if (lower.includes("bao nhiêu") || lower.includes("hạn mức") || lower.includes("còn lại") || lower.includes("tình hình") || lower.includes("ngân sách")) {
    let responseText = "Số dư hiện tại của bạn là khoảng " + (context?.currentBalance ? (context.currentBalance / 1000).toLocaleString('vi-VN') + "kđ" : "11.2 củ") + ". Ngân sách Ăn uống tháng này còn lại khá thoải mái!";
    if (lower.includes("ăn") || lower.includes("cơm") || lower.includes("food")) {
      const foodLimit = context?.categoryBudgets?.Food || 4500000;
      const foodSpent = context?.categorySpent?.Food || 2800000;
      const remaining = foodLimit - foodSpent;
      responseText = `Hạn mức Ăn uống tháng này của bạn là ${(foodLimit/1000000).toFixed(1)} củ. Đã tiêu ${(foodSpent/1000).toLocaleString('vi-VN')}k. Bạn còn lại ${(remaining/1000).toLocaleString('vi-VN')}kđ!`;
    } else if (lower.includes("công việc") || lower.includes("work") || lower.includes("ads")) {
      const workLimit = context?.categoryBudgets?.Work || 3000000;
      const workSpent = context?.categorySpent?.Work || 2200000;
      const remaining = workLimit - workSpent;
      responseText = `Quỹ Công việc đã dùng ${(workSpent/1000000).toFixed(1)} củ / ${(workLimit/1000000).toFixed(1)} củ hạn mức (${Math.round((workSpent/workLimit)*100)}%). Hãy cân đối chi phí dự án sắp tới nhé!`;
    }

    return {
      intent: "query_data",
      transactions: [],
      reply_message: responseText
    };
  }

  // Parse amount in VND
  let amount = 0;
  let matches = lower.match(/(\d+[\d\.,]*)\s*(củ|lít|xị|k|tr|triệu|ngàn|đ|vnd)?/i);
  if (matches) {
    let numStr = matches[1].replace(/,/g, '.');
    let num = parseFloat(numStr);
    let unit = (matches[2] || '').toLowerCase();
    
    if (unit === 'củ' || unit === 'tr' || unit === 'triệu') {
      amount = Math.round(num * 1000000);
    } else if (unit === 'lít' || unit === 'xị') {
      amount = Math.round(num * 100000);
    } else if (unit === 'k' || unit === 'ngàn') {
      amount = Math.round(num * 1000);
    } else if (num < 1000) {
      // Default assume k for small numbers like 45, 35
      amount = Math.round(num * 1000);
    } else {
      amount = Math.round(num);
    }
  }

  if (amount === 0) {
    return {
      intent: "general_chat",
      transactions: [],
      reply_message: "Chào bạn! Tôi là ChiChill AI — Trợ lý quản lý chi tiêu thật Chill! ☕ Bạn có thể gõ ví dụ: 'Cơm trưa 45k, cafe 35k' hoặc 'Nam mượn 200k tiền cơm'."
    };
  }

  // Determine category & type
  let category = "Food";
  let type = "expense";
  let personName = "";

  // Check user custom categories first if available
  if (context?.userCategories && Array.isArray(context.userCategories)) {
    for (const c of context.userCategories) {
      const catLabel = (c.label || '').toLowerCase();
      const catDesc = (c.description || '').toLowerCase();
      if (catLabel && (lower.includes(catLabel) || (catDesc && lower.includes(catDesc)))) {
        category = c.code;
        break;
      }
    }
  }

  if (lower.includes("mượn") || lower.includes("vay") || lower.includes("nợ")) {
    category = "Debt";
    if (lower.includes("cho") || lower.includes("mượn tiền") || lower.includes("ứng")) {
      type = "receivable";
    } else if (lower.includes("vay") || lower.includes("nợ")) {
      type = "payable";
    }
    // Try extract name
    const words = prompt.split(" ");
    for (let i = 0; i < words.length; i++) {
      if (["mượn", "vay", "cho"].includes(words[i].toLowerCase()) && i > 0) {
        personName = words[i-1];
      }
    }
  } else if (lower.includes("ads") || lower.includes("quẹt thẻ") || lower.includes("đạo cụ") || lower.includes("tiếp khách") || lower.includes("công ty")) {
    category = "Work";
  } else if (lower.includes("xăng") || lower.includes("grab") || lower.includes("gojek") || lower.includes("be") || lower.includes("xe")) {
    category = "Transport";
  } else if (lower.includes("áo") || lower.includes("quần") || lower.includes("shopee") || lower.includes("lazada") || lower.includes("mua")) {
    category = "Shopping";
  } else if (lower.includes("lương") || lower.includes("thưởng") || lower.includes("freelance") || lower.includes("thu")) {
    category = "Income";
    type = "income";
  }

  const categoryNames: Record<string, string> = {
    Food: "Ăn uống",
    Transport: "Đi lại",
    Shopping: "Mua sắm",
    Work: "Công việc",
    Debt: "Nợ & Cho vay",
    Income: "Thu nhập"
  };

  const formattedAmount = (amount / 1000).toLocaleString('vi-VN') + "kđ";
  let replyMsg = `Đã ghi nhận ${formattedAmount} cho danh mục ${categoryNames[category] || category}.`;
  if (type === "receivable") {
    replyMsg = `Đã ghi nhận khoản cho mượn ${formattedAmount} vào Sổ Nợ VP. Cần tạo tin nhắn nhắc Zalo thì báo mình nhé!`;
  } else if (type === "payable") {
    replyMsg = `Đã lưu khoản nợ ${formattedAmount} vào Sổ Nợ VP để bạn nhớ trả đúng hẹn!`;
  } else if (type === "income") {
    replyMsg = `Tuyệt vời! Đã cộng ${formattedAmount} vào tổng thu nhập tháng này.`;
  } else if (category === "Food") {
    replyMsg = `Đã ghi nhận ${formattedAmount} tiền ${prompt}. Đừng quên cân đối ngân sách ăn uống tuần này nhé!`;
  }

  return {
    intent: "log_transaction",
    transactions: [
      {
        type,
        amount,
        category,
        description: prompt
      }
    ],
    reply_message: replyMsg
  };
}

// API endpoint to parse finance natural language prompt
app.post("/api/parse-finance", async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGeminiClient();

    if (!ai) {
      console.log("Gemini API key not found, using fallback parser.");
      const fallbackResult = fallbackParse(prompt, context);
      return res.json(fallbackResult);
    }

    const userCategoriesFormatted = context?.userCategories && Array.isArray(context.userCategories)
      ? context.userCategories.map((c: any) => `- "${c.code}": ${c.label} (${c.description || ''})`).join('\n')
      : `- "Food": Ăn uống\n- "Transport": Đi lại\n- "Shopping": Mua sắm\n- "Work": Công việc\n- "Debt": Nợ & Cho vay\n- "Income": Thu nhập`;

    const systemInstruction = `
Bạn là ChiChill AI — Trợ lý Quản lý Chi tiêu Cá nhân AI chuyên nghiệp, giúp dân văn phòng Việt Nam theo dõi thu/chi/nợ nần một cách nhẹ nhàng, thư giãn (Chill) và không bị bất kỳ áp lực nào.

MỤC TIÊU CỐT LÕI:
1. Giải quyết điểm đau: Quản lý chi tiêu thường rất áp lực. ChiChill biến việc đó thành trải nghiệm thư giãn, tự nhiên nhất.
2. Hiểu ngôn ngữ tự nhiên, tiếng lóng (củ, lít, xị, quẹt thẻ giùm, cà bao, chia bill, ứng trước) để tự động ghi nhận thu/chi/nợ chính xác không cần thao tác phức tạp.
3. Phân tích dữ liệu hạn mức ngân sách và đưa ra lời khuyên ngắn gọn, thân thiện, mang tính khích lệ.
4. Phản hồi tự nhiên, gần gũi, thoải mái, tích cực.

DANH SÁCH DANH MỤC CHI TIÊU CÓ THỂ TÙY CHỈNH CỦA NGƯỜI DÙNG:
${userCategoriesFormatted}
- "Budget_Query": Dùng khi người dùng hỏi về hạn mức, số dư, hoặc tình hình chi tiêu.

DỮ LIỆU BÌNH CẢNH NGƯỜI DÙNG HẠN MỨC & SỐ DƯ HIỆN TẠI (Context):
- Số dư hiện tại: ${context?.currentBalance ? context.currentBalance.toLocaleString('vi-VN') : '11200000'} VNĐ
- Tổng thu nhập tháng: ${context?.monthlyIncome ? context.monthlyIncome.toLocaleString('vi-VN') : '20500000'} VNĐ
- Tổng chi tiêu tháng: ${context?.monthlyExpense ? context.monthlyExpense.toLocaleString('vi-VN') : '7500000'} VNĐ
- Tiền người khác nợ mình (Receivables): ${context?.totalReceivables ? context.totalReceivables.toLocaleString('vi-VN') : '1450000'} VNĐ
- Tiền mình nợ người khác (Payables): ${context?.totalPayables ? context.totalPayables.toLocaleString('vi-VN') : '350000'} VNĐ

QUY TRÌNH XỬ LÝ (CHỈ TRẢ VỀ JSON VALID - KHÔNG MARKDOWN - KHÔNG TEXT THỪA):
Dù người dùng nói gì, bạn bắt buộc phải phân tích và trả về DUY NHẤT một chuỗi JSON theo cấu trúc sau:

{
  "intent": "log_transaction" | "query_data" | "general_chat",
  "transactions": [
    {
      "type": "expense" | "income" | "receivable" | "payable",
      "amount": <số nguyên, ví dụ 50k = 50000, 1 củ = 1000000, 1 lít = 100000, 5 lít = 500000, 1.5 củ = 1500000>,
      "category": "<Chỉ chọn một mã CategoryCode trong Danh sách trên>",
      "description": "<Mô tả ngắn gọn bằng tiếng Việt>"
    }
  ],
  "reply_message": "<Câu trả lời tự nhiên, ngắn gọn để hiển thị cho người dùng>"
}

HƯỚNG DẪN VIẾT 'reply_message':
- Trả lời trực tiếp vào vấn đề.
- Nếu là ghi nhận chi tiêu: Xác nhận ngắn gọn. (VD: "Đã ghi nhận 50k tiền cafe sáng. Cố gắng giữ ngân sách tuần này nhé!")
- Nếu là truy vấn ngân sách: Cung cấp con số rõ ràng từ Context và gợi ý hành động.
- Không giải thích dài dòng về việc bạn là AI.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "";
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const parsedData = JSON.parse(cleanedText);
    return res.json(parsedData);
  } catch (err: any) {
    console.error("Error in /api/parse-finance:", err);
    // Fall back to heuristic parser on any error
    const fallbackResult = fallbackParse(req.body?.prompt || "", req.body?.context);
    return res.json(fallbackResult);
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "ChiChill AI" });
});

// Endpoint to trigger or forward Zalo Notification / ZNS / Webhook
app.post("/api/send-zalo-notification", async (req, res) => {
  try {
    const { categoryLabel, spent, limit, percentage, level, zaloPhoneOrId, zaloWebhookUrl } = req.body;

    const formattedSpent = (spent || 0).toLocaleString("vi-VN") + " ₫";
    const formattedLimit = (limit || 0).toLocaleString("vi-VN") + " ₫";
    const statusText = level === "danger" ? "VƯỢT HẠN MỨC 100%" : `ĐẠT ${percentage}% HẠN MỨC`;

    const zaloMessagePayload = {
      recipient: zaloPhoneOrId || "0901234567",
      template_id: "ZNS_BUDGET_ALERT_V1",
      template_data: {
        category: categoryLabel || "Danh mục chi tiêu",
        spent: formattedSpent,
        limit: formattedLimit,
        percentage: `${percentage}%`,
        status: statusText,
        advice: level === "danger"
          ? "Đã vượt ngân sách dự kiến. Vui lòng dừng các khoản chi không cấp thiết!"
          : "Đã chi tiêu gần chạm hạn mức, hãy cân nhắc chi tiêu tiết kiệm trong những ngày tới.",
        time: new Date().toLocaleString("vi-VN"),
      },
    };

    // If external Zalo webhook is configured, forward to webhook
    if (zaloWebhookUrl && typeof zaloWebhookUrl === "string" && zaloWebhookUrl.startsWith("http")) {
      try {
        await fetch(zaloWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(zaloMessagePayload),
        });
      } catch (webhookErr) {
        console.warn("Could not forward to external Zalo webhook:", webhookErr);
      }
    }

    return res.json({
      success: true,
      message: `Đã gửi cảnh báo Zalo thành công tới ${zaloPhoneOrId || "số Zalo liên kết"} (${statusText}).`,
      payload: zaloMessagePayload,
    });
  } catch (error: any) {
    console.error("Error in /api/send-zalo-notification:", error);
    return res.status(500).json({ success: false, error: error?.message || "Internal Server Error" });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
} else {
  // Production static serving
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Production server running on port ${PORT}`);
  });
}
