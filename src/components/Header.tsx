import { Shield, ServerOff, Cpu, Lock } from 'lucide-react';

export function Header() {
  return (
    <div className="flex flex-col border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
            <Shield className="w-6 h-6 text-neon-green" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">TinyEdge AI</h1>
            <p className="text-xs font-mono text-slate-400">NIDS Admin Panel v1.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></div>
            <span className="text-sm font-medium text-slate-300">System Healthy</span>
          </div>
          <div className="px-3 py-1 bg-slate-800 rounded-md border border-slate-700 font-mono text-xs text-cyber-cyan">
            IP: 192.168.1.1
          </div>
        </div>
      </header>

      {/* Widget 1: Air-Gapped Privacy Status Bar */}
      <div className="bg-slate-800/50 border-t border-slate-700/50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-md border border-slate-700">
            <ServerOff className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-300 tracking-wide">Cloud Connection: <span className="text-slate-500">OFFLINE</span></span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-950/30 rounded-md border border-green-900/50 shadow-[0_0_10px_rgba(57,255,20,0.1)]">
            <Cpu className="w-4 h-4 text-neon-green" />
            <span className="text-sm font-semibold text-neon-green">100% Local Inference Active</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-cyber-cyan" />
          <span className="text-xs font-medium text-slate-400">
            Privacy Shield: <span className="text-cyber-cyan">Encrypted Metadata Analysis - ON</span>
          </span>
        </div>
      </div>
    </div>
  );
}
