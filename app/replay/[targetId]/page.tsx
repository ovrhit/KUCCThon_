export default function ReplayPage({ params }: { params: { targetId: string } }) {
  const { targetId } = params;
  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white relative">
      <div className="absolute top-10 left-6 z-10">
        <h1 className="text-xl font-bold">감사 릴스: {targetId}</h1>
      </div>
      
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">영상 플레이어 영역 (Mock Player)</p>
      </div>

      <div className="absolute bottom-24 left-6 right-6">
        <p className="text-lg font-medium">“오늘 하루도 고마워요”</p>
        <p className="text-sm text-gray-400 mt-1">2024.05.15</p>
      </div>
    </div>
  );
}
