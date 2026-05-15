"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Pencil, Plus, Video, X } from "lucide-react";
import { MOCK_TARGETS } from "@/lib/mockData";
import { createDemoTarget, fetchDemoTargets, updateDemoTargetName } from "@/lib/targets";
import { Target } from "@/types";

export default function Home() {
  const [targets, setTargets] = useState<Target[]>(MOCK_TARGETS);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchDemoTargets().then(setTargets);
  }, []);

  const addTarget = async () => {
    if (!newName.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const target = await createDemoTarget(newName);
      setTargets((current) => [...current, target]);
      setNewName("");
      setIsAdding(false);
    } catch (error) {
      console.error("Add target error:", error);
      alert("대상을 추가하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (target: Target) => {
    setEditingId(target.id);
    setEditingName(target.name);
  };

  const saveTargetName = async () => {
    if (!editingId || !editingName.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const updated = await updateDemoTargetName(editingId, editingName);
      setTargets((current) => current.map((target) => (target.id === updated.id ? updated : target)));
      setEditingId(null);
      setEditingName("");
    } catch (error) {
      console.error("Update target error:", error);
      alert("이름을 변경하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-10 pb-32 bg-[#FFFCF2]">
      <header className="mt-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-[#4A3F35] uppercase">Hanpyeon</h1>
          <p className="text-[11px] text-[#D4B872] font-bold uppercase tracking-widest mt-1">My Logs</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3">
        {targets.map((target) => {
          const isEditing = editingId === target.id;

          return (
            <div
              key={target.id}
              className="group relative flex items-center justify-between gap-3 bg-white hover:bg-[#FFFACD] p-4 rounded-2xl transition-all border border-[#F0E6D2] shadow-sm"
            >
              {isEditing ? (
                <div className="flex-1 flex items-center space-x-4 min-w-0">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${target.color}`} />
                  <div className="min-w-0">
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") saveTargetName();
                        if (event.key === "Escape") setEditingId(null);
                      }}
                      className="w-full bg-transparent text-sm font-bold text-[#5C4F41] outline-none border-b border-[#D4B872]"
                    />
                    <p className="text-[10px] text-[#A69785] font-medium truncate">{target.description}</p>
                  </div>
                </div>
              ) : (
              <Link href={`/target/${target.id}`} className="flex-1 flex items-center space-x-4 min-w-0">
                <div className={`w-3 h-3 rounded-full shrink-0 ${target.color}`} />
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[#5C4F41] truncate">{target.name}</h2>
                  <p className="text-[10px] text-[#A69785] font-medium truncate">{target.description}</p>
                </div>
              </Link>
              )}

              {isEditing ? (
                <button
                  onClick={saveTargetName}
                  disabled={isSaving}
                  className="p-3 bg-[#4A3F35] text-white rounded-xl shadow-sm active:scale-95 transition-all disabled:opacity-50"
                  aria-label="이름 저장"
                >
                  <Check size={18} />
                </button>
              ) : (
                <button
                  onClick={() => startEditing(target)}
                  className="p-3 bg-white rounded-xl shadow-sm active:scale-95 transition-all text-[#A69785] border border-[#F0E6D2]"
                  aria-label={`${target.name} 이름 변경`}
                >
                  <Pencil size={18} />
                </button>
              )}

              <Link
                href={`/record?target=${target.id}`}
                className="p-3 bg-[#FFF67B] border-2 border-[#D4B872]/50 rounded-xl shadow-sm hover:bg-[#FDE047] hover:scale-105 active:scale-95 transition-all text-[#6B5700]"
                aria-label={`${target.name} 기록 남기기`}
              >
                <Video size={18} />
              </Link>
            </div>
          );
        })}

        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center space-x-2 bg-transparent border-2 border-dashed border-[#FDE047] p-4 rounded-2xl text-[#D4B872] hover:bg-[#FFFACD] transition-all active:scale-[0.98]"
          >
            <Plus size={16} />
            <span className="text-xs font-bold">대상 추가</span>
          </button>
        ) : (
          <div className="bg-white p-4 rounded-2xl border-2 border-[#D4B872] flex flex-col space-y-3 animate-in fade-in zoom-in duration-200 shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-[#D4B872] tracking-tighter">New Target</span>
              <button onClick={() => setIsAdding(false)} className="text-[#A69785] hover:text-[#4A3F35]" aria-label="닫기">
                <X size={14} />
              </button>
            </div>
            <input
              autoFocus
              type="text"
              placeholder="이름 (예: 엄마, 친구)"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addTarget()}
              className="bg-transparent text-sm font-bold outline-none border-b border-[#F0E6D2] pb-1 text-[#5C4F41] placeholder:text-[#A69785]/50"
            />
            <button
              onClick={addTarget}
              disabled={isSaving || !newName.trim()}
              className="w-full bg-[#FFF67B] text-[#6B5700] py-2 rounded-xl text-xs font-black active:scale-95 transition-transform border border-[#D4B872]/50 disabled:opacity-50"
            >
              추가하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
