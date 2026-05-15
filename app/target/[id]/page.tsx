"use client";

import { useParams } from "next/navigation";
import { MOCK_TARGETS } from "@/lib/mockData";
import Link from "next/link";
import { ChevronLeft, Play } from "lucide-react";

export default function TargetDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const target = MOCK_TARGETS.find(t => t.id === id);

  if (!target) return <div className="p-6 text-center mt-20">대상을 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <header className="p-6 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <Link href="/" className="p-2 -ml-2"><ChevronLeft size={28} /></Link>
        <h1 className="text-xl font-bold">{target.name}</h1>
        <button className="text-sm font-semibold text-gray-500">편집</button>
      </header>

      {/* Calendar Area (Setlog style) */}
      <div className="px-6 mt-2">
        <div className="bg-gray-50 rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">2024년 5월</h2>
            <Link href={`/replay/${id}`} className="flex items-center space-x-1 text-xs bg-black text-white px-4 py-2 rounded-full shadow-md hover:scale-105 transition-transform">
              <Play size={14} fill="white" />
              <span className="font-medium">릴스 감상</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }).map((_, i) => {
              const hasLog = [3, 10, 15, 22].includes(i + 1);
              return (
                <div 
                  key={i} 
                  className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    hasLog ? "bg-black text-white scale-110 shadow-md" : "bg-white text-gray-400 border border-gray-200"
                  }`}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Logs Preview */}
      <div className="px-6 mt-10 space-y-4">
        <h3 className="font-bold text-gray-400 text-[11px] uppercase tracking-widest pl-1">Recent Logs</h3>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] bg-gray-200 rounded-2xl overflow-hidden relative shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white tracking-wider">05.1{i}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Record Button */}
      <div className="fixed bottom-24 left-0 right-0 px-6 z-20">
        <Link 
          href={`/record?target=${id}`}
          className={`w-full h-14 ${target.color} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-xl hover:brightness-110 active:scale-[0.98] transition-all`}
        >
          기록 남기기
        </Link>
      </div>
    </div>
  );
}
