import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  BellRing,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Send,
  Volume2,
  VolumeX,
  Sliders,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { NotificationSettings } from '../types';
import {
  requestSystemNotificationPermission,
  sendSystemNotification,
  playAlertChime,
  triggerZaloNotification,
} from '../utils/notificationService';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  onSaveSettings: (newSettings: NotificationSettings) => void;
  onTestNotification?: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<NotificationSettings>(settings);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  const [testSuccessMsg, setTestSuccessMsg] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setFormData(settings);
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    } else {
      setPermissionStatus('unsupported');
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const granted = await requestSystemNotificationPermission();
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
    if (granted) {
      setFormData((prev) => ({ ...prev, enableSystemNotification: true }));
      sendSystemNotification('ChiChill AI - Đã kích hoạt thông báo hệ thống! 🔔', {
        body: 'Bạn sẽ nhận được cảnh báo ngay khi chi tiêu chạm ngưỡng ngân sách.',
      });
    }
  };

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestSuccessMsg(null);

    if (formData.soundEnabled) {
      playAlertChime('warning');
    }

    if (formData.enableSystemNotification) {
      if (permissionStatus === 'granted') {
        sendSystemNotification('⚠️ [ChiChill AI] Cảnh báo ngân sách: Ăn uống đạt 85%!', {
          body: 'Đã tiêu 3.825.000đ / 4.500.000đ hạn mức tháng. Hãy cân nhắc chi tiêu để giữ tài chính Chill nhé!',
        });
      } else {
        await handleRequestPermission();
      }
    }

    if (formData.enableZaloNotification) {
      await triggerZaloNotification({
        categoryLabel: 'Ăn uống',
        spent: 3825000,
        limit: 4500000,
        percentage: 85,
        level: 'warning',
        zaloPhoneOrId: formData.zaloPhoneOrId || '0901234567',
        zaloWebhookUrl: formData.zaloWebhookUrl,
      });
    }

    setTestSuccessMsg('Đã bắn thử thông báo mẫu qua Hệ thống & Zalo thành công!');
    setIsTesting(false);
    setTimeout(() => setTestSuccessMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-200">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900">Cài Đặt Nhắc Nhở Ngân Sách</h2>
              <p className="text-xs text-gray-500">Thông báo qua Zalo & Hệ thống khi gần chạm hạn mức</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 scrollbar-thin text-sm">
          {/* Test Status Banner */}
          {testSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{testSuccessMsg}</span>
            </div>
          )}

          {/* Section 1: Warning Threshold */}
          <div className="bg-blue-50/60 border border-blue-100 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-gray-900">Ngưỡng Bật Cảnh Báo</span>
              </div>
              <span className="text-sm font-black text-blue-700 bg-white px-2.5 py-0.5 rounded-lg border border-blue-200 shadow-2xs">
                {formData.warningThreshold}% Hạn mức
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Hệ thống sẽ lập tức gửi thông báo khi bất kỳ danh mục chi tiêu nào đạt từ {formData.warningThreshold}% trở lên.
            </p>

            {/* Threshold Preset Buttons */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[70, 80, 85, 90].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, warningThreshold: t }))}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    formData.warningThreshold === t
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 scale-102'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {t}%
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Browser System Push Notification */}
          <div className="border border-gray-200 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Thông Báo Hệ Thống (Trình duyệt)</h3>
                  <p className="text-xs text-gray-500">Bắn pop-up banner trên màn hình điện thoại & laptop</p>
                </div>
              </div>

              <input
                type="checkbox"
                id="toggle-system-notif"
                checked={formData.enableSystemNotification}
                onChange={(e) => setFormData((prev) => ({ ...prev, enableSystemNotification: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded-md cursor-pointer accent-blue-600"
              />
            </div>

            {/* Permission Check Action */}
            <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gray-500" />
                <span>Quyền trình duyệt:</span>
                <span
                  className={`font-bold ${
                    permissionStatus === 'granted'
                      ? 'text-emerald-600'
                      : permissionStatus === 'denied'
                      ? 'text-rose-600'
                      : 'text-amber-600'
                  }`}
                >
                  {permissionStatus === 'granted'
                    ? 'Đã cấp phép ✓'
                    : permissionStatus === 'denied'
                    ? 'Bị từ chối'
                    : 'Chưa cấp phép'}
                </span>
              </div>

              {permissionStatus !== 'granted' && (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Cấp quyền ngay
                </button>
              )}
            </div>
          </div>

          {/* Section 3: Zalo Bot & OA Notifications */}
          <div className="border border-gray-200 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Thông Báo Zalo (ZNS / Zalo Bot)</h3>
                  <p className="text-xs text-gray-500">Nhắc nhở trực tiếp qua tin nhắn Zalo</p>
                </div>
              </div>

              <input
                type="checkbox"
                id="toggle-zalo-notif"
                checked={formData.enableZaloNotification}
                onChange={(e) => setFormData((prev) => ({ ...prev, enableZaloNotification: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded-md cursor-pointer accent-blue-600"
              />
            </div>

            {formData.enableZaloNotification && (
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Số Điện Thoại / ID Zalo Nhận Tin:
                  </label>
                  <input
                    type="text"
                    value={formData.zaloPhoneOrId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, zaloPhoneOrId: e.target.value }))}
                    placeholder="VD: 0901234567 hoặc zalo_id"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">
                    Zalo Webhook URL (Tùy chọn - Dành cho Zalo OA / Chatbot):
                  </label>
                  <input
                    type="url"
                    value={formData.zaloWebhookUrl || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, zaloWebhookUrl: e.target.value }))}
                    placeholder="https://openapi.zalo.me/v2.0/oa/message..."
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Hệ thống sẽ kích hoạt template ZNS thông báo ngân sách tiêu chuẩn của FinMate AI.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Sound & Behavior Preferences */}
          <div className="border border-gray-200 p-4 rounded-2xl space-y-3">
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-gray-500">
              Tùy Chọn Khác
            </h3>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {formData.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-blue-600" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
                <span className="font-semibold text-gray-800">Âm thanh chuông cảnh báo</span>
              </div>
              <input
                type="checkbox"
                checked={formData.soundEnabled}
                onChange={(e) => setFormData((prev) => ({ ...prev, soundEnabled: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded-md cursor-pointer accent-blue-600"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-gray-800">Tự động cảnh báo ngay sau khi ghi chép</span>
              </div>
              <input
                type="checkbox"
                checked={formData.autoAlertOnSpending}
                onChange={(e) => setFormData((prev) => ({ ...prev, autoAlertOnSpending: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded-md cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleRunTest}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700 transition-colors cursor-pointer shadow-2xs"
          >
            <Send className="w-3.5 h-3.5 text-blue-600" />
            <span>{isTesting ? 'Đang gửi...' : 'Thử thông báo mẫu'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200/70 rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-200 transition-transform active:scale-95 cursor-pointer"
            >
              Lưu Cấu Hình
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
