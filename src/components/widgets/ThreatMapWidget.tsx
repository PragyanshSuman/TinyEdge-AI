import { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';
import { Globe2, Maximize2, Minimize2 } from 'lucide-react';
import clsx from 'clsx';

interface ThreatMapProps {
  logs: any[];
}

export function ThreatMapWidget({ logs }: ThreatMapProps) {
  const globeEl = useRef<any>();
  const [arcsData, setArcsData] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Local machine coordinates (e.g., default fallback)
  const LOCAL_LAT = 37.7749;
  const LOCAL_LNG = -122.4194;

  useEffect(() => {
    const recentThreats = logs.filter(log => log.isBlocked && log.geo && log.geo.lat !== 0);
    
    const arcs = recentThreats.map(log => ({
      startLat: log.geo.lat,
      startLng: log.geo.lon,
      endLat: LOCAL_LAT,
      endLng: LOCAL_LNG,
      color: ['#ff3333', '#ff0000'],
      label: `Threat from ${log.geo.country || 'Unknown'}`
    }));

    setArcsData(arcs);

    if (arcs.length > 0 && globeEl.current) {
      const lastThreat = arcs[0];
      globeEl.current.pointOfView({ lat: lastThreat.startLat, lng: lastThreat.startLng, altitude: 2 }, 1000);
    }
  }, [logs]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const globeComponent = (
    <div className="absolute inset-0 top-[50px] flex items-center justify-center cursor-move overflow-hidden rounded-b-xl">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        backgroundColor="rgba(0,0,0,0)"
        atmosphereColor="lightskyblue"
        atmosphereAltitude={0.15}
        arcsData={arcsData}
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={1500}
        arcsTransitionDuration={1000}
        arcStroke={1.5}
      />
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex font-sans">
        <div className="w-[70%] relative border-r border-slate-800 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
            <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
              <Globe2 className="w-6 h-6 text-cyber-cyan" />
              Global Threat Origin Map (Expanded)
            </h2>
            <button onClick={() => setIsFullscreen(false)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded">
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 relative">
            {globeComponent}
          </div>
        </div>
        
        <div className="w-[30%] bg-slate-900 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-slate-800 sticky top-0 bg-slate-900/90 backdrop-blur z-10">
            <h3 className="text-lg font-bold text-slate-200">Active Projections</h3>
            <p className="text-sm text-slate-400">Tracing {arcsData.length} active origin(s)</p>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {logs.filter(log => log.isBlocked).length === 0 ? (
              <div className="text-slate-500 text-sm text-center mt-10">No active threats to project.</div>
            ) : (
              logs.filter(log => log.isBlocked).slice(0, 15).map(log => (
                <div key={log.id} className="bg-slate-800/50 p-3 rounded border border-slate-700 hover:border-slate-600 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono text-xs text-cyber-cyan">{log.sourceIp}</span>
                    <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-red-950/50 text-cyber-red border border-red-900/50 px-1.5 rounded">{log.classification}</span>
                  </div>
                  {log.geo && log.geo.country !== 'Unknown' && (
                    <div className="text-xs text-slate-400 mt-2">
                      Origin: <span className="text-slate-300 font-semibold">{log.geo.country}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 flex flex-col gap-4 bg-slate-900/50 rounded-xl border border-slate-800 p-5 mt-2 relative overflow-hidden h-[400px]">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 z-10 relative">
        <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-cyber-cyan" />
          Global Threat Origin Map
        </h2>
        <div className="flex items-center gap-3">
          {arcsData.length > 0 && (
            <span className="text-xs font-bold text-cyber-red animate-pulse bg-red-950/50 border border-red-900/50 px-2 py-1 rounded">
              ACTIVE ATTACK TRACED
            </span>
          )}
          <button onClick={() => setIsFullscreen(true)} className="text-slate-400 hover:text-white p-1" title="Maximize Map">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {globeComponent}
      
      <div className="absolute bottom-4 left-4 z-10 text-xs text-slate-400 bg-slate-950/80 p-2 rounded border border-slate-800 backdrop-blur-sm pointer-events-none">
        <p>Real-time Geolocation IP Tracing</p>
        {arcsData.length > 0 && (
          <p className="text-cyber-red font-semibold mt-1">Tracing {arcsData.length} active origin(s)</p>
        )}
      </div>
    </div>
  );
}
