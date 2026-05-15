"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { MOCK_TARGETS, resolveTargetId } from "@/lib/mockData";

type ReelLog = {
  id: string;
  target_id: string;
  message: string;
  video_url: string;
  video_public_url: string;
  recorded_date: string;
};

export default function ReplayPage() {
  const params = useParams();
  const targetId = resolveTargetId(params?.targetId as string);
  const target = useMemo(
    () => MOCK_TARGETS.find((item) => item.id === targetId || item.slug === params?.targetId),
    [params?.targetId, targetId],
  );

  const [logs, setLogs] = useState<ReelLog[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/reels/${targetId}`, { cache: "no-store" });
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
  }, [targetId]);

  const currentLog = logs[currentIndex];
  const videoUrl = currentLog?.video_public_url || currentLog?.video_url;

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white relative overflow-hidden">
      <div className="absolute top-10 left-6 right-6 z-10 flex items-center justify-between">
        <Link href={`/target/${targetId}`} className="p-2 -ml-2 text-white">
          <ChevronLeft size={28} />
        </Link>
        <h1 className="text-sm font-bold text-white/80">{target?.name ?? "감사 릴스"}</h1>
        <div className="w-10" />
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
          <p className="text-lg font-bold">아직 저장된 영상이 없습니다.</p>
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
            onEnded={() => setCurrentIndex((index) => (index + 1 < logs.length ? index + 1 : 0))}
          />

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
            <p className="text-lg font-medium">{currentLog.message}</p>
            <p className="text-sm text-gray-400 mt-1">{currentLog.recorded_date}</p>
          </div>
        </>
      )}
    </div>
  );
}
