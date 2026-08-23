import React, { useState, useEffect } from 'react';
import { Coffee, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { generateRandomString, generateCodeChallenge } from '../utils/pkce';

interface LoginViewProps {
  onLogin: (user: any) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Lấy App ID từ biến môi trường của Vite
  const ZALO_APP_ID = import.meta.env.VITE_ZALO_APP_ID || '';

  const handleZaloLogin = async () => {
    if (!ZALO_APP_ID) {
      setError('Lỗi: Chưa cấu hình VITE_ZALO_APP_ID trong môi trường!');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // 1. Khởi tạo PKCE
      const codeVerifier = generateRandomString(43);
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateRandomString(12);

      // 2. Lưu state và verifier vào session để check lúc callback
      sessionStorage.setItem('zalo_auth_state', state);
      sessionStorage.setItem('zalo_code_verifier', codeVerifier);

      // 3. Xây dựng Callback URL (chính là trang hiện tại)
      const redirectUri = window.location.origin;

      // 4. Redirect qua Zalo OAuth V4
      const oauthUrl = `https://oauth.zaloapp.com/v4/permission?app_id=${ZALO_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge=${codeChallenge}&state=${state}`;
      
      window.location.href = oauthUrl;
    } catch (err: any) {
      setIsLoading(false);
      setError('Lỗi tạo request đăng nhập: ' + err.message);
    }
  };

  // 5. Xử lý Callback từ Zalo
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      const savedState = sessionStorage.getItem('zalo_auth_state');
      const savedVerifier = sessionStorage.getItem('zalo_code_verifier');

      if (state !== savedState) {
        setError('Lỗi bảo mật: Trạng thái (state) không khớp!');
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
          setError(data.error);
          setIsLoading(false);
        } else {
          // Xóa URL params cho sạch
          window.history.replaceState({}, document.title, window.location.pathname);
          sessionStorage.removeItem('zalo_auth_state');
          sessionStorage.removeItem('zalo_code_verifier');
          onLogin(data.user);
        }
      })
      .catch(err => {
        setError('Lỗi kết nối server: ' + err.message);
        setIsLoading(false);
      });
    }
  }, [onLogin]);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-emerald-50 via-white to-emerald-50/30 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
      <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-40 h-40 bg-teal-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-sm mx-auto flex flex-col items-center z-10 relative">
        {/* App Branding */}
        <div className="mb-6 rotate-3">
          <img src="/logo.png" alt="ChiChill Logo" className="w-20 h-20 rounded-3xl shadow-lg shadow-emerald-200 object-cover bg-white" onError={(e) => {
            (e.currentTarget as any).outerHTML = '<div class="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-200"><svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white fill-white/20"><path d="M18 3a3 3 0 0 0 0 6 3 3 0 0 0 0-6m-3 3c-2.5 0-4.5 2-4.5 5 0 3.5 3 5 6 5s2-1.5 2-2"></path></svg></div>';
          }} />
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight text-center mb-2">
          ChiChill <span className="text-emerald-600 italic">AI</span>
        </h1>
        <p className="text-sm font-medium text-gray-500 text-center mb-10 px-4">
          Trợ lý quản lý chi tiêu nhẹ nhàng, không áp lực dành cho dân văn phòng.
        </p>

        {/* Login Card */}
        <div className="w-full bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl shadow-emerald-100/50 border border-white space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-gray-800">Đăng nhập để tiếp tục</h2>
            <p className="text-xs text-gray-500">Đồng bộ dữ liệu an toàn trên thiết bị của bạn.</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 font-medium">{error}</p>
            </div>
          )}

          <button
            onClick={handleZaloLogin}
            disabled={isLoading}
            className="w-full relative group h-12 flex items-center justify-center gap-3 bg-[#0068FF] hover:bg-[#0055D4] active:bg-[#0047B3] text-white rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 shadow-md shadow-blue-200"
          >
            {isLoading ? (
              <Zap className="w-5 h-5 animate-pulse text-white/80" />
            ) : (
              // Simple mock Zalo logo using text or a customized shape
              <div className="font-black text-lg tracking-tighter bg-white text-[#0068FF] rounded-md px-1.5 py-0 leading-none">Zalo</div>
            )}
            
            <span>{isLoading ? 'Đang kết nối...' : 'Đăng nhập bằng Zalo'}</span>
            
            {!isLoading && (
              <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ShieldCheck className="w-4 h-4 text-blue-200" />
              </div>
            )}
          </button>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Dữ liệu của bạn được mã hóa an toàn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
