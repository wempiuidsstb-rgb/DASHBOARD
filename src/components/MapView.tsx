import React, { useEffect, useRef, useState, useMemo } from 'react';
import { GarduRecord } from '../types';
import L from 'leaflet';
import { Layers, Maximize2, ExternalLink, Navigation, Search, CheckCircle2, AlertOctagon, BatteryCharging, ShieldAlert } from 'lucide-react';

// Safety patch for Leaflet Canvas renderer to prevent "Cannot read properties of undefined (reading 'save')"
if (typeof window !== 'undefined' && L && L.Canvas) {
  const canvasProto = L.Canvas.prototype as any;
  if (!canvasProto.__ctx_save_patched__) {
    canvasProto.__ctx_save_patched__ = true;

    const originalClear = canvasProto._clear;
    canvasProto._clear = function () {
      if (!this._ctx || !this._container) return;
      try {
        originalClear.call(this);
      } catch (_) {
        // Silently catch context destroyed or disposed race condition
      }
    };

    const originalDraw = canvasProto._draw;
    canvasProto._draw = function () {
      if (!this._ctx || !this._container) return;
      try {
        originalDraw.call(this);
      } catch (_) {
        // Silently catch context destroyed or disposed race condition
      }
    };

    const originalUpdateCircle = canvasProto._updateCircle;
    canvasProto._updateCircle = function (layer: any) {
      if (!this._ctx || !this._drawing || !layer || (layer._empty && layer._empty())) return;
      try {
        originalUpdateCircle.call(this, layer);
      } catch (_) {
        // Silently catch context destroyed or disposed race condition
      }
    };

    const originalUpdatePoly = canvasProto._updatePoly;
    canvasProto._updatePoly = function (layer: any, closed: boolean) {
      if (!this._ctx || !this._drawing || !layer) return;
      try {
        originalUpdatePoly.call(this, layer, closed);
      } catch (_) {
        // Silently catch context destroyed or disposed race condition
      }
    };

    const originalDestroyContainer = canvasProto._destroyContainer;
    canvasProto._destroyContainer = function () {
      if (this._redrawRequest) {
        try {
          L.Util.cancelAnimFrame(this._redrawRequest);
        } catch (_) {}
        this._redrawRequest = null;
      }
      this._drawing = false;
      try {
        originalDestroyContainer.call(this);
      } catch (_) {}
    };
  }
}

interface MapViewProps {
  records: GarduRecord[];
  onSelectGardu: (gardu: GarduRecord) => void;
  selectedGarduId?: string | null;
}

export const MapView: React.FC<MapViewProps> = ({
  records,
  onSelectGardu,
  selectedGarduId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const canvasRendererRef = useRef<L.Canvas | null>(null);
  const highlightCircleRef = useRef<L.CircleMarker | null>(null);

  const [basemap, setBasemap] = useState<'streets' | 'satellite' | 'carto'>('streets');
  const [mapSearch, setMapSearch] = useState('');
  const [searchMatches, setSearchMatches] = useState<GarduRecord[]>([]);

  // Filter only records that have valid coordinates
  const geoRecords = useMemo(() => {
    return records.filter((r) => r.lat !== null && r.lng !== null);
  }, [records]);

  // Statistics for map legend
  const legendStats = useMemo(() => {
    let ov = 0, nm = 0, un = 0;
    for (const r of geoRecords) {
      if (r.status_beban === 'OVERLOAD') ov++;
      else if (r.status_beban === 'UNDERLOAD') un++;
      else nm++;
    }
    return { total: geoRecords.length, overload: ov, normal: nm, underload: un };
  }, [geoRecords]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Default center on Bulukumba / South Sulawesi
    const map = L.map(mapContainerRef.current, {
      center: [-5.45, 120.2],
      zoom: 10,
      zoomControl: true,
      preferCanvas: true,
    });

    const canvas = L.canvas({ padding: 0.5 }).addTo(map);
    canvasRendererRef.current = canvas;

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    mapInstanceRef.current = map;

    // Invalidate size once DOM stabilizes
    const resizeTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.invalidateSize();
        } catch (_) {}
      }
    }, 150);

    return () => {
      clearTimeout(resizeTimer);
      if (highlightCircleRef.current) {
        try {
          highlightCircleRef.current.remove();
        } catch (_) {}
        highlightCircleRef.current = null;
      }
      if (markersLayerRef.current) {
        try {
          markersLayerRef.current.clearLayers();
        } catch (_) {}
        markersLayerRef.current = null;
      }
      if (canvasRendererRef.current) {
        try {
          canvasRendererRef.current.remove();
        } catch (_) {}
        canvasRendererRef.current = null;
      }
      try {
        map.stop();
        map.remove();
      } catch (err) {
        console.warn('Map cleanup error:', err);
      }
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap tile layer
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    if (basemap === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (basemap === 'carto') {
      url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';
    }

    const newTileLayer = L.tileLayer(url, {
      attribution,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [basemap]);

  // Update Markers when geoRecords changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    const canvas = canvasRendererRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    if (geoRecords.length === 0) return;

    const bounds = L.latLngBounds([]);

    geoRecords.forEach((rec) => {
      if (rec.lat === null || rec.lng === null) return;
      bounds.extend([rec.lat, rec.lng]);

      let fillColor = '#10b981'; // normal
      let strokeColor = '#047857';

      if (rec.status_beban === 'OVERLOAD') {
        fillColor = '#ef4444';
        strokeColor = '#b91c1c';
      } else if (rec.status_beban === 'UNDERLOAD') {
        fillColor = '#3b82f6';
        strokeColor = '#1d4ed8';
      }

      const marker = L.circleMarker([rec.lat, rec.lng], {
        renderer: canvas || undefined,
        radius: rec.status_beban === 'OVERLOAD' ? 7 : 5.5,
        fillColor,
        color: strokeColor,
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.85,
      });

      // Custom Popup HTML
      const statusBadge =
        rec.status_beban === 'OVERLOAD'
          ? '<span style="background:#fef2f2;color:#dc2626;padding:2px 8px;border-radius:6px;font-weight:700;font-size:11px;border:1px solid #fca5a5;">OVERLOAD</span>'
          : rec.status_beban === 'UNDERLOAD'
          ? '<span style="background:#eff6ff;color:#2563eb;padding:2px 8px;border-radius:6px;font-weight:700;font-size:11px;border:1px solid #bfdbfe;">UNDERLOAD</span>'
          : '<span style="background:#f0fdf4;color:#16a34a;padding:2px 8px;border-radius:6px;font-weight:700;font-size:11px;border:1px solid #86efac;">NORMAL</span>';

      const popupContent = `
        <div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:240px;padding:12px;color:#1e293b;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;border-bottom:1px solid #f1f5f9;padding-bottom:6px;">
            <div>
              <div style="font-weight:800;font-size:15px;color:#0f172a;">${rec.gardu}</div>
              <div style="font-size:11px;color:#64748b;">${rec.ulp}</div>
            </div>
            <div>${statusBadge}</div>
          </div>
          
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px;font-size:12px;">
            <div style="background:#f8fafc;padding:5px;border-radius:6px;">
              <span style="color:#64748b;font-size:10px;display:block;">Kapasitas</span>
              <strong style="color:#0f172a;">${rec.kapasitas} kVA (${rec.fasa} Ph)</strong>
            </div>
            <div style="background:#f8fafc;padding:5px;border-radius:6px;">
              <span style="color:#64748b;font-size:10px;display:block;">% Pembebanan</span>
              <strong style="color:${rec.beban_pct > 80 ? '#dc2626' : '#0f172a'};">${rec.beban_pct}%</strong>
            </div>
            <div style="background:#f8fafc;padding:5px;border-radius:6px;">
              <span style="color:#64748b;font-size:10px;display:block;">Unbalance</span>
              <strong style="color:#0f172a;">${rec.unbalance_pct}%</strong>
            </div>
            <div style="background:#f8fafc;padding:5px;border-radius:6px;">
              <span style="color:#64748b;font-size:10px;display:block;">Pembumian</span>
              <strong style="color:${rec.pembumian > 5 ? '#d97706' : '#16a34a'};">${rec.pembumian} &Omega;</strong>
            </div>
          </div>

          <div style="font-size:11px;color:#475569;margin-bottom:10px;background:#f1f5f9;padding:6px;border-radius:6px;">
            <div><strong>Penyulang:</strong> ${rec.penyulang || '-'}</div>
            <div style="margin-top:2px;"><strong>Arus R/S/T/N:</strong> ${rec.ir} / ${rec.is} / ${rec.it} / ${rec.in} A</div>
          </div>

          <div style="display:flex;gap:6px;">
            <button id="btn-detail-${rec.id}" style="flex:1;background:#2563eb;color:#fff;border:none;padding:6px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;">
              Lihat Rincian
            </button>
            <a href="https://www.google.com/maps/search/?api=1&query=${rec.lat},${rec.lng}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;justify-content:center;background:#e2e8f0;color:#334155;padding:6px 8px;border-radius:6px;text-decoration:none;font-size:11px;font-weight:600;">
              Google Maps
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300 });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-detail-${rec.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectGardu(rec);
          };
        }
      });

      marker.on('click', () => {
        // highlight marker
      });

      markersLayer.addLayer(marker);
    });

    // Fit map to bounds if points exist
    if (bounds.isValid()) {
      try {
        map.stop();
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14, animate: false });
      } catch (_) {}
    }
  }, [geoRecords, onSelectGardu]);

  // Handle selected gardu zoom & highlight ring
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedGarduId) {
      if (highlightCircleRef.current) {
        try {
          highlightCircleRef.current.remove();
        } catch (_) {}
        highlightCircleRef.current = null;
      }
      return;
    }

    const target = geoRecords.find((r) => r.id === selectedGarduId || r.gardu === selectedGarduId);
    if (target && target.lat !== null && target.lng !== null) {
      try {
        map.stop();
        map.flyTo([target.lat, target.lng], 15, { duration: 0.8 });
      } catch (_) {
        try {
          map.setView([target.lat, target.lng], 15);
        } catch (_) {}
      }

      if (highlightCircleRef.current) {
        try {
          highlightCircleRef.current.setLatLng([target.lat, target.lng]);
        } catch (_) {}
      } else {
        try {
          highlightCircleRef.current = L.circleMarker([target.lat, target.lng], {
            renderer: canvasRendererRef.current || undefined,
            radius: 14,
            fillColor: 'transparent',
            color: '#f59e0b',
            weight: 3,
            dashArray: '4, 4',
          }).addTo(map);
        } catch (_) {}
      }
    }
  }, [selectedGarduId, geoRecords]);

  // Quick map search
  const handleMapSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setMapSearch(query);
    if (!query.trim()) {
      setSearchMatches([]);
      return;
    }
    const q = query.toLowerCase();
    const matches = geoRecords
      .filter((r) => r.gardu.toLowerCase().includes(q) || r.penyulang.toLowerCase().includes(q))
      .slice(0, 5);
    setSearchMatches(matches);
  };

  const handleSelectMatch = (rec: GarduRecord) => {
    setMapSearch('');
    setSearchMatches([]);
    if (rec.lat && rec.lng && mapInstanceRef.current) {
      try {
        mapInstanceRef.current.stop();
        mapInstanceRef.current.flyTo([rec.lat, rec.lng], 16, { duration: 0.8 });
      } catch (_) {
        try {
          mapInstanceRef.current.setView([rec.lat, rec.lng], 16);
        } catch (_) {}
      }
      onSelectGardu(rec);
    }
  };

  const handleFitAll = () => {
    if (!mapInstanceRef.current || geoRecords.length === 0) return;
    const bounds = L.latLngBounds([]);
    geoRecords.forEach((r) => {
      if (r.lat && r.lng) bounds.extend([r.lat, r.lng]);
    });
    if (bounds.isValid()) {
      try {
        mapInstanceRef.current.stop();
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], animate: true });
      } catch (_) {}
    }
  };

  return (
    <div className="relative w-full h-[650px] lg:h-[720px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Top Controls: Basemap & Quick Search */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Quick Search on Map */}
        <div className="relative w-full sm:w-64 bg-white rounded-xl shadow-md border border-slate-300">
          <div className="flex items-center px-3.5 py-2">
            <Search className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
            <input
              type="text"
              value={mapSearch}
              onChange={handleMapSearch}
              placeholder="Cari gardu di peta..."
              className="w-full text-xs bg-transparent focus:outline-none text-slate-900 placeholder-slate-500 font-semibold"
            />
          </div>

          {searchMatches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-300 divide-y divide-slate-100 overflow-hidden max-h-48 overflow-y-auto">
              {searchMatches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMatch(m)}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <strong className="text-slate-900 font-bold">{m.gardu}</strong>
                    <span className="text-slate-600 ml-1.5 font-normal">({m.ulp})</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      m.status_beban === 'OVERLOAD'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : m.status_beban === 'UNDERLOAD'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {m.status_beban}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Basemap switcher */}
        <div className="flex items-center bg-white p-1 rounded-xl shadow-md border border-slate-300 text-xs font-semibold">
          <button
            onClick={() => setBasemap('streets')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              basemap === 'streets' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Peta Jalan
          </button>
          <button
            onClick={() => setBasemap('satellite')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              basemap === 'satellite' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Satelit
          </button>
          <button
            onClick={() => setBasemap('carto')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              basemap === 'carto' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Terang
          </button>
        </div>

        {/* Reset / Fit View button */}
        <button
          onClick={handleFitAll}
          title="Fokuskan Semua Gardu"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-white rounded-xl shadow-md border border-slate-300 text-xs font-bold text-slate-800 hover:text-slate-950 hover:bg-slate-50 transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Fokus Wilayah</span>
        </button>
      </div>

      {/* Floating Legend Bottom Right - Bento Card */}
      <div className="absolute bottom-5 right-4 z-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-300 text-xs space-y-2.5 max-w-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="stat-label text-slate-800">Status Beban Gardu</span>
          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
            {legendStats.total.toLocaleString()} Titik
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-200"></span>
              <span className="text-slate-700 font-medium">Overload (&gt;80%)</span>
            </div>
            <strong className="text-red-600 font-bold">{legendStats.overload.toLocaleString()}</strong>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
              <span className="text-slate-700 font-medium">Normal (40-80%)</span>
            </div>
            <strong className="text-emerald-600 font-bold">{legendStats.normal.toLocaleString()}</strong>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-200"></span>
              <span className="text-slate-700 font-medium">Underload (&lt;40%)</span>
            </div>
            <strong className="text-blue-600 font-bold">{legendStats.underload.toLocaleString()}</strong>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-blue-500 shrink-0" />
          <span>Klik titik gardu untuk inspeksi detail</span>
        </div>
      </div>
    </div>
  );
};
