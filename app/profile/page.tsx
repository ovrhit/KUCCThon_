import { User, Settings, Bell, HelpCircle, LogOut } from "lucide-react";

export default function ProfilePage() {
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
          <p className="text-xs text-gray-400 font-medium">감사를 기록한 지 12일째</p>
        </div>
      </div>

      <div className="space-y-2">
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all">
          <div className="flex items-center space-x-3 text-gray-700">
            <Settings size={20} />
            <span className="text-sm font-bold">환경 설정</span>
          </div>
        </button>
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all">
          <div className="flex items-center space-x-3 text-gray-700">
            <Bell size={20} />
            <span className="text-sm font-bold">알림 설정</span>
          </div>
        </button>
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all">
          <div className="flex items-center space-x-3 text-gray-700">
            <HelpCircle size={20} />
            <span className="text-sm font-bold">도움말 및 고객센터</span>
          </div>
        </button>
        <div className="h-px bg-gray-100 my-4 mx-4" />
        <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all text-red-500">
          <div className="flex items-center space-x-3">
            <LogOut size={20} />
            <span className="text-sm font-bold">로그아웃</span>
          </div>
        </button>
      </div>
    </div>
  );
}
