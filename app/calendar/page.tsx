export default function CalendarPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">나의 기록들</h1>
      <div className="grid grid-cols-7 gap-2 mb-8">
        {Array.from({ length: 31 }).map((_, i) => (
          <div 
            key={i} 
            className={`aspect-square flex items-center justify-center rounded-lg border ${
              [3, 10, 15, 22].includes(i + 1) ? "bg-black text-white" : "bg-white text-gray-400"
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>
      
      <section>
        <h2 className="font-bold mb-4">5월의 흐름</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div>
              <p className="font-medium text-sm">To. 친구</p>
              <p className="text-xs text-gray-500">2024.05.15</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
