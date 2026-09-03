"use client";

import { useEffect, useState } from "react";

interface Log{
    _id: string;
    service: string;
    level: string;
    message: string;
    timeStamp: string;
}

interface Stat{
    _id: string;
    errorCount: number;
}

interface Incident{
    _id: string;
    service: string;
    errorCount: string;
    summary: string;
    detectedAt: string;
}

interface LiveStat{
    service: string;
    currentErrorCount: number;
}

const API_BASE = "http://localhost:4000/api";

export default function Dashboard() {

  const [logs, setLogs] = useState<Log[]>([]);
  const [stat, setStats] = useState<Stat[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]); 
  const [liveStat, setLiveStats] = useState<LiveStat[]>([]);

  useEffect(() =>{
    async function fetchData() {
        try{
            const [logRes, statRes, incidentRes, liveStatRes] = await Promise.all([
                fetch(`${API_BASE}/logs`),
                fetch(`${API_BASE}/stats`),
                fetch(`${API_BASE}/incidents`),
                fetch(`${API_BASE}/live-stats`)
            ])
            setLogs(await logRes.json());
            setStats(await statRes.json());
            setIncidents(await incidentRes.json());
            setLiveStats(await liveStatRes.json());
        }catch(err){
            console.log("Failed to fetch dashboard data:", err);
        }
    }

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  },[]);

  const liveStatMap = Object.fromEntries(
    liveStat.map((item) => [item.service,item])
  );
  return(
    <main className="min-h-screen bg-gray-950 text-gray-100 p-8">
        <h1 className="text-2xl font-bold mb-6">
            LogSentinal Dashboard
        </h1>
        {/* Per Service error stat */}
        <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Error Rate by Sevice</h2>
            <div className="flex gap-4 flex-wrap">
                {stat.length === 0 && <p className="text-gray-500">No Errors Yet</p> }
                {stat.map((s) => {
                    const live = liveStatMap[s._id];
                    const isSpiking = (live?.currentErrorCount ?? 0) >= 5;

                    return(
                        <div
                        key={s._id}
                        className={`px-4 py-3 rounded-lg border ${
                            isSpiking ? 'border-red-500 bg-red-950' : 'border-gray-700 bg-gray-900'
                        }`}
                        >
                            <p className="text-small text-gray-400">{s._id}</p>
                            <p className="text-2xl font-bold">{s.errorCount}</p>
                            <p className="text-sm text-gray-500 mt-1">{live?.currentErrorCount ?? 0} in last 60s</p>
                        </div>
                    )
                })

                }
            </div>
        </section>

        <section className="mb-8">
             <h2 className="text-lg font-semibold mb-3">⚠️Detected Incidents</h2>
             {incidents.length === 0 && (
                <p className="text-gray-500">No incidents detected yet.</p>
             )}
             <div className="space-y-3">
                {incidents.map((inc) => (
                    <div key={inc._id} className="p-4 rounded-lg border border-yellow-600 bg-yellow-950">
                        <p className="font-semibold">{inc.service} - {inc.errorCount} errors</p>
                        <p className="text-sm text-gray-300 mt-1">{inc.summary}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(inc.detectedAt).toLocaleString()}</p>
                    </div>
                ))}
             </div>
        </section>

        <section>
            <h2 className="text-lg font-semibold mb-3">Recent Logs</h2>
            <div className="overflow-x-auto rounded-md border border-gray-800">
                <table className="w-full text-sm">
                    <thead className="bg-gray-900 text-gray-400">
                        <tr>
                            <th className="text-left p-2">Time</th>
                            <th className="text-left p-2">Service</th>
                            <th className="text-left p-2">Level</th>
                            <th className="text-left p-2">Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log._id} className="border-t border-gray-800 ">
                                <td className="p-2 text-gray-500">{new Date(log.timeStamp).toLocaleString()}</td>
                                <td className="p-2">{log.service}</td>
                                <td className="p-2">
                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                        log.level === 'error'
                                        ? 'bg-red-900 text-red-300'
                                        : log.level === 'warn'
                                        ? 'bg-yellow-900 text-yellow-300'
                                        : 'bg-gray-800 text-gray-400'
                                    }`}>
                                        {log.level}
                                    </span>
                                </td>
                                <td className="p-2">{log.message}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    </main>
  );
}