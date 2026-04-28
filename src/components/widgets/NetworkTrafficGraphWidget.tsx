import { useState, useEffect } from 'react';
import { Activity, AlertTriangle, ShieldX, Ghost, Calculator } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface NetworkTrafficProps {
  isUnderAttack: boolean;
  onSimulateAttack: (type: string) => void;
  isLiveMode?: boolean;
  livePps?: number;
}

const generateNormalData = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    time: i,
    packets: Math.floor(Math.random() * 200) + 100, // 100 - 300
  }));
};

export function NetworkTrafficGraphWidget({ isUnderAttack, onSimulateAttack, isLiveMode, livePps }: NetworkTrafficProps) {
  const [data, setData] = useState(generateNormalData(20));
  const [currentAttack, setCurrentAttack] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        const newData = [...prevData.slice(1)];
        const lastTime = prevData[prevData.length - 1].time;
        
        let nextPackets;
        if (isLiveMode && livePps !== undefined) {
          nextPackets = livePps;
        } else if (isUnderAttack && currentAttack === 'ddos') {
          nextPackets = Math.floor(Math.random() * 3000) + 2000;
        } else {
          nextPackets = Math.floor(Math.random() * 200) + 100;
        }

        newData.push({ time: lastTime + 1, packets: nextPackets });
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isUnderAttack, currentAttack, isLiveMode, livePps]);

  const handleAttackClick = (type: string) => {
    setCurrentAttack(type);
    onSimulateAttack(type);
  };

  return (
    <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 bg-slate-900/50 rounded-xl border border-slate-800 p-5 relative overflow-hidden">
      {/* Alert Overlay */}
      {isUnderAttack && (
        <div className="absolute inset-0 bg-red-950/20 backdrop-blur-[2px] z-10 flex items-center justify-center animate-pulse">
          <div className="bg-red-950/80 border border-cyber-red px-6 py-4 rounded-lg flex flex-col items-center gap-2 shadow-[0_0_30px_rgba(255,51,51,0.3)]">
            <div className="flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-cyber-red" />
              <div>
                <h3 className="text-xl font-bold text-cyber-red">THREAT DETECTED</h3>
                <p className="text-red-200">Active Network Defense Engaged</p>
              </div>
            </div>
            <p className="text-xs font-mono text-red-300 bg-red-950 px-3 py-1 rounded">
              See Mitigation Log for Defense Strategy
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800 relative z-20 gap-3">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyber-cyan" />
          Live Network Traffic
        </h2>
        
        <div className="flex flex-wrap items-center gap-2">
          {isLiveMode && (
            <span className="text-neon-green text-xs font-bold animate-pulse px-2 py-1 bg-green-950/30 border border-green-900/50 rounded mr-2">
              ● LIVE SNIFFING
            </span>
          )}
          <button
            onClick={() => handleAttackClick('ddos')}
            disabled={isUnderAttack || isLiveMode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950 text-red-300 border border-red-900 rounded hover:bg-red-900 transition-colors disabled:opacity-50 text-xs font-semibold"
            title="Sends 5000+ packets/sec"
          >
            <ShieldX className="w-3.5 h-3.5" />
            Smash Doorbell (DDoS)
          </button>
          <button
            onClick={() => handleAttackClick('adversarial')}
            disabled={isUnderAttack || isLiveMode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-950 text-purple-300 border border-purple-900 rounded hover:bg-purple-900 transition-colors disabled:opacity-50 text-xs font-semibold"
            title="Sends padded malicious data"
          >
            <Ghost className="w-3.5 h-3.5" />
            Optical Illusion (Adversarial)
          </button>
          <button
            onClick={() => handleAttackClick('rounding_error')}
            disabled={isUnderAttack || isLiveMode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-950 text-orange-300 border border-orange-900 rounded hover:bg-orange-900 transition-colors disabled:opacity-50 text-xs font-semibold"
            title="Targets the 8-bit INT8 limits"
          >
            <Calculator className="w-3.5 h-3.5" />
            Rounding Error (8-Bit Blind Spot)
          </button>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" hide />
            <YAxis stroke="#475569" fontSize={12} tickFormatter={(val) => `${val} p/s`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
              itemStyle={{ color: isUnderAttack ? 'var(--color-cyber-red)' : 'var(--color-neon-green)' }}
            />
            <Line
              type="monotone"
              dataKey="packets"
              stroke={isUnderAttack && currentAttack === 'ddos' ? "var(--color-cyber-red)" : "var(--color-neon-green)"}
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
              strokeOpacity={0.8}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
