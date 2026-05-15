import Link from "next/link";
import { MOCK_TARGETS } from "@/lib/mockData";
import { Plus, Video } from "lucide-react";

export default function Home() {
  return (
    // 전체 배경: 아주 연한 레몬 아이보리빛 (#FFFCF2)
    <div className="min-h-screen p-6 space-y-10 pb-32 bg-[#FFFCF2]">
      <header className="mt-8">
        <h1 className="text-3xl font-black tracking-tighter text-[#4A3F35] uppercase">Hanpyeon</h1>
        <p className="text-[11px] text-[#D4B872] font-bold uppercase tracking-widest mt-1">My Logs</p>
      </header>

      <div className="grid grid-cols-1 gap-3">
        {MOCK_TARGETS.map((target) => (
          <div 
            key={target.id}
            className="group relative flex items-center justify-between bg-white hover:bg-[#FFFACD] p-4 rounded-2xl transition-all border border-[#F0E6D2] shadow-sm"
          >
            <Link 
              href={`/target/${target.id}`}
              className="flex-1 flex items-center space-x-4"
            >
              <div className={`w-3 h-3 rounded-full ${target.color}`} />
              <div>
                <h2 className="text-sm font-bold text-[#5C4F41]">{target.name}</h2>
                <p className="text-[10px] text-[#A69785] font-medium">{target.description}</p>
              </div>
            </Link>
            
            {/* ✨ 녹화 버튼: 아주 얇은 골드빛 테두리(border border-[#D4B872]/50) 추가 */}
            <Link 
              href={`/record?target=${target.id}`}
              className="p-3 bg-[#FFF67B] border-2 border[#D4B872]/50 rounded-xl shadow-sm hover:bg-[#FDE047] hover:scale-105 active:scale-95 transition-all text-[#6B5700]"
            >
              <Video size={18} />
            </Link>
          </div>
        ))}

        <button className="flex items-center justify-center space-x-2 bg-transparent border-2 border-dashed border-[#FDE047] p-4 rounded-2xl text-[#D4B872] hover:bg-[#FFFACD] transition-all active:scale-[0.98]">
          <Plus size={16} />
          <span className="text-xs font-bold">새 대상 추가</span>
        </button>
      </div>
    </div>
  );
}