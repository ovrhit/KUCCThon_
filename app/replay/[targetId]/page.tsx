"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Captions, Check, ChevronLeft, Loader2, Share2 } from "lucide-react";
import { MOCK_TARGETS, resolveTargetId } from "@/lib/mockData";
import { supabase } from "@/lib/supabase/client";
import { VIDEO_BUCKET } from "@/lib/supabase/paths";

type ReelLog = {
  id: string;
  target_id: string;
  message: string;
  video_url: string;
  video_public_url?: string;
  recorded_date: string;
};

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDateRange(mode: string, year: string | null | undefined, month: string | null | undefined) {
  const today = new Date();

  if (mode === "last30") {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    return {
      startDate: formatDate(start),
      endDate: formatDate(today),
    };
  }

  const selectedYear = Number(year ?? today.getFullYear());
  const selectedMonth = Number(month ?? today.getMonth() + 1);
  const start = new Date(Date.UTC(selectedYear, selectedMonth - 1, 1));
  const monthEnd = new Date(Date.UTC(selectedYear, selectedMonth, 0));
  const end =
    selectedYear === today.getFullYear() && selectedMonth === today.getMonth() + 1
      ? today
      : monthEnd;

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

function getVideoExtension(path: string) {
  const extension = path.split(".").pop();
  return extension && /^[a-z0-9]+$/i.test(extension) ? extension : "mp4";
}

function buildDownloadFilename(targetName: string | undefined, log: ReelLog) {
  const safeTargetName = (targetName || "hanpyeon").replace(/[\r\n\\/]/g, "-");
  return `${safeTargetName}-${log.recorded_date}.${getVideoExtension(log.video_url)}`;
}

function ReplayContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const targetId = resolveTargetId(params?.targetId as string);
  const mode = searchParams?.get("mode") ?? "month";
  const year = searchParams?.get("year");
  const month = searchParams?.get("month");
  const target = useMemo(
    () => MOCK_TARGETS.find((item) => item.id === targetId || item.slug === params?.targetId),
    [params?.targetId, targetId],
  );

  const [logs, setLogs] = useState<ReelLog[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCaptions, setShowCaptions] = useState(true);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      setError(null);

      try {
        const { startDate, endDate } = getDateRange(mode, year, month);
        const { data, error: fetchError } = await supabase
          .from("gratitude_logs")
          .select("*")
          .eq("target_id", targetId)
          .gte("recorded_date", startDate)
          .lte("recorded_date", endDate)
          .order("recorded_date", { ascending: true })
          .order("created_at", { ascending: true });

        if (fetchError) throw fetchError;

        setLogs(data ?? []);
        setCurrentIndex(0);
      } catch (fetchError) {
        console.error("Replay fetch error:", fetchError);
        setError(fetchError instanceof Error ? fetchError.message : "한편을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    if (targetId) fetchLogs();
  }, [mode, month, targetId, year]);

  const currentLog = logs[currentIndex];
  const videoUrl = currentLog
    ? currentLog.video_public_url ||
      supabase.storage.from(VIDEO_BUCKET).getPublicUrl(currentLog.video_url).data.publicUrl
    : undefined;
  const title =
    mode === "last30"
      ? "최근 30일 한편"
      : year && month
        ? `${year}.${month.padStart(2, "0")} 한편`
        : "월 한편";

  const playNext = () => {
    setCurrentIndex((index) => (index + 1 < logs.length ? index + 1 : index));
  };

  const getDownloadUrl = () => {
    if (!currentLog) return null;

    const downloadUrl = new URL("/api/videos/download", window.location.origin);
    downloadUrl.searchParams.set("path", currentLog.video_url);
    downloadUrl.searchParams.set("name", buildDownloadFilename(target?.name, currentLog));
    return downloadUrl.toString();
  };

  const shareReel = async () => {
    const url = getDownloadUrl();
    if (!url) return;

    const text = `${target?.name ?? "감사"} ${title} 영상 다운로드`;
    const nav = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
      clipboard?: Clipboard;
    };

    try {
      if (nav.share) {
        await nav.share({ title: "Hanpyeon", text, url });
        return;
      }

      await nav.clipboard?.writeText(url);
      setShareStatus("copied");
      window.setTimeout(() => setShareStatus("idle"), 1800);
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") return;
      console.error("Share error:", shareError);
    }
  };

  return (
    <div className="h-screen bg-[#FFFCF2] text-[#4A3F35] relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-20 px-5 pt-8 pb-4 bg-[#FFFCF2]/90 backdrop-blur-md border-b border-[#F0E6D2]">
        <div className="flex items-center justify-between">
          <Link href={`/target/${targetId}`} className="w-10 h-10 rounded-full bg-white border border-[#F0E6D2] flex items-center justify-center text-[#4A3F35] shadow-sm">
            <ChevronLeft size={22} />
          </Link>
          <div className="text-center">
            <h1 className="text-sm font-black">{target?.name ?? "감사 한편"}</h1>
            <p className="text-[10px] text-[#A69785] font-bold mt-1 uppercase tracking-widest">{title}</p>
          </div>
          <button
            onClick={shareReel}
            className="w-10 h-10 rounded-full bg-[#FFF67B] border border-[#D4B872]/60 flex items-center justify-center text-[#6B5700] shadow-sm"
            aria-label="한편 공유"
          >
            {shareStatus === "copied" ? <Check size={18} /> : <Share2 size={18} />}
          </button>
        </div>
      </div>

      <main className="h-full flex items-center justify-center px-4 pt-28 pb-28">
        <div className="relative w-full max-w-4xl h-full max-h-[72dvh] bg-[#4A3F35] rounded-[2rem] border-[10px] border-white shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-white/65">
                <Loader2 className="animate-spin" />
                <p className="text-sm">한편을 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="h-full flex items-center justify-center px-6 text-center text-sm text-red-100">
                {error}
              </div>
            ) : !currentLog ? (
              <div className="h-full flex flex-col items-center justify-center px-6 text-center space-y-4 text-white">
                <p className="text-lg font-bold">해당 기간에 저장된 영상이 없습니다.</p>
                <Link href={`/record?target=${targetId}`} className="inline-flex bg-[#FFF67B] text-[#6B5700] px-5 py-3 rounded-full text-sm font-black">
                  첫 기록 남기기
                </Link>
              </div>
            ) : (
              <>
                <video
                  key={currentLog.id}
                  src={videoUrl}
                  autoPlay
                  controls
                  playsInline
                  className="w-full h-full object-contain bg-black"
                  onEnded={playNext}
                />

                {showCaptions ? (
                  <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <p className="inline-block rounded-2xl bg-black/45 px-5 py-3 text-xl font-black leading-snug text-white shadow-2xl backdrop-blur-sm">
                      {currentLog.message}
                    </p>
                    <p className="mt-3 text-xs font-bold tracking-widest text-white/70">{currentLog.recorded_date}</p>
                  </div>
                ) : null}

                <div className="absolute bottom-5 left-5 right-5">
                  <div className="flex gap-1 mb-4">
                    {logs.map((log, index) => (
                      <button
                        key={log.id}
                        aria-label={`${index + 1}번째 영상으로 이동`}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-1 flex-1 rounded-full ${index === currentIndex ? "bg-[#FFF67B]" : "bg-white/25"}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs font-bold text-white/60">
                    <span>
                      {currentIndex + 1}/{logs.length}
                    </span>
                    <span>{currentLog.recorded_date}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-7 pt-4 bg-[#FFFCF2]/90 backdrop-blur-md border-t border-[#F0E6D2]">
        <div className="mx-auto flex max-w-sm items-center justify-center gap-3">
          <button
            onClick={() => setShowCaptions((value) => !value)}
            className={`h-11 px-4 rounded-full border flex items-center gap-2 text-xs font-black ${
              showCaptions
                ? "bg-[#4A3F35] text-white border-[#4A3F35]"
                : "bg-white text-[#6B5700] border-[#F0E6D2]"
            }`}
          >
            <Captions size={17} />
            <span>자막</span>
          </button>
          <button
            onClick={shareReel}
            className="h-11 px-5 rounded-full bg-[#FFF67B] text-[#6B5700] border border-[#D4B872]/60 flex items-center gap-2 text-xs font-black shadow-sm"
          >
            {shareStatus === "copied" ? <Check size={17} /> : <Share2 size={17} />}
            <span>{shareStatus === "copied" ? "복사됨" : "공유"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReplayPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#FFFCF2] flex items-center justify-center text-[#4A3F35]">한편을 불러오는 중...</div>}>
      <ReplayContent />
    </Suspense>
  );
}
