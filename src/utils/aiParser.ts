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
      reply_message: reply,
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
      intent: "general_chat",
      transactions: [],
      reply_message: reply,
    };
  }

  // 2. Shopping Decision Advice ("Có nên mua X?")
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
      intent: "general_chat",
      transactions: [],
      reply_message: advice,
    };
  }

  // 3. Saving & Allocation Advice ("Làm sao tiết kiệm", "Phân bổ lương")
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
      intent: "general_chat",
      transactions: [],
      reply_message: reply,
    };
  }

  // 4. Debt & Receivables Query ("Ai nợ tao", "Tiền nợ")
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
      reply_message: reply,
    };
  }

  // 5. Check for budget / financial query intent
  if (
    lower.includes("bao nhiêu") ||
    lower.includes("hạn mức") ||
    lower.includes("còn lại") ||
    lower.includes("ngân sách") ||
    lower.includes("số dư")
  ) {
    let responseText = `Số dư hiện tại của bạn là ${(context?.currentBalance ? (context.currentBalance / 1000).toLocaleString('vi-VN') + "kđ" : "13.000.000đ")}.`;

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
      reply_message: responseText,
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
