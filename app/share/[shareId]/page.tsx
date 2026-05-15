export default function SharePage({ params }: { params: { shareId: string } }) {
  return (
    <div className="p-6 text-center mt-20">
      <div className="mb-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-blue-600">💌</span>
        </div>
        <h1 className="text-2xl font-bold">당신에게 도착한<br/>한 편의 편지</h1>
      </div>
      
      <p className="text-gray-600 mb-10 leading-relaxed">
        그동안 쌓인 소중한 감사의 기록들을<br/>
        릴스로 확인해보세요.
      </p>

      <button className="w-full py-4 bg-black text-white rounded-xl font-bold">
        리플레이 보기
      </button>
    </div>
  );
}
