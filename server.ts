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
  const rawKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!rawKey) return null;
  const apiKey = rawKey.replace(/^["']|["']$/g, '').trim();
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

function parseVNDAmount(text: string): number {
  const itemLower = text.toLowerCase().trim();

  // 1. Handle "rưỡi" / "ruoi" (e.g. "1 củ rưỡi", "1tr rưỡi", "2 lít rưỡi")
  if (itemLower.includes("rưỡi") || itemLower.includes("ruoi")) {
    const rMatch = itemLower.match(/(\d+[\d\.,]*)\s*(củ|tr|triệu|lít|xị|k)?\s*(rưỡi|ruoi)/i);
    if (rMatch) {
      const num = parseFloat((rMatch[1] || "1").replace(/,/g, "."));
      const unit = (rMatch[2] || "").toLowerCase();
      if (unit === "củ" || unit === "tr" || unit === "triệu") {
        return Math.round((num + 0.5) * 1000000);
      } else if (unit === "lít" || unit === "xị") {
        return Math.round((num + 0.5) * 100000);
      } else if (unit === "k") {
        return Math.round((num + 0.5) * 1000);
      } else if (num < 100) {
        return Math.round((num + 0.5) * 1000);
      }
    }
  }

  // 2. Infix notation like "1tr8", "1 củ 8", "1 triệu 8", "2 lít 5", "1k5", "1tr800", "1tr800k", "1 củ 50k"
  const infixMatch = itemLower.match(/(\d+[\d\.,]*)\s*(củ|tr|triệu|lít|xị|k|ngàn|nghìn)\s*(\d+[\d\.,]*)\s*(k|ngàn|nghìn|đ|vnd)?/i);
  if (infixMatch) {
    const mainNum = parseFloat(infixMatch[1].replace(/,/g, "."));
    const unit = infixMatch[2].toLowerCase();
    const subNum = parseFloat(infixMatch[3].replace(/,/g, "."));
    const subUnit = (infixMatch[4] || "").toLowerCase();

    let mainVND = 0;
    let subVND = 0;

    if (unit === "củ" || unit === "tr" || unit === "triệu") {
      mainVND = Math.round(mainNum * 1000000);
      if (subUnit === "k" || subUnit === "ngàn" || subUnit === "nghìn") {
        subVND = Math.round(subNum * 1000);
      } else if (subNum < 10) {
        // e.g. 1tr8 -> 800,000
        subVND = Math.round(subNum * 100000);
      } else if (subNum < 100) {
        // e.g. 1tr80 -> 800,000, 1tr25 -> 250,000
        subVND = Math.round(subNum * 10000);
      } else {
        // e.g. 1tr800 -> 800,000
        subVND = Math.round(subNum * 1000);
      }
      return mainVND + subVND;
    } else if (unit === "lít" || unit === "xị") {
      mainVND = Math.round(mainNum * 100000);
      if (subUnit === "k" || subUnit === "ngàn" || subUnit === "nghìn") {
        subVND = Math.round(subNum * 1000);
      } else if (subNum < 10) {
        // e.g. 2 lít 5 -> 50,000
        subVND = Math.round(subNum * 10000);
      } else {
        subVND = Math.round(subNum * 1000);
      }
      return mainVND + subVND;
    } else if (unit === "k" || unit === "ngàn" || unit === "nghìn") {
      mainVND = Math.round(mainNum * 1000);
      if (subNum < 10) {
        // e.g. 1k5 -> 500
        subVND = Math.round(subNum * 100);
      } else if (subNum < 100) {
        subVND = Math.round(subNum * 10);
      } else {
        subVND = Math.round(subNum);
      }
      return mainVND + subVND;
    }
  }

  // 3. Standard notation "1.8tr", "1,8 triệu", "45k", "500000", "1.2 củ"
  const stdMatch = itemLower.match(/(\d+[\d\.,]*)\s*(củ|lít|xị|k|tr|triệu|ngàn|nghìn|đ|vnd)?/i);
  if (stdMatch) {
    const numStr = stdMatch[1].replace(/,/g, ".");
    const num = parseFloat(numStr);
    const unit = (stdMatch[2] || "").toLowerCase();

    if (unit === "củ" || unit === "tr" || unit === "triệu") {
      return Math.round(num * 1000000);
    } else if (unit === "lít" || unit === "xị") {
      return Math.round(num * 100000);
    } else if (unit === "k" || unit === "ngàn" || unit === "nghìn") {
      return Math.round(num * 1000);
    } else if (num < 1000 && !itemLower.includes("đ") && !itemLower.includes("vnd")) {
      return Math.round(num * 1000);
    } else {
      return Math.round(num);
    }
  }

  return 0;
}

// Fallback Vietnamese heuristic parser in case Gemini API Key is missing or unavailable
function fallbackParse(prompt: string, context?: any) {
  const lower = prompt.toLowerCase().trim();
  
  // 1. Check for budget/query intent
  if (
    lower.includes("bao nhiêu") ||
    lower.includes("hạn mức") ||
    lower.includes("còn lại") ||
    lower.includes("tình hình") ||
    lower.includes("ngân sách") ||
    lower.includes("số dư")
  ) {
    let responseText = "Số dư hiện tại của bạn là khoảng " + (context?.currentBalance ? (context.currentBalance / 1000).toLocaleString('vi-VN') + "kđ" : "11.2 củ") + ". Ngân sách Ăn uống tháng này còn lại khá thoải mái!";
    if (lower.includes("ăn") || lower.includes("cơm") || lower.includes("food") || lower.includes("uống") || lower.includes("cafe")) {
      const foodLimit = context?.categoryBudgets?.Food || 4500000;
      const foodSpent = context?.categorySpent?.Food || 2800000;
      const remaining = foodLimit - foodSpent;
      responseText = `Hạn mức Ăn uống tháng này của bạn là ${(foodLimit/1000000).toFixed(1)} củ. Đã tiêu ${(foodSpent/1000).toLocaleString('vi-VN')}k. Bạn còn lại ${(remaining/1000).toLocaleString('vi-VN')}kđ!`;
    } else if (lower.includes("công việc") || lower.includes("work") || lower.includes("ads") || lower.includes("dự án")) {
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

  // 2. Parse multi-item or single-item transactions
  // Tách các khoản theo dấu phẩy (,), chấm phẩy (;), xuống dòng (\n), dấu cộng (+), hoặc từ "và"
  const rawItems = prompt.split(/[,;\n+]|\s+và\s+/i).map(s => s.trim()).filter(Boolean);
  const transactions: Array<{
    type: 'expense' | 'income' | 'receivable' | 'payable';
    amount: number;
    category: string;
    description: string;
  }> = [];

  for (const item of rawItems) {
    const itemLower = item.toLowerCase();
    const amount = parseVNDAmount(item);

    if (amount > 0) {
      let category = "Food";
      let type: 'expense' | 'income' | 'receivable' | 'payable' = "expense";

      // Check user custom categories first if available
      if (context?.userCategories && Array.isArray(context.userCategories)) {
        for (const c of context.userCategories) {
          const catLabel = (c.label || '').toLowerCase();
          const catDesc = (c.description || '').toLowerCase();
          if (catLabel && (itemLower.includes(catLabel) || (catDesc && itemLower.includes(catDesc)))) {
            category = c.code;
            break;
          }
        }
      }

      if (itemLower.includes("mượn") || itemLower.includes("vay") || itemLower.includes("nợ") || itemLower.includes("ứng") || itemLower.includes("chia bill")) {
        category = "Debt";
        if (itemLower.includes("cho") || itemLower.includes("mượn") || itemLower.includes("ứng")) {
          type = "receivable";
        } else {
          type = "payable";
        }
      } else if (itemLower.includes("ads") || itemLower.includes("quẹt thẻ") || itemLower.includes("đạo cụ") || itemLower.includes("tiếp khách") || itemLower.includes("công ty") || itemLower.includes("phòng") || itemLower.includes("khách sạn") || itemLower.includes("ks") || itemLower.includes("vé máy bay") || itemLower.includes("công tác")) {
        category = "Work";
      } else if (itemLower.includes("xăng") || itemLower.includes("grab") || itemLower.includes("gojek") || itemLower.includes("be") || itemLower.includes("xe") || itemLower.includes("gửi xe") || itemLower.includes("taxi")) {
        category = "Transport";
      } else if (itemLower.includes("áo") || itemLower.includes("quần") || itemLower.includes("shopee") || itemLower.includes("lazada") || itemLower.includes("mua") || itemLower.includes("sắm") || itemLower.includes("homestay") || itemLower.includes("du lịch")) {
        category = "Shopping";
      } else if (itemLower.includes("lương") || itemLower.includes("thưởng") || itemLower.includes("freelance") || itemLower.includes("thu")) {
        category = "Income";
        type = "income";
      }

      transactions.push({
        type,
        amount,
        category,
        description: item
      });
    }
  }

  if (transactions.length === 0) {
    return {
      intent: "general_chat",
      transactions: [],
      reply_message: "Chào bạn! Tôi là ChiChill AI — Trợ lý quản lý chi tiêu thật Chill! ☕ Bạn có thể gõ ví dụ: 'Cơm trưa 45k, cafe Highland 35k' hoặc 'Nam mượn 200k tiền cơm'."
    };
  }

  const categoryNames: Record<string, string> = {
    Food: "Ăn uống",
    Transport: "Đi lại",
    Shopping: "Mua sắm",
    Work: "Công việc",
    Debt: "Nợ & Cho vay",
    Income: "Thu nhập"
  };

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const formattedTotal = (totalAmount / 1000).toLocaleString('vi-VN') + "kđ";

  let replyMsg = `Đã ghi nhận ${transactions.length} khoản (${formattedTotal}): ${transactions.map(t => `${t.description} (${(t.amount/1000).toLocaleString('vi-VN')}kđ)`).join(', ')}. Chúc bạn làm việc thật Chill! ☕`;

  if (transactions.length === 1) {
    const firstTx = transactions[0];
    const formattedAmount = (firstTx.amount / 1000).toLocaleString('vi-VN') + "kđ";
    const catName = categoryNames[firstTx.category] || firstTx.category;

    if (firstTx.type === 'receivable') {
      replyMsg = `Đã ghi nhận khoản cho mượn ${formattedAmount} vào Sổ Nợ VP. Bạn có thể gửi tin nhắn nhắc nợ Zalo bất cứ lúc nào nhé!`;
    } else if (firstTx.type === 'payable') {
      replyMsg = `Đã lưu khoản nợ ${formattedAmount} vào Sổ Nợ VP để bạn nhớ trả đúng hẹn!`;
    } else if (firstTx.type === 'income') {
      replyMsg = `Tuyệt vời! Đã cộng ${formattedAmount} vào tổng thu nhập tháng này.`;
    } else {
      replyMsg = `Đã ghi nhận ${formattedAmount} cho danh mục ${catName}. Hãy luôn giữ ngân sách thoải mái nhé!`;
    }
  }

  return {
    intent: "log_transaction",
    transactions,
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
      console.log("⚠️ [Parser Engine: Fallback Regex] GEMINI_API_KEY chưa được cấu hình, sử dụng bộ tách Heuristic cục bộ.");
      const fallbackResult = fallbackParse(prompt, context);
      return res.json({ ...fallbackResult, engine: "fallback_regex" });
    }

    console.log("⚡ [Parser Engine: Gemini AI] Đang gửi yêu cầu tới Google Gemini 3.7 Flash...");

    const userCategoriesFormatted = context?.userCategories && Array.isArray(context.userCategories)
      ? context.userCategories.map((c: any) => `- "${c.code}": ${c.label} (${c.description || ''})`).join('\n')
      : `- "Food": Ăn uống\n- "Transport": Đi lại\n- "Shopping": Mua sắm\n- "Work": Công việc\n- "Debt": Nợ & Cho vay\n- "Income": Thu nhập`;

    const systemInstruction = `
Bạn là ChiChill AI — Trợ lý Quản lý Chi tiêu Cá nhân AI chuyên nghiệp, giúp người dùng Việt Nam theo dõi thu/chi/nợ nần một cách nhẹ nhàng, thư giãn (Chill) và không bị bất kỳ áp lực nào.

MỤC TIÊU CỐT LÕI:
1. Giải quyết điểm đau: Quản lý chi tiêu thường rất áp lực. ChiChill biến việc đó thành trải nghiệm thư giãn, tự nhiên nhất.
2. Hiểu ngôn ngữ tự nhiên, tiếng lóng (củ, lít, xị, quẹt thẻ giùm, cà bao, chia bill, ứng trước) để tự động ghi nhận thu/chi/nợ chính xác không cần thao tác phức tạp.
3. QUAN TRỌNG VỀ ĐA GIAO DỊCH (MULTI-TRANSACTIONS):
   - Khi người dùng nhập một câu chứa NHIỀU khoản (phân tách bởi dấu phẩy, dấu chấm phẩy, "và", "+", xuống dòng, ví dụ: "Cơm trưa VP 45k, cafe Highland 35k", hoặc "Grab 50k và trà sữa 40k"), bạn BẮT BUỘC PHẢI bóc tách thành TỪNG phần tử riêng biệt trong mảng "transactions".
   - Ví dụ:
     Input: "Cơm trưa VP 45k, cafe Highland 35k"
     Output "transactions":
     [
       { "type": "expense", "amount": 45000, "category": "Food", "description": "Cơm trưa VP" },
       { "type": "expense", "amount": 35000, "category": "Food", "description": "Cafe Highland" }
     ]
4. Phân tích dữ liệu hạn mức ngân sách và đưa ra lời khuyên ngắn gọn, thân thiện, mang tính khích lệ.
5. Phản hồi tự nhiên, gần gũi, thoải mái, tích cực.

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
- Nếu là ghi nhận chi tiêu: Xác nhận ngắn gọn tất cả các khoản đã ghi nhận. (VD: "Đã ghi nhận 2 khoản: Cơm trưa VP (45kđ) và cafe Highland (35kđ), tổng 80kđ. Chúc bạn một ngày thật Chill! ☕")
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
    console.log("✅ [Gemini AI Response]:", JSON.stringify(parsedData));
    return res.json({ ...parsedData, engine: "gemini-3.7-flash" });
  } catch (err: any) {
    console.error("⚠️ [Gemini Error, switching to Fallback Regex]:", err?.message || err);
    // Fall back to heuristic parser on any error
    const fallbackResult = fallbackParse(req.body?.prompt || "", req.body?.context);
    return res.json({ ...fallbackResult, engine: "fallback_regex" });
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

// Endpoint for AI Monthly Wrap-up (Roast & Toast)
app.post("/api/ai-wrap-up", async (req, res) => {
  try {
    const { month, transactions, categories, savingsRate } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ error: "Transactions required" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ 
        success: false, 
        message: "Tính năng AI Wrap-up cần kết nối Gemini API. Hãy thiết lập GEMINI_API_KEY trong file .env nhé! (Hiện tại AI đang đi vắng ☕)" 
      });
    }

    // Shrink payload to save tokens
    const miniTx = transactions.map((t: any) => `${t.date}|${t.category}|${t.amount}|${t.type}`).join('\n');
    const catMap = Object.keys(categories || {}).map(k => `${k}:${categories[k].label}`).join(', ');

    const prompt = `
Bạn là ChiChill AI. Hãy viết một đoạn nhận xét tổng kết tài chính cuối tháng (tháng ${month}) thật hài hước, mặn mòi, mang phong cách "Roast & Toast" (vừa trêu chọc vừa khen ngợi) giống như Spotify Wrapped.
Dữ liệu tóm tắt:
- Tỷ lệ tiết kiệm: ${savingsRate}%
- Danh sách giao dịch (Date|Category|Amount|Type):
${miniTx}
- Mã danh mục: ${catMap}

Yêu cầu:
- Viết 1 đoạn văn ngắn (tối đa 4-5 câu).
- Có emoji vui nhộn.
- Giọng điệu thân thiện, GenZ, phân tích xem người dùng chi nhiều tiền nhất vào cái gì, có đáng khen không hay đáng bị trêu (vd: "Chúa tể trà sữa", "Dân chơi chốt đơn").
- Không dùng Markdown, trả về plain text trơn thuần túy.
    `;

    console.log(`⚡ [AI Wrap-up] Đang tạo báo cáo cho tháng ${month}...`);
    const result = await ai.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.json({
      success: true,
      message: text
    });
  } catch (error: any) {
    console.error("Error in AI Wrap-up:", error);
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
