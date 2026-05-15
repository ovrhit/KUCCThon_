"use client";

import { useState } from "react";
import { Bell, HelpCircle, Loader2, LogOut, Settings, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { resetDemoData } from "@/lib/demoReset";

export default function ProfilePage() {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    const ok = confirm("테스트 데이터를 초기화할까요? 영상 기록과 추가한 대상이 삭제되고 기본 대상만 남습니다.");
    if (!ok) return;

    setIsResetting(true);
    try {
      await resetDemoData();
      alert("테스트 데이터가 초기화되었습니다.");
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Reset error:", err);
      alert(err instanceof Error ? err.message : "초기화 중 오류가 발생했습니다.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 pb-32 bg-[#FFFCF2]">
      <header className="mt-8 mb-10">
        <h1 className="text-3xl font-black tracking-tighter text-[#4A3F35] uppercase">My Page</h1>
      </header>

      <div className="flex items-center space-x-4 mb-10 bg-white border border-[#F0E6D2] shadow-sm p-6 rounded-3xl">
        <div className="w-16 h-16 bg-[#FFF67B] rounded-2xl flex items-center justify-center text-[#5C4F41]">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold italic text-[#5C4F41]">Grateful User</h2>
          <p className="text-xs text-[#A69785] font-medium">감사를 기록하는 중</p>
        </div>
      </div>

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
            <span className="text-sm font-bold">도움말</span>
          </div>
        </button>

        <button
          onClick={handleResetData}
          disabled={isResetting}
          className="w-full flex items-center justify-between p-4 hover:bg-[#FFFACD] rounded-2xl transition-all text-[#D9534F] disabled:opacity-50"
        >
          <div className="flex items-center space-x-3">
            {isResetting ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
            <span className="text-sm font-bold">테스트 데이터 초기화</span>
          </div>
        </button>

        <div className="h-px bg-[#F0E6D2] my-4 mx-4" />

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
