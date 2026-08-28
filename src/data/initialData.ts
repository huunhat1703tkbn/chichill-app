import { CategoryCode, CategoryInfo, Transaction, CategoryBudget, OfficeDebt } from '../types';

export const CATEGORIES: Record<CategoryCode, CategoryInfo> = {
  Food: {
    code: 'Food',
    label: 'Ăn uống',
    iconName: 'Utensils',
    color: '#F59E0B', // Amber
    bgColor: '#FEF3C7',
    description: 'Cơm trưa, cafe, trà sữa, ăn nhậu, ăn vặt'
  },
  Transport: {
    code: 'Transport',
    label: 'Đi lại',
    iconName: 'Car',
    color: '#3B82F6', // Blue
    bgColor: '#DBEAFE',
    description: 'Xăng, Grab, Gojek, vé xe, gửi xe'
  },
  Shopping: {
    code: 'Shopping',
    label: 'Mua sắm',
    iconName: 'ShoppingBag',
    color: '#EC4899', // Pink
    bgColor: '#FCE7F3',
    description: 'Quần áo, mỹ phẩm, đồ dùng cá nhân, Lazada/Shopee'
  },
  Work: {
    code: 'Work',
    label: 'Công việc',
    iconName: 'Briefcase',
    color: '#8B5CF6', // Purple
    bgColor: '#EDE9FE',
    description: 'Chạy Ads, đạo cụ dự án, tiếp khách, in ấn, dụng cụ làm việc'
  },
  Debt: {
    code: 'Debt',
    label: 'Nợ & Cho vay',
    iconName: 'HandCoins',
    color: '#EF4444', // Red
    bgColor: '#FEE2E2',
    description: 'Cho vay, mượn tiền, ứng trước, trả nợ, chia bill'
  },
  Income: {
    code: 'Income',
    label: 'Thu nhập',
    iconName: 'Wallet',
    color: '#10B981', // Emerald
    bgColor: '#D1FAE5',
    description: 'Lương, thưởng, freelance, thu hồi nợ'
  },
  Budget_Query: {
    code: 'Budget_Query',
    label: 'Hạn mức / Hỏi đáp',
    iconName: 'HelpCircle',
    color: '#06B6D4', // Cyan
    bgColor: '#CFFAFE',
    description: 'Tra cứu ngân sách, tư vấn chi tiêu'
  },
  Housing: {
    code: 'Housing',
    label: 'Nhà ở & Tiện ích',
    iconName: 'Home',
    color: '#8B5CF6', // Purple
    bgColor: '#EDE9FE',
    description: 'Tiền nhà, điện, nước, internet'
  },
  Subscriptions: {
    code: 'Subscriptions',
    label: 'Dịch vụ định kỳ',
    iconName: 'Tv',
    color: '#F43F5E', // Rose
    bgColor: '#FFE4E6',
    description: 'Netflix, Spotify, Gym, iCloud'
  }
};

export const INITIAL_BUDGETS: CategoryBudget[] = [
  { category: 'Housing', limitAmount: 6000000 },   // 6.0 củ
  { category: 'Food', limitAmount: 4500000 },      // 4.5 củ
  { category: 'Transport', limitAmount: 1500000 }, // 1.5 củ
  { category: 'Shopping', limitAmount: 2500000 },  // 2.5 củ
  { category: 'Work', limitAmount: 3000000 },      // 3.0 củ
  { category: 'Subscriptions', limitAmount: 500000 }, // 500k
  { category: 'Debt', limitAmount: 2000000 },      // 2.0 củ
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    type: 'income',
    amount: 18000000,
    category: 'Income',
    description: 'Lương chuyển khoản tháng này',
    date: '2026-08-01',
    time: '08:30',
    createdBy: 'manual'
  },
  {
    id: 'tx-102',
    type: 'income',
    amount: 2500000,
    category: 'Income',
    description: 'Thu nhập Freelance thiết kế banner',
    date: '2026-08-05',
    time: '19:15',
    createdBy: 'manual'
  },
  {
    id: 'tx-103',
    type: 'expense',
    amount: 2800000,
    category: 'Food',
    description: 'Cơm trưa VP & cafe Highland 2 tuần',
    date: '2026-08-15',
    time: '12:30',
    createdBy: 'ai'
  },
  {
    id: 'tx-104',
    type: 'expense',
    amount: 650000,
    category: 'Transport',
    description: 'Đổ xăng & GrabBike đi họp dự án',
    date: '2026-08-18',
    time: '09:00',
    createdBy: 'ai'
  },
  {
    id: 'tx-105',
    type: 'expense',
    amount: 1850000,
    category: 'Shopping',
    description: 'Quần áo Uniqlo đi làm + mỹ phẩm',
    date: '2026-08-19',
    time: '20:00',
    createdBy: 'ai'
  },
  {
    id: 'tx-106',
    type: 'expense',
    amount: 2200000,
    category: 'Work',
    description: 'Quẹt thẻ chạy Ads Facebook cho dự án A',
    date: '2026-08-20',
    time: '15:45',
    createdBy: 'ai'
  },
  {
    id: 'tx-107',
    type: 'receivable',
    amount: 250000,
    category: 'Debt',
    description: 'Nam mượn tiền cơm trưa chia bill',
    date: '2026-08-21',
    time: '12:45',
    createdBy: 'ai',
    personName: 'Nam (Design)'
  },
  {
    id: 'tx-108',
    type: 'receivable',
    amount: 1200000,
    category: 'Debt',
    description: 'Ứng trước tiền mua đạo cụ chụp ảnh cho Sếp',
    date: '2026-08-21',
    time: '16:00',
    createdBy: 'ai',
    personName: 'Sếp Tuấn'
  },
  {
    id: 'tx-109',
    type: 'payable',
    amount: 350000,
    category: 'Debt',
    description: 'Cà bao trà sữa nhóm - nợ Linh Marketing',
    date: '2026-08-21',
    time: '17:30',
    createdBy: 'ai',
    personName: 'Linh (Marketing)'
  },
  // --- MOCK DATA DUMPS CHO THÁNG 7 ---
  {
    id: 'tx-110',
    type: 'income',
    amount: 18000000,
    category: 'Income',
    description: 'Lương tháng 7',
    date: '2026-07-05',
    time: '09:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-111',
    type: 'expense',
    amount: 5500000,
    category: 'Food',
    description: 'Tiền ăn tháng 7',
    date: '2026-07-25',
    time: '12:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-112',
    type: 'expense',
    amount: 2500000,
    category: 'Shopping',
    description: 'Mua đồ Shopee tháng 7',
    date: '2026-07-15',
    time: '19:00',
    createdBy: 'manual'
  },
  // --- MOCK DATA DUMPS CHO THÁNG 6 ---
  {
    id: 'tx-113',
    type: 'income',
    amount: 17500000,
    category: 'Income',
    description: 'Lương tháng 6',
    date: '2026-06-05',
    time: '09:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-114',
    type: 'expense',
    amount: 6000000,
    category: 'Food',
    description: 'Tiền ăn uống, nhậu tháng 6',
    date: '2026-06-20',
    time: '12:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-115',
    type: 'expense',
    amount: 1000000,
    category: 'Transport',
    description: 'Bảo dưỡng xe máy tháng 6',
    date: '2026-06-10',
    time: '10:00',
    createdBy: 'manual'
  }
];

export const INITIAL_DEBTS: OfficeDebt[] = [
  {
    id: 'debt-1',
    personName: 'Nam (Design)',
    type: 'receivable',
    amount: 250000,
    description: 'Tiền cơm trưa chia bill buffet',
    date: '2026-08-21',
    isSettled: false
  },
  {
    id: 'debt-2',
    personName: 'Sếp Tuấn',
    type: 'receivable',
    amount: 1200000,
    description: 'Ứng trước tiền mua đạo cụ studio dự án',
    date: '2026-08-21',
    isSettled: false
  },
  {
    id: 'debt-3',
    personName: 'Linh (Marketing)',
    type: 'payable',
    amount: 350000,
    description: 'Linh ứng giùm tiền trà sữa Gong Cha cả phòng',
    date: '2026-08-21',
    isSettled: false
  },
  {
    id: 'debt-4',
    personName: 'Hoàng (IT)',
    type: 'receivable',
    amount: 500000,
    description: 'Hoàng mượn 5 lít tiền vé xe đợt lễ',
    date: '2026-08-10',
    isSettled: true
  }
];

export const SLANG_SAMPLES = [
  { slang: '45k cơm trưa, 35k cafe', standard: '45,000đ Ăn uống & 35,000đ Ăn uống' },
  { slang: 'Quẹt thẻ 1 củ rưỡi chạy ads', standard: '1,500,000đ Công việc (Chạy Ads)' },
  { slang: 'Nam mượn 200k tiền cơm trưa', standard: '200,000đ Nợ cho vay (Nam)' },
  { slang: 'Cà bao trà sữa phòng 3 lít', standard: '300,000đ Ăn uống' },
  { slang: 'Tháng này còn bao nhiêu tiền ăn?', standard: 'Hỏi hạn mức danh mục Food' },
  { slang: 'Linh trả nợ 350k', standard: '350,000đ Thu nhập / Thu hồi nợ' },
];
