"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, Circle, Square, RefreshCcw, Check, Loader2, CameraOff, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { MOCK_TARGETS, resolveTargetId } from "@/lib/mockData";
import { supabase } from "@/lib/supabase/client";
import { VIDEO_BUCKET } from "@/lib/supabase/paths";

function RecordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTarget = resolveTargetId(searchParams?.get("target") || "me");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(10);
  
  const [targetId, setTargetId] = useState(initialTarget);
  const [message, setMessage] = useState("");
  const [recordedDate, setRecordedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize camera
  const startCamera = useCallback(async () => {
    setError(null);
    try {
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
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.error("Auto-play failed:", e));
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("카메라를 시작할 수 없습니다. 권한 설정을 확인해주세요.");
    }
  }, []);

  useEffect(() => {
    if (!recordedBlob) startCamera();
    return () => stream?.getTracks().forEach(track => track.stop());
  }, [recordedBlob, startCamera]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isRecording) {
      stopRecording();
    }
    return () => clearInterval(interval);
  }, [isRecording, timeLeft]);

  const captureThumbnail = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          setThumbnailBlob(blob);
        }, "image/jpeg", 0.8);
      }
    }
  };

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=h264") 
      ? "video/mp4;codecs=h264" 
      : "video/webm;codecs=vp8,opus";

    try {
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        setRecordedBlob(blob);
        setVideoUrl(URL.createObjectURL(blob));
        captureThumbnail();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setTimeLeft(10);
    } catch (e) {
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
    setThumbnailBlob(null);
    setVideoUrl(null);
    setTimeLeft(10);
    startCamera();
  };

  const handleSubmit = async () => {
    if (!recordedBlob) return;
    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || "anonymous-user";
      
      const logId = crypto.randomUUID();
      const videoExt = recordedBlob.type.includes("mp4") ? "mp4" : "webm";
      
      // CRITICAL FIX: Ensure no leading slashes and explicit bucket usage
      const cleanUserId = userId.replace(/^\//, "");
      const cleanTargetId = targetId.replace(/^\//, "");
      const videoPath = `${cleanUserId}/${cleanTargetId}/${logId}.${videoExt}`;
      const thumbPath = thumbnailBlob ? `${cleanUserId}/${cleanTargetId}/${logId}.jpg` : null;

      console.log("Starting upload process...", { bucket: VIDEO_BUCKET, videoPath, thumbPath });

      // 1. Upload Video
      const { error: videoErr } = await supabase.storage
        .from(VIDEO_BUCKET)
        .upload(videoPath, recordedBlob, { contentType: recordedBlob.type, upsert: false });
      if (videoErr) throw videoErr;

      // 2. Upload Thumbnail if the browser was able to capture one.
      if (thumbnailBlob && thumbPath) {
        const { error: thumbErr } = await supabase.storage
          .from(VIDEO_BUCKET)
          .upload(thumbPath, thumbnailBlob, { contentType: "image/jpeg", upsert: false });
        if (thumbErr) throw thumbErr;
      }

      // 3. Insert DB Record
      const { error: dbErr } = await supabase
        .from("gratitude_logs")
        .insert({
          id: logId,
          user_id: userId === "anonymous-user" ? null : userId,
          target_id: targetId,
          message,
          video_url: videoPath,
          thumbnail_url: thumbPath,
          recorded_date: recordedDate,
        });
      
      if (dbErr) throw dbErr;

      alert("기록이 저장되었습니다!");
      router.push(`/target/${targetId}`);
    } catch (err) {
      console.error("DEBUG - Upload error:", err);
      // Show full error details to the user for immediate diagnosis
      const fullError = JSON.stringify(err, Object.getOwnPropertyNames(err));
      alert(`업로드 실패 상세: ${fullError}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative">
      <header className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <Link href="/" className="p-2 -ml-2 text-white"><ChevronLeft size={28} /></Link>
        {!recordedBlob && !error && (
          <div className="bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center space-x-2 border border-white/10">
            <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-white'}`} />
            <span className="font-mono text-sm">00:{timeLeft.toString().padStart(2, '0')}</span>
          </div>
        )}
        <div className="flex items-center space-x-2">
          {!recordedBlob && (
             <div className="relative group active:scale-95 transition-transform">
                <input 
                  type="date" 
                  value={recordedDate} 
                  onChange={(e) => setRecordedDate(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-30"
                />
                <div className="p-3 bg-black/40 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center relative z-20">
                  <CalendarIcon size={20} className="text-white" />
                </div>
             </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center bg-gray-950 px-4">
        <div className="w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl relative border border-white/5">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <CameraOff size={48} className="text-gray-600" />
              <p className="text-sm text-gray-400">{error}</p>
              <button onClick={startCamera} className="px-6 py-2 bg-white text-black rounded-full text-xs font-bold">다시 시도</button>
            </div>
          ) : !recordedBlob ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          ) : (
            <video src={videoUrl!} autoPlay loop playsInline className="w-full h-full object-cover" />
          )}

          {recordedBlob && message && (
            <div className="absolute bottom-6 left-6 right-6 text-white drop-shadow-lg z-10">
              <p className="text-lg font-bold leading-snug bg-black/20 backdrop-blur-sm p-2 rounded-lg inline-block">{message}</p>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

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
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-white/50">{recordedDate} To.</span>
                <select 
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="flex-1 bg-gray-900 text-white rounded-xl p-3 text-sm font-bold border border-white/10 outline-none"
                >
                  {MOCK_TARGETS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
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
              <button onClick={retakeVideo} className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors">
                <RefreshCcw size={18} /><span className="text-xs font-bold">다시 찍기</span>
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
