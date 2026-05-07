import { useState } from 'react';
import { ShieldAlert, ShieldCheck, SearchCode, X } from 'lucide-react';
import clsx from 'clsx';

interface ThreatLogTableProps {
  logs: any[];
}

export function ThreatLogTableWidget({ logs }: ThreatLogTableProps) {
  const [selectedHex, setSelectedHex] = useState<string | null>(null);

  return (
    <div className="col-span-12 flex flex-col gap-4 bg-slate-900/50 rounded-xl border border-slate-800 p-5 mt-2 relative">
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
              <th scope="col" className="px-6 py-3">Payload</th>
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
                  {log.raw_hex ? (
                    <button 
                      onClick={() => setSelectedHex(log.raw_hex)}
                      className="flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-300 border border-slate-700 rounded hover:bg-slate-700 transition-colors"
                    >
                      <SearchCode className="w-3.5 h-3.5" />
                      View Hex
                    </button>
                  ) : (
                    <span className="text-slate-600 text-xs">-</span>
                  )}
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

      {/* Hex Dump Modal */}
      {selectedHex && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
              <h3 className="text-slate-200 font-semibold flex items-center gap-2">
                <SearchCode className="w-4 h-4 text-cyber-cyan" />
                Raw Packet Payload (Hex Dump)
              </h3>
              <button onClick={() => setSelectedHex(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-black">
              <pre className="font-mono text-xs text-neon-green/80 whitespace-pre-wrap break-all leading-relaxed">
                {selectedHex}
              </pre>
            </div>
            <div className="p-3 border-t border-slate-800 bg-slate-950/50 text-xs text-slate-500 flex justify-between">
              <span>First 64 bytes of intercepted packet</span>
              <span>Layer 2/3 Inspection Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
