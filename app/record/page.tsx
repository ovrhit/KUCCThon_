"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, Circle, Square, RefreshCcw, Check, Loader2, CameraOff } from "lucide-react";
import Link from "next/link";
import { MOCK_TARGETS } from "@/lib/mockData";

function RecordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTarget = searchParams?.get("target") || "me";

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
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize camera with improved error handling and landscape ratio
  const startCamera = useCallback(async () => {
    setError(null);
    try {
      // Constraints for Landscape (16:9)
      const constraints = {
        video: { 
          facingMode: "user", 
          aspectRatio: { ideal: 16 / 9 },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // High stability for mobile: explicit play call
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("Auto-play failed:", e));
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError("카메라 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.");
        } else if (err.name === "NotFoundError") {
          setError("사용 가능한 카메라를 찾을 수 없습니다.");
        } else {
          setError("카메라를 시작하는 중 오류가 발생했습니다: " + err.message);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!recordedBlob) {
      startCamera();
    }
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [recordedBlob, startCamera]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRecording) {
      stopRecording();
    }
    return () => clearInterval(interval);
  }, [isRecording, timeLeft]);

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    
    // Check supported types for better compatibility
    const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=h264") 
      ? "video/mp4;codecs=h264" 
      : "video/webm;codecs=vp8,opus";

    try {
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
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
    } catch (e) {
      console.error("MediaRecorder start failed:", e);
      alert("녹화를 시작할 수 없습니다.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stream?.getTracks().forEach(track => track.stop());
    }
  };

  const retakeVideo = () => {
    setRecordedBlob(null);
    setVideoUrl(null);
    setTimeLeft(10);
    startCamera();
  };

  const handleSubmit = async () => {
    if (!recordedBlob) return;
    setIsUploading(true);
    
    try {
      console.log("Uploading...", { targetId, message, blobSize: recordedBlob.size });
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      alert("기록이 성공적으로 저장되었습니다!");
      router.push("/");
    } catch (error) {
      console.error("Upload failed", error);
      alert("업로드 중 문제가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <Link href="/" className="p-2 -ml-2 text-white"><ChevronLeft size={28} /></Link>
        {!recordedBlob && !error && (
          <div className="bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center space-x-2 border border-white/10">
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white'}`} />
            <span className="font-mono text-sm">00:{timeLeft.toString().padStart(2, '0')}</span>
          </div>
        )}
        <div className="w-10" />
      </header>

      {/* Video Area (Landscape 16:9 focused) */}
      <div className="flex-1 flex items-center justify-center bg-gray-950 px-4">
        <div className="w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl relative border border-white/5">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <CameraOff size={48} className="text-gray-600" />
              <p className="text-sm text-gray-400">{error}</p>
              <button 
                onClick={startCamera}
                className="px-6 py-2 bg-white text-black rounded-full text-xs font-bold"
              >
                다시 시도
              </button>
            </div>
          ) : !recordedBlob ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover scale-x-[-1]" // Mirror for selfie
            />
          ) : (
            <video 
              src={videoUrl!} 
              autoPlay 
              loop 
              playsInline 
              className="w-full h-full object-cover"
            />
          )}

          {/* Message Overlay Preview */}
          {recordedBlob && message && (
            <div className="absolute bottom-6 left-6 right-6 text-white drop-shadow-lg z-10">
              <p className="text-lg font-bold leading-snug bg-black/20 backdrop-blur-sm p-2 rounded-lg inline-block">
                {message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Controls Area */}
      <div className="h-64 bg-black flex flex-col p-6 z-20">
        {!recordedBlob && !error ? (
          <div className="flex-1 flex items-center justify-center">
            {isRecording ? (
              <button 
                onClick={stopRecording}
                className="w-20 h-20 bg-transparent border-4 border-red-500 rounded-full flex items-center justify-center"
              >
                <Square className="text-red-500" fill="currentColor" size={24} />
              </button>
            ) : (
              <button 
                onClick={startRecording}
                className="w-20 h-20 bg-transparent border-4 border-white rounded-full flex items-center justify-center active:scale-90 transition-transform"
              >
                <div className="w-16 h-16 bg-red-500 rounded-full" />
              </button>
            )}
          </div>
        ) : recordedBlob ? (
          <div className="flex flex-col h-full justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">To.</span>
                <select 
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="flex-1 bg-gray-900 text-white rounded-xl p-3 text-sm font-bold border border-white/10 outline-none"
                >
                  {MOCK_TARGETS.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <input 
                type="text"
                placeholder="감사의 한 줄을 남겨보세요"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={300}
                className="w-full bg-gray-900 text-white rounded-xl p-4 text-sm font-medium border border-white/10 outline-none placeholder:text-gray-600"
              />
            </div>
            
            <div className="flex justify-between items-center pb-4">
              <button 
                onClick={retakeVideo}
                className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors"
              >
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
