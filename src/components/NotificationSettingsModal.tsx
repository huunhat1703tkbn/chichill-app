import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Send,
  Volume2,
  VolumeX,
  Sliders,
  ShieldCheck,
  Zap,
  LogOut,
  RefreshCw,
  User,
  BellRing,
} from 'lucide-react';
import { NotificationSettings } from '../types';
import {
  playAlertChime,
  triggerZaloNotification,
  requestZaloNotifPermission,
  fetchZaloProfile,
} from '../utils/notificationService';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NotificationSettings;
  userProfile?: any;
  onSaveSettings: (newSettings: NotificationSettings) => void;
  onUpdateUserProfile?: (profile: any) => void;
  onLogout?: () => void;
  onTestNotification?: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  userProfile,
  onSaveSettings,
  onUpdateUserProfile,
  onLogout,
  onTestNotification,
}) => {
  const [formData, setFormData] = useState<NotificationSettings>(settings);
  const [testSuccessMsg, setTestSuccessMsg] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncingZalo, setIsSyncingZalo] = useState(false);

  useEffect(() => {
    // If settings has no zaloUserId but userProfile has it, sync automatically
    const updated = { ...settings };
    if (!updated.zaloUserId && userProfile?.id) {
      updated.zaloUserId = userProfile.id;
    }
    setFormData(updated);
  }, [settings, userProfile, isOpen]);

  if (!isOpen) return null;

  // Connect / Re-sync Zalo Profile & Request Push Permission
  const handleConnectAndGrantPermission = async () => {
    setIsSyncingZalo(true);
    setTestSuccessMsg(null);

    // 1. Fetch Zalo user profile from SDK if missing
    let currentUserId = formData.zaloUserId || userProfile?.id;
    const profile = await fetchZaloProfile();
    if (profile?.id) {
      currentUserId = profile.id;
      if (onUpdateUserProfile) {
        onUpdateUserProfile(profile);
      }
      localStorage.setItem('finmate_user', JSON.stringify(profile));
    }

    // 2. Request Zalo push notification permission
    const notifResult = await requestZaloNotifPermission();

    const updatedSettings: NotificationSettings = {
      ...formData,
      zaloUserId: currentUserId || formData.zaloUserId,
      zaloNotifPermission: notifResult,
      enableZaloNotification: notifResult === 'granted' || formData.enableZaloNotification,
    };

    // Immediately persist both locally and to parent state & localStorage
    setFormData(updatedSettings);
    onSaveSettings(updatedSettings);
    localStorage.setItem('finmate_notification_settings', JSON.stringify(updatedSettings));

    setIsSyncingZalo(false);

    if (notifResult === 'granted') {
      setTestSuccessMsg('✅ Đã cấp quyền Zalo thành công!');
    } else if (currentUserId) {
      setTestSuccessMsg('✅ Đã đồng bộ Zalo ID thành công!');
    } else {
      setTestSuccessMsg('⚠️ Chưa nhận được quyền từ Zalo.');
    }
    setTimeout(() => setTestSuccessMsg(null), 4000);
  };

  const handleSave = () => {
    onSaveSettings(formData);
    localStorage.setItem('finmate_notification_settings', JSON.stringify(formData));
    onClose();
  };

  const handleRunTest = async () => {
    setIsTesting(true);
    setTestSuccessMsg(null);

    // 1. Play sound chime
    if (formData.soundEnabled) {
      playAlertChime('warning');
    }

    // 2. Trigger in-app visual toast banner
    if (onTestNotification) {
      onTestNotification();
    }

    // 3. Trigger Zalo push notification API call
    if (formData.enableZaloNotification && (formData.zaloUserId || userProfile?.id)) {
      const targetUserId = formData.zaloUserId || userProfile?.id;
      const result = await triggerZaloNotification({
        categoryLabel: 'Ăn uống',
        spent: 3825000,
        limit: 4500000,
        percentage: 85,
        level: 'warning',
        zaloUserId: targetUserId,
      });

      if (result.success) {
        setTestSuccessMsg('✅ Đã gửi thông báo Zalo thành công!');
      } else {
        setTestSuccessMsg(`⚠️ ${result.message}`);
      }
    } else if (formData.enableZaloNotification && !formData.zaloUserId && !userProfile?.id) {
      setTestSuccessMsg('⚠️ Chưa có Zalo User ID. Hãy bấm "Cấp quyền Zalo ngay" trước.');
    } else {
      setTestSuccessMsg('✅ Đã phát chuông & hiển thị thông báo mẫu!');
    }

    setIsTesting(false);
    setTimeout(() => setTestSuccessMsg(null), 6000);
  };

  const isZaloGranted = formData.zaloNotifPermission === 'granted';
  const displayName = userProfile?.name || 'Tài khoản Zalo';
  const displayId = formData.zaloUserId || userProfile?.id || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900">Cài Đặt Cảnh Báo</h2>
              <p className="text-[11px] text-gray-500">Nhắc nhở khi chạm ngưỡng ngân sách</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1 scrollbar-thin text-xs">
          {/* Status Alert Toast */}
          {testSuccessMsg && (
            <div className={`p-2.5 rounded-xl flex items-center gap-2 font-bold animate-in fade-in ${
              testSuccessMsg.startsWith('✅')
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border border-amber-200 text-amber-800'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{testSuccessMsg}</span>
            </div>
          )}

          {/* Section 1: Warning Threshold */}
          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                Ngưỡng cảnh báo chi tiêu
              </span>
              <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                {formData.warningThreshold}% hạn mức
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[70, 80, 85, 90].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    const updated = { ...formData, warningThreshold: t };
                    setFormData(updated);
                    onSaveSettings(updated);
                    localStorage.setItem('finmate_notification_settings', JSON.stringify(updated));
                  }}
                  className={`py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    formData.warningThreshold === t
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {t}%
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Zalo Push Notification */}
          <div className="border border-blue-200 bg-blue-50/20 p-3.5 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Smartphone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Thông báo qua Zalo</h3>
                  <p className="text-[10px] text-gray-500">Nhận tin nhắn cảnh báo trực tiếp</p>
                </div>
              </div>

              <input
                type="checkbox"
                id="toggle-zalo-notif"
                checked={formData.enableZaloNotification}
                onChange={(e) => {
                  const updated = { ...formData, enableZaloNotification: e.target.checked };
                  setFormData(updated);
                  onSaveSettings(updated);
                  localStorage.setItem('finmate_notification_settings', JSON.stringify(updated));
                }}
                className="w-4 h-4 text-blue-600 rounded-md cursor-pointer accent-blue-600"
              />
            </div>

            {/* Zalo Account & Permission Box */}
            <div className="bg-white p-3 rounded-xl border border-blue-100 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {userProfile?.avatar ? (
                    <img
                      src={userProfile.avatar}
                      alt="Avatar"
                      className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{displayName}</p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {displayId ? `ID: ${displayId.substring(0, 12)}...` : 'Chưa có Zalo ID'}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                    isZaloGranted
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {isZaloGranted ? '✓ Đã cấp quyền' : 'Chưa cấp quyền'}
                </span>
              </div>

              {/* Action Buttons for Zalo */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleConnectAndGrantPermission}
                  disabled={isSyncingZalo}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncingZalo ? 'animate-spin' : ''}`} />
                  <span>{isZaloGranted ? 'Đồng bộ lại Zalo' : 'Cấp quyền Zalo ngay'}</span>
                </button>

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Đăng xuất khỏi tài khoản hiện tại để đăng nhập lại?')) {
                        onClose();
                        onLogout();
                      }
                    }}
                    className="bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold py-1.5 px-2.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
                    title="Đăng xuất tài khoản"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Đổi tài khoản</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Sound Preference */}
          <div className="border border-slate-200 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              {formData.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-blue-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-400" />
              )}
              <span className="font-semibold text-gray-800">Âm thanh chuông báo</span>
            </div>
            <input
              type="checkbox"
              checked={formData.soundEnabled}
              onChange={(e) => {
                const updated = { ...formData, soundEnabled: e.target.checked };
                setFormData(updated);
                onSaveSettings(updated);
                localStorage.setItem('finmate_notification_settings', JSON.stringify(updated));
              }}
              className="w-4 h-4 text-blue-600 rounded-md cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleRunTest}
            disabled={isTesting}
            className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl font-bold text-gray-700 transition-colors cursor-pointer shadow-2xs text-xs"
          >
            <Send className="w-3 h-3 text-blue-600" />
            <span>{isTesting ? 'Đang gửi...' : 'Thử thông báo'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              Lưu Cấu Hình
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
