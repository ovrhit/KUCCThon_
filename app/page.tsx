import Link from "next/link";
import { MOCK_TARGETS } from "@/lib/mockData";
import { Plus, Video } from "lucide-react";

export default function Home() {
  return (
    <div className="p-6 space-y-10 pb-32">
      <header className="mt-8">
        <h1 className="text-3xl font-black tracking-tighter text-black uppercase">Hanpyeon</h1>
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">My Logs</p>
      </header>

      <div className="grid grid-cols-1 gap-3">
        {MOCK_TARGETS.map((target) => (
          <div 
            key={target.id}
            className="group relative flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-4 rounded-2xl transition-all border border-gray-100"
          >
            <Link 
              href={`/target/${target.id}`}
              className="flex-1 flex items-center space-x-4"
            >
              <div className={`w-3 h-3 rounded-full ${target.color}`} />
              <div>
                <h2 className="text-sm font-bold text-gray-800">{target.name}</h2>
                <p className="text-[10px] text-gray-400 font-medium">{target.description}</p>
              </div>
            </Link>
            
            <Link 
              href={`/record?target=${target.id}`}
              className="p-3 bg-white rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all text-gray-600 border border-gray-100"
            >
              <Video size={18} />
            </Link>
          </div>
        ))}

        <button className="flex items-center justify-center space-x-2 bg-white border-2 border-dashed border-gray-200 p-4 rounded-2xl text-gray-400 hover:bg-gray-50 transition-all active:scale-[0.98]">
          <Plus size={16} />
          <span className="text-xs font-bold">새 대상 추가</span>
        </button>
      </div>
    </div>
  );
}
