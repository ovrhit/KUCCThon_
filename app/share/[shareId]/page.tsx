export default function SharePage({ params }: { params: { shareId: string } }) {
  const { shareId } = params;

  return (
    <div className="min-h-screen bg-[#FFFCF2] p-6 text-center flex flex-col items-center justify-center">
      <div className="mb-8">
        <div className="w-20 h-20 bg-[#FFF67B] border border-[#D4B872]/60 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-[#6B5700]">한</span>
        </div>
        <h1 className="text-2xl font-black text-[#4A3F35]">
          당신에게 도착한
          <br />
          감사 한편
        </h1>
      </div>

      <p className="text-[#A69785] mb-10 leading-relaxed text-sm">
        소중한 감사의 기록들을
        <br />
        한편으로 확인해보세요.
      </p>

      <a href={`/api/shared-reels/${shareId}`} className="w-full max-w-sm py-4 bg-[#4A3F35] text-white rounded-xl font-bold">
        한편 보기
      </a>
    </div>
  );
}
