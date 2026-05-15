"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Loader2, Play, X } from "lucide-react";
import { MOCK_TARGETS, resolveTargetId } from "@/lib/mockData";
import { GratitudeLog } from "@/types";

type ReelLogResponse = {
  id: string;
  target_id: string;
  message: string;
  video_url: string;
  video_public_url: string;
  recorded_date: string;
  created_at?: string;
};

function toGratitudeLog(item: ReelLogResponse): GratitudeLog {
  return {
    id: item.id,
    targetId: item.target_id,
    message: item.message,
    videoUrl: item.video_public_url || item.video_url,
    thumbnailUrl: null,
    recordedDate: item.recorded_date,
    createdAt: item.created_at ?? "",
  };
}

export default function TargetDetailPage() {
  const params = useParams();
  const targetId = resolveTargetId(params?.id as string);
  const target = MOCK_TARGETS.find((item) => item.id === targetId || item.slug === params?.id);

  const [logs, setLogs] = useState<GratitudeLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<GratitudeLog | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/reels/${targetId}`, { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "기록을 불러오지 못했습니다.");
        }

        setLogs((payload.logs ?? []).map(toGratitudeLog).reverse());
      } catch (fetchError) {
        console.error("Fetch logs error:", fetchError);
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (targetId) fetchLogs();
  }, [targetId]);

  if (!target) {
    return <div className="p-6 text-center mt-20">대상을 찾을 수 없습니다.</div>;
  }

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

    return {
      day,
      log: logs.find((log) => log.recordedDate === dateStr),
    };
  });

  return (
    <div className="min-h-screen bg-white pb-32">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <Link href="/" className="p-2 -ml-2 text-black">
          <ChevronLeft size={28} />
        </Link>
        <h1 className="text-xl font-bold">{target.name}</h1>
        <div className="w-10" />
      </header>

      <div className="px-6 mt-2">
        <div className="bg-gray-50 rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-lg">
              {currentYear}년 {currentMonth}월
            </h2>
            <Link href={`/replay/${targetId}`} className="flex items-center space-x-1 text-xs bg-black text-white px-4 py-2 rounded-full shadow-md hover:scale-105 transition-transform">
              <Play size={14} fill="white" />
              <span className="font-medium">릴스 감상</span>
            </Link>
          </div>

          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="animate-spin text-gray-300" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map(({ day, log }) => (
                <button
                  key={day}
                  onClick={() => log && setSelectedLog(log)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all relative overflow-hidden ${
                    log ? "scale-105 shadow-md border-2 border-black bg-black text-white" : "bg-white text-gray-300 border border-gray-100"
                  }`}
                >
                  {log ? (
                    <video src={log.videoUrl} muted playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                  ) : null}
                  <span className="relative z-10">{day}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-6 mt-10 space-y-4">
        <h3 className="font-bold text-gray-400 text-[11px] uppercase tracking-widest pl-1">Recent Logs</h3>
        {logs.length === 0 && !isLoading ? (
          <p className="text-sm text-gray-300 italic pl-1">아직 기록이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {logs.slice(0, 4).map((log) => (
              <button
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="aspect-video bg-gray-100 rounded-2xl overflow-hidden relative shadow-sm border border-gray-200/50 active:scale-95 transition-transform"
              >
                <video src={log.videoUrl} muted playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white tracking-wider">
                  {log.recordedDate.split("-").slice(1).join(".")}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-24 left-0 right-0 px-6 z-20">
        <Link
          href={`/record?target=${targetId}`}
          className={`w-full h-14 ${target.color} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-xl hover:brightness-110 active:scale-[0.98] transition-all`}
        >
          기록 남기기
        </Link>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <button onClick={() => setSelectedLog(null)} className="absolute top-10 right-6 text-white p-2 z-50">
            <X size={32} />
          </button>
          <div className="w-full max-w-2xl aspect-video bg-black rounded-2xl overflow-hidden relative">
            <video src={selectedLog.videoUrl} autoPlay controls className="w-full h-full object-contain" />
            <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
              <p className="text-xl font-bold">{selectedLog.message}</p>
              <p className="text-sm text-white/50 mt-1">{selectedLog.recordedDate}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
