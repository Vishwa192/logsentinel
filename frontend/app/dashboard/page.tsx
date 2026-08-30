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

const API_BASE = "http://localhost:4000/api";

export default function Dashboard() {

  const [logs, setLogs] = useState<Log[]>([]);
  const [stat, setStats] = useState<Stat[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]); 

  useEffect(() =>{
    async function fetchData() {
        try{
            const [logRes, statRes, incidentRes] = await Promise.all([
                fetch(`${API_BASE}/logs`),
                fetch(`${API_BASE}/stats`),
                fetch(`${API_BASE}/incidents`),
            ])
            setLogs(await logRes.json());
            setStats(await statRes.json());
            setIncidents(await incidentRes.json());
        }catch(err){
            console.log("Failed to fetch dashboard data:", err);
        }
    }

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  },[]);
  return(
    <main className="min-h-screen bg-gray-950text-gray-100 p-8">
        <h1 className="text-2xl font-bold mb-6">
            LogSentinal Dashboard
        </h1>
        {/* Per Service error stat */}
        <section className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Error Rate by Sevice</h2>
            <div className="flex gap-4 flex-wrap">
                {stat.length === 0 && <p className="text-gray-500">No Errors Yet</p> }
                {stat.map((s) => (
                    <div
                        key={s._id}
                        className={`px-4 py-3 rounded-lg border ${
                            s.errorCount >= 5 ? 'border-red-500' : 'border-gray-700 bg-gray-900'
                        }`}
                    >
                        <p className="text-small text-gray-400">{s._id}</p>
                        <p className="text-2xl font-bold">{s.errorCount}</p>
                    </div>
                ))}
            </div>
            <p className="text-gray-500">No errors yet.</p>
        </section>

        <section className="mb-8">
             <h2 className="text-lg font-semibold mb-3">⚠️Detected Incidents</h2>
             <p className="text-gray-500">No incidents detected yet.</p>
        </section>

        <section>
            <h2 className="text-lg font-semibold mb-3">Recent Logs</h2>
            <div className="overflow-x-auto rounded-mg border border-gray-800">
                <table className="w-full text-sm">
                    <thead className="bg-gray-900 text-gray-400">
                        <tr>
                            <th className="text-left p-2">Time</th>
                            <th className="text-left p-2">Service</th>
                            <th className="text-left p-2">Level</th>
                            <th className="text-left p-2">Message</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </section>
    </main>
  );
}