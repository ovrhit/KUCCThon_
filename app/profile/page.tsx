"use client";

import { useState } from "react";
import { User, Settings, Bell, HelpCircle, LogOut, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    const ok = confirm("정말로 모든 데이터를 초기화하시겠습니까? (보관함 및 영상 기록이 모두 삭제됩니다.)");
    if (!ok) return;

    setIsResetting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || "anonymous-user";

      const { error: logErr } = await supabase
        .from("gratitude_logs")
        .delete()
        .match(userId === "anonymous-user" ? {} : { user_id: userId }); 
      
      if (logErr) throw logErr;

      const { error: targetErr } = await supabase
        .from("targets")
        .delete()
        .match(userId === "anonymous-user" ? {} : { user_id: userId });

      if (targetErr) throw targetErr;

      alert("모든 데이터가 초기화되었습니다.");
      window.location.href = "/"; 
    } catch (err) {
      console.error("Reset error:", err);
      alert("초기화 중 오류가 발생했습니다.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    // 전체 배경: 홈 화면과 동일한 연한 레몬 아이보리
    <div className="min-h-screen p-6 pb-32 bg-[#FFFCF2]">
      <header className="mt-8 mb-10">
        <h1 className="text-3xl font-black tracking-tighter text-[#4A3F35] uppercase">My Page</h1>
      </header>

      {/* 1. 바깥 레이어: 두툼한 노랑-주황 그라데이션 테두리 */}
      <div className="mb-10 p-[4px] rounded-[2.2rem] bg-gradient-to-r from-[#FF9800] via-[#FFDB4B] to-[#FFE16A] shadow-[0_8px_30px_rgb(255,235,59,0.2)]">
        
        {/* 2. 내부 레이어: 흰색 박스 */}
        <div className="flex items-center space-x-4 bg-white p-6 rounded-[2rem]">
          
          {/* 프로필 아이콘 박스 */}
          <div className="w-16 h-16 bg-[#FFF67B] rounded-2xl flex items-center justify-center text-[#5C4F41] shadow-inner">
            <User size={32} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#5C4F41] tracking-tight">Grateful User</h2>
            <p className="text-xs text-[#A69785] font-medium flex items-center gap-1">
              <span className="text-[#FF9800]">🔥</span> 감사를 기록한 지 12일째
            </p>
          </div>
        </div>
      </div>

      {/* 메뉴 리스트 영역 */}
      <div className="space-y-2">
        <button className="w-full flex items-center justify-between p-4 hover:bg-[#FFFACD] rounded-2xl transition-all">
          <div className="flex items-center space-x-3 text-[#5C4F41]">
            <Settings size={20} />
            <span className="text-sm font-bold">환경 설정</span>
          </div>
        </button>
        <button className="w-full flex items-center justify-between p-4 hover:bg-[#FFFACD] rounded-2xl transition-all">
          <div className="flex items-center space-x-3 text-[#5C4F41]">
            <Bell size={20} />
            <span className="text-sm font-bold">알림 설정</span>
          </div>
        </button>
        <button className="w-full flex items-center justify-between p-4 hover:bg-[#FFFACD] rounded-2xl transition-all">
          <div className="flex items-center space-x-3 text-[#5C4F41]">
            <HelpCircle size={20} />
            <span className="text-sm font-bold">도움말 및 고객센터</span>
          </div>
        </button>
        
        {/* Reset Button for Testing (Applying the new design theme) */}
        <button 
          onClick={handleResetData}
          disabled={isResetting}
          className="w-full flex items-center justify-between p-4 hover:bg-[#FFFACD] rounded-2xl transition-all text-[#D9534F]"
        >
          <div className="flex items-center space-x-3">
            {isResetting ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
            <span className="text-sm font-bold">테스트 데이터 초기화 (전체 삭제)</span>
          </div>
        </button>

        <div className="h-px bg-[#F0E6D2] my-4 mx-4" />
        
        {/* 로그아웃 버튼 */}
        <button className="w-full flex items-center justify-between p-4 hover:bg-[#FFFACD] rounded-2xl transition-all text-[#A69785]">
          <div className="flex items-center space-x-3">
            <LogOut size={20} />
            <span className="text-sm font-bold">로그아웃</span>
          </div>
        </button>
      </div>
    </div>
  );
}
