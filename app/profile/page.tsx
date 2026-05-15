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

      // 1. Delete all logs (This will trigger RLS or direct delete if permitted)
      // Since we use ON DELETE CASCADE in SQL, deleting targets might be enough.
      // But for safety and storage cleanup, we'll delete logs first.
      
      const { error: logErr } = await supabase
        .from("gratitude_logs")
        .delete()
        .match(userId === "anonymous-user" ? {} : { user_id: userId }); // Caution: empty match deletes all in some cases if not careful with RLS
      
      if (logErr) throw logErr;

      const { error: targetErr } = await supabase
        .from("targets")
        .delete()
        .match(userId === "anonymous-user" ? {} : { user_id: userId });

      if (targetErr) throw targetErr;

      alert("모든 데이터가 초기화되었습니다.");
      window.location.href = "/"; // Refresh to initial state
    } catch (err) {
      console.error("Reset error:", err);
      alert("초기화 중 오류가 발생했습니다.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-6 pb-32">
      <header className="mt-8 mb-10">
        <h1 className="text-3xl font-black tracking-tighter text-black uppercase">My Page</h1>
      </header>

      <div className="flex items-center space-x-4 mb-10 bg-gray-50 p-6 rounded-3xl">
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold italic">Grateful User</h2>
          <p className="text-xs text-gray-400 font-medium">테스트 모드 작동 중</p>
        </div>
      </div>

      <div className="space-y-2">
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all">
          <div className="flex items-center space-x-3 text-gray-700">
            <Settings size={20} />
            <span className="text-sm font-bold">환경 설정</span>
          </div>
        </button>
        
        {/* Reset Button for Testing */}
        <button 
          onClick={handleResetData}
          disabled={isResetting}
          className="w-full flex items-center justify-between p-4 hover:bg-red-50 rounded-2xl transition-all text-red-600"
        >
          <div className="flex items-center space-x-3">
            {isResetting ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
            <span className="text-sm font-bold">테스트 데이터 초기화 (전체 삭제)</span>
          </div>
        </button>

        <div className="h-px bg-gray-100 my-4 mx-4" />
        
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all text-gray-400">
          <div className="flex items-center space-x-3">
            <LogOut size={20} />
            <span className="text-sm font-bold">로그아웃</span>
          </div>
        </button>
      </div>
    </div>
  );
}
