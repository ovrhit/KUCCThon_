"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_TARGETS as INITIAL_TARGETS } from "@/lib/mockData";
import { Plus, Video, X } from "lucide-react";

export default function Home() {
  const [targets, setTargets] = useState(INITIAL_TARGETS);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const addTarget = () => {
    if (!newName.trim()) return;
    const newTarget = {
      id: `target-${Date.now()}`,
      name: newName,
      description: "새로 추가된 보관함",
      color: "bg-emerald-500"
    };
    setTargets([...targets, newTarget]);
    setNewName("");
    setIsAdding(false);
  };

  return (
    // 전체 배경: 아주 연한 레몬 아이보리빛 (#FFFCF2)
    <div className="min-h-screen p-6 space-y-10 pb-32 bg-[#FFFCF2]">
      <header className="mt-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-[#4A3F35] uppercase">Hanpyeon</h1>
          <p className="text-[11px] text-[#D4B872] font-bold uppercase tracking-widest mt-1">My Logs</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3">
        {targets.map((target) => (
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
            
            <Link 
              href={`/record?target=${target.id}`}
              className="p-3 bg-[#FFF67B] border-2 border-[#D4B872]/50 rounded-xl shadow-sm hover:bg-[#FDE047] hover:scale-105 active:scale-95 transition-all text-[#6B5700]"
            >
              <Video size={18} />
            </Link>
          </div>
        ))}

        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center space-x-2 bg-transparent border-2 border-dashed border-[#FDE047] p-4 rounded-2xl text-[#D4B872] hover:bg-[#FFFACD] transition-all active:scale-[0.98]"
          >
            <Plus size={16} />
            <span className="text-xs font-bold">새 대상 추가</span>
          </button>
        ) : (
          <div className="bg-white p-4 rounded-2xl border-2 border-[#D4B872] flex flex-col space-y-3 animate-in fade-in zoom-in duration-200 shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-[#D4B872] tracking-tighter">New Target</span>
              <button onClick={() => setIsAdding(false)} className="text-[#A69785] hover:text-[#4A3F35]"><X size={14} /></button>
            </div>
            <input 
              autoFocus
              type="text" 
              placeholder="이름 (예: 엄마, 친구들)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTarget()}
              className="bg-transparent text-sm font-bold outline-none border-b border-[#F0E6D2] pb-1 text-[#5C4F41] placeholder:text-[#A69785]/50"
            />
            <button 
              onClick={addTarget}
              className="w-full bg-[#FFF67B] text-[#6B5700] py-2 rounded-xl text-xs font-black active:scale-95 transition-transform border border-[#D4B872]/50"
            >
              추가하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
