import { BillSplitGroup, BillSplitExpense } from '../types';
import { getApiUrl } from './api';

// 1. Tạo hoặc đưa nhóm lên Cloud Shared
export async function createOrSyncSharedBill(
  group: BillSplitGroup,
  userProfile?: any
): Promise<{ success: boolean; group?: BillSplitGroup; shareCode?: string; error?: string }> {
  try {
    const res = await fetch(getApiUrl('/api/shared-bill'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group,
        ownerUserId: userProfile?.id,
        userProfile,
      }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, group: data.group, shareCode: data.shareCode };
    }
    return { success: false, error: data.error || 'Không thể tạo nhóm chia sẻ' };
  } catch (err: any) {
    console.error('Error creating shared bill:', err);
    return { success: false, error: err?.message || 'Lỗi mạng khi kết nối server' };
  }
}

// 2. Lấy dữ liệu Shared Bill mới nhất từ server theo shareCode
export async function fetchSharedBill(
  shareCode: string
): Promise<{ success: boolean; group?: BillSplitGroup; error?: string }> {
  try {
    const normalized = shareCode.trim().toUpperCase();
    const res = await fetch(getApiUrl(`/api/shared-bill/${normalized}`));
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, group: data.group };
    }
    return { success: false, error: data.error || 'Không tìm thấy nhóm' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi kết nối' };
  }
}

// 3. Người dùng Zalo tham gia nhóm (Join Shared Bill)
export async function joinSharedBill(
  shareCode: string,
  userProfile: any
): Promise<{ success: boolean; group?: BillSplitGroup; error?: string }> {
  try {
    const normalized = shareCode.trim().toUpperCase();
    const res = await fetch(getApiUrl(`/api/shared-bill/${normalized}/join`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userProfile }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, group: data.group };
    }
    return { success: false, error: data.error || 'Lỗi khi tham gia nhóm' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi mạng' };
  }
}

// 4. Thêm / cập nhật khoản chi trên Shared Bill
export async function addSharedExpense(
  shareCode: string,
  expense: BillSplitExpense,
  userProfile?: any
): Promise<{ success: boolean; group?: BillSplitGroup; error?: string }> {
  try {
    const normalized = shareCode.trim().toUpperCase();
    const res = await fetch(getApiUrl(`/api/shared-bill/${normalized}/expense`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expense, userProfile }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, group: data.group };
    }
    return { success: false, error: data.error || 'Không thể thêm khoản chi' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi mạng' };
  }
}

// 5. Xóa khoản chi trên Shared Bill
export async function deleteSharedExpense(
  shareCode: string,
  expenseId: string
): Promise<{ success: boolean; group?: BillSplitGroup; error?: string }> {
  try {
    const normalized = shareCode.trim().toUpperCase();
    const res = await fetch(getApiUrl(`/api/shared-bill/${normalized}/expense/${expenseId}`), {
      method: 'DELETE',
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, group: data.group };
    }
    return { success: false, error: data.error || 'Không thể xóa khoản chi' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Lỗi mạng' };
  }
}

// 6. Đổi trạng thái tất toán trên Shared Bill
export async function toggleSharedSettled(
  shareCode: string
): Promise<{ success: boolean; group?: BillSplitGroup; error?: string }> {
  try {
    const normalized = shareCode.trim().toUpperCase();
    const res = await fetch(getApiUrl(`/api/shared-bill/${normalized}/settle`), {
      method: 'POST',
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, group: data.group };
    }
    return { success: false, error: data.error };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// 7. Cập nhật Thủ quỹ & STK trên Shared Bill
export async function updateSharedLeader(
  shareCode: string,
  leader: string,
  bankInfo: string
): Promise<{ success: boolean; group?: BillSplitGroup; error?: string }> {
  try {
    const normalized = shareCode.trim().toUpperCase();
    const res = await fetch(getApiUrl(`/api/shared-bill/${normalized}/leader`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leader, bankInfo }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, group: data.group };
    }
    return { success: false, error: data.error };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

// 8. Xóa Shared Bill trên server
export async function deleteSharedBillFromServer(shareCode: string): Promise<boolean> {
  try {
    const normalized = shareCode.trim().toUpperCase();
    const res = await fetch(getApiUrl(`/api/shared-bill/${normalized}`), {
      method: 'DELETE',
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

// 9. Tạo đường link chia sẻ Zalo Mini App hoặc Web
export function generateBillInviteLink(shareCode: string): string {
  const appId = (import.meta as any).env?.VITE_ZALO_APP_ID || '3359280154790783177';
  return `https://zalo.me/s/${appId}/?bill=${shareCode}`;
}
