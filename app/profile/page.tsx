import { User, Settings, Bell, HelpCircle, LogOut } from "lucide-react";

export default function ProfilePage() {
  return (
    // 전체 배경: 홈 화면과 동일한 연한 레몬 아이보리
    <div className="min-h-screen p-6 pb-32 bg-[#FFFCF2]">
      <header className="mt-8 mb-10">
        <h1 className="text-3xl font-black tracking-tighter text-[#4A3F35] uppercase">My Page</h1>
      </header>

      {/* 프로필 카드 영역: 흰색 배경에 따뜻한 테두리 추가 */}
      <div className="flex items-center space-x-4 mb-10 bg-white border border-[#F0E6D2] shadow-sm p-6 rounded-3xl">
        {/* 말씀하신 화사한 레몬 컬러(#FFF67B)를 프로필 아이콘 배경으로 적용! */}
        <div className="w-16 h-16 bg-[#FFF67B] rounded-2xl flex items-center justify-center text-[#5C4F41]">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold italic text-[#5C4F41]">Grateful User</h2>
          <p className="text-xs text-[#A69785] font-medium">감사를 기록한 지 12일째</p>
        </div>
      </div>

      {/* 메뉴 리스트 영역 */}
      <div className="space-y-2">
        {/* hover 시 레몬 쉬폰(#FFFACD) 색상으로 부드럽게 변경 */}
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
        
        {/* 구분선 색상도 부드러운 베이지로 변경 */}
        <div className="h-px bg-[#F0E6D2] my-4 mx-4" />
        
        {/* 로그아웃 버튼: 기존 쨍한 빨간색 대신 앱 컬러와 어울리는 톤다운된 레드(#D9534F) 사용 */}
        <button className="w-full flex items-center justify-between p-4 hover:bg-[#FFFACD] rounded-2xl transition-all text-[#D9534F]">
          <div className="flex items-center space-x-3">
            <LogOut size={20} />
            <span className="text-sm font-bold">로그아웃</span>
          </div>
        </button>
      </div>
    </div>
  );
}