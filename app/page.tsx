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
    <div className="p-6 space-y-10 pb-32">
      <header className="mt-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-black uppercase">Hanpyeon</h1>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">My Logs</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3">
        {targets.map((target) => (
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

        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center space-x-2 bg-white border-2 border-dashed border-gray-200 p-4 rounded-2xl text-gray-400 hover:bg-gray-50 transition-all active:scale-[0.98]"
          >
            <Plus size={16} />
            <span className="text-xs font-bold">새 대상 추가</span>
          </button>
        ) : (
          <div className="bg-gray-50 p-4 rounded-2xl border-2 border-black flex flex-col space-y-3 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">New Target</span>
              <button onClick={() => setIsAdding(false)}><X size={14} /></button>
            </div>
            <input 
              autoFocus
              type="text" 
              placeholder="이름 (예: 엄마, 친구들)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTarget()}
              className="bg-transparent text-sm font-bold outline-none border-b border-gray-200 pb-1"
            />
            <button 
              onClick={addTarget}
              className="w-full bg-black text-white py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform"
            >
              추가하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
