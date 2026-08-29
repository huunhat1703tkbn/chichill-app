import { CategoryCode, CategoryInfo, Transaction, CategoryBudget, OfficeDebt } from '../types';

export const CATEGORIES: Record<CategoryCode, CategoryInfo> = {
  Housing: {
    code: 'Housing',
    label: 'Tiền nhà',
    iconName: 'Home',
    color: '#EA580C', // Orange
    bgColor: '#FFEDD5',
    description: 'Tiền thuê nhà, chung cư, bảo trì'
  },
  Food: {
    code: 'Food',
    label: 'Ăn uống',
    iconName: 'Utensils',
    color: '#F59E0B', // Amber
    bgColor: '#FEF3C7',
    description: 'Cơm trưa, cafe, trà sữa, ăn nhậu, ăn vặt'
  },
  Savings: {
    code: 'Savings',
    label: 'Tiết kiệm & Đầu tư',
    iconName: 'Wallet',
    color: '#0D9488', // Teal
    bgColor: '#CCFBF1',
    description: 'Quỹ khẩn cấp, tích lũy, đầu tư'
  },
  Shopping: {
    code: 'Shopping',
    label: 'Mua sắm & Giải trí',
    iconName: 'ShoppingBag',
    color: '#EC4899', // Pink
    bgColor: '#FCE7F3',
    description: 'Quần áo, xem phim, du lịch, mua sắm online'
  },
  Transport: {
    code: 'Transport',
    label: 'Đi lại',
    iconName: 'Car',
    color: '#3B82F6', // Blue
    bgColor: '#DBEAFE',
    description: 'Xăng, Grab, Gojek, gửi xe'
  },
  Utilities: {
    code: 'Utilities',
    label: 'Điện nước & Net',
    iconName: 'Tv',
    color: '#0891B2', // Cyan
    bgColor: '#CFFAFE',
    description: 'Điện, nước, internet, 4G, truyền hình'
  },
  Work: {
    code: 'Work',
    label: 'Công việc',
    iconName: 'Briefcase',
    color: '#8B5CF6', // Purple
    bgColor: '#EDE9FE',
    description: 'Chạy Ads, tiếp khách, in ấn, thiết bị'
  },
  Debt: {
    code: 'Debt',
    label: 'Nợ & Cho vay',
    iconName: 'HandCoins',
    color: '#EF4444', // Red
    bgColor: '#FEE2E2',
    description: 'Cho vay, mượn tiền, ứng trước, chia bill'
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
    color: '#06B6D4',
    bgColor: '#CFFAFE',
    description: 'Tra cứu ngân sách, tư vấn chi tiêu'
  }
};

export const INITIAL_BUDGETS: CategoryBudget[] = [
  { category: 'Housing', limitAmount: 6000000 },     // 30% (6.0 củ)
  { category: 'Food', limitAmount: 5000000 },        // 25% (5.0 củ)
  { category: 'Savings', limitAmount: 4000000 },     // 20% (4.0 củ)
  { category: 'Shopping', limitAmount: 2000000 },    // 10% (2.0 củ)
  { category: 'Transport', limitAmount: 1200000 },   // 6% (1.2 củ)
  { category: 'Utilities', limitAmount: 1000000 },   // 5% (1.0 củ)
  { category: 'Work', limitAmount: 1000000 },        // 1.0 củ
  { category: 'Debt', limitAmount: 2000000 },        // 2.0 củ
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // =================== THÁNG 8 / 2026 (THÁNG HIỆN TẠI) ===================
  {
    id: 'tx-801',
    type: 'income',
    amount: 24500000,
    category: 'Income',
    description: 'Lương chuyển khoản tháng 8 (Công ty Tech)',
    date: '2026-08-01',
    time: '08:30',
    createdBy: 'manual'
  },
  {
    id: 'tx-802',
    type: 'expense',
    amount: 5800000,
    category: 'Housing',
    description: 'Tiền thuê căn hộ & phí quản lý T8',
    date: '2026-08-02',
    time: '09:15',
    createdBy: 'manual'
  },
  {
    id: 'tx-803',
    type: 'expense',
    amount: 5000000,
    category: 'Savings',
    description: 'Trích gửi tiết kiệm tích lũy ngân hàng T8',
    date: '2026-08-03',
    time: '10:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-804',
    type: 'expense',
    amount: 850000,
    category: 'Utilities',
    description: 'Tiền điện, nước, internet VNPT T8',
    date: '2026-08-04',
    time: '14:20',
    createdBy: 'manual'
  },
  {
    id: 'tx-805',
    type: 'income',
    amount: 4200000,
    category: 'Income',
    description: 'Thu nhập Freelance thiết kế UI/UX',
    date: '2026-08-05',
    time: '19:45',
    createdBy: 'manual'
  },
  {
    id: 'tx-806',
    type: 'expense',
    amount: 750000,
    category: 'Food',
    description: 'Cơm trưa gà nướng & Highlands cafe tuần 1',
    date: '2026-08-07',
    time: '12:30',
    createdBy: 'ai'
  },
  {
    id: 'tx-807',
    type: 'expense',
    amount: 180000,
    category: 'Transport',
    description: 'Đổ đầy bình xăng & phí gửi xe tháng',
    date: '2026-08-08',
    time: '08:00',
    createdBy: 'ai'
  },
  {
    id: 'tx-808',
    type: 'expense',
    amount: 620000,
    category: 'Food',
    description: 'Đi siêu thị WinMart mua đồ nấu ăn tuần',
    date: '2026-08-10',
    time: '18:30',
    createdBy: 'ai'
  },
  {
    id: 'tx-809',
    type: 'expense',
    amount: 790000,
    category: 'Shopping',
    description: 'Áo sơ mi Uniqlo đi làm & tất vớ',
    date: '2026-08-12',
    time: '20:15',
    createdBy: 'ai'
  },
  {
    id: 'tx-810',
    type: 'expense',
    amount: 650000,
    category: 'Shopping',
    description: 'Gói tập Gym Citigym tháng 8',
    date: '2026-08-14',
    time: '18:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-811',
    type: 'expense',
    amount: 850000,
    category: 'Food',
    description: 'Cơm trưa văn phòng & Phúc Long tuần 2',
    date: '2026-08-16',
    time: '12:45',
    createdBy: 'ai'
  },
  {
    id: 'tx-812',
    type: 'expense',
    amount: 145000,
    category: 'Work',
    description: 'GrabCar đi gặp đối tác khách hàng tại Q1',
    date: '2026-08-18',
    time: '15:30',
    createdBy: 'ai'
  },
  {
    id: 'tx-813',
    type: 'expense',
    amount: 520000,
    category: 'Shopping',
    description: 'Mua tai nghe Bluetooth Shopee',
    date: '2026-08-20',
    time: '21:00',
    createdBy: 'ai'
  },
  {
    id: 'tx-814',
    type: 'receivable',
    amount: 250000,
    category: 'Debt',
    description: 'Nam mượn tiền cơm trưa chia bill buffet',
    date: '2026-08-21',
    time: '12:45',
    createdBy: 'ai',
    personName: 'Nam (Design)'
  },
  {
    id: 'tx-815',
    type: 'receivable',
    amount: 1200000,
    category: 'Debt',
    description: 'Ứng trước tiền mua đạo cụ studio cho Sếp',
    date: '2026-08-21',
    time: '16:00',
    createdBy: 'ai',
    personName: 'Sếp Tuấn'
  },
  {
    id: 'tx-816',
    type: 'payable',
    amount: 350000,
    category: 'Debt',
    description: 'Linh ứng giùm tiền trà sữa Gong Cha cả phòng',
    date: '2026-08-21',
    time: '17:30',
    createdBy: 'ai',
    personName: 'Linh (Marketing)'
  },
  {
    id: 'tx-817',
    type: 'expense',
    amount: 480000,
    category: 'Food',
    description: 'Ăn lẩu Haidilao cuối tuần cùng nhóm bạn',
    date: '2026-08-23',
    time: '19:30',
    createdBy: 'ai'
  },
  {
    id: 'tx-818',
    type: 'expense',
    amount: 95000,
    category: 'Transport',
    description: 'Xăng xe máy & gửi xe tòa nhà',
    date: '2026-08-25',
    time: '08:30',
    createdBy: 'ai'
  },
  {
    id: 'tx-819',
    type: 'expense',
    amount: 260000,
    category: 'Work',
    description: 'Mua sổ tay & bút ký văn phòng phẩm',
    date: '2026-08-26',
    time: '14:00',
    createdBy: 'ai'
  },
  {
    id: 'tx-820',
    type: 'expense',
    amount: 420000,
    category: 'Food',
    description: 'Cơm trưa bún đậu & cafe The Coffee House',
    date: '2026-08-28',
    time: '12:15',
    createdBy: 'ai'
  },

  // =================== THÁNG 7 / 2026 ===================
  {
    id: 'tx-701',
    type: 'income',
    amount: 24500000,
    category: 'Income',
    description: 'Lương chuyển khoản tháng 7',
    date: '2026-07-01',
    time: '08:30',
    createdBy: 'manual'
  },
  {
    id: 'tx-702',
    type: 'expense',
    amount: 5800000,
    category: 'Housing',
    description: 'Tiền thuê căn hộ T7',
    date: '2026-07-02',
    time: '09:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-703',
    type: 'expense',
    amount: 4500000,
    category: 'Savings',
    description: 'Trích quỹ tích lũy tiết kiệm T7',
    date: '2026-07-03',
    time: '10:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-704',
    type: 'expense',
    amount: 920000,
    category: 'Utilities',
    description: 'Tiền điện nước, máy lạnh T7',
    date: '2026-07-04',
    time: '11:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-705',
    type: 'income',
    amount: 3500000,
    category: 'Income',
    description: 'Dự án Freelance thiết kế web landing page',
    date: '2026-07-08',
    time: '18:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-706',
    type: 'expense',
    amount: 2850000,
    category: 'Food',
    description: 'Cơm trưa, trà sữa, cafe cả tháng 7',
    date: '2026-07-15',
    time: '12:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-707',
    type: 'expense',
    amount: 1450000,
    category: 'Shopping',
    description: 'Mua giày thể thao chạy bộ Nike',
    date: '2026-07-18',
    time: '19:30',
    createdBy: 'ai'
  },
  {
    id: 'tx-708',
    type: 'expense',
    amount: 420000,
    category: 'Transport',
    description: 'Grab và xăng xe tháng 7',
    date: '2026-07-20',
    time: '08:30',
    createdBy: 'ai'
  },
  {
    id: 'tx-709',
    type: 'expense',
    amount: 550000,
    category: 'Food',
    description: 'Ăn nướng BBQ Gogi House sinh nhật bạn bè',
    date: '2026-07-24',
    time: '20:00',
    createdBy: 'ai'
  },
  {
    id: 'tx-710',
    type: 'expense',
    amount: 450000,
    category: 'Work',
    description: 'In ấn hồ sơ dự án & thử nghiệm Ads Facebook',
    date: '2026-07-28',
    time: '16:00',
    createdBy: 'ai'
  },

  // =================== THÁNG 6 / 2026 ===================
  {
    id: 'tx-601',
    type: 'income',
    amount: 24000000,
    category: 'Income',
    description: 'Lương chuyển khoản tháng 6',
    date: '2026-06-01',
    time: '08:30',
    createdBy: 'manual'
  },
  {
    id: 'tx-602',
    type: 'expense',
    amount: 5800000,
    category: 'Housing',
    description: 'Tiền thuê căn hộ T6',
    date: '2026-06-02',
    time: '09:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-603',
    type: 'expense',
    amount: 5000000,
    category: 'Savings',
    description: 'Gửi tiết kiệm định kỳ ngân hàng T6',
    date: '2026-06-03',
    time: '10:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-604',
    type: 'expense',
    amount: 890000,
    category: 'Utilities',
    description: 'Tiền điện, nước, internet T6',
    date: '2026-06-05',
    time: '14:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-605',
    type: 'expense',
    amount: 2900000,
    category: 'Food',
    description: 'Tiền cơm trưa văn phòng, cafe Highland T6',
    date: '2026-06-12',
    time: '12:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-606',
    type: 'expense',
    amount: 1800000,
    category: 'Shopping',
    description: 'Du lịch Vũng Tàu cuối tuần với công ty',
    date: '2026-06-15',
    time: '18:00',
    createdBy: 'ai'
  },
  {
    id: 'tx-607',
    type: 'income',
    amount: 1500000,
    category: 'Income',
    description: 'Thu hồi nợ bạn cũ chuyển khoản trả',
    date: '2026-06-20',
    time: '14:30',
    createdBy: 'ai'
  },
  {
    id: 'tx-608',
    type: 'expense',
    amount: 550000,
    category: 'Transport',
    description: 'Xăng xe & bảo dưỡng xe máy định kỳ',
    date: '2026-06-22',
    time: '10:30',
    createdBy: 'ai'
  },

  // =================== THÁNG 5 / 2026 ===================
  {
    id: 'tx-501',
    type: 'income',
    amount: 24000000,
    category: 'Income',
    description: 'Lương chuyển khoản tháng 5',
    date: '2026-05-01',
    time: '08:30',
    createdBy: 'manual'
  },
  {
    id: 'tx-502',
    type: 'income',
    amount: 3000000,
    category: 'Income',
    description: 'Thưởng dịp lễ 30/4 - 1/5 từ công ty',
    date: '2026-05-02',
    time: '09:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-503',
    type: 'expense',
    amount: 5800000,
    category: 'Housing',
    description: 'Tiền thuê căn hộ T5',
    date: '2026-05-02',
    time: '10:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-504',
    type: 'expense',
    amount: 6000000,
    category: 'Savings',
    description: 'Trích thưởng & lương gửi tiết kiệm T5',
    date: '2026-05-03',
    time: '11:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-505',
    type: 'expense',
    amount: 810000,
    category: 'Utilities',
    description: 'Điện nước và cước mạng T5',
    date: '2026-05-05',
    time: '15:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-506',
    type: 'expense',
    amount: 3100000,
    category: 'Food',
    description: 'Tiền ăn uống, cơm trưa, liên hoan tháng 5',
    date: '2026-05-15',
    time: '12:30',
    createdBy: 'manual'
  },
  {
    id: 'tx-507',
    type: 'expense',
    amount: 850000,
    category: 'Shopping',
    description: 'Mua quà tặng mẹ ngày của mẹ',
    date: '2026-05-18',
    time: '19:00',
    createdBy: 'ai'
  },
  {
    id: 'tx-508',
    type: 'expense',
    amount: 380000,
    category: 'Transport',
    description: 'Xăng xe & tiền gửi xe tháng 5',
    date: '2026-05-20',
    time: '08:30',
    createdBy: 'ai'
  },

  // =================== THÁNG 4 / 2026 ===================
  {
    id: 'tx-401',
    type: 'income',
    amount: 23000000,
    category: 'Income',
    description: 'Lương chuyển khoản tháng 4',
    date: '2026-04-01',
    time: '08:30',
    createdBy: 'manual'
  },
  {
    id: 'tx-402',
    type: 'expense',
    amount: 5800000,
    category: 'Housing',
    description: 'Tiền thuê căn hộ T4',
    date: '2026-04-02',
    time: '09:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-403',
    type: 'expense',
    amount: 4000000,
    category: 'Savings',
    description: 'Trích tiết kiệm tích lũy ngân hàng T4',
    date: '2026-04-03',
    time: '10:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-404',
    type: 'expense',
    amount: 790000,
    category: 'Utilities',
    description: 'Điện nước và truyền hình T4',
    date: '2026-04-04',
    time: '14:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-405',
    type: 'income',
    amount: 2800000,
    category: 'Income',
    description: 'Freelance viết bài content & SEO',
    date: '2026-04-10',
    time: '20:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-406',
    type: 'expense',
    amount: 2950000,
    category: 'Food',
    description: 'Tiền ăn uống, cơm trưa, ăn vặt tháng 4',
    date: '2026-04-18',
    time: '12:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-407',
    type: 'expense',
    amount: 650000,
    category: 'Shopping',
    description: 'Mỹ phẩm & kem chống nắng mùa hè',
    date: '2026-04-22',
    time: '18:30',
    createdBy: 'ai'
  },
  {
    id: 'tx-408',
    type: 'expense',
    amount: 400000,
    category: 'Transport',
    description: 'Xăng xe máy & GrabCar',
    date: '2026-04-25',
    time: '09:00',
    createdBy: 'ai'
  },

  // =================== THÁNG 3 / 2026 ===================
  {
    id: 'tx-301',
    type: 'income',
    amount: 23000000,
    category: 'Income',
    description: 'Lương chuyển khoản tháng 3',
    date: '2026-03-01',
    time: '08:30',
    createdBy: 'manual'
  },
  {
    id: 'tx-302',
    type: 'expense',
    amount: 5800000,
    category: 'Housing',
    description: 'Tiền thuê căn hộ T3',
    date: '2026-03-02',
    time: '09:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-303',
    type: 'expense',
    amount: 4000000,
    category: 'Savings',
    description: 'Trích tiết kiệm tích lũy ngân hàng T3',
    date: '2026-03-03',
    time: '10:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-304',
    type: 'expense',
    amount: 780000,
    category: 'Utilities',
    description: 'Điện nước và mạng internet T3',
    date: '2026-03-04',
    time: '14:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-305',
    type: 'expense',
    amount: 2800000,
    category: 'Food',
    description: 'Tiền cơm trưa & cafe văn phòng tháng 3',
    date: '2026-03-15',
    time: '12:00',
    createdBy: 'manual'
  },
  {
    id: 'tx-306',
    type: 'expense',
    amount: 950000,
    category: 'Shopping',
    description: 'Mua sắm Shopee quần áo mùa hè',
    date: '2026-03-20',
    time: '19:00',
    createdBy: 'ai'
  },
  {
    id: 'tx-307',
    type: 'expense',
    amount: 350000,
    category: 'Transport',
    description: 'Xăng xe máy & gửi xe tháng 3',
    date: '2026-03-25',
    time: '08:30',
    createdBy: 'ai'
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
