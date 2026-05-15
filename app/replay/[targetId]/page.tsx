"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Captions, ChevronLeft, Loader2 } from "lucide-react";
import { MOCK_TARGETS, resolveTargetId } from "@/lib/mockData";

type ReelLog = {
  id: string;
  target_id: string;
  message: string;
  video_url: string;
  video_public_url: string;
  recorded_date: string;
};

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

  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      setError(null);

      try {
        const query = new URLSearchParams({ mode });
        if (mode === "month") {
          if (year) query.set("year", year);
          if (month) query.set("month", month);
        }

        const response = await fetch(`/api/reels/${targetId}?${query.toString()}`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error ?? "릴스를 불러오지 못했습니다.");
        }

        setLogs(payload.logs ?? []);
        setCurrentIndex(0);
      } catch (fetchError) {
        console.error("Replay fetch error:", fetchError);
        setError(fetchError instanceof Error ? fetchError.message : "릴스를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    if (targetId) fetchLogs();
  }, [mode, month, targetId, year]);

  const currentLog = logs[currentIndex];
  const videoUrl = currentLog?.video_public_url || currentLog?.video_url;
  const title =
    mode === "last30"
      ? "최근 30일 릴스"
      : year && month
        ? `${year}.${month.padStart(2, "0")} 릴스`
        : "월 릴스";

  const playNext = () => {
    setCurrentIndex((index) => (index + 1 < logs.length ? index + 1 : index));
  };

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white relative overflow-hidden">
      <div className="absolute top-10 left-6 right-6 z-10 flex items-center justify-between">
        <Link href={`/target/${targetId}`} className="p-2 -ml-2 text-white">
          <ChevronLeft size={28} />
        </Link>
        <div className="text-center">
          <h1 className="text-sm font-bold text-white/80">{target?.name ?? "감사 릴스"}</h1>
          <p className="text-[10px] text-white/45 font-bold mt-1">{title}</p>
        </div>
        <button
          onClick={() => setShowCaptions((value) => !value)}
          className={`w-10 h-10 rounded-full border flex items-center justify-center ${
            showCaptions ? "bg-white text-black border-white" : "bg-black/40 text-white border-white/20"
          }`}
          aria-label="자막 표시 전환"
        >
          <Captions size={18} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="animate-spin" />
          <p className="text-sm">릴스를 불러오는 중...</p>
        </div>
      ) : error ? (
        <p className="px-6 text-center text-sm text-red-200">{error}</p>
      ) : !currentLog ? (
        <div className="px-6 text-center space-y-4">
          <p className="text-lg font-bold">해당 기간에 저장된 영상이 없습니다.</p>
          <Link href={`/record?target=${targetId}`} className="inline-flex bg-white text-black px-5 py-3 rounded-full text-sm font-bold">
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

          <div className="absolute bottom-24 left-6 right-6">
            <div className="flex gap-1 mb-5">
              {logs.map((log, index) => (
                <button
                  key={log.id}
                  aria-label={`${index + 1}번째 영상으로 이동`}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1 flex-1 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/25"}`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs font-bold text-white/55">
              <span>
                {currentIndex + 1}/{logs.length}
              </span>
              <span>{currentLog.recorded_date}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ReplayPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-black flex items-center justify-center text-white">릴스를 불러오는 중...</div>}>
      <ReplayContent />
    </Suspense>
  );
}
