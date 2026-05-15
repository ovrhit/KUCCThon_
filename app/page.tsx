import Link from "next/link";
import { MOCK_GRATITUDE_LOGS } from "@/lib/mockData";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-8">
      <header className="text-center mt-10">
        <h1 className="text-3xl font-bold">한편</h1>
        <p className="text-gray-500 mt-2">작은 감사들이 쌓여, 하나의 메시지가 됩니다.</p>
      </header>

      <section className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">최근 기록</h2>
        <div className="space-y-4">
          {MOCK_GRATITUDE_LOGS.map((log) => (
            <div key={log.id} className="p-4 border rounded-xl shadow-sm bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  To. {log.targetName}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(log.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-800">{log.message}</p>
            </div>
          ))}
        </div>
      </section>

      <Link 
        href="/record"
        className="fixed bottom-24 right-6 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      >
        <span className="text-2xl">+</span>
      </Link>
    </div>
  );
}
