import { BillItem } from '../types';

export interface ParsedItemizedBillResult {
  paidBy?: string;
  billTitle?: string;
  items: BillItem[];
  shippingFee: number;
  discountAmount: number;
}

const parseVND = (raw: string): number => {
  if (!raw) return 0;
  const cleaned = raw.trim().toLowerCase().replace(/,/g, '.');
  if (/[\d.]+\s*k$/.test(cleaned)) {
    return Math.round(parseFloat(cleaned.replace(/k$/, '')) * 1000);
  }
  if (/[\d.]+\s*(tr|triệu)$/.test(cleaned)) {
    return Math.round(parseFloat(cleaned.replace(/(tr|triệu)$/, '')) * 1000000);
  }
  if (/[\d.]+\s*củ$/.test(cleaned)) {
    return Math.round(parseFloat(cleaned.replace(/củ$/, '')) * 1000000);
  }
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  return num < 1000 ? Math.round(num * 1000) : Math.round(num);
};

const normalize = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();

export function parseItemizedBillText(
  text: string,
  groupMembers: string[] = []
): ParsedItemizedBillResult {
  const result: ParsedItemizedBillResult = {
    items: [],
    shippingFee: 0,
    discountAmount: 0,
  };

  if (!text || !text.trim()) return result;

  let workingText = text.trim();

  // 1. Detect Payer if formatted like "Nam trả bill 250k gồm: ..." or "Nam ứng: ..."
  const payerMatch = workingText.match(
    /^([A-Za-zÀ-ỹ\s]+?)\s+(?:trả|ứng|thanh toán|mua)(?:\s+(?:bill|tiền|hết|hóa đơn)?[^:,]+)?(?::|gồm)\s*(.*)/i
  );
  if (payerMatch) {
    const rawPayer = payerMatch[1].trim();
    const matchedMember = groupMembers.find(
      (m) => normalize(m) === normalize(rawPayer) || rawPayer.toLowerCase().includes(m.toLowerCase())
    );
    if (matchedMember) {
      result.paidBy = matchedMember;
    }
    workingText = payerMatch[2];
  }

  // 2. Extract Shipping Fee
  const shipMatch = workingText.match(
    /(?:phí\s+ship|tiền\s+ship|ship|giao\s+hàng)\s*(?::|\+|=)?\s*(\d+[\d.,]*\s*(?:k|tr|triệu|đ|vnd)?)/i
  );
  if (shipMatch) {
    result.shippingFee = parseVND(shipMatch[1]);
    workingText = workingText.replace(shipMatch[0], ' ');
  }

  // 3. Extract Discount Voucher
  const discountMatch = workingText.match(
    /(?:voucher|mã\s+giảm|giảm\s+giá|giảm|discount|khuyến\s+mãi)\s*(?::|-|=)?\s*(\d+[\d.,]*\s*(?:k|tr|triệu|đ|vnd)?)/i
  );
  if (discountMatch) {
    result.discountAmount = parseVND(discountMatch[1]);
    workingText = workingText.replace(discountMatch[0], ' ');
  }

  // 4. Split remaining text into clauses by commas, semicolons, newlines, or "và"
  const clauses = workingText
    .split(/[,;\n\+]|\s+và\s+/i)
    .map((c) => c.trim())
    .filter((c) => c.length > 2);

  clauses.forEach((clause, idx) => {
    // Check if clause has an amount
    const priceMatch = clause.match(/(\d+[\d.,]*\s*(?:k|tr|triệu|đ|vnd|000))/i);
    if (!priceMatch) return;

    const rawPrice = priceMatch[1];
    const totalPrice = parseVND(rawPrice);
    if (totalPrice <= 0) return;

    // Check for quantity (e.g., "2 cf", "x2", "2 ly")
    let quantity = 1;
    const qtyMatch = clause.match(/(?:^|\s)(?:x\s*(\d+)|\b(\d+)\s*(?:ly|phần|cái|suất|món|hộp|chai|lon|bát|tô|đĩa|cuốn|bịch|gói|bánh)\b|\b(\d+)\s+([a-zA-ZÀ-ỹ]))/i);
    if (qtyMatch) {
      const qNum = parseInt(qtyMatch[1] || qtyMatch[2] || qtyMatch[3] || '1', 10);
      if (!isNaN(qNum) && qNum > 0 && qNum <= 50) {
        quantity = qNum;
      }
    }

    // Check assigned member(s)
    let assignedMembers: string[] = [];

    // Is it shared by everyone?
    if (
      /(?:chia\s*đều|ăn\s*chung|cả\s*nhóm|chung|tất\s*cả|mọi\s*người|chia\s*\d+)/i.test(clause)
    ) {
      assignedMembers = [...groupMembers];
    } else {
      // Find matching group members in this clause
      groupMembers.forEach((m) => {
        const normM = normalize(m);
        const normClause = normalize(clause);
        const regex = new RegExp(`\\b${normM}\\b`, 'i');
        if (regex.test(normClause)) {
          if (!assignedMembers.includes(m)) {
            assignedMembers.push(m);
          }
        }
      });
    }

    if (assignedMembers.length === 0) {
      assignedMembers = groupMembers.length > 0 ? [...groupMembers] : ['Tất cả'];
    }

    // Extract cleaned item name
    let itemName = clause
      .replace(priceMatch[0], '')
      .replace(/(?:phần\s+của|của|cho|chia\s*đều|ăn\s*chung|cả\s*nhóm|chia\s*\d+)/gi, '')
      .replace(/(?:^|\s)(?:x\s*\d+|\d+\s*(?:ly|phần|cái|suất|món|hộp|chai|lon|bát|tô|đĩa|cuốn|bịch|gói|bánh))(?:\s|$)/gi, ' ')
      .trim();

    // Remove member names from item name
    groupMembers.forEach((m) => {
      const reg = new RegExp(`\\b${m}\\b`, 'gi');
      itemName = itemName.replace(reg, '');
    });

    itemName = itemName.replace(/[:\-_\/]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!itemName || itemName.length < 2) {
      itemName = `Món ${idx + 1}`;
    }

    // Unit price
    const unitPrice = quantity > 1 && totalPrice > 1000 ? Math.round(totalPrice / quantity) : totalPrice;

    result.items.push({
      id: `item-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      name: itemName.charAt(0).toUpperCase() + itemName.slice(1),
      quantity,
      price: unitPrice,
      assignedMembers,
    });
  });

  return result;
}
