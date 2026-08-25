// On-device intelligent Vietnamese Financial Parser
// Handles slang (củ, lít, xị, k, tr), split bills, debts, custom categories, budgets & context

export interface ParseResult {
  intent: 'log_transaction' | 'query_data' | 'general_chat';
  transactions: Array<{
    type: 'expense' | 'income' | 'receivable' | 'payable';
    amount: number;
    category: string;
    description: string;
  }>;
  reply_message: string;
}

export function parseVNDAmount(text: string): number {
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

export function clientFallbackParse(prompt: string, context?: any): ParseResult {
  const lower = prompt.toLowerCase().trim();

  // 1. Check for budget / financial query intent
  if (
    lower.includes("bao nhiêu") ||
    lower.includes("hạn mức") ||
    lower.includes("còn lại") ||
    lower.includes("tình hình") ||
    lower.includes("ngân sách") ||
    lower.includes("số dư")
  ) {
    let responseText = `Số dư hiện tại của bạn là ${(context?.currentBalance ? (context.currentBalance / 1000).toLocaleString('vi-VN') + "kđ" : "13.000.000đ")}. Ngân sách Ăn uống tháng này còn lại khá thoải mái!`;

    if (lower.includes("ăn") || lower.includes("cơm") || lower.includes("food") || lower.includes("uống") || lower.includes("cafe")) {
      const foodLimit = context?.categoryBudgets?.Food || 4500000;
      const foodSpent = context?.categorySpent?.Food || 2800000;
      const remaining = foodLimit - foodSpent;
      responseText = `Hạn mức Ăn uống tháng này của bạn là ${(foodLimit / 1000000).toFixed(1)} củ. Đã tiêu ${(foodSpent / 1000).toLocaleString('vi-VN')}k. Bạn còn lại ${(remaining / 1000).toLocaleString('vi-VN')}kđ!`;
    } else if (lower.includes("công việc") || lower.includes("work") || lower.includes("ads") || lower.includes("dự án")) {
      const workLimit = context?.categoryBudgets?.Work || 3000000;
      const workSpent = context?.categorySpent?.Work || 2200000;
      const remaining = workLimit - workSpent;
      responseText = `Quỹ Công việc đã dùng ${(workSpent / 1000000).toFixed(1)} củ / ${(workLimit / 1000000).toFixed(1)} củ hạn mức (${Math.round((workSpent / workLimit) * 100)}%). Hãy cân đối chi phí dự án sắp tới nhé!`;
    }

    return {
      intent: "query_data",
      transactions: [],
      reply_message: responseText
    };
  }

  // 2. Parse multi-item or single-item transactions
  // Example: "Cơm trưa 45k, cafe 35k" -> splits by comma / 'và' / '+'
  const items = prompt.split(/[,;\n+]|\s+và\s+/i).map(s => s.trim()).filter(Boolean);
  const transactions: ParseResult['transactions'] = [];

  for (const item of items) {
    const itemLower = item.toLowerCase();
    const amount = parseVNDAmount(item);

    if (amount > 0) {
      let category = "Food";
      let type: 'expense' | 'income' | 'receivable' | 'payable' = "expense";

      // Match custom user categories
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

  // If no amount detected, reply as friendly chatbot
  if (transactions.length === 0) {
    return {
      intent: "general_chat",
      transactions: [],
      reply_message: "Chào bạn! Tôi là ChiChill AI — Trợ lý tài chính cá nhân thật Chill! ☕ Bạn có thể gõ ví dụ: 'Cơm trưa 45k, cafe Highland 35k' hoặc 'Nam mượn 200k tiền cơm'."
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
  
  let replyMsg = `Đã ghi nhận ${transactions.length} khoản (${formattedTotal}): ${transactions.map(t => `${t.description} (${(t.amount/1000).toLocaleString('vi-VN')}kđ)`).join(', ')}. Chúc bạn một ngày làm việc thật Chill! ☕`;
  
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
