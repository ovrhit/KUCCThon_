"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, Play, X } from "lucide-react";
import { PUBLIC_DEMO_USER_ID, resolveTargetId } from "@/lib/mockData";
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
  const [pendingDeleteLog, setPendingDeleteLog] = useState<GratitudeLog | null>(null);
  const [isDeletingLog, setIsDeletingLog] = useState(false);
  const [isClearingTargetData, setIsClearingTargetData] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);

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

  const clearLogPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const startLogPress = (log: GratitudeLog) => {
    clearLogPressTimer();
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      setPendingDeleteLog(log);
    }, 650);
  };

  const endLogPress = () => {
    clearLogPressTimer();
    window.setTimeout(() => {
      longPressTriggeredRef.current = false;
    }, 0);
  };

  const openLog = (log: GratitudeLog) => {
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    setSelectedLog(log);
  };

  const getStoragePaths = (log: GratitudeLog) => {
    return [log.videoUrl, log.thumbnailUrl].filter(
      (path): path is string => typeof path === "string" && path.length > 0 && !path.startsWith("http"),
    );
  };

  const clearTargetData = async () => {
    if (isClearingTargetData) return;

    const ok = confirm(`${target?.name ?? "이 대상"}의 기록과 영상을 모두 지울까요?`);
    if (!ok) return;

    setIsClearingTargetData(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("gratitude_logs")
        .select("video_url,thumbnail_url")
        .eq("user_id", PUBLIC_DEMO_USER_ID)
        .eq("target_id", targetId);

      if (fetchError) throw fetchError;

      const storagePaths = Array.from(
        new Set(
          (data ?? [])
            .flatMap((log) => [log.video_url, log.thumbnail_url])
            .filter((path): path is string => typeof path === "string" && path.length > 0 && !path.startsWith("http")),
        ),
      );

      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from(VIDEO_BUCKET)
          .remove(storagePaths);

        if (storageError) {
          console.warn("Target storage cleanup skipped:", storageError);
        }
      }

      const { error: deleteError } = await supabase
        .from("gratitude_logs")
        .delete()
        .eq("user_id", PUBLIC_DEMO_USER_ID)
        .eq("target_id", targetId);

      if (deleteError) throw deleteError;

      setLogs([]);
      setSelectedLog(null);
      setPendingDeleteLog(null);
      alert("데이터를 지웠습니다.");
    } catch (clearError) {
      console.error("Clear target data error:", clearError);
      alert("데이터를 지우지 못했습니다. Supabase 삭제 정책이 적용되어 있는지 확인해주세요.");
    } finally {
      setIsClearingTargetData(false);
    }
  };

  const deletePendingLog = async () => {
    if (!pendingDeleteLog || isDeletingLog) return;

    setIsDeletingLog(true);
    try {
      const storagePaths = getStoragePaths(pendingDeleteLog);
      if (storagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from(VIDEO_BUCKET)
          .remove(storagePaths);

        if (storageError) {
          console.warn("Storage delete skipped:", storageError);
        }
      }

      const { error: deleteError } = await supabase
        .from("gratitude_logs")
        .delete()
        .eq("id", pendingDeleteLog.id)
        .eq("target_id", targetId);

      if (deleteError) throw deleteError;

      setLogs((current) => current.filter((log) => log.id !== pendingDeleteLog.id));
      setSelectedLog((current) => (current?.id === pendingDeleteLog.id ? null : current));
      setPendingDeleteLog(null);
    } catch (deleteError) {
      console.error("Delete log error:", deleteError);
      alert("기록을 삭제하지 못했습니다. Supabase 삭제 정책이 적용되어 있는지 확인해주세요.");
    } finally {
      setIsDeletingLog(false);
    }
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
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={clearTargetData}
              disabled={isClearingTargetData}
              className="min-w-16 px-3 py-2 rounded-full bg-white border border-[#F0E6D2] text-[#D9534F] text-[11px] font-black shadow-sm disabled:opacity-40"
            >
              {isClearingTargetData ? <Loader2 size={14} className="mx-auto animate-spin" /> : "데이터 지우기"}
            </button>
            <button
              onClick={startEditingName}
              className="px-3 py-2 rounded-full bg-white border border-[#F0E6D2] text-[#A69785] text-[11px] font-black shadow-sm"
            >
              이름 수정
            </button>
          </div>
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
                  onPointerDown={() => log && startLogPress(log)}
                  onPointerUp={endLogPress}
                  onPointerLeave={clearLogPressTimer}
                  onPointerCancel={clearLogPressTimer}
                  onContextMenu={(event) => {
                    if (!log) return;
                    event.preventDefault();
                    setPendingDeleteLog(log);
                  }}
                  onClick={() => log && openLog(log)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all relative overflow-hidden ${
                    log ? "scale-105 shadow-mdss border-2 border-[#D4B872] bg-white" : "bg-[#F9F7F0] text-[#D4B872] border border-[#F0E6D2]"
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
                onPointerDown={() => startLogPress(log)}
                onPointerUp={endLogPress}
                onPointerLeave={clearLogPressTimer}
                onPointerCancel={clearLogPressTimer}
                onContextMenu={(event) => {
                  event.preventDefault();
                  setPendingDeleteLog(log);
                }}
                onClick={() => openLog(log)}
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

      {pendingDeleteLog && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-[#F0E6D2]">
            <h2 className="text-lg font-black text-[#4A3F35] mb-2">기록 삭제</h2>
            <p className="text-sm text-[#A69785] leading-relaxed mb-5">
              {pendingDeleteLog.recordedDate} 기록을 삭제할까요?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingDeleteLog(null)}
                disabled={isDeletingLog}
                className="px-4 py-2 rounded-full text-xs font-black text-[#A69785] disabled:opacity-40"
              >
                취소
              </button>
              <button
                onClick={deletePendingLog}
                disabled={isDeletingLog}
                className="min-w-16 px-4 py-2 rounded-full bg-[#D9534F] text-white text-xs font-black disabled:opacity-40"
              >
                {isDeletingLog ? <Loader2 size={14} className="mx-auto animate-spin" /> : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
