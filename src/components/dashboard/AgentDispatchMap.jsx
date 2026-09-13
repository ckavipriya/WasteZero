import { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Truck,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  Phone,
  ArrowRight,
  ExternalLink,
  Filter,
  Maximize2,
  RotateCcw,
} from 'lucide-react';

// Sample coordinates mapping for city zones if coordinates not provided
const CITY_ZONES = [
  { name: 'Banjara Hills, Sector 4', x: 28, y: 35, lat: 17.4156, lng: 78.4347 },
  { name: 'Jubilee Hills, Phase 2', x: 52, y: 22, lat: 17.4319, lng: 78.4071 },
  { name: 'Madhapur Tech Zone', x: 74, y: 45, lat: 17.4483, lng: 78.3808 },
  { name: 'Gachibowli Green Hub', x: 82, y: 72, lat: 17.4401, lng: 78.3489 },
  { name: 'Begumpet Commercial Block', x: 42, y: 65, lat: 17.4447, lng: 78.4664 },
  { name: 'Hitec City Circle', x: 62, y: 80, lat: 17.4435, lng: 78.3772 },
  { name: 'Kondapur Residential Colony', x: 35, y: 82, lat: 17.4616, lng: 78.3668 },
];

export default function AgentDispatchMap({ pickups = [], onStatusChange }) {
  const [selectedPickupId, setSelectedPickupId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [mapStyle, setMapStyle] = useState('streets'); // 'streets' | 'satellite' | 'dark'
  const [isOptimized, setIsOptimized] = useState(false);
  const [agentHubLocation] = useState({ x: 15, y: 48, name: 'Central Recycling Hub' });

  // Map incoming pickups to visual grid positions
  const mappedPickups = useMemo(() => {
    return pickups.map((p, idx) => {
      const zone = CITY_ZONES[idx % CITY_ZONES.length];
      return {
        ...p,
        gridX: p.gridX || zone.x,
        gridY: p.gridY || zone.y,
        zoneName: p.address || zone.name,
        lat: p.lat || zone.lat,
        lng: p.lng || zone.lng,
      };
    });
  }, [pickups]);

  // Filter pickups
  const filteredPickups = useMemo(() => {
    if (filterCategory === 'all') return mappedPickups;
    return mappedPickups.filter((p) => p.category.toLowerCase() === filterCategory.toLowerCase());
  }, [mappedPickups, filterCategory]);

  const pendingPickups = filteredPickups.filter((p) => p.status !== 'completed' && p.status !== 'cancelled');
  const activeSelected = mappedPickups.find((p) => p._id === selectedPickupId) || pendingPickups[0] || mappedPickups[0];

  // Route path calculations
  const routePoints = useMemo(() => {
    if (pendingPickups.length === 0) return [];
    let points = [agentHubLocation, ...pendingPickups];
    if (isOptimized) {
      // Sort by distance from hub visually
      points = [
        agentHubLocation,
        ...[...pendingPickups].sort((a, b) => {
          const distA = Math.hypot(a.gridX - agentHubLocation.x, a.gridY - agentHubLocation.y);
          const distB = Math.hypot(b.gridX - agentHubLocation.x, b.gridY - agentHubLocation.y);
          return distA - distB;
        }),
      ];
    }
    return points;
  }, [pendingPickups, isOptimized, agentHubLocation]);

  // Construct SVG Polyline path
  const svgPolylinePoints = routePoints.map((pt) => `${pt.gridX || pt.x},${pt.gridY || pt.y}`).join(' ');

  // Calculate route distance estimate
  const totalDistanceKm = useMemo(() => {
    if (routePoints.length < 2) return 0;
    let dist = 0;
    for (let i = 0; i < routePoints.length - 1; i++) {
      const p1 = routePoints[i];
      const p2 = routePoints[i + 1];
      const dx = (p1.gridX || p1.x) - (p2.gridX || p2.x);
      const dy = (p1.gridY || p1.y) - (p2.gridY || p2.y);
      dist += Math.sqrt(dx * dx + dy * dy) * 0.18; // scaling factor
    }
    return dist.toFixed(1);
  }, [routePoints]);

  const estTimeMins = Math.round(totalDistanceKm * 3.2);

  const getMarkerColor = (status) => {
    switch (status) {
      case 'in-progress':
        return 'bg-amber-500 border-amber-200 text-white ring-4 ring-amber-400/30';
      case 'assigned':
        return 'bg-blue-600 border-blue-200 text-white ring-4 ring-blue-400/30';
      case 'completed':
        return 'bg-emerald-500 border-emerald-200 text-white opacity-60';
      default:
        return 'bg-purple-600 border-purple-200 text-white';
    }
  };

  const getCategoryBadge = (category) => {
    const catLower = (category || '').toLowerCase();
    if (catLower.includes('plastic')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (catLower.includes('e-waste')) return 'bg-purple-100 text-purple-800 border-purple-300';
    if (catLower.includes('paper')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (catLower.includes('glass')) return 'bg-teal-100 text-teal-800 border-teal-300';
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-0">
      {/* Map Header Controls */}
      <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Live Pickup Route Dispatch Map</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200">
                {pendingPickups.length} Active Stops
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Visual doorstep coordinates & AI optimized collection path
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none pr-1"
            >
              <option value="all">All Waste</option>
              <option value="plastic">Plastic</option>
              <option value="paper">Paper</option>
              <option value="glass">Glass</option>
              <option value="e-waste">E-Waste</option>
            </select>
          </div>

          {/* Map Style Selector */}
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 text-xs">
            <button
              onClick={() => setMapStyle('streets')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                mapStyle === 'streets'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Street
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                mapStyle === 'satellite'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapStyle('dark')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                mapStyle === 'dark'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Dark
            </button>
          </div>

          {/* AI Route Optimizer */}
          <button
            onClick={() => setIsOptimized((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition cursor-pointer ${
              isOptimized
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isOptimized ? 'text-amber-300' : 'text-emerald-500'}`} />
            <span>{isOptimized ? 'Route Optimized' : 'Optimize Path'}</span>
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[460px]">
        {/* Interactive Map Visual Stage */}
        <div
          className={`lg:col-span-2 relative overflow-hidden transition-colors ${
            mapStyle === 'satellite'
              ? 'bg-slate-950 text-slate-100'
              : mapStyle === 'dark'
              ? 'bg-slate-900 text-slate-100'
              : 'bg-emerald-950/90 text-slate-800'
          }`}
          style={{
            backgroundImage:
              mapStyle === 'satellite'
                ? 'radial-gradient(circle, rgba(30, 41, 59, 0.4) 1px, transparent 1px)'
                : mapStyle === 'dark'
                ? 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)'
                : 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        >
          {/* Simulated Geographic Grid Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Sector grid lines */}
            <path
              d="M 0,25 L 100,25 M 0,50 L 100,50 M 0,75 L 100,75 M 25,0 L 25,100 M 50,0 L 50,100 M 75,0 L 75,100"
              stroke="currentColor"
              strokeWidth="0.15"
              strokeDasharray="1,1"
              opacity="0.25"
            />

            {/* Main Transit Corridor lines */}
            <path d="M 10,20 Q 40,60 90,40" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="0.8" fill="none" />
            <path d="M 20,80 Q 60,30 85,85" stroke="rgba(59, 130, 246, 0.25)" strokeWidth="0.8" fill="none" />

            {/* Route Polyline Path */}
            {routePoints.length > 1 && (
              <polyline
                points={svgPolylinePoints}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.2"
                strokeDasharray="2,2"
                className="animate-pulse"
              />
            )}
          </svg>

          {/* Central Agent Hub Marker */}
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
            style={{ left: `${agentHubLocation.x}%`, top: `${agentHubLocation.y}%` }}
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-400 text-amber-400 flex items-center justify-center shadow-lg hover:scale-110 transition">
              <Truck className="w-4 h-4" />
            </div>
            <div className="absolute top-9 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md pointer-events-none border border-slate-700">
              HQ Hub
            </div>
          </div>

          {/* Pickup Location Markers */}
          {mappedPickups.map((pickup, idx) => {
            const isSelected = activeSelected?._id === pickup._id;
            const isPending = pickup.status !== 'completed' && pickup.status !== 'cancelled';
            return (
              <div
                key={pickup._id}
                onClick={() => setSelectedPickupId(pickup._id)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer ${
                  isSelected ? 'z-30 scale-125' : 'z-10 hover:scale-110'
                }`}
                style={{ left: `${pickup.gridX}%`, top: `${pickup.gridY}%` }}
              >
                {/* Ripple Effect for selected or in-progress */}
                {isSelected && (
                  <span className="absolute -inset-2 rounded-full bg-amber-400/40 animate-ping" />
                )}

                {/* Marker Pin */}
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-[11px] shadow-lg ${getMarkerColor(
                    pickup.status
                  )}`}
                >
                  {idx + 1}
                </div>

                {/* Pin Tooltip Tag */}
                <div
                  className={`absolute top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap shadow-lg border transition ${
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-400 scale-100'
                      : 'bg-slate-900/90 text-slate-200 border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  <span className="capitalize">{pickup.category}</span> ({pickup.weightEstimateKg || 5}kg)
                </div>
              </div>
            );
          })}

          {/* Bottom Live Telemetry Overlay */}
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-md rounded-xl p-3 border border-slate-700 text-white flex flex-wrap items-center justify-between gap-3 text-xs z-20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Compass className="w-4 h-4" />
                <span className="font-bold">Dispatch Route</span>
              </div>
              <div>
                <span className="text-slate-400">Total Distance: </span>
                <span className="font-bold text-white">{totalDistanceKm} km</span>
              </div>
              <div>
                <span className="text-slate-400">Est. Time: </span>
                <span className="font-bold text-emerald-400">{estTimeMins} mins</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                <span className="text-slate-300">Assigned</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="text-slate-300">In Transit</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-slate-300">Collected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Location Details Sidebar */}
        <div className="bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
          {activeSelected ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Stop Details #{mappedPickups.findIndex((p) => p._id === activeSelected._id) + 1}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize flex items-center gap-2">
                    <span>{activeSelected.category} Collection</span>
                  </h3>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${getCategoryBadge(
                    activeSelected.category
                  )}`}
                >
                  {activeSelected.status}
                </span>
              </div>

              {/* Location Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Pickup Address</span>
                    <span>{activeSelected.address || activeSelected.zoneName}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Estimated Weight</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {activeSelected.weightEstimateKg || 5} kg
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Preferred Slot</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {activeSelected.preferredTimeSlot || 'Morning (9-12)'}
                    </span>
                  </div>
                </div>

                {activeSelected.user && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Resident Customer</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {activeSelected.user.name || activeSelected.user.username}
                      </span>
                    </div>
                    <a
                      href={`tel:${activeSelected.phone || '9876543210'}`}
                      className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 transition"
                      title="Call Resident"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* External Navigation Link */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  activeSelected.address || activeSelected.zoneName
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Agent Actions */}
              {onStatusChange && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {activeSelected.status === 'assigned' && (
                    <button
                      onClick={() => onStatusChange(activeSelected._id, 'in-progress')}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Start Route Transit</span>
                    </button>
                  )}
                  {activeSelected.status !== 'completed' && activeSelected.status !== 'cancelled' && (
                    <button
                      onClick={() => onStatusChange(activeSelected._id, 'completed')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark Doorstep Collected</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Select a pin on the map to view doorstep details
            </div>
          )}

          {/* Pickup List Counter */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Route Stops ({mappedPickups.length})</span>
            <div className="flex gap-1">
              {mappedPickups.map((p, idx) => (
                <button
                  key={p._id}
                  onClick={() => setSelectedPickupId(p._id)}
                  className={`w-6 h-6 rounded-lg font-bold text-[10px] transition ${
                    activeSelected?._id === p._id
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
