import { useState, useEffect } from 'react';
import clsx from 'clsx';
import './App.css';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { HardwareMonitorWidget } from './components/widgets/HardwareMonitorWidget';
import { NetworkTrafficGraphWidget } from './components/widgets/NetworkTrafficGraphWidget';
import { ThreatLogTableWidget } from './components/widgets/ThreatLogTableWidget';
import { ThreatMapWidget } from './components/widgets/ThreatMapWidget';

function App() {
// ... existing code, just doing the import at top and adding to Dashboard

  const [isUnderAttack, setIsUnderAttack] = useState(false);
  const [borderFlash, setBorderFlash] = useState(false);
  const [liveLogs, setLiveLogs] = useState<any[]>([]);
  const [simulatedLogs, setSimulatedLogs] = useState<any[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [livePps, setLivePps] = useState(0);
  const [liveHw, setLiveHw] = useState<{cpu: number, ram: number} | null>(null);
  const [activeTab, setActiveTab] = useState<'live' | 'simulated'>('live');

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:8000/live_traffic');
        const data = await response.json();
        
        if (data.error) {
           console.error(data.error);
           return;
        }

        if (data.hw) {
          setLiveHw(data.hw);
        }

        if (!isLiveMode) return; // Only update logs and PPS if sniffing mode is explicitly enabled

        setLivePps(data.pps || 0);

        // Only log if it's a threat or sparsely to not flood the table with "Normal Traffic"
        if (data.isThreat || Math.random() < 0.1) {
          const newLog = {
            id: Date.now(),
            timestamp: data.timestamp,
            sourceIp: data.sourceIp,
            protocol: data.protocol,
            classification: data.prediction,
            action: data.action,
            confidence: data.confidence,
            inferenceTime: data.inferenceTime,
            isGenuine: data.isGenuine,
            isBlocked: data.isThreat,
            isZeroDay: data.isThreat,
            raw_hex: data.raw_hex,
            geo: data.geo
          };

          setLiveLogs(prev => [newLog, ...prev].slice(0, 50));

          if (data.isThreat && activeTab === 'live') {
            setIsUnderAttack(true);
            setBorderFlash(true);
            setTimeout(() => setBorderFlash(false), 2000);
            setTimeout(() => setIsUnderAttack(false), 6000);
          }
        }
      } catch (error) {
        console.error("Live traffic error:", error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLiveMode, activeTab]);

  // Initialize base logs
  useEffect(() => {
    const now = new Date();
    const getPastTime = (minutes: number) => {
      const d = new Date(now.getTime() - minutes * 60000);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    };

    setSimulatedLogs([
      {
        id: 2,
        timestamp: getPastTime(2),
        sourceIp: '192.168.1.45',
        protocol: 'TCP',
        classification: 'Normal Traffic',
        action: 'Allowed',
        confidence: '99.8%',
        isBlocked: false,
      },
      {
        id: 3,
        timestamp: getPastTime(15), 
        sourceIp: '45.33.22.11',
        protocol: 'ICMP',
        classification: 'Ping Sweep',
        action: 'Blocked',
        confidence: '95.2%',
        isBlocked: true,
      },
      {
        id: 4,
        timestamp: getPastTime(42),
        sourceIp: '192.168.1.12',
        protocol: 'UDP',
        classification: 'Normal Traffic',
        action: 'Allowed',
        confidence: '98.9%',
        isBlocked: false,
      }
    ]);
  }, []);

  const handleSimulateAttack = async (attackType: string) => {
    if (isUnderAttack) return;
    
    try {
      // Send the distinct attack payload to the NIDS AI model
      let packets = 200;
      if (attackType === 'ddos') packets = 5000;
      if (attackType === 'adversarial') packets = 250;
      if (attackType === 'rounding_error') packets = 150;

      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attack_type: attackType, packets_per_second: packets }),
      });
      
      const data = await response.json();
      
      const newLog = {
        id: Date.now(),
        timestamp: data.timestamp,
        sourceIp: data.sourceIp,
        protocol: data.protocol,
        classification: data.prediction,
        action: data.action,
        confidence: data.confidence,
        inferenceTime: data.inferenceTime,
        isGenuine: data.isGenuine,
        isBlocked: data.isThreat,
        isZeroDay: data.isThreat
      };

      setSimulatedLogs(prev => [newLog, ...prev]);

      if (data.isThreat && activeTab === 'simulated') {
        setIsUnderAttack(true);
        setBorderFlash(true);
        
        setTimeout(() => setBorderFlash(false), 2000);
        setTimeout(() => setIsUnderAttack(false), 6000);
      }
    } catch (error) {
      console.error("AI Model Server Offline:", error);
    }
  };

  return (
    <div 
      className={clsx(
        "min-h-screen bg-slate-950 font-sans selection:bg-neon-green/30 transition-all duration-300 border-4 box-border",
        borderFlash ? "border-cyber-red shadow-[inset_0_0_100px_rgba(255,51,51,0.2)]" : "border-transparent"
      )}
    >
      <Header />
      <div className="flex flex-col sm:flex-row justify-between items-center px-6 pt-4 max-w-7xl mx-auto w-full gap-4">
        <div className="flex bg-slate-900 border border-slate-700 rounded-full p-1 shadow-lg z-10">
          <button 
            onClick={() => setActiveTab('live')}
            className={clsx("px-8 py-2 rounded-full text-sm font-semibold transition-all duration-300", activeTab === 'live' ? "bg-neon-green/20 text-neon-green border border-neon-green/30 shadow-[0_0_15px_rgba(57,255,20,0.2)]" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800")}
          >
            Live Shield (IPS)
          </button>
          <button 
            onClick={() => setActiveTab('simulated')}
            className={clsx("px-8 py-2 rounded-full text-sm font-semibold transition-all duration-300", activeTab === 'simulated' ? "bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/30 shadow-[0_0_15px_rgba(0,255,255,0.2)]" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800")}
          >
            Training & Simulation Lab
          </button>
        </div>

        {activeTab === 'live' && (
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold text-sm bg-slate-900 border border-slate-700 px-4 py-2 rounded hover:bg-slate-800 transition-colors shadow-lg z-10">
            <input type="checkbox" className="accent-neon-green w-4 h-4 cursor-pointer" checked={isLiveMode} onChange={(e) => setIsLiveMode(e.target.checked)} />
            Live Sniffing Mode
          </label>
        )}
      </div>

      <Dashboard>
        {activeTab === 'live' ? (
          <>
            <HardwareMonitorWidget isUnderAttack={isUnderAttack} liveHw={liveHw || undefined} />
            <NetworkTrafficGraphWidget 
              isUnderAttack={isUnderAttack} 
              onSimulateAttack={handleSimulateAttack} 
              isLiveMode={isLiveMode}
              livePps={livePps}
              hideSimulateButtons={true}
            />
            <ThreatMapWidget logs={liveLogs} />
            <ThreatLogTableWidget logs={liveLogs} />
          </>
        ) : (
          <>
            <HardwareMonitorWidget isUnderAttack={isUnderAttack} />
            <NetworkTrafficGraphWidget 
              isUnderAttack={isUnderAttack} 
              onSimulateAttack={handleSimulateAttack} 
              isLiveMode={false}
              livePps={0}
            />
            <ThreatLogTableWidget logs={simulatedLogs} />
          </>
        )}
      </Dashboard>
    </div>
  )
}

export default App;
