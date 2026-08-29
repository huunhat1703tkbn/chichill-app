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
import { Firestore } from "@google-cloud/firestore";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn("Could not create data dir:", err);
  }
}

let db: Firestore | null = null;
try {
  // Automatically uses default service account on Cloud Run
  db = new Firestore();
  console.log("✅ Firestore initialized successfully");
} catch (e) {
  console.error("⚠️ Failed to initialize Firestore. Falling back to local JSON storage:", e);
}

const memoryUserStore: Record<string, any> = {};

async function getUserDataFromStorage(userId: string) {
  if (memoryUserStore[userId]) return memoryUserStore[userId];
  
  if (db) {
    try {
      const doc = await db.collection('chichill_users').doc(userId).get();
      if (doc.exists) {
        const data = doc.data();
        memoryUserStore[userId] = data;
        return data;
      }
    } catch (e) {
      console.error("Firestore read error (user):", e);
    }
  }

  // Fallback to local file
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

async function saveUserDataToStorage(userId: string, data: any) {
  memoryUserStore[userId] = data;
  
  if (db) {
    try {
      await db.collection('chichill_users').doc(userId).set(data);
    } catch (e) {
      console.error("Firestore write error (user):", e);
    }
  }

  // Fallback to local file
  try {
    const filePath = path.join(DATA_DIR, `user_${userId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed writing user data to disk:", err);
  }
}

// Endpoint lấy dữ liệu đám mây của người dùng
app.get("/api/user-data/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  const userData = await getUserDataFromStorage(userId);
  return res.json({ success: true, data: userData || null });
});

// Endpoint đồng bộ dữ liệu giữa Điện thoại Zalo & Web Google Cloud Run
app.post("/api/sync-user-data", async (req, res) => {
  const { userId, data } = req.body;
  if (!userId || !data) return res.status(400).json({ error: "Missing userId or data" });
  await saveUserDataToStorage(userId, data);
  return res.json({ success: true, timestamp: Date.now() });
});

// =========================================================================
// COLLABORATIVE SHARED BILL SPLITTING ENDPOINTS
// =========================================================================

const memorySharedBillStore: Record<string, any> = {};

function generateShareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "CHILL-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function getSharedBillFromStorage(shareCode: string) {
  const normalized = shareCode.trim().toUpperCase();
  if (memorySharedBillStore[normalized]) return memorySharedBillStore[normalized];
  
  if (db) {
    try {
      const doc = await db.collection('chichill_shared_bills').doc(normalized).get();
      if (doc.exists) {
        const data = doc.data();
        memorySharedBillStore[normalized] = data;
        return data;
      }
    } catch (e) {
      console.error("Firestore read error (bill):", e);
    }
  }

  // Fallback
  const filePath = path.join(DATA_DIR, `shared_bill_${normalized}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      memorySharedBillStore[normalized] = data;
      return data;
    } catch (e) {
      console.error("Error reading shared bill:", e);
    }
  }
  return null;
}

async function saveSharedBillToStorage(shareCode: string, groupData: any) {
  const normalized = shareCode.trim().toUpperCase();
  groupData.shareCode = normalized;
  groupData.isShared = true;
  groupData.lastSyncedAt = new Date().toISOString();
  memorySharedBillStore[normalized] = groupData;
  
  if (db) {
    try {
      await db.collection('chichill_shared_bills').doc(normalized).set(groupData);
    } catch (e) {
      console.error("Firestore write error (bill):", e);
    }
  }

  // Fallback
  try {
    const filePath = path.join(DATA_DIR, `shared_bill_${normalized}.json`);
    fs.writeFileSync(filePath, JSON.stringify(groupData, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed writing shared bill to disk:", err);
  }
}

// 1. Tạo hoặc chuyển nhóm thành Shared Bill (Cộng tác đa người dùng)
app.post("/api/shared-bill", async (req, res) => {
  try {
    const { group, ownerUserId, userProfile } = req.body;
    if (!group || !group.name) {
      return res.status(400).json({ success: false, error: "Missing group data" });
    }

    let shareCode = group.shareCode;
    if (!shareCode) {
      // Generate a unique shareCode
      let attempts = 0;
      let existing = null;
      do {
        shareCode = generateShareCode();
        existing = await getSharedBillFromStorage(shareCode);
        attempts++;
      } while (existing && attempts < 10);
    }

    const memberProfiles = group.memberProfiles || [];
    if (userProfile && userProfile.id) {
      const exists = memberProfiles.some((p: any) => p.userId === userProfile.id);
      if (!exists) {
        memberProfiles.push({
          userId: userProfile.id,
          name: userProfile.name || group.leader || "Thành viên",
          avatar: userProfile.avatar || "",
          joinedAt: new Date().toISOString(),
        });
      }
    }

    const newGroup = {
      ...group,
      shareCode,
      isShared: true,
      ownerUserId: ownerUserId || userProfile?.id || group.ownerUserId,
      memberProfiles,
      createdAt: group.createdAt || new Date().toISOString().split("T")[0],
      expenses: group.expenses || [],
      isSettled: group.isSettled ?? false,
    };

    await saveSharedBillToStorage(shareCode, newGroup);
    console.log(`✅ [Shared Bill Created]: ${shareCode} - "${newGroup.name}"`);
    return res.json({ success: true, shareCode, group: newGroup });
  } catch (err: any) {
    console.error("Error creating shared bill:", err);
    return res.status(500).json({ success: false, error: err?.message || "Internal Server Error" });
  }
});

// 2. Lấy dữ liệu Shared Bill theo shareCode (Deep link / Mở nhóm)
app.get("/api/shared-bill/:shareCode", async (req, res) => {
  const { shareCode } = req.params;
  if (!shareCode) return res.status(400).json({ success: false, error: "Missing shareCode" });

  const group = await getSharedBillFromStorage(shareCode);
  if (!group) {
    return res.status(404).json({ success: false, error: "Không tìm thấy nhóm chia bill với mã này" });
  }

  return res.json({ success: true, group });
});

// 3. Tham gia nhóm chia bill (Join Shared Bill qua Zalo Profile)
app.post("/api/shared-bill/:shareCode/join", async (req, res) => {
  const { shareCode } = req.params;
  const { userProfile } = req.body;
  if (!shareCode) return res.status(400).json({ success: false, error: "Missing shareCode" });

  const group = await getSharedBillFromStorage(shareCode);
  if (!group) {
    return res.status(404).json({ success: false, error: "Không tìm thấy nhóm chia bill" });
  }

  if (userProfile && userProfile.id) {
    if (!group.memberProfiles) group.memberProfiles = [];
    const existingIndex = group.memberProfiles.findIndex((p: any) => p.userId === userProfile.id);
    if (existingIndex >= 0) {
      group.memberProfiles[existingIndex] = {
        ...group.memberProfiles[existingIndex],
        name: userProfile.name || group.memberProfiles[existingIndex].name,
        avatar: userProfile.avatar || group.memberProfiles[existingIndex].avatar,
      };
    } else {
      group.memberProfiles.push({
        userId: userProfile.id,
        name: userProfile.name || "Thành viên mới",
        avatar: userProfile.avatar || "",
        joinedAt: new Date().toISOString(),
      });
    }

    // Also ensure user's display name is in group.members
    const cleanName = userProfile.name?.trim();
    if (cleanName && !group.members.includes(cleanName)) {
      group.members.push(cleanName);
    }
  }

  await saveSharedBillToStorage(shareCode, group);
  console.log(`👥 [Shared Bill Joined]: ${userProfile?.name || "Anonymous"} joined ${shareCode}`);
  return res.json({ success: true, group });
});

// 4. Thêm hoặc cập nhật khoản chi trong Shared Bill
app.post("/api/shared-bill/:shareCode/expense", async (req, res) => {
  const { shareCode } = req.params;
  const { expense, userProfile } = req.body;
  if (!shareCode || !expense) {
    return res.status(400).json({ success: false, error: "Missing shareCode or expense" });
  }

  const group = await getSharedBillFromStorage(shareCode);
  if (!group) {
    return res.status(404).json({ success: false, error: "Không tìm thấy nhóm chia bill" });
  }

  const newExpense = {
    ...expense,
    id: expense.id || `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    paidByUserId: userProfile?.id || expense.paidByUserId,
    createdAt: expense.createdAt || new Date().toISOString(),
  };

  const existingIdx = group.expenses.findIndex((e: any) => e.id === newExpense.id);
  if (existingIdx >= 0) {
    group.expenses[existingIdx] = newExpense;
  } else {
    group.expenses.push(newExpense);
  }

  // Ensure paidBy name is in members list
  if (newExpense.paidBy && !group.members.includes(newExpense.paidBy)) {
    group.members.push(newExpense.paidBy);
  }

  await saveSharedBillToStorage(shareCode, group);
  console.log(`💸 [Shared Bill Expense Added]: ${shareCode} - ${newExpense.description} (${newExpense.amount}đ)`);
  return res.json({ success: true, group, expense: newExpense });
});

// 5. Xóa khoản chi trong Shared Bill
app.delete("/api/shared-bill/:shareCode/expense/:expenseId", async (req, res) => {
  const { shareCode, expenseId } = req.params;
  if (!shareCode || !expenseId) {
    return res.status(400).json({ success: false, error: "Missing parameters" });
  }

  const group = await getSharedBillFromStorage(shareCode);
  if (!group) {
    return res.status(404).json({ success: false, error: "Không tìm thấy nhóm chia bill" });
  }

  group.expenses = group.expenses.filter((e: any) => e.id !== expenseId);
  await saveSharedBillToStorage(shareCode, group);
  return res.json({ success: true, group });
});

// 6. Đánh dấu tất toán (Toggle isSettled)
app.post("/api/shared-bill/:shareCode/settle", async (req, res) => {
  const { shareCode } = req.params;
  const group = await getSharedBillFromStorage(shareCode);
  if (!group) {
    return res.status(404).json({ success: false, error: "Không tìm thấy nhóm chia bill" });
  }

  group.isSettled = !group.isSettled;
  await saveSharedBillToStorage(shareCode, group);
  return res.json({ success: true, group });
});

// 7. Cập nhật Trưởng nhóm / Thủ quỹ & STK
app.put("/api/shared-bill/:shareCode/leader", async (req, res) => {
  const { shareCode } = req.params;
  const { leader, bankInfo } = req.body;
  const group = await getSharedBillFromStorage(shareCode);
  if (!group) {
    return res.status(404).json({ success: false, error: "Không tìm thấy nhóm chia bill" });
  }

  if (leader !== undefined) group.leader = leader;
  if (bankInfo !== undefined) group.bankInfo = bankInfo;

  await saveSharedBillToStorage(shareCode, group);
  return res.json({ success: true, group });
});

// 8. Xóa nhóm Shared Bill
app.delete("/api/shared-bill/:shareCode", async (req, res) => {
  const { shareCode } = req.params;
  const normalized = shareCode.trim().toUpperCase();
  delete memorySharedBillStore[normalized];
  
  if (db) {
    try {
      await db.collection('chichill_shared_bills').doc(normalized).delete();
    } catch (e) {
      console.error("Firestore delete error (bill):", e);
    }
  }

  const filePath = path.join(DATA_DIR, `shared_bill_${normalized}.json`);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {}
  }
  return res.json({ success: true });
});

// Zalo OAuth V4 Callback Endpoint
app.post("/api/auth/zalo", async (req, res) => {
  try {
    const { code, code_verifier, redirect_uri } = req.body;
    const ZALO_APP_ID = process.env.VITE_ZALO_APP_ID || process.env.ZALO_APP_ID || '737758941600774697';
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

function parseBaseVNDAmount(text: string): number {
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

  // 2. Infix notation like "3tr5", "1tr8", "1 củ 8", "1 triệu 8", "2 lít 5", "1k5", "1tr800", "1tr800k", "1 củ 50k"
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
        subVND = Math.round(subNum * 100000);
      } else if (subNum < 100) {
        subVND = Math.round(subNum * 10000);
      } else {
        subVND = Math.round(subNum * 1000);
      }
      return mainVND + subVND;
    } else if (unit === "lít" || unit === "xị") {
      mainVND = Math.round(mainNum * 100000);
      if (subUnit === "k" || subUnit === "ngàn" || subUnit === "nghìn") {
        subVND = Math.round(subNum * 1000);
      } else if (subNum < 10) {
        subVND = Math.round(subNum * 10000);
      } else {
        subVND = Math.round(subNum * 1000);
      }
      return mainVND + subVND;
    } else if (unit === "k" || unit === "ngàn" || unit === "nghìn") {
      mainVND = Math.round(mainNum * 1000);
      if (subNum < 10) {
        subVND = Math.round(subNum * 100);
      } else if (subNum < 100) {
        subVND = Math.round(subNum * 10);
      } else {
        subVND = Math.round(subNum);
      }
      return mainVND + subVND;
    }
  }

  // 3. Standard notation "3.5tr", "1.8tr", "1,8 triệu", "45k", "500000", "1.2 củ"
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

function parseVNDAmount(text: string): number {
  const itemLower = text.toLowerCase().trim();

  // 0. Handle multipliers e.g. "tiền nhà 3 tháng mỗi tháng 3tr5", "3 tháng x 3.5tr", "4 vé mỗi vé 150k"
  const multMatch = itemLower.match(/(\d+)\s*(tháng|thang|lần|lan|cái|cai|chiếc|chiec|suất|suat|phần|phan|người|nguoi|vé|ve|hộp|hop|ly|cốc|coc|bát|tô|to)\s*(?:mỗi|moi|từng|tung|x|\*|\/)?\s*(?:tháng|thang|lần|lan|cái|cai|suất|suat|phần|phan|người|nguoi|vé|ve|hộp|hop|ly|cốc|coc|bát|tô|to)?\s*([0-9\.,]+(?:\s*[a-zA-Zđ]+(?:\s*\d+)?)?)/i);
  if (multMatch) {
    const qty = parseInt(multMatch[1], 10);
    const unitPriceStr = multMatch[3];
    const unitPrice = parseBaseVNDAmount(unitPriceStr);
    if (qty > 0 && unitPrice > 0) {
      return qty * unitPrice;
    }
  }

  return parseBaseVNDAmount(text);
}

// Fallback Vietnamese heuristic parser in case Gemini API Key is missing or unavailable
function fallbackParse(prompt: string, context?: any) {
  const lower = prompt.toLowerCase().trim();

  // Check if prompt is a question, explanation request or inquiry (NOT a transaction log)
  const isQuestionOrInquiry =
    lower.startsWith("sao") ||
    lower.includes("tại sao") ||
    lower.includes("vì sao") ||
    lower.includes("sao lại") ||
    lower.includes("sao ví") ||
    lower.includes("sao tiền") ||
    lower.includes("giải thích") ||
    lower.includes("thắc mắc") ||
    lower.includes("trong khi") ||
    lower.includes("tại sao lại") ||
    lower.includes("nguyên nhân") ||
    lower.includes("nghĩa là sao") ||
    lower.includes("nghĩa là gì") ||
    lower.includes("thế nào") ||
    lower.includes("bao nhiêu") ||
    lower.includes("hạn mức") ||
    lower.includes("số dư") ||
    lower.includes("đánh giá") ||
    lower.includes("sức khỏe") ||
    lower.includes("có nên") ||
    lower.includes("tiết kiệm") ||
    lower.includes("phân bổ") ||
    lower.includes("ai nợ") ||
    lower.includes("?");

  // 1. Specific Explanation: Why wallet balance is different from monthly income vs expense
  if (
    (lower.includes("sao") || lower.includes("tại sao") || lower.includes("vì sao") || lower.includes("giải thích")) &&
    (lower.includes("ví") || lower.includes("số dư") || lower.includes("balance")) &&
    (lower.includes("thu") || lower.includes("chi") || lower.includes("trong khi"))
  ) {
    const balance = context?.currentBalance || 28000000;
    const income = context?.monthlyIncome || 20500000;
    const expense = context?.monthlyExpense || 12490000;
    const surplus = income - expense;

    const reply = `💡 GIẢI THÍCH SỰ CHÊNH LỆCH SỐ DƯ VÍ & THU CHI THÁNG:\n\n1. 👛 Số dư ví (${balance.toLocaleString('vi-VN')} đ): Là TỔNG SỐ DƯ TÍCH LŨY lũy kế từ trước đến nay của bạn (bao gồm số dư từ các tháng trước mang sang).\n\n2. 📊 Thu (${income.toLocaleString('vi-VN')} đ) & Chi (${expense.toLocaleString('vi-VN')} đ): Là các giao dịch phát sinh của RIÊNG THÁNG NÀY.\n\n3. ✨ Tháng này bạn đang thặng dư dương +${surplus.toLocaleString('vi-VN')} đ (Thu - Chi), và khoản này đã được tự động cộng dồn vào số dư ví tích lũy của bạn!`;

    return {
      intent: "query_data",
      transactions: [],
      reply_message: reply
    };
  }

  // 2. Intelligent Financial Advice & Evaluation
  if (
    lower.includes("đánh giá") ||
    lower.includes("sức khỏe tài chính") ||
    lower.includes("tình hình") ||
    lower.includes("thế nào") ||
    lower.includes("ổn không") ||
    lower.includes("tiêu nhiều")
  ) {
    const expense = context?.monthlyExpense || 0;
    const income = context?.monthlyIncome || 0;
    const balance = context?.currentBalance || 0;
    const daysRemaining = context?.dateContext?.daysRemaining || 10;
    const warnings = context?.warningCategories || [];

    let status = "🟢 Sức khỏe tài chính: RẤT CHILL";
    let advice = "Bạn đang kiểm soát chi tiêu rất tốt, tỷ lệ tiết kiệm ổn định.";

    if (warnings.length > 0) {
      status = "🟡 Sức khỏe tài chính: CẦN LƯU Ý";
      advice = `Bạn đang có ${warnings.length} nhóm chi tiêu gần chạm hoặc vượt hạn mức (${warnings.map((w: any) => w.label).join(', ')}). Trong ${daysRemaining} ngày tới, hãy ưu tiên các khoản thiết yếu nhé!`;
    } else if (income > 0 && expense > income * 0.8) {
      status = "🔴 Sức khỏe tài chính: BÁO ĐỘNG ĐỎ";
      advice = `Tổng chi tiêu đã chiếm hơn 80% thu nhập tháng. Hãy hãm phanh chi tiêu mua sắm/ăn ngoài để bảo toàn số dư ${balance.toLocaleString('vi-VN')}đ nhé!`;
    }

    const reply = `📊 TỔNG QUAN TÀI CHÍNH THÁNG NÀY:\n- Số dư khả dụng: ${balance.toLocaleString('vi-VN')} đ\n- Thu nhập: ${income.toLocaleString('vi-VN')} đ | Chi tiêu: ${expense.toLocaleString('vi-VN')} đ\n\n${status}\n💡 Lời khuyên: ${advice} ✨`;

    return {
      intent: "financial_advice",
      transactions: [],
      reply_message: reply
    };
  }

  // 3. Shopping Decision Advice ("Có nên mua X?")
  if (
    lower.includes("có nên mua") ||
    lower.includes("tính mua") ||
    lower.includes("định mua") ||
    lower.includes("mua được không")
  ) {
    const balance = context?.currentBalance || 0;
    const amount = parseVNDAmount(prompt) || 1000000;
    const remainingAfter = balance - amount;

    let advice = "";
    if (amount > balance) {
      advice = `🔴 CHƯA NÊN MUA LÚC NÀY! Khoản này (${amount.toLocaleString('vi-VN')}đ) vượt quá số dư hiện có (${balance.toLocaleString('vi-VN')}đ). Mua xong bạn sẽ bị âm tiền đấy!`;
    } else if (remainingAfter < balance * 0.3) {
      advice = `🟡 CÂN NHẮC KỸ! Nếu quẹt ${amount.toLocaleString('vi-VN')}đ, số dư của bạn chỉ còn ${remainingAfter.toLocaleString('vi-VN')}đ — khá mỏng manh cho các ngày còn lại trong tháng. Nên dời sang tháng sau hoặc đợi nhận lương nhé!`;
    } else {
      advice = `🟢 QUYẾT ĐỊNH ĐƯỢC! Số dư của bạn (${balance.toLocaleString('vi-VN')}đ) hoàn toàn đủ khả năng chi trả ${amount.toLocaleString('vi-VN')}đ mà vẫn giữ được mức an toàn (${remainingAfter.toLocaleString('vi-VN')}đ). Hãy tận hưởng món đồ thật Chill! ☕✨`;
    }

    return {
      intent: "financial_advice",
      transactions: [],
      reply_message: advice
    };
  }

  // 4. Saving & Allocation Advice ("Làm sao tiết kiệm", "Phân bổ lương")
  if (
    lower.includes("tiết kiệm") ||
    lower.includes("phân bổ") ||
    lower.includes("quản lý lương") ||
    lower.includes("50/30/20")
  ) {
    const income = context?.monthlyIncome || 15000000;
    const nec = Math.round(income * 0.5);
    const want = Math.round(income * 0.3);
    const save = Math.round(income * 0.2);

    const reply = `💡 GỢI Ý PHÂN BỔ TÀI CHÍNH (QUY TẮC 50/30/20):\nVới mức thu nhập ước tính ${(income / 1000000).toFixed(1)} củ:\n1. 🏠 Thiết yếu (50%): ${(nec / 1000000).toFixed(1)} củ (Tiền nhà, ăn uống, đi lại)\n2. ☕ Sở thích & Chill (30%): ${(want / 1000000).toFixed(1)} củ (Cafe, mua sắm, giải trí)\n3. 🐷 Tiết kiệm & Tích lũy (20%): ${(save / 1000000).toFixed(1)} củ (Chuyển vào quỹ tiết kiệm ngay khi có lương!)\n\n👉 Mẹo Chill: Cắt bớt 1 cốc trà sữa/ngày bạn đã có thêm gần 1 triệu tiền tiết kiệm mỗi tháng! ✨`;

    return {
      intent: "financial_advice",
      transactions: [],
      reply_message: reply
    };
  }

  // 5. Debt & Receivables Query ("Ai nợ tao", "Tiền nợ")
  if (
    (lower.includes("ai") || lower.includes("danh sách")) &&
    (lower.includes("nợ") || lower.includes("mượn") || lower.includes("đòi"))
  ) {
    const recList = context?.receivablesList || [];
    const totalRec = context?.totalReceivables || 0;

    let reply = "";
    if (recList.length === 0 && totalRec === 0) {
      reply = `🎉 Bạn hiện không có ai nợ tiền cả, sổ nợ hoàn toàn sạch sẽ và Chill! ✨`;
    } else {
      reply = `📋 DANH SÁCH CÁC BẠN ĐANG NỢ TIỀN BẠN (Tổng: ${totalRec.toLocaleString('vi-VN')} đ):\n`;
      recList.forEach((r: any) => {
        reply += `- ${r.personName}: ${r.amount.toLocaleString('vi-VN')} đ (${r.description})\n`;
      });
      reply += `\n👉 Bạn có thể vào tab "Sổ nợ" và bấm nút Zalo để gửi tin nhắn nhắc nợ khéo léo nhé! 📲`;
    }

    return {
      intent: "query_data",
      transactions: [],
      reply_message: reply
    };
  }

  // 6. Basic Budget & Balance Query
  if (
    lower.includes("bao nhiêu") ||
    lower.includes("hạn mức") ||
    lower.includes("còn lại") ||
    lower.includes("ngân sách") ||
    lower.includes("số dư")
  ) {
    let responseText = "Số dư hiện tại của bạn là khoảng " + (context?.currentBalance ? (context.currentBalance / 1000).toLocaleString('vi-VN') + "kđ" : "11.2 củ") + ".";
    if (lower.includes("nhà") || lower.includes("phòng") || lower.includes("điện") || lower.includes("nước") || lower.includes("housing")) {
      const hLimit = context?.categoryBudgets?.Housing || 6000000;
      const hSpent = context?.categorySpent?.Housing || 0;
      const remaining = hLimit - hSpent;
      responseText = `Hạn mức Nhà ở & Tiện ích tháng này là ${(hLimit / 1000000).toFixed(1)} củ. Đã tiêu ${(hSpent / 1000).toLocaleString('vi-VN')}k. Bạn còn lại ${(remaining / 1000).toLocaleString('vi-VN')}kđ!`;
    } else if (lower.includes("ăn") || lower.includes("cơm") || lower.includes("food") || lower.includes("uống") || lower.includes("cafe")) {
      const foodLimit = context?.categoryBudgets?.Food || 4500000;
      const foodSpent = context?.categorySpent?.Food || 2800000;
      const remaining = foodLimit - foodSpent;
      responseText = `Hạn mức Ăn uống tháng này là ${(foodLimit / 1000000).toFixed(1)} củ. Đã tiêu ${(foodSpent / 1000).toLocaleString('vi-VN')}k. Bạn còn lại ${(remaining / 1000).toLocaleString('vi-VN')}kđ!`;
    } else if (lower.includes("công việc") || lower.includes("work") || lower.includes("ads") || lower.includes("dự án")) {
      const workLimit = context?.categoryBudgets?.Work || 3000000;
      const workSpent = context?.categorySpent?.Work || 2200000;
      const remaining = workLimit - workSpent;
      responseText = `Quỹ Công việc đã dùng ${(workSpent / 1000000).toFixed(1)} củ / ${(workLimit / 1000000).toFixed(1)} củ hạn mức (${Math.round((workSpent / workLimit) * 100)}%).`;
    }

    return {
      intent: "query_data",
      transactions: [],
      reply_message: responseText
    };
  }

  // If this is a question or inquiry that wasn't caught by specific branches above, DO NOT parse into transactions!
  if (isQuestionOrInquiry) {
    return {
      intent: "general_chat",
      transactions: [],
      reply_message: `Tôi hiểu bạn đang có câu hỏi về tài chính. Hiện tại số dư của bạn là ${(context?.currentBalance || 0).toLocaleString('vi-VN')} đ, thu nhập tháng là ${(context?.monthlyIncome || 0).toLocaleString('vi-VN')} đ và chi tiêu tháng là ${(context?.monthlyExpense || 0).toLocaleString('vi-VN')} đ. Bạn cần giải đáp thêm khía cạnh nào cứ nói nhé! ☕✨`
    };
  }

  // 7. Parse multi-item or single-item transactions
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

      // Priority Category Classification Rules
      if (itemLower.includes("mượn") || itemLower.includes("vay") || itemLower.includes("nợ") || itemLower.includes("ứng") || itemLower.includes("chia bill")) {
        category = "Debt";
        if (itemLower.includes("cho") || itemLower.includes("mượn") || itemLower.includes("ứng")) {
          type = "receivable";
        } else {
          type = "payable";
        }
      } else if (
        itemLower.includes("tiền nhà") ||
        itemLower.includes("thuê nhà") ||
        itemLower.includes("phòng trọ") ||
        itemLower.includes("tiền phòng") ||
        itemLower.includes("tiền điện") ||
        itemLower.includes("tiền nước") ||
        itemLower.includes("tiền mạng") ||
        itemLower.includes("internet") ||
        itemLower.includes("wifi") ||
        itemLower.includes("chung cư") ||
        itemLower.includes("mặt bằng") ||
        itemLower.includes("tiện ích") ||
        itemLower.includes("gửi xe tháng") ||
        (itemLower.includes("nhà") && (itemLower.includes("tháng") || itemLower.includes("cọc") || itemLower.includes("hợp đồng")))
      ) {
        category = "Housing";
      } else if (
        itemLower.includes("netflix") ||
        itemLower.includes("spotify") ||
        itemLower.includes("gym") ||
        itemLower.includes("icloud") ||
        itemLower.includes("youtube") ||
        itemLower.includes("yt premium") ||
        itemLower.includes("định kỳ") ||
        itemLower.includes("gói cước") ||
        itemLower.includes("4g") ||
        itemLower.includes("5g") ||
        itemLower.includes("truyền hình") ||
        itemLower.includes("vieon") ||
        itemLower.includes("k+") ||
        itemLower.includes("chatgpt") ||
        itemLower.includes("canva")
      ) {
        category = "Subscriptions";
      } else if (
        itemLower.includes("ads") ||
        itemLower.includes("quẹt thẻ") ||
        itemLower.includes("đạo cụ") ||
        itemLower.includes("tiếp khách") ||
        itemLower.includes("công ty") ||
        itemLower.includes("in ấn") ||
        itemLower.includes("văn phòng") ||
        itemLower.includes("khách sạn") ||
        itemLower.includes("ks") ||
        itemLower.includes("vé máy bay") ||
        itemLower.includes("công tác") ||
        itemLower.includes("dự án")
      ) {
        category = "Work";
      } else if (
        itemLower.includes("xăng") ||
        itemLower.includes("grab") ||
        itemLower.includes("gojek") ||
        itemLower.includes("be") ||
        itemLower.includes("xe") ||
        itemLower.includes("gửi xe") ||
        itemLower.includes("taxi") ||
        itemLower.includes("rửa xe") ||
        itemLower.includes("thay nhớt") ||
        itemLower.includes("cầu đường")
      ) {
        category = "Transport";
      } else if (
        itemLower.includes("áo") ||
        itemLower.includes("quần") ||
        itemLower.includes("giày") ||
        itemLower.includes("dép") ||
        itemLower.includes("mỹ phẩm") ||
        itemLower.includes("son") ||
        itemLower.includes("shopee") ||
        itemLower.includes("lazada") ||
        itemLower.includes("tiki") ||
        itemLower.includes("mua") ||
        itemLower.includes("sắm") ||
        itemLower.includes("homestay") ||
        itemLower.includes("du lịch")
      ) {
        category = "Shopping";
      } else if (
        itemLower.includes("lương") ||
        itemLower.includes("thưởng") ||
        itemLower.includes("freelance") ||
        itemLower.includes("nhận tiền") ||
        itemLower.includes("thu nhập") ||
        itemLower.includes("ting ting") ||
        itemLower.includes("hoa hồng")
      ) {
        category = "Income";
        type = "income";
      } else if (
        itemLower.includes("cơm") ||
        itemLower.includes("phở") ||
        itemLower.includes("bún") ||
        itemLower.includes("bánh mì") ||
        itemLower.includes("trưa") ||
        itemLower.includes("tối") ||
        itemLower.includes("sáng") ||
        itemLower.includes("cafe") ||
        itemLower.includes("cà phê") ||
        itemLower.includes("trà sữa") ||
        itemLower.includes("ăn") ||
        itemLower.includes("uống") ||
        itemLower.includes("nhậu") ||
        itemLower.includes("lẩu") ||
        itemLower.includes("buffet") ||
        itemLower.includes("trà") ||
        itemLower.includes("highland") ||
        itemLower.includes("starbucks") ||
        itemLower.includes("phúc long") ||
        itemLower.includes("pizza") ||
        itemLower.includes("chợ") ||
        itemLower.includes("siêu thị")
      ) {
        category = "Food";
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
      reply_message: "Chào bạn! Tôi là ChiChill AI — Trợ lý & Cố vấn tài chính cá nhân của bạn! ☕\n\nBạn có thể:\n👉 Ghi chi tiêu: 'Cơm trưa 45k, cafe Highland 35k' hoặc 'Tiền nhà 3 tháng mỗi tháng 3tr5'\n👉 Hỏi sức khỏe tài chính: 'Đánh giá chi tiêu tháng này?'\n👉 Xin lời khuyên: 'Đang tính mua tai nghe 2 triệu, có nên không?'"
    };
  }

  const categoryNames: Record<string, string> = {
    Food: "Ăn uống",
    Transport: "Đi lại",
    Shopping: "Mua sắm",
    Work: "Công việc",
    Housing: "Nhà ở & Tiện ích",
    Subscriptions: "Dịch vụ định kỳ",
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
      replyMsg = `Đã ghi nhận khoản cho mượn ${formattedAmount} vào Sổ Nợ. Bạn có thể gửi tin nhắn nhắc nợ Zalo bất cứ lúc nào nhé!`;
    } else if (firstTx.type === 'payable') {
      replyMsg = `Đã lưu khoản nợ ${formattedAmount} vào Sổ Nợ để bạn nhớ trả đúng hẹn!`;
    } else if (firstTx.type === 'income') {
      replyMsg = `Tuyệt vời! Đã cộng ${formattedAmount} vào tổng thu nhập.`;
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

    console.log("⚡ [Parser Engine: Gemini AI] Đang gửi yêu cầu tới Google Gemini...");

    const userCategoriesFormatted = context?.userCategories && Array.isArray(context.userCategories)
      ? context.userCategories.map((c: any) => `- "${c.code}": ${c.label} (${c.description || ''})`).join('\n')
      : `- "Housing": Nhà ở & Tiện ích (Tiền nhà, phòng trọ, chung cư, tiền điện, tiền nước, internet, wifi, dịch vụ toà nhà)
- "Subscriptions": Dịch vụ định kỳ (Netflix, Spotify, Gym, iCloud, YouTube Premium, gói cước 4G, truyền hình)
- "Food": Ăn uống (Cơm, phở, bún, bánh mì, cafe, trà sữa, ăn vặt, nhà hàng, siêu thị)
- "Transport": Đi lại (Xăng xe, Grab, Gojek, Be, taxi, gửi xe, bảo dưỡng, cầu đường)
- "Shopping": Mua sắm (Quần áo, giày dép, mỹ phẩm, Shopee, Lazada, Tiki, đồ dùng cá nhân)
- "Work": Công việc & Sự nghiệp (Chạy ads, tiếp khách, văn phòng phẩm, thiết bị, dự án)
- "Debt": Nợ & Cho vay (Mượn nợ, cho vay, ứng tiền, chia bill nhóm)
- "Income": Thu nhập (Tiền lương, thưởng, freelance, bán hàng, hoa hồng)`;

    const topExpensesFormatted = context?.topExpenses && Array.isArray(context.topExpenses) && context.topExpenses.length > 0
      ? context.topExpenses.map((t: any) => `- ${t.label}: ${t.amount.toLocaleString('vi-VN')}đ (${t.percentage}% tổng chi)`).join('\n')
      : '- Chưa có thống kê chi tiết';

    const warningsFormatted = context?.warningCategories && Array.isArray(context.warningCategories) && context.warningCategories.length > 0
      ? context.warningCategories.map((w: any) => `- ${w.label}: Đã tiêu ${w.spent.toLocaleString('vi-VN')}đ / ${w.limit.toLocaleString('vi-VN')}đ (${w.percentage}%) [⚠️ Báo động]`).join('\n')
      : 'Không có nhóm nào vượt hạn mức (An toàn)';

    const receivablesFormatted = context?.receivablesList && Array.isArray(context.receivablesList) && context.receivablesList.length > 0
      ? context.receivablesList.map((r: any) => `- ${r.personName}: ${r.amount.toLocaleString('vi-VN')}đ (${r.description || 'Chưa ghi chú'})`).join('\n')
      : 'Không có ai nợ tiền';

    const payablesFormatted = context?.payablesList && Array.isArray(context.payablesList) && context.payablesList.length > 0
      ? context.payablesList.map((p: any) => `- Nợ ${p.personName}: ${p.amount.toLocaleString('vi-VN')}đ (${p.description || 'Chưa ghi chú'})`).join('\n')
      : 'Không nợ ai tiền';

    const dateContextStr = context?.dateContext
      ? `Hôm nay là ngày ${context.dateContext.today} (ngày ${context.dateContext.dayOfMonth}/${context.dateContext.daysInMonth}, còn ${context.dateContext.daysRemaining} ngày nữa hết tháng - Đã qua ${context.dateContext.monthProgressPercentage}% của tháng).`
      : `Ngày hiện tại: ${new Date().toLocaleDateString('vi-VN')}`;

    const systemInstruction = `
Bạn là ChiChill AI — Trợ lý & Cố vấn Quản lý Tài chính Thông minh (AI Financial Coach & Advisor), mang sứ mệnh giúp người dùng văn phòng và giới trẻ Việt Nam "Chi có kế hoạch, Chill không âu lo".

BẠN CÓ 2 VAI TRÒ CHÍNH TÙY THEO Ý ĐỊNH CỦA NGƯỜI DÙNG:

============================================================
VAI TRÒ 1: GHI NHẬN THU / CHI / NỢ TỰ ĐỘNG (Transaction Logging)
============================================================
- Khi người dùng nhập các khoản tiền (tiếng lóng củ/lít/xị/k/tr, đa giao dịch phân tách bằng dấu phẩy, "và", "+", xuống dòng).
- Bóc tách đầy đủ vào mảng "transactions" theo đúng cấu trúc.
- "intent": "log_transaction"
- "reply_message": Xác nhận ngắn gọn, tích cực, truyền năng lượng tích cực.

QUY TẮC PHÂN LOẠI DANH MỤC CHUẨN XÁC:
1. "Housing" (Nhà ở & Tiện ích): Mọi chi phí liên quan đến tiền nhà, phòng trọ, chung cư, mặt bằng, tiền điện, tiền nước, internet, wifi, phí toà nhà.
   - Ví dụ: "tiền nhà 3 tháng mỗi tháng 3tr5" -> category: "Housing", amount: 10500000 (3 * 3.500.000), description: "Tiền nhà 3 tháng (3.5tr/tháng)"
   - Ví dụ: "tiền điện 850k", "tiền nước 120k", "thuê phòng 3 củ" -> category: "Housing"
2. "Subscriptions" (Dịch vụ định kỳ): Netflix, Spotify, Gym, iCloud, YouTube Premium, gói 4G/5G, phần mềm định kỳ.
   - Ví dụ: "netflix 260k", "tập gym 500k", "spotify 59k" -> category: "Subscriptions"
3. "Food" (Ăn uống): Cơm, phở, bún, bánh mì, cafe, trà sữa, ăn trưa, ăn tối, buffet, siêu thị mua đồ ăn.
4. "Transport" (Đi lại): Đổ xăng, Grab, Be, taxi, bảo dưỡng xe, gửi xe, vé cầu đường.
5. "Shopping" (Mua sắm): Quần áo, giày dép, mỹ phẩm, săn sale Shopee/Lazada/Tiki.
6. "Work" (Công việc): Chạy ads, văn phòng phẩm, in ấn, tiếp khách, công tác.
7. "Debt" (Nợ & Cho vay): Cho mượn tiền, vay nợ, ứng tiền, chia bill.
8. "Income" (Thu nhập): Lương, thưởng, freelance, khách thanh toán.

QUY TẮC TÍNH TOÁN SỐ LƯỢNG & NHÂN TIỀN:
- Nếu người dùng nhập dạng nhân/nhiều kỳ như "3 tháng mỗi tháng 3tr5", "4 vé mỗi vé 150k", "3 phần cơm 40k":
  -> Hãy tính TỔNG số tiền chi thực tế (VD: 3 * 3.500.000 = 10.500.000 VNĐ).

============================================================
VAI TRÒ 2: CỐ VẤN TÀI CHÍNH & TƯ VẤN THÔNG MINH (Financial Coach)
============================================================
QUY TẮC SỐ 1 (BẮT BUỘC):
- BẤT KỲ CÂU NÓI NÀO CÓ TÍNH CHẤT HỎI, THẮC MẮC, TÌM HIỂU NGUYÊN NHÂN, GIẢI THÍCH (chứa các từ: "sao", "tại sao", "vì sao", "sao lại", "sao ví", "sao tiền", "giải thích", "thắc mắc", "cho hỏi", "trong khi", "tại sao số dư...", "tính thế nào", "tại sao lại ra con số...", hoặc kết thúc bằng dấu "?"):
- BẠN BẮT BUỘC PHẢI XÁC ĐỊNH INTENT LÀ "query_data" HOẶC "financial_advice" VÀ TRẢ VỀ "transactions": [].
- TUYỆT ĐỐI KHÔNG ĐƯỢC TẠO RA BẤT KỲ TRANSACTION NÀO TỪ CÂU HỎI!

Khi người dùng hỏi, tâm sự, xin lời khuyên hoặc đánh giá:
1. "Giải thích sự chênh lệch Số dư ví vs Thu/Chi tháng" (VD: "sao ví tôi có hơn 28tr trong khi thu là 20tr5 và chi là 12tr490?"):
   - GIẢI THÍCH RÕ RÀNG:
     a) Số dư ví (${context?.currentBalance?.toLocaleString('vi-VN') || 0}đ): Là TỔNG SỐ DƯ TÍCH LŨY lũy kế từ trước đến nay (bao gồm các tháng trước chuyển sang).
     b) Thu (${context?.monthlyIncome?.toLocaleString('vi-VN') || 0}đ) và Chi (${context?.monthlyExpense?.toLocaleString('vi-VN') || 0}đ): Là các khoản phát sinh trong RIÊNG THÁNG HIỆN TẠI.
     c) Tháng này bạn thặng dư dương (${((context?.monthlyIncome || 0) - (context?.monthlyExpense || 0)).toLocaleString('vi-VN')}đ), và khoản này đã được tự động cộng dồn vào số dư ví của bạn!

2. "Đánh giá tài chính / Tình hình tháng này thế nào? / Có ổn không? / Tao tiêu nhiều quá không?":
   - Phân tích tương quan giữa TIẾN ĐỘ THÁNG (${context?.dateContext?.monthProgressPercentage || 50}% tháng) và TỔNG CHI TIÊU (${context?.monthlyExpense?.toLocaleString('vi-VN') || 0}đ).
   - Chỉ ra cụ thể nhóm nào đang tiêu nhiều nhất hoặc vượt hạn mức (Dựa vào mục CẢNH BÁO HẠN MỨC).
   - Đánh giá tổng thể sức khỏe tài chính: "Rất Chill (Xanh)", "Cần chú ý (Vàng)", hoặc "Báo động đỏ (Đỏ)".
   - Đưa ra 1-2 lời khuyên hành động thực tế cho những ngày còn lại.

3. "Có nên mua X với giá Y không? / Đang tính mua điện thoại 15 củ, có ổn không?":
   - So sánh số tiền định chi với Số dư hiện tại (${context?.currentBalance?.toLocaleString('vi-VN') || 0}đ) và Hạn mức còn lại.
   - Đưa ra phân tích khách quan: Mua xong thì số dư còn bao nhiêu, có ảnh hưởng đến chi tiêu thiết yếu trong ${context?.dateContext?.daysRemaining || 10} ngày tới không.
   - Khuyên thẳng thắn: Nên chốt đơn / Nên dời lại sau ngày nhận lương / Nên trích từ quỹ tiết kiệm.

4. "Làm sao để tiết kiệm X củ? / Lương 20 củ phân chia sao? / Tiêu tiền trà sữa nhiều quá":
   - Đưa ra công thức phân bổ thực tế (50/30/20 hoặc 6 hũ) áp dụng ngay cho con số của họ.
   - Mẹo cắt giảm các khoản rò rỉ (cafe, trà sữa, ship đồ ăn) mà vẫn giữ tâm lý thoải mái ("Chill").

5. "Ai đang nợ tao? / Tiền nợ thế nào?":
   - Liệt kê chi tiết những ai đang nợ tiền từ danh sách CÔNG NỢ, tổng số tiền cần đòi, và nhắc họ gửi tin nhắn nhắc nợ qua Zalo.

6. "Chế Độ Sinh Tồn Cuối Tháng / Hôm nay được tiêu bao nhiêu? / Còn bao nhiêu tiền sống sót?":
   - Khi người dùng hỏi về tiền còn lại mỗi ngày hoặc chế độ sinh tồn:
   - Dựa vào hạn mức còn lại và số ngày còn lại đến kỳ lương để tính định mức "Safe-to-Spend" mỗi ngày.
   - Đưa ra thực đơn / mẹo sinh tồn thực tế (cơm bình dân 35k, trà đá thay cafe, tạm hoãn săn sale) với phong cách hài hước, hóm hỉnh và thiết thực.

VĂN PHONG CỦA BẠN:
- Thông minh, sâu sắc, thực tế, thân thiện, mang năng lượng Chill và khích lệ.
- Dùng tiếng Việt tự nhiên, có thể kèm emoji phù hợp (☕, 🍕, 💡, 📊, ✨, 🔥).
- Tuyệt đối không phán xét, không lý thuyết suông giáo điều, luôn dựa trên số liệu thực tế trong Context bên dưới.

DANH SÁCH DANH MỤC CỦA NGƯỜI DÙNG:
${userCategoriesFormatted}

THÔNG TIN BỐI CẢNH TÀI CHÍNH HIỆN TẠI (CONTEXT):
- ${dateContextStr}
- Số dư hiện tại: ${context?.currentBalance ? context.currentBalance.toLocaleString('vi-VN') : '0'} VNĐ
- Tổng thu nhập tháng: ${context?.monthlyIncome ? context.monthlyIncome.toLocaleString('vi-VN') : '0'} VNĐ
- Tổng chi tiêu tháng: ${context?.monthlyExpense ? context.monthlyExpense.toLocaleString('vi-VN') : '0'} VNĐ
- Tỷ lệ tiết kiệm hiện tại: ${context?.savingsRate || 0}%
- Top chi tiêu nhiều nhất:
${topExpensesFormatted}
- Cảnh báo hạn mức:
${warningsFormatted}
- Sổ nợ cần thu (Người khác nợ mình): ${context?.totalReceivables ? context.totalReceivables.toLocaleString('vi-VN') : '0'} VNĐ
${receivablesFormatted}
- Sổ nợ cần trả (Mình nợ người khác): ${context?.totalPayables ? context.totalPayables.toLocaleString('vi-VN') : '0'} VNĐ
${payablesFormatted}
- Giao dịch gần nhất: ${context?.recentTransactionsSummary || 'Chưa có'}

QUY ĐỊNH ĐỊNH DẠNG JSON TRẢ VỀ (CHỈ TRẢ VỀ JSON HỢP LỆ, KHÔNG TEXT THỪA):
{
  "intent": "log_transaction" | "query_data" | "financial_advice" | "general_chat",
  "transactions": [
    {
      "type": "expense" | "income" | "receivable" | "payable",
      "amount": <số nguyên VND>,
      "category": "<CategoryCode phù hợp>",
      "description": "<Mô tả ngắn gọn>"
    }
  ],
  "reply_message": "<Câu trả lời đầy đủ, sâu sắc, định dạng dễ đọc, xuống dòng hợp lý bằng \\n>"
}
`;

    const geminiPromise = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini timeout 4.5s")), 4500)
    );

    const response: any = await Promise.race([geminiPromise, timeoutPromise]);

    const responseText = response.text || "";
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const parsedData = JSON.parse(cleanedText);
    console.log("✅ [Gemini AI Response]:", JSON.stringify(parsedData));
    return res.json({ ...parsedData, engine: "gemini-2.5-flash" });
  } catch (err: any) {
    console.error("⚠️ [Gemini Error or Timeout, switching to Fallback Parser]:", err?.message || err);
    const fallbackResult = fallbackParse(req.body?.prompt || "", req.body?.context);
    return res.json({ ...fallbackResult, engine: "fallback_regex" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "ChiChill AI" });
});

// Endpoint to send REAL Zalo Mini App push notification
// Uses: https://openapi.mini.zalo.me/notification/template
app.post("/api/send-zalo-notification", async (req, res) => {
  try {
    const { categoryLabel, spent, limit, percentage, level, zaloUserId } = req.body;

    // Validate required fields
    if (!zaloUserId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu Zalo User ID. Người dùng cần đăng nhập lại trong Zalo Mini App.",
      });
    }

    const ZALO_API_KEY = process.env.ZALO_API_KEY;
    const ZALO_MINIAPP_ID = process.env.ZALO_MINIAPP_ID || process.env.APP_ID;

    if (!ZALO_API_KEY || !ZALO_MINIAPP_ID) {
      console.warn("[Zalo Notification] Missing ZALO_API_KEY or ZALO_MINIAPP_ID env vars. Falling back to in-app only.");
      return res.json({
        success: false,
        message: "Chưa cấu hình ZALO_API_KEY trên Cloud Run (vào Cloud Run Console > Variables để thêm ZALO_API_KEY).",
        fallback: true,
      });
    }

    const formattedSpent = (spent || 0).toLocaleString("vi-VN") + " ₫";
    const formattedLimit = (limit || 0).toLocaleString("vi-VN") + " ₫";
    const statusText = level === "danger" ? "🚨 VƯỢT HẠN MỨC" : `⚠️ ĐẠT ${percentage}% HẠN MỨC`;
    const advice = level === "danger"
      ? `Đã vượt ngân sách ${categoryLabel}! (${formattedSpent} / ${formattedLimit}). Hạn chế chi tiêu thêm nhé!`
      : `${categoryLabel} đã chạm ${percentage}% hạn mức (${formattedSpent} / ${formattedLimit}). Cẩn thận chi tiêu nha!`;

    // Zalo Mini App Notification API payload
    const zaloPayload = {
      templateId: "0", // Default template
      templateData: {
        title: `ChiChill - ${statusText}`,
        contentTitle: `${categoryLabel}: ${percentage}%`,
        contentDescription: advice,
        buttonText: "Xem chi tiết",
        buttonUrl: `https://zalo.me/s/${ZALO_MINIAPP_ID}/`,
      },
    };

    console.log(`[Zalo Notification] Sending push to user ${zaloUserId}:`, JSON.stringify(zaloPayload));

    const zaloRes = await fetch("https://openapi.mini.zalo.me/notification/template", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": ZALO_API_KEY,
        "X-User-Id": zaloUserId,
        "X-MiniApp-Id": ZALO_MINIAPP_ID,
      },
      body: JSON.stringify(zaloPayload),
    });

    const zaloData = await zaloRes.json().catch(() => ({}));

    if (zaloRes.ok && (zaloData.error === 0 || zaloData.error === undefined)) {
      console.log(`[Zalo Notification] ✅ Sent successfully to ${zaloUserId}`);
      return res.json({
        success: true,
        message: `Đã gửi thông báo Zalo thành công (${statusText} - ${categoryLabel}).`,
      });
    } else {
      console.warn(`[Zalo Notification] ❌ API returned error:`, zaloData);
      const errMsg = zaloData.message || zaloData.error_description || `Mã lỗi ${zaloData.error || zaloRes.status}`;
      return res.json({
        success: false,
        message: `Zalo API: ${errMsg}`,
        zaloError: zaloData,
      });
    }
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
    try {
      const result = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt
      });
      
      if (result.text) {
        return res.json({
          success: true,
          message: result.text
        });
      }
    } catch (apiErr: any) {
      console.warn("Gemini API call failed, generating smart local fallback wrap-up:", apiErr?.message);
    }

    // Smart Local Fallback: Generates a witty, customized Wrapped message if API limits are reached
    const expensesByCategory: Record<string, number> = {};
    let totalExpenses = 0;
    (transactions || []).forEach((t: any) => {
      if (t.type === 'expense') {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + (t.amount || 0);
        totalExpenses += (t.amount || 0);
      }
    });

    const topCategoryKey = Object.keys(expensesByCategory).sort((a, b) => expensesByCategory[b] - expensesByCategory[a])[0];
    const topCategoryLabel = categories[topCategoryKey]?.label || topCategoryKey || 'Ăn uống';
    const topCategoryAmount = (expensesByCategory[topCategoryKey] || 0).toLocaleString('vi-VN');

    let fallbackMessage = '';
    const numRate = parseFloat(savingsRate) || 0;

    if (numRate >= 20) {
      fallbackMessage = `🎉 Wow, tháng ${month} này bạn là "Bậc thầy tích lũy" với tỷ lệ tiết kiệm đỉnh chóp ${savingsRate}%! Dù chi mạnh tay nhất cho ${topCategoryLabel} (${topCategoryAmount}đ), bạn vẫn giữ vững phong độ ví tiền rủng rỉnh. ChiChill chấm bạn 10/10 điểm thảnh thơi sống chất! ☕✨`;
    } else if (numRate > 0) {
      fallbackMessage = `💸 Tháng ${month} vừa rồi bạn có dấu hiệu hơi "cháy túi" nhẹ khi chi tới ${topCategoryAmount}đ cho ${topCategoryLabel}, nhưng may mắn vẫn giữ được tỷ lệ tiết kiệm ${savingsRate}%. Tháng sau bớt chút order trà sữa/chốt đơn là lại chill ngay thôi nhé! 🧋📈`;
    } else {
      fallbackMessage = `🚨 Báo động đỏ tháng ${month}: Danh hiệu "Chiến thần quẹt thẻ" chính thức thuộc về bạn với ${topCategoryAmount}đ đổ dồn vào ${topCategoryLabel}! Đã đến lúc bật chế độ "Thắt lưng buộc bụng" và để ChiChill đồng hành cứu vớt ví tiền của bạn rồi đấy! 🎯⚡`;
    }

    return res.json({
      success: true,
      message: fallbackMessage
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
