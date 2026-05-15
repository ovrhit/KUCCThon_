"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, Circle, Square, RefreshCcw, Check, Loader2 } from "lucide-react";
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

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", aspectRatio: 9 / 16 },
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("카메라 권한을 허용해주세요.");
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
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp8,opus" });
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      setVideoUrl(URL.createObjectURL(blob));
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    setTimeLeft(10);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stream?.getTracks().forEach(track => track.stop()); // Stop camera to show preview
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
      // TODO: Replace with actual Supabase Storage & DB upload logic
      console.log("Uploading...", { targetId, message, blobSize: recordedBlob.size });
      await new Promise(resolve => setTimeout(resolve, 1500)); // Mock delay
      
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
      <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/60 to-transparent">
        <Link href="/" className="p-2 -ml-2 drop-shadow-md text-white"><ChevronLeft size={28} /></Link>
        {!recordedBlob && (
          <div className="bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white'}`} />
            <span className="font-mono text-sm">00:{timeLeft.toString().padStart(2, '0')}</span>
          </div>
        )}
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Video Area */}
      <div className="flex-1 relative bg-gray-900 rounded-b-3xl overflow-hidden shadow-2xl">
        {!recordedBlob ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
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

        {/* Message Overlay Preview (only visible when recorded) */}
        {recordedBlob && message && (
          <div className="absolute bottom-10 left-6 right-6 text-white drop-shadow-md z-10">
            <p className="text-xl font-bold leading-snug">{message}</p>
          </div>
        )}
      </div>

      {/* Controls Area */}
      <div className="h-64 bg-black flex flex-col p-6 z-20">
        {!recordedBlob ? (
          <div className="flex-1 flex items-center justify-center">
            {isRecording ? (
              <button 
                onClick={stopRecording}
                className="w-20 h-20 bg-transparent border-4 border-red-500 rounded-full flex items-center justify-center hover:bg-red-500/10 transition-colors"
              >
                <Square className="text-red-500" fill="currentColor" size={24} />
              </button>
            ) : (
              <button 
                onClick={startRecording}
                className="w-20 h-20 bg-transparent border-4 border-white rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Circle className="text-red-500" fill="currentColor" size={64} />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full justify-between space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <select 
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="bg-gray-800 text-white rounded-xl p-3 text-sm font-medium border border-gray-700 focus:ring-2 focus:ring-white outline-none"
              >
                {MOCK_TARGETS.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <input 
                type="text"
                placeholder="감사 메시지 남기기..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={300}
                className="bg-gray-800 text-white rounded-xl p-3 text-sm font-medium border border-gray-700 focus:ring-2 focus:ring-white outline-none placeholder:text-gray-500"
              />
            </div>
            
            <div className="flex justify-between items-center">
              <button 
                onClick={retakeVideo}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors p-2"
              >
                <RefreshCcw size={20} />
                <span className="text-sm font-bold">다시 찍기</span>
              </button>
              
              <button 
                onClick={handleSubmit}
                disabled={isUploading || !message.trim()}
                className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center space-x-2 disabled:opacity-50 transition-opacity"
              >
                {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                <span>저장하기</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white italic">Loading Camera...</div>}>
      <RecordContent />
    </Suspense>
  );
}
