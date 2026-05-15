"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  CameraOff,
  Check,
  ChevronLeft,
  Loader2,
  RefreshCcw,
  Square,
} from "lucide-react";
import { DEFAULT_USER_ID, MOCK_TARGETS, resolveTargetId } from "@/lib/mockData";

function RecordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTarget = resolveTargetId(searchParams?.get("target"));

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [targetId, setTargetId] = useState(initialTarget);
  const [message, setMessage] = useState("");
  const [recordedDate, setRecordedDate] = useState(new Date().toISOString().split("T")[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    setStream((current) => {
      current?.getTracks().forEach((track) => track.stop());
      return null;
    });
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    stopCamera();

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          aspectRatio: { ideal: 16 / 9 },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((playError) => {
            console.error("Auto-play failed:", playError);
          });
        };
      }
    } catch (cameraError) {
      console.error("Error accessing camera:", cameraError);
      setError("카메라를 시작할 수 없습니다. 브라우저 권한을 확인해주세요.");
    }
  }, [stopCamera]);

  useEffect(() => {
    if (!recordedBlob) startCamera();
    return () => stopCamera();
  }, [recordedBlob, startCamera, stopCamera]);

  useEffect(() => {
    if (!isRecording) return;

    if (timeLeft === 0) {
      stopRecording();
      return;
    }

    const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording, timeLeft]);

  const startRecording = () => {
    if (!stream) return;

    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=h264")
      ? "video/mp4;codecs=h264"
      : "video/webm;codecs=vp8,opus";

    try {
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        setRecordedBlob(blob);
        setVideoUrl(URL.createObjectURL(blob));
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setTimeLeft(10);
    } catch (recordError) {
      console.error("Recording error:", recordError);
      alert("녹화를 시작할 수 없습니다.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopCamera();
    }
  };

  const retakeVideo = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setRecordedBlob(null);
    setVideoUrl(null);
    setTimeLeft(10);
    startCamera();
  };

  const handleSubmit = async () => {
    if (!recordedBlob || !message.trim()) return;

    setIsUploading(true);

    try {
      const extension = recordedBlob.type.includes("mp4") ? "mp4" : "webm";
      const formData = new FormData();
      formData.append("userId", DEFAULT_USER_ID);
      formData.append("targetId", targetId);
      formData.append("message", message.trim());
      formData.append("recordedDate", recordedDate);
      formData.append("video", recordedBlob, `gratitude-${Date.now()}.${extension}`);

      const response = await fetch("/api/gratitude-logs", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "업로드에 실패했습니다.");
      }

      alert("기록이 저장되었습니다!");
      router.push(`/target/${targetId}`);
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      alert(`업로드 실패: ${uploadError instanceof Error ? uploadError.message : "알 수 없는 오류"}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <Link href="/" className="p-2 -ml-2 text-white">
          <ChevronLeft size={28} />
        </Link>
        {!recordedBlob && !error && (
          <div className="bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center space-x-2 border border-white/10">
            <div className={`w-2 h-2 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-white"}`} />
            <span className="font-mono text-sm">00:{timeLeft.toString().padStart(2, "0")}</span>
          </div>
        )}
        {!recordedBlob ? (
          <div className="relative active:scale-95 transition-transform">
            <input
              type="date"
              value={recordedDate}
              onChange={(event) => setRecordedDate(event.target.value)}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-30"
            />
            <div className="p-3 bg-black/40 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center">
              <CalendarIcon size={20} className="text-white" />
            </div>
          </div>
        ) : (
          <div className="w-11" />
        )}
      </header>

      <div className="flex-1 flex items-center justify-center bg-gray-950 px-4">
        <div className="w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl relative border border-white/5">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <CameraOff size={48} className="text-gray-600" />
              <p className="text-sm text-gray-400">{error}</p>
              <button onClick={startCamera} className="px-6 py-2 bg-white text-black rounded-full text-xs font-bold">
                다시 시도
              </button>
            </div>
          ) : !recordedBlob ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          ) : (
            <video src={videoUrl ?? undefined} autoPlay loop playsInline className="w-full h-full object-cover" />
          )}

          {recordedBlob && message && (
            <div className="absolute bottom-6 left-6 right-6 text-white drop-shadow-lg z-10">
              <p className="text-lg font-bold leading-snug bg-black/20 backdrop-blur-sm p-2 rounded-lg inline-block">
                {message}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="h-64 bg-black flex flex-col p-6 z-20">
        {!recordedBlob && !error ? (
          <div className="flex-1 flex items-center justify-center">
            {isRecording ? (
              <button onClick={stopRecording} className="w-20 h-20 bg-transparent border-4 border-red-500 rounded-full flex items-center justify-center">
                <Square className="text-red-500" fill="currentColor" size={24} />
              </button>
            ) : (
              <button onClick={startRecording} className="w-20 h-20 bg-transparent border-4 border-white rounded-full flex items-center justify-center active:scale-90 transition-transform">
                <div className="w-16 h-16 bg-red-500 rounded-full" />
              </button>
            )}
          </div>
        ) : recordedBlob ? (
          <div className="flex flex-col h-full justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{recordedDate} To.</span>
                <select
                  value={targetId}
                  onChange={(event) => setTargetId(event.target.value)}
                  className="flex-1 bg-gray-900 text-white rounded-xl p-3 text-sm font-bold border border-white/10 outline-none"
                >
                  {MOCK_TARGETS.map((target) => (
                    <option key={target.id} value={target.id}>
                      {target.name}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                placeholder="감사한 마음을 적어보세요"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={300}
                className="w-full bg-gray-900 text-white rounded-xl p-4 text-sm font-medium border border-white/10 outline-none placeholder:text-gray-600"
              />
            </div>

            <div className="flex justify-between items-center pb-4">
              <button onClick={retakeVideo} className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors">
                <RefreshCcw size={18} />
                <span className="text-xs font-bold">다시 찍기</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isUploading || !message.trim()}
                className="bg-white text-black px-10 py-3.5 rounded-full font-black text-sm flex items-center space-x-2 disabled:opacity-30 transition-all active:scale-95"
              >
                {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                <span>저장</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function RecordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white italic">카메라 준비 중...</div>}>
      <RecordContent />
    </Suspense>
  );
}
