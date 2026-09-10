import Link from "next/link";

export default function Home() {
  return(
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">LogSentinel</h1>
        <p className="text-gray-400 max-w-md">
          Real-time log monitoring with Kafka, Redis, and AI-Powered root-cause summarizarion
        </p>
      </div>
      <Link 
        href="/dashboard"
        className = "px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors font-medium"
      >
        Open Dashboard ➡️
      </Link>
    </main>
  )
}