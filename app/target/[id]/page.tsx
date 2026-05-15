"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, Play, X } from "lucide-react";
import { resolveTargetId } from "@/lib/mockData";
import { fetchDemoTargets, updateDemoTargetName } from "@/lib/targets";
import { supabase } from "@/lib/supabase/client";
import { VIDEO_BUCKET } from "@/lib/supabase/paths";
import { GratitudeLog, Target } from "@/types";

export default function TargetDetailPage() {
  const params = useParams();
  const targetId = resolveTargetId(params?.id as string);

  const [target, setTarget] = useState<Target | null>(null);
  const [logs, setLogs] = useState<GratitudeLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<GratitudeLog | null>(null);
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const currentYear = calendarDate.getFullYear();
  const currentMonth = calendarDate.getMonth() + 1;

  useEffect(() => {
    async function fetchTarget() {
      const targets = await fetchDemoTargets();
      const nextTarget = targets.find((item) => item.id === targetId) ?? null;
      setTarget(nextTarget);
      setEditingName(nextTarget?.name ?? "");
    }

    fetchTarget();
  }, [targetId]);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const { data, error } = await supabase
          .from("gratitude_logs")
          .select("*")
          .eq("target_id", targetId)
          .order("recorded_date", { ascending: false });

        if (error) throw error;

        const formattedLogs: GratitudeLog[] = (data || []).map((item) => ({
          id: item.id,
          targetId: item.target_id,
          message: item.message,
          videoUrl: item.video_url,
          thumbnailUrl: item.thumbnail_url,
          recordedDate: item.recorded_date,
          createdAt: item.created_at,
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

  const getPublicUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    return supabase.storage.from(VIDEO_BUCKET).getPublicUrl(path).data.publicUrl;
  };

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const monthReplayHref = `/replay/${targetId}?mode=month&year=${currentYear}&month=${currentMonth}`;
  const last30ReplayHref = `/replay/${targetId}?mode=last30`;

  const moveMonth = (offset: number) => {
    setCalendarDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const startEditingName = () => {
    if (!target) return;
    setEditingName(target.name);
    setIsEditingName(true);
  };

  const cancelEditingName = () => {
    setEditingName(target?.name ?? "");
    setIsEditingName(false);
  };

  const saveTargetName = async () => {
    if (!target || !editingName.trim() || isSavingName) return;

    setIsSavingName(true);
    try {
      const updated = await updateDemoTargetName(target.id, editingName);
      setTarget(updated);
      setEditingName(updated.name);
      setIsEditingName(false);
    } catch (error) {
      console.error("Update target error:", error);
      alert("이름을 변경하지 못했습니다.");
    } finally {
      setIsSavingName(false);
    }
  };

  if (!target) return <div className="p-6 text-center mt-20">대상을 찾을 수 없습니다.</div>;

  const calendarDays = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

    return {
      day,
      log: logs.find((log) => log.recordedDate === dateStr),
    };
  });

  const renderLogPreview = (log: GratitudeLog, className: string) => {
    if (log.thumbnailUrl) {
      return <img src={getPublicUrl(log.thumbnailUrl)} className={className} alt="thumb" />;
    }

    return (
      <video
        src={getPublicUrl(log.videoUrl)}
        muted
        playsInline
        preload="metadata"
        className={className}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFCF2] pb-32">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-[#FFFCF2]/80 backdrop-blur-md z-10">
        <Link href="/" className="p-2 -ml-2 text-[#4A3F35]">
          <ChevronLeft size={28} />
        </Link>
        <div className="flex-1 px-3 text-center min-w-0">
          {isEditingName ? (
            <input
              autoFocus
              value={editingName}
              onChange={(event) => setEditingName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") saveTargetName();
                if (event.key === "Escape") cancelEditingName();
              }}
              className="w-full max-w-48 bg-white border border-[#D4B872]/60 rounded-xl px-3 py-2 text-center text-sm font-black text-[#4A3F35] outline-none"
            />
          ) : (
            <h1 className="text-xl font-black text-[#4A3F35] tracking-tight truncate">{target.name}</h1>
          )}
        </div>
        {isEditingName ? (
          <div className="flex items-center gap-1">
            <button
              onClick={cancelEditingName}
              className="px-3 py-2 text-[11px] font-bold text-[#A69785]"
            >
              취소
            </button>
            <button
              onClick={saveTargetName}
              disabled={isSavingName || !editingName.trim()}
              className="min-w-12 px-3 py-2 rounded-full bg-[#4A3F35] text-white text-[11px] font-black disabled:opacity-40"
            >
              {isSavingName ? <Loader2 size={14} className="mx-auto animate-spin" /> : "저장"}
            </button>
          </div>
        ) : (
          <button
            onClick={startEditingName}
            className="px-3 py-2 rounded-full bg-white border border-[#F0E6D2] text-[#A69785] text-[11px] font-black shadow-sm"
          >
            이름 수정
          </button>
        )}
      </header>

      <div className="px-6 mt-2">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#F0E6D2]">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => moveMonth(-1)}
                className="w-8 h-8 rounded-full bg-[#F9F7F0] border border-[#F0E6D2] flex items-center justify-center text-[#6B5700]"
                aria-label="이전 달"
              >
                <ChevronLeft size={16} />
              </button>
              <h2 className="font-bold text-[#5C4F41] min-w-24 text-center">
                {currentYear}.{currentMonth.toString().padStart(2, "0")}
              </h2>
              <button
                onClick={() => moveMonth(1)}
                className="w-8 h-8 rounded-full bg-[#F9F7F0] border border-[#F0E6D2] flex items-center justify-center text-[#6B5700]"
                aria-label="다음 달"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <Link href={monthReplayHref} className="flex items-center space-x-1 text-xs bg-[#FFF67B] text-[#6B5700] px-4 py-2 rounded-full border border-[#D4B872]/50 shadow-sm hover:scale-105 transition-transform font-black">
              <Play size={14} fill="currentColor" />
              <span>월 한편</span>
            </Link>
          </div>

          <div className="flex justify-end mb-6">
            <Link href={last30ReplayHref} className="text-xs bg-[#F9F7F0] text-[#6B5700] px-4 py-2 rounded-full border border-[#F0E6D2] font-black">
              최근 30일
            </Link>
          </div>

          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="animate-spin text-[#D4B872]" />
            </div>
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
                  {log ? renderLogPreview(log, "absolute inset-0 w-full h-full object-cover opacity-80") : null}
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
                {renderLogPreview(log, "absolute inset-0 w-full h-full object-cover")}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-[10px] font-bold text-white tracking-wider">
                  <span className="shrink-0">{log.recordedDate.split("-").slice(1).join(".")}</span>
                  <span className="min-w-0 truncate text-left">{log.message}</span>
                </div>
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
          <button onClick={() => setSelectedLog(null)} className="absolute top-10 right-6 text-white p-2 z-50">
            <X size={32} />
          </button>
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
