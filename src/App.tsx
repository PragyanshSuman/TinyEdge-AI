import { useState, useEffect } from 'react';
import clsx from 'clsx';
import './App.css';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { HardwareMonitorWidget } from './components/widgets/HardwareMonitorWidget';
import { NetworkTrafficGraphWidget } from './components/widgets/NetworkTrafficGraphWidget';
import { ThreatLogTableWidget } from './components/widgets/ThreatLogTableWidget';

function App() {
  const [isUnderAttack, setIsUnderAttack] = useState(false);
  const [borderFlash, setBorderFlash] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [livePps, setLivePps] = useState(0);

  useEffect(() => {
    if (!isLiveMode) return;
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch('http://localhost:8000/live_traffic');
        const data = await response.json();
        
        if (data.error) {
           console.error(data.error);
           return;
        }

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
            isZeroDay: data.isThreat
          };

          setLogs(prev => [newLog, ...prev].slice(0, 50));

          if (data.isThreat) {
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
  }, [isLiveMode]);

  // Initialize base logs
  useEffect(() => {
    const now = new Date();
    const getPastTime = (minutes: number) => {
      const d = new Date(now.getTime() - minutes * 60000);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    };

    setLogs([
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

      setLogs(prev => [newLog, ...prev]);

      if (data.isThreat) {
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
      <div className="flex justify-end px-6 pt-4 max-w-7xl mx-auto w-full">
        <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold text-sm bg-slate-900 border border-slate-700 px-4 py-2 rounded hover:bg-slate-800 transition-colors shadow-lg">
          <input type="checkbox" className="accent-neon-green w-4 h-4 cursor-pointer" checked={isLiveMode} onChange={(e) => setIsLiveMode(e.target.checked)} />
          Live Sniffing Mode
        </label>
      </div>
      <Dashboard>
        <HardwareMonitorWidget isUnderAttack={isUnderAttack} />
        <NetworkTrafficGraphWidget 
          isUnderAttack={isUnderAttack} 
          onSimulateAttack={handleSimulateAttack} 
          isLiveMode={isLiveMode}
          livePps={livePps}
        />
        <ThreatLogTableWidget logs={logs} />
      </Dashboard>
    </div>
  )
}

export default App;
