import { ShieldAlert, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';

interface ThreatLogTableProps {
  logs: any[];
}

export function ThreatLogTableWidget({ logs }: ThreatLogTableProps) {
  return (
    <div className="col-span-12 flex flex-col gap-4 bg-slate-900/50 rounded-xl border border-slate-800 p-5 mt-2">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-slate-400" />
          Behavioral Threat Log & Mitigation
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-400">
          <thead className="text-xs text-slate-500 uppercase bg-slate-800/50 border-b border-slate-700">
            <tr>
              <th scope="col" className="px-6 py-3">Timestamp (Local)</th>
              <th scope="col" className="px-6 py-3">Source IP</th>
              <th scope="col" className="px-6 py-3">AI Classification</th>
              <th scope="col" className="px-6 py-3">Inference Delay</th>
              <th scope="col" className="px-6 py-3">Action Taken</th>
              <th scope="col" className="px-6 py-3">Engine</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr 
                key={log.id} 
                className={clsx(
                  "border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors",
                  log.isZeroDay && "bg-red-950/20"
                )}
              >
                <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">{log.timestamp}</td>
                <td className="px-6 py-4 font-mono text-slate-300">{log.sourceIp}</td>
                <td className={clsx("px-6 py-4 font-medium", log.isZeroDay ? "text-cyber-red" : "text-slate-300")}>
                  {log.classification}
                </td>
                <td className="px-6 py-4 font-mono text-xs text-neon-green">
                  {log.inferenceTime || "N/A"}
                </td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    "px-2.5 py-1 rounded border text-xs font-medium flex items-center gap-1.5 w-fit leading-tight max-w-xs",
                    log.isBlocked 
                      ? "bg-red-950/50 text-red-400 border-red-900/50" 
                      : "bg-green-950/30 text-neon-green border-green-900/30"
                  )}>
                    {log.isBlocked ? <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" /> : <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />}
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    "px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border",
                    log.isGenuine 
                      ? "bg-blue-950/30 text-blue-400 border-blue-900/50"
                      : "bg-slate-800 text-slate-500 border-slate-700"
                  )}>
                    {log.isGenuine ? "INT8 GPU/NPU" : "Simulated"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
