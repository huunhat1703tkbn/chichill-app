import React, { useState, useEffect } from 'react';
import { Coffee, ShieldCheck, Zap, AlertCircle, X } from 'lucide-react';
import { generateRandomString, generateCodeChallenge } from '../utils/pkce';
import { getUserInfo } from 'zmp-sdk/apis';

interface LoginViewProps {
  onLogin: (user: any) => void;
  onClose?: () => void;
}

export function LoginView({ onLogin, onClose }: LoginViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Tự động nhận diện và đăng nhập nếu đang chạy trong môi trường Zalo Mini App
  useEffect(() => {
    try {
      getUserInfo({
        success: (data: any) => {
          if (data?.userInfo?.id) {
            onLogin({
              id: data.userInfo.id,
              name: data.userInfo.name,
              avatar: data.userInfo.avatar
            });
          }
        },
        fail: (err: any) => {
          // Không phải lỗi nghiêm trọng nếu đang chạy ở web thường
          console.log('ZMP auto-login skip:', err);
        }
      });
    } catch {
      // Ignore if not in ZMP environment
    }
  }, [onLogin]);

  // Lấy App ID từ biến môi trường của Vite hoặc App ID mặc định
  const ZALO_APP_ID = import.meta.env.VITE_ZALO_APP_ID || '3359280154790783177';

  const handleZaloLogin = async () => {
    setIsLoading(true);
    setError('');

    // 1. Thử đăng nhập qua Native Zalo Mini App SDK trước
    try {
      getUserInfo({
        success: (data: any) => {
          if (data?.userInfo?.id) {
            setIsLoading(false);
            onLogin({
              id: data.userInfo.id,
              name: data.userInfo.name,
              avatar: data.userInfo.avatar
            });
            return;
          }
        },
        fail: async () => {
          // 2. Nếu không ở trong ZMP, chuyển sang quy trình OAuth Web PKCE
          await proceedWebOAuth();
        }
      });
      return;
    } catch {
      // Fallback sang Web OAuth
      await proceedWebOAuth();
    }
  };

  const proceedWebOAuth = async () => {
    if (!ZALO_APP_ID) {
      setError('Lỗi: Chưa cấu hình VITE_ZALO_APP_ID trong môi trường!');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Tạo State và Code Verifier (PKCE)
      const state = generateRandomString(43);
      const codeVerifier = generateRandomString(43);
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      // 2. Lưu vào Session Storage để verify sau khi Zalo redirect về
      sessionStorage.setItem('zalo_auth_state', state);
      sessionStorage.setItem('zalo_code_verifier', codeVerifier);

      // 3. Xây dựng URL Redirect (Chính là trang hiện tại của bạn)
      const redirectUri = window.location.origin;

      // 4. Chuyển hướng người dùng sang Zalo (Sử dụng OAuth V4)
      const oauthUrl = `https://oauth.zaloapp.com/v4/permission?app_id=${ZALO_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge=${codeChallenge}&state=${state}`;
      
      window.location.href = oauthUrl;

    } catch (err: any) {
      setError('Lỗi khi khởi tạo đăng nhập: ' + err.message);
      setIsLoading(false);
    }
  };

  const handledCallbackRef = React.useRef(false);

  // 5. Xử lý Callback từ Zalo (cho môi trường Web)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      if (handledCallbackRef.current) return;
      handledCallbackRef.current = true;

      // Xóa URL params và session storage ngay lập tức để tránh gọi 2 lần (React StrictMode) hoặc khi reload trang
      window.history.replaceState({}, document.title, window.location.pathname);
      const savedState = sessionStorage.getItem('zalo_auth_state');
      const savedVerifier = sessionStorage.getItem('zalo_code_verifier');
      sessionStorage.removeItem('zalo_auth_state');
      sessionStorage.removeItem('zalo_code_verifier');

      if (!savedVerifier || state !== savedState) {
        setError('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng bấm Đăng nhập lại.');
        return;
      }

      setIsLoading(true);

      // Gửi code lên server để đổi lấy token
      fetch('/api/auth/zalo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
          code_verifier: savedVerifier,
          redirect_uri: window.location.origin
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          const detailMsg = data.details?.error_description || data.details?.error_name || '';
          setError((data.error || 'Lỗi đổi mã xác thực') + (detailMsg ? `: ${detailMsg}` : ''));
          setIsLoading(false);
          return;
        }

        const accessToken = data.tokens?.access_token;
        if (!accessToken) {
          setError('Không lấy được Access Token từ máy chủ.');
          setIsLoading(false);
          return;
        }

        // Tự gọi Zalo Graph API từ Client (vì người dùng ở VN, sẽ không bị Zalo chặn IP)
        fetch("https://graph.zalo.me/v2.0/me?fields=id,name,picture", {
          headers: {
            "access_token": accessToken,
          },
        })
        .then(profileRes => profileRes.json())
        .then(profileData => {
          if (profileData.error) {
            setError(`Zalo từ chối cung cấp thông tin: ${profileData.message || profileData.error}`);
            setIsLoading(false);
            return;
          }
          
          const avatarUrl = profileData.picture?.data?.url || "";
          
          onLogin({
            id: profileData.id,
            name: profileData.name,
            avatar: avatarUrl
          });
        })
        .catch(err => {
          setError('Lỗi khi lấy thông tin Zalo: ' + err.message);
          setIsLoading(false);
        });

      })
      .catch(err => {
        setError('Lỗi kết nối server: ' + err.message);
        setIsLoading(false);
      });
    }
  }, [onLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50/95 backdrop-blur-sm p-4 sm:p-6 fixed inset-0 z-50 overflow-y-auto">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-stone-100 flex flex-col items-center relative my-auto">
        
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="w-18 h-18 rounded-3xl overflow-hidden mb-6 shadow-md shadow-emerald-200 bg-white border border-emerald-100 p-1">
          <img src="/logo.png" alt="ChiChill Mascot" className="w-full h-full object-cover rounded-2xl" onError={(e) => {
            (e.currentTarget as any).outerHTML = '<div class="w-full h-full bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl">☕</div>';
          }} />
        </div>
        
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mb-1.5 text-center tracking-tight">
          ChiChill <span className="text-emerald-600 italic">AI</span>
        </h1>
        <p className="text-sm font-bold text-emerald-700 mb-3 text-center">
          Chi có kế hoạch · Thảnh thơi sống chất ☕
        </p>
        <p className="text-xs text-stone-500 text-center mb-8 leading-relaxed max-w-xs">
          Trợ lý tài chính AI thông minh: Ghi chép tự động từ tin nhắn, chia bill nhóm chuẩn xác, quản lý ngân sách không áp lực.
        </p>

        {error && (
          <div className="w-full bg-red-50 border border-red-100 rounded-xl p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button 
          onClick={handleZaloLogin}
          disabled={isLoading}
          className="w-full h-14 bg-[#0068FF] hover:bg-[#005AE0] text-white font-medium rounded-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-blue-500/20"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="font-bold text-lg tracking-tight">Zalo</span>
          )}
          <span className="text-base">{isLoading ? 'Đang kết nối...' : 'Đăng nhập bằng Zalo'}</span>
        </button>

        <div className="w-full mt-10 space-y-4">
          <div className="flex items-center gap-3 text-stone-500">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-500" />
            <span className="text-sm">Bảo mật thông tin bằng chuẩn OAuth 2.0</span>
          </div>
          <div className="flex items-center gap-3 text-stone-500">
            <Zap className="w-5 h-5 shrink-0 text-amber-500" />
            <span className="text-sm">Truy cập siêu tốc, không cần nhớ mật khẩu</span>
          </div>
        </div>

      </div>
    </div>
  );
}
