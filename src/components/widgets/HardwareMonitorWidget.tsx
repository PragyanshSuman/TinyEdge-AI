import React, { useState, useEffect } from 'react';
import { MemoryStick, Cpu, Thermometer, Zap, Lock } from 'lucide-react';

interface CircularGaugeProps {
  value: number;
  max: number;
  label: string;
  subValue: string;
  icon: React.ReactNode;
  color: string;
}

function CircularGauge({ value, max, label, subValue, icon, color }: CircularGaugeProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  // Ensure we don't go below 0 offset (which would be >100% max)
  const boundedValue = Math.min(Math.max(value, 0), max);
  const strokeDashoffset = circumference - (boundedValue / max) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-900/50 rounded-xl border border-slate-800">
      <div className="relative flex items-center justify-center mb-3">
        {/* Background circle */}
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-slate-800"
          />
          {/* Progress circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out drop-shadow-lg"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-center">
        <div className="text-xl font-bold text-slate-100" style={{ color }}>{subValue}</div>
        <div className="text-xs font-medium text-slate-400 mt-1 max-w-[120px] leading-tight">{label}</div>
      </div>
    </div>
  );
}

export function HardwareMonitorWidget({ isUnderAttack = false }: { isUnderAttack?: boolean }) {
  const [cpu, setCpu] = useState(14);
  const [temp, setTemp] = useState(42);
  const [speed, setSpeed] = useState(3.2);

  // Dynamic Real-Time Metric Engine
  useEffect(() => {
    const interval = setInterval(() => {
      if (isUnderAttack) {
        // High threat conditions
        setCpu(Math.floor(Math.random() * (98 - 85 + 1) + 85)); // 85% to 98%
        setTemp(prev => (prev < 62 ? prev + Math.random() * 2.5 : 62 + Math.random() * 0.5)); // Rises to ~62C
        setSpeed(parseFloat((Math.random() * (18.5 - 12.0) + 12.0).toFixed(1))); // 12ms to 18ms
      } else {
        // Idle heartbeat conditions
        setCpu(Math.floor(Math.random() * (18 - 10 + 1) + 10)); // 10% to 18%
        setTemp(prev => (prev > 42 ? prev - Math.random() * 2 : 42 + Math.random() * 0.4)); // Settles at 42C
        setSpeed(parseFloat((Math.random() * (3.8 - 2.8) + 2.8).toFixed(1))); // 2.8ms to 3.8ms
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isUnderAttack]);

  return (
    <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Zap className="w-5 h-5 text-neon-green" />
          Hardware Efficiency
        </h2>
        <span className="text-xs font-mono text-slate-500">Live Device Status</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Memory footprint is mathematically static based on PyTorch export size */}
        <CircularGauge
          value={4.8}
          max={20.0}
          label="INT8 Quantized Footprint"
          subValue="4.8 / 20 MB"
          icon={<MemoryStick className="w-6 h-6 text-slate-300" />}
          color="var(--color-neon-green, #39ff14)"
        />
        <CircularGauge
          value={cpu}
          max={100}
          label="Router CPU Load"
          subValue={`${cpu}%`}
          icon={<Cpu className="w-6 h-6 text-slate-300" />}
          color={cpu > 80 ? "var(--color-cyber-red, #ff3333)" : "var(--color-neon-green, #39ff14)"}
        />
        <CircularGauge
          value={temp}
          max={100}
          label={temp > 55 ? "Device Temp (OVERHEATING)" : "Device Temp (Stable)"}
          subValue={`${temp.toFixed(1)}°C`}
          icon={<Thermometer className="w-6 h-6 text-slate-300" />}
          color={temp > 55 ? "var(--color-cyber-red, #ff3333)" : "var(--color-cyber-cyan, #00ffff)"}
        />
        <CircularGauge
          value={speed > 25 ? 25 : speed}
          max={25}
          label="Avg. Processing Time"
          subValue={`${speed.toFixed(1)} ms`}
          icon={<Zap className="w-6 h-6 text-slate-300" />}
          color={speed > 10 ? "var(--color-cyber-red, #ff3333)" : "var(--color-neon-green, #39ff14)"}
        />
      </div>

      {/* 4. Model Extraction Defense */}
      <div className="mt-4 p-3 bg-slate-950/80 border border-purple-900/40 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_15px_rgba(147,51,234,0.1)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-900/30 rounded-lg border border-purple-800/50">
            <Lock className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-purple-100 flex items-center gap-2">
              The Digital Safe
              <span className="text-[10px] px-1.5 py-0.5 bg-purple-950 text-purple-300 rounded border border-purple-800">Secure Enclave</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Model Storage: AES-256 Encrypted at Rest</div>
          </div>
        </div>
        <div className="px-2.5 py-1.5 bg-slate-900 text-slate-300 border border-slate-700 rounded text-[10px] font-mono whitespace-nowrap">
          <span className="text-purple-400">File:</span> tiny_edge_nids_int8.pt.enc
        </div>
      </div>
    </div>
  );
}
