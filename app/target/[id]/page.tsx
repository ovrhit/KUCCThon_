"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { MOCK_TARGETS, resolveTargetId } from "@/lib/mockData";
import Link from "next/link";
import { ChevronLeft, Play, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { VIDEO_BUCKET } from "@/lib/supabase/paths";
import { GratitudeLog } from "@/types";

export default function TargetDetailPage() {
  const params = useParams();
  const targetId = resolveTargetId(params?.id as string);
  const target = MOCK_TARGETS.find(t => t.id === targetId);

  const [logs, setLogs] = useState<GratitudeLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<GratitudeLog | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  useEffect(() => {
    async function fetchLogs() {
      try {
        const { data, error } = await supabase
          .from("gratitude_logs")
          .select("*")
          .eq("target_id", targetId)
          .order("recorded_date", { ascending: false });

        if (error) throw error;
        
        const formattedLogs: GratitudeLog[] = (data || []).map(item => ({
          id: item.id,
          targetId: item.target_id,
          message: item.message,
          videoUrl: item.video_url,
          thumbnailUrl: item.thumbnail_url,
          recordedDate: item.recorded_date,
          createdAt: item.created_at
        }));

        setLogs(formattedLogs);
      } catch (err) {
        console.error("Fetch logs error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (targetId) fetchLogs();
  }, [targetId]);

  if (!target) return <div className="p-6 text-center mt-20">대상을 찾을 수 없습니다.</div>;

  const getPublicUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    return supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path).data.publicUrl;
  };

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return {
      day,
      log: logs.find(l => l.recordedDate === dateStr)
    };
  });

  return (
    <div className="min-h-screen bg-[#FFFCF2] pb-32">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-[#FFFCF2]/80 backdrop-blur-md z-10">
        <Link href="/" className="p-2 -ml-2 text-[#4A3F35]"><ChevronLeft size={28} /></Link>
        <h1 className="text-xl font-black text-[#4A3F35] tracking-tight">{target.name}</h1>
        <div className="w-10" />
      </header>

      <div className="px-6 mt-2">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#F0E6D2]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-[#5C4F41]">{currentYear}년 {currentMonth}월</h2>
            <Link href={`/replay/${targetId}`} className="flex items-center space-x-1 text-xs bg-[#FFF67B] text-[#6B5700] px-4 py-2 rounded-full border border-[#D4B872]/50 shadow-sm hover:scale-105 transition-transform font-black">
              <Play size={14} fill="currentColor" />
              <span>릴스 감상</span>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="h-40 flex items-center justify-center"><Loader2 className="animate-spin text-[#D4B872]" /></div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map(({ day, log }) => (
                <button 
                  key={day} 
                  onClick={() => log && setSelectedLog(log)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all relative overflow-hidden ${
                    log ? "scale-105 shadow-md border-2 border-[#D4B872] bg-white" : "bg-[#F9F7F0] text-[#D4B872] border border-[#F0E6D2]"
                  }`}
                >
                  {log ? (
                    <img 
                      src={getPublicUrl(log.thumbnailUrl || "")} 
                      alt={day.toString()} 
                      className="absolute inset-0 w-full h-full object-cover opacity-80"
                    />
                  ) : null}
                  <span className={`relative z-10 ${log ? "text-white drop-shadow-md font-black" : ""}`}>{day}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 mt-10 space-y-4">
        <h3 className="font-black text-[#D4B872] text-[10px] uppercase tracking-widest pl-1">Recent Logs</h3>
        {logs.length === 0 && !isLoading ? (
          <p className="text-sm text-[#A69785] italic pl-1">아직 기록이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {logs.slice(0, 4).map((log) => (
              <button 
                key={log.id} 
                onClick={() => setSelectedLog(log)}
                className="aspect-video bg-white rounded-2xl overflow-hidden relative shadow-sm border border-[#F0E6D2] active:scale-95 transition-transform"
              >
                <img src={getPublicUrl(log.thumbnailUrl || "")} className="absolute inset-0 w-full h-full object-cover" alt="thumb" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white tracking-wider">
                  {log.recordedDate.split('-').slice(1).join('.')}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-24 left-0 right-0 px-6 z-20">
        <Link 
          href={`/record?target=${targetId}`}
          className="w-full h-14 bg-[#FFF67B] rounded-2xl flex items-center justify-center text-[#6B5700] font-black text-lg shadow-lg border border-[#D4B872]/50 active:scale-[0.98] transition-all"
        >
          기록 남기기
        </Link>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <button onClick={() => setSelectedLog(null)} className="absolute top-10 right-6 text-white p-2 z-50"><X size={32} /></button>
          <div className="w-full max-w-2xl aspect-video bg-black rounded-3xl overflow-hidden relative shadow-2xl border border-white/10">
            <video 
              src={getPublicUrl(selectedLog.videoUrl)} 
              autoPlay 
              controls 
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-8 left-8 right-8 text-white pointer-events-none drop-shadow-md">
              <p className="text-xl font-black italic tracking-tight">{selectedLog.message}</p>
              <p className="text-[10px] text-white/50 font-bold mt-2 uppercase tracking-widest">{selectedLog.recordedDate}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
