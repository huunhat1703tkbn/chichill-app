import { BudgetNotification, CategoryCode, CategoryInfo, NotificationSettings } from '../types';
import { getApiUrl } from './api';
import { openShareSheet, requestSendNotification, getUserInfo } from 'zmp-sdk/apis';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enableSystemNotification: true,
  enableZaloNotification: true,
  warningThreshold: 80, // 80%
  zaloPhoneOrId: '',
  zaloUserId: undefined,
  zaloNotifPermission: 'unknown',
  autoAlertOnSpending: true,
  soundEnabled: true,
};

// Fetch real Zalo User profile from ZMP SDK
export async function fetchZaloProfile(): Promise<{ id: string; name: string; avatar: string } | null> {
  try {
    if (typeof getUserInfo !== 'function') return null;
    return new Promise((resolve) => {
      getUserInfo({
        success: (data: any) => {
          if (data?.userInfo?.id) {
            resolve({
              id: data.userInfo.id,
              name: data.userInfo.name || 'Người dùng Zalo',
              avatar: data.userInfo.avatar || '',
            });
          } else {
            resolve(null);
          }
        },
        fail: () => resolve(null),
      });
    });
  } catch {
    return null;
  }
}

// Play a subtle notification chime using Web Audio API
export function playAlertChime(type: 'warning' | 'danger' = 'warning') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type === 'danger' ? 'sawtooth' : 'sine';
    const now = ctx.currentTime;

    if (type === 'danger') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch (e) {
    console.debug('Audio chime skipped:', e);
  }
}

// Request Browser System Notification Permission
export async function requestSystemNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

// Dispatch System (Browser) Notification
export function sendSystemNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (e) {
      console.warn('Could not dispatch browser notification:', e);
    }
  }
}

// Request Zalo Mini App notification permission using ZMP SDK
export async function requestZaloNotifPermission(): Promise<'granted' | 'denied' | 'unknown'> {
  try {
    if (typeof requestSendNotification !== 'function') return 'unknown';
    return new Promise((resolve) => {
      requestSendNotification({
        success: () => {
          console.log('[ChiChill] Zalo notification permission GRANTED');
          resolve('granted');
        },
        fail: (err: any) => {
          console.warn('[ChiChill] Zalo notification permission DENIED:', err);
          resolve('denied');
        },
      });
    });
  } catch (err) {
    console.log('[ChiChill] requestSendNotification not available (not in ZMP env):', err);
    return 'unknown';
  }
}

// Format message for Zalo sharing/ZNS
export function formatZaloBudgetMessage(
  categoryLabel: string,
  spent: number,
  limit: number,
  percentage: number,
  level: 'warning' | 'danger'
): string {
  const formatMoney = (v: number) => v.toLocaleString('vi-VN') + ' ₫';
  const remaining = Math.max(0, limit - spent);
  const icon = level === 'danger' ? '🚨 VƯỢT HẠN MỨC' : '⚠️ GẦN HẾT HẠN MỨC';

  return (
`${icon} - ${categoryLabel}
📊 Đã dùng: ${percentage}%
💸 Chi/Hạn mức: ${formatMoney(spent)} / ${formatMoney(limit)}
${level === 'danger' ? `🔴 Vượt: ${formatMoney(spent - limit)}` : `🟢 Còn lại: ${formatMoney(remaining)}`}
⏰ ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${new Date().toLocaleDateString('vi-VN')}`
  );
}

// Share formatted alert directly to Zalo Chat in Mini App or Clipboard in Web
export async function shareZaloMessage(text: string, title: string = 'ChiChill AI - Cảnh Báo Chi Tiêu') {
  try {
    if (typeof window !== 'undefined') {
      try {
        // Sử dụng type: 'text' để gọi picker Zalo và gửi như 1 tin nhắn thường!
        await openShareSheet({
          type: 'text',
          data: {
            text: text,
          },
        });
        return;
      } catch (err) {
        console.log('openShareSheet type text failed, fallback to Web Share or Clipboard:', err);
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text
        });
        return;
      } catch (err) {
        console.log('Web Share bị lỗi hoặc người dùng hủy:', err);
      }
    }

    // Fallback: Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Fallback: Lỗi khi copy', err);
      }
      document.body.removeChild(textArea);
    }
  } catch (err) {
    console.error('Không thể xử lý chia sẻ tin nhắn:', err);
  }
}

/**
 * Trigger real Zalo Mini App push notification via server.
 * Server calls https://openapi.mini.zalo.me/notification/template
 */
export async function triggerZaloNotification(payload: {
  categoryLabel: string;
  spent: number;
  limit: number;
  percentage: number;
  level: 'warning' | 'danger';
  zaloUserId?: string;
}): Promise<{ success: boolean; message: string }> {
  if (!payload.zaloUserId) {
    console.warn('[ChiChill] No zaloUserId provided, cannot send Zalo push notification');
    return {
      success: false,
      message: 'Chưa có Zalo User ID. Hãy đăng nhập lại trong Zalo Mini App.',
    };
  }

  try {
    const res = await fetch(getApiUrl('/api/send-zalo-notification'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, message: data.message || 'Đã gửi thông báo Zalo thành công.' };
    }
    return {
      success: false,
      message: data.message || data.error || 'Lỗi khi gửi thông báo Zalo.',
    };
  } catch (e) {
    console.error('Failed to trigger Zalo notification API:', e);
    return {
      success: false,
      message: 'Không thể kết nối server để gửi thông báo Zalo.',
    };
  }
}
