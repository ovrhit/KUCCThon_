export default function RecordPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">감사 기록하기</h1>
      <div className="bg-gray-100 aspect-[9/16] rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
        <p className="text-gray-500">영상을 촬영하거나 업로드하세요 (최대 10초)</p>
      </div>
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">받는 사람</label>
          <select className="w-full p-3 rounded-xl border bg-white">
            <option>부모님</option>
            <option>친구</option>
            <option>연인</option>
            <option>나 자신</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">메시지</label>
          <textarea 
            className="w-full p-3 rounded-xl border h-24 bg-white" 
            placeholder="감사의 한 줄을 남겨보세요."
          ></textarea>
        </div>
        <button className="w-full py-4 bg-black text-white rounded-xl font-bold">
          저장하기
        </button>
      </div>
    </div>
  );
}
