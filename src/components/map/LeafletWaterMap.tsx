import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Station } from '../../types/station';
import { SituationStatus } from '../../types/basin';
import { useLanguage } from '../../hooks/useLanguage';
import { r2Client } from '../../services/r2Client';
import { isStationMissingData } from '../../services/stationService';

interface LeafletWaterMapProps {
  stations: Station[];
  center: [number, number];
  zoom: number;
  selectedStationId?: string | null;
  onSelectStation: (st: Station) => void;
  baseMapType?: 'streets' | 'dark' | 'satellite';
  userLocation?: { lat: number; long: number } | null;
  radiusKm?: number;
  basinSlug?: string;
  showFlowPaths?: boolean;
}

/**
 * Parses coordinates from GeoJSON LineString or MultiLineString into Leaflet [lat, lng]
 */
function parseCoordinatesToLatLngs(geometry: any): [number, number][][] {
  if (!geometry || !geometry.coordinates) return [];
  const lines: [number, number][][] = [];

  if (geometry.type === 'LineString') {
    const pts = geometry.coordinates
      .filter((pt: any) => Array.isArray(pt) && pt.length >= 2 && !isNaN(pt[0]) && !isNaN(pt[1]))
      .map((pt: [number, number]) => [pt[1], pt[0]] as [number, number]);
    if (pts.length >= 2) lines.push(pts);
  } else if (geometry.type === 'MultiLineString') {
    for (const segment of geometry.coordinates) {
      if (Array.isArray(segment)) {
        const pts = segment
          .filter((pt: any) => Array.isArray(pt) && pt.length >= 2 && !isNaN(pt[0]) && !isNaN(pt[1]))
          .map((pt: [number, number]) => [pt[1], pt[0]] as [number, number]);
        if (pts.length >= 2) lines.push(pts);
      }
    }
  }
  return lines;
}

/**
 * Assigns styling for hydrological flow paths based on feature_type
 */
function getFlowPathStyle(featureType: string): L.PolylineOptions {
  switch (featureType) {
    case 'gauge_to_gauge_flowpath':
      return {
        color: '#00E5FF',
        weight: 2.2,
        opacity: 0.85,
      };
    case 'osm_waterway':
      return {
        color: '#38BDF8',
        weight: 1.6,
        opacity: 0.7,
      };
    case 'rainfall_to_gauge_flowpath':
      return {
        color: '#2DD4BF',
        weight: 1.4,
        dashArray: '5, 5',
        opacity: 0.65,
      };
    case 'rainfall_drainage_branch':
      return {
        color: '#7DD3FC',
        weight: 1.1,
        opacity: 0.5,
      };
    default:
      return {
        color: '#0284C7',
        weight: 1.5,
        opacity: 0.6,
      };
  }
}

/**
 * Creates rich HTML tooltip / popup for flow path segment
 */
function createFlowPathPopup(props: any, isThai: boolean): string {
  if (!props) return '';
  const type = props.feature_type;
  let title = isThai ? 'โครงข่ายเส้นทางน้ำ' : 'Flow Path';
  let details = '';

  if (type === 'gauge_to_gauge_flowpath') {
    title = isThai ? '🌊 เส้นทางน้ำเชื่อมโยงสถานีวัดน้ำ' : '🌊 Gauge Connection Flow Path';
    details = `
      <div><strong>${isThai ? 'ต้นทาง:' : 'From:'}</strong> ${props.from_station_name || props.from_station_id || '-'}</div>
      <div><strong>${isThai ? 'ปลายทาง:' : 'To:'}</strong> ${props.to_station_name || props.to_station_id || 'จุดรวมน้ำหลัก'}</div>
      <div><strong>${isThai ? 'ระยะทาง:' : 'Distance:'}</strong> ${props.distance_km ? `${props.distance_km} กม.` : '-'}</div>
      ${props.river_slope ? `<div><strong>${isThai ? 'ความลาดชัน:' : 'Slope:'}</strong> ${(props.river_slope * 1000).toFixed(2)} ‰</div>` : ''}
    `;
  } else if (type === 'osm_waterway') {
    title = isThai ? '🏞️ ลำน้ำธรรมชาติ (Waterway)' : '🏞️ Natural River / Waterway';
    details = `
      <div><strong>${isThai ? 'ชื่อลำน้ำ:' : 'River:'}</strong> ${props.river_name || (isThai ? 'ลำน้ำสาขา' : 'Tributary')}</div>
      ${props.length_km ? `<div><strong>${isThai ? 'ความยาว:' : 'Length:'}</strong> ${props.length_km} กม.</div>` : ''}
      ${props.waterway ? `<div><strong>${isThai ? 'ประเภท:' : 'Type:'}</strong> ${props.waterway}</div>` : ''}
    `;
  } else if (type === 'rainfall_to_gauge_flowpath') {
    title = isThai ? '🌧️ เส้นทางน้ำหลากจากสถานีฝน' : '🌧️ Rainfall Runoff Path';
    details = `
      <div><strong>${isThai ? 'จากสถานีฝน:' : 'From:'}</strong> ${props.from_station_name || props.from_station_id || '-'}</div>
      <div><strong>${isThai ? 'จุดไหลลงแม่น้ำ:' : 'Drain To:'}</strong> ${props.to_station_name || 'Stream Entry'}</div>
      <div><strong>${isThai ? 'ระยะทาง:' : 'Distance:'}</strong> ${props.distance_km ? `${props.distance_km} กม.` : '-'}</div>
      ${props.response_lag_hours ? `<div><strong>${isThai ? 'เวลาตอบสนอง:' : 'Lag Time:'}</strong> ~${props.response_lag_hours} ชม.</div>` : ''}
    `;
  } else if (type === 'rainfall_drainage_branch') {
    title = isThai ? '💧 ลำน้ำระบายน้ำสาขาย่อย' : '💧 Drainage Branch';
    details = `
      <div><strong>${isThai ? 'สถานี:' : 'Station ID:'}</strong> #${props.from_station_id || '-'}</div>
      ${props.branch_length_km ? `<div><strong>${isThai ? 'ความยาวสาขา:' : 'Branch Length:'}</strong> ${props.branch_length_km} กม.</div>` : ''}
    `;
  }

  return `
    <div style="font-family: inherit; font-size: 11px; line-height: 1.5; color: #0F172A; min-width: 180px;">
      <div style="font-weight: bold; color: #0284C7; margin-bottom: 4px; border-bottom: 1px solid #E2E8F0; padding-bottom: 2px;">
        ${title}
      </div>
      <div style="display: flex; flex-direction: column; gap: 2px;">
        ${details}
      </div>
    </div>
  `;
}

/**
 * World-spanning coordinates in Web Mercator [lat, lng] format.
 * Covers -85.051128 to 85.051128 lat, and -360 to 360 lng to ensure the black mask
 * surrounds the basin even when panning or zooming out.
 */
const WORLD_MASK_COORDS: [number, number][] = [
  [-85.051128, -360],
  [-85.051128, 360],
  [85.051128, 360],
  [85.051128, -360],
  [-85.051128, -360],
];

/**
 * Extracts outer boundary rings from GeoJSON (FeatureCollection, Feature, or Geometry)
 * converting [lng, lat] GeoJSON coordinates to Leaflet [lat, lng] format.
 */
function extractPolygonRings(geoJsonData: any): [number, number][][] {
  const rings: [number, number][][] = [];

  const processGeometry = (geom: any) => {
    if (!geom) return;
    if (geom.type === 'Polygon' && Array.isArray(geom.coordinates) && geom.coordinates.length > 0) {
      const extRing = geom.coordinates[0];
      if (Array.isArray(extRing)) {
        const latLngs = extRing
          .filter((pt: any) => Array.isArray(pt) && pt.length >= 2)
          .map((pt: [number, number]) => [pt[1], pt[0]] as [number, number]);
        if (latLngs.length > 2) {
          rings.push(latLngs);
        }
      }
    } else if (geom.type === 'MultiPolygon' && Array.isArray(geom.coordinates)) {
      for (const poly of geom.coordinates) {
        if (Array.isArray(poly) && poly.length > 0 && Array.isArray(poly[0])) {
          const latLngs = poly[0]
            .filter((pt: any) => Array.isArray(pt) && pt.length >= 2)
            .map((pt: [number, number]) => [pt[1], pt[0]] as [number, number]);
          if (latLngs.length > 2) {
            rings.push(latLngs);
          }
        }
      }
    } else if (geom.type === 'GeometryCollection' && Array.isArray(geom.geometries)) {
      geom.geometries.forEach(processGeometry);
    }
  };

  if (geoJsonData.type === 'FeatureCollection' && Array.isArray(geoJsonData.features)) {
    geoJsonData.features.forEach((f: any) => processGeometry(f.geometry));
  } else if (geoJsonData.type === 'Feature') {
    processGeometry(geoJsonData.geometry);
  } else {
    processGeometry(geoJsonData);
  }

  return rings;
}

export const LeafletWaterMap: React.FC<LeafletWaterMapProps> = ({
  stations,
  center,
  zoom,
  selectedStationId,
  onSelectStation,
  baseMapType = 'satellite',
  userLocation,
  radiusKm,
  basinSlug,
  showFlowPaths = true,
}) => {
  const { t, isThai } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userLayerRef = useRef<L.LayerGroup | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const maskLayerRef = useRef<L.Polygon | null>(null);
  const flowPathsLayerRef = useRef<L.LayerGroup | null>(null);
  const canvasRendererRef = useRef<L.Canvas | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Progressive loading progress state (0 - 100%, null when not loading)
  const [flowPathsProgress, setFlowPathsProgress] = useState<number | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Custom pane for the 70% black world mask (above tiles at 200, below overlays at 400 & markers at 600)
      if (!map.getPane('maskPane')) {
        const maskPane = map.createPane('maskPane');
        maskPane.style.zIndex = '350';
        maskPane.style.pointerEvents = 'none';
      }

      // Initialize hardware-accelerated Canvas renderer to avoid mobile SVG DOM explosion
      const canvasRenderer = L.canvas({ padding: 0.5 });
      canvasRendererRef.current = canvasRenderer;

      mapInstanceRef.current = map;
      flowPathsLayerRef.current = L.layerGroup().addTo(map);
      markersLayerRef.current = L.layerGroup().addTo(map);
      userLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Base Map Tile Layer (Default: Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    // Default to Satellite
    let tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let attribution = 'Tiles &copy; Esri';
    let subdomains = 'abcd';

    if (baseMapType === 'streets') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
      subdomains = 'abc';
    } else if (baseMapType === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; OpenStreetMap &copy; CARTO';
      subdomains = 'abcd';
    }

    const tileLayer = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
      subdomains,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
  }, [baseMapType]);

  // Center update when center prop changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && !geoJsonLayerRef.current) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom]);

  // Load Basin Boundary GeoJSON from Cloudflare R2 and apply 70% black mask outside
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !basinSlug) return;

    let isMounted = true;

    // Clean up previous layers
    if (maskLayerRef.current) {
      map.removeLayer(maskLayerRef.current);
      maskLayerRef.current = null;
    }
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }

    r2Client.getBoundaryGeoJson(basinSlug).then((geoJsonData) => {
      if (!isMounted || !map || !geoJsonData) return;

      try {
        const rings = extractPolygonRings(geoJsonData);

        // 1. Render black mask outside the basin with 70% opacity (0.7)
        if (rings.length > 0) {
          const maskPolygon = L.polygon([WORLD_MASK_COORDS, ...rings], {
            stroke: false,
            fillColor: '#000000',
            fillOpacity: 0.7,
            interactive: false,
            fillRule: 'evenodd',
            pane: 'maskPane',
          }).addTo(map);

          maskLayerRef.current = maskPolygon;
        }

        // 2. Render basin boundary contour
        const geoLayer = L.geoJSON(geoJsonData, {
          style: {
            color: '#06B6D4',
            weight: 2.5,
            opacity: 0.95,
            fill: false,
            interactive: false,
          },
        }).addTo(map);

        geoJsonLayerRef.current = geoLayer;

        // Auto fit bounds to the basin boundary
        if (geoLayer.getBounds().isValid()) {
          map.fitBounds(geoLayer.getBounds(), {
            padding: [24, 24],
            maxZoom: 12,
          });
        }
      } catch (e) {
        console.warn('Failed to parse or render boundary geojson:', e);
      }
    });

    return () => {
      isMounted = false;
      if (maskLayerRef.current && map) {
        map.removeLayer(maskLayerRef.current);
        maskLayerRef.current = null;
      }
      if (geoJsonLayerRef.current && map) {
        map.removeLayer(geoJsonLayerRef.current);
        geoJsonLayerRef.current = null;
      }
    };
  }, [basinSlug]);

  // Load and progressively render Flow Paths GeoJSON (.gz) with time-sliced chunking
  useEffect(() => {
    const map = mapInstanceRef.current;
    const canvasRenderer = canvasRendererRef.current;
    const flowPathsLayer = flowPathsLayerRef.current;
    if (!map || !basinSlug || !canvasRenderer || !flowPathsLayer) return;

    let isCancelled = false;

    // Cancel any ongoing frame
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Clear previous flow paths
    flowPathsLayer.clearLayers();

    if (!showFlowPaths) {
      setFlowPathsProgress(null);
      return;
    }

    setFlowPathsProgress(0);

    r2Client.getFlowPathsGeoJson(basinSlug).then((geoJsonData) => {
      if (isCancelled || !map) {
        setFlowPathsProgress(null);
        return;
      }

      if (!geoJsonData) {
        setFlowPathsProgress(null);
        return;
      }

      const features: any[] = Array.isArray(geoJsonData.features)
        ? geoJsonData.features
        : geoJsonData.type === 'Feature'
        ? [geoJsonData]
        : [];

      if (features.length === 0) {
        setFlowPathsProgress(null);
        return;
      }

      const totalFeatures = features.length;
      let currentIndex = 0;
      // Process 150 features per frame to prevent mobile UI lag and maintain 60 FPS
      const CHUNK_SIZE = 150;

      const renderNextChunk = () => {
        if (isCancelled || !map || !flowPathsLayerRef.current) return;

        const limit = Math.min(currentIndex + CHUNK_SIZE, totalFeatures);

        for (let i = currentIndex; i < limit; i++) {
          const feat = features[i];
          const lines = parseCoordinatesToLatLngs(feat.geometry);
          const style = getFlowPathStyle(feat.properties?.feature_type);
          const popupHtml = createFlowPathPopup(feat.properties, isThai);

          for (const lineCoords of lines) {
            const poly = L.polyline(lineCoords, {
              ...style,
              renderer: canvasRenderer,
            });
            if (popupHtml) {
              poly.bindPopup(popupHtml, { className: 'flow-path-popup' });
            }
            flowPathsLayerRef.current.addLayer(poly);
          }
        }

        currentIndex = limit;
        const pct = Math.round((currentIndex / totalFeatures) * 100);
        setFlowPathsProgress(pct);

        if (currentIndex < totalFeatures) {
          rafIdRef.current = requestAnimationFrame(renderNextChunk);
        } else {
          rafIdRef.current = null;
          // Gracefully fade out the progress indicator after streaming finishes
          setTimeout(() => {
            if (!isCancelled) {
              setFlowPathsProgress(null);
            }
          }, 1200);
        }
      };

      rafIdRef.current = requestAnimationFrame(renderNextChunk);
    });

    return () => {
      isCancelled = true;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [basinSlug, showFlowPaths, isThai]);

  // Render Station Pulse Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    stations.forEach((station) => {
      const isMissing = isStationMissingData(station);
      const isWater = station.stationType === 'water_level';
      const status = isMissing ? 'missing' : station.status;
      const isSelected = selectedStationId === station.id;

      // Color mapping for status halo
      const colorHex: Record<SituationStatus, string> = {
        normal: '#10B981',
        watch: '#F59E0B',
        warning: '#F97316',
        critical: '#EF4444',
        missing: '#64748B',
      };

      const markerColor = isMissing ? '#64748B' : (colorHex[status] || '#06B6D4');
      const iconSymbol = isWater ? '🌊' : '🌧️';

      // Custom HTML Marker: If missing data, display static gray icon without ping/pulse effect
      const customIcon = L.divIcon({
        className: isMissing ? 'custom-water-marker custom-marker-missing' : 'custom-water-marker',
        html: isMissing
          ? `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; cursor: pointer;">
            <div style="position: relative; width: 30px; height: 30px; border-radius: 9999px; background-color: #1E293B; border: 2px solid #64748B; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: none; opacity: 0.8; transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}; transition: transform 0.2s;">
              <span style="filter: grayscale(100%) opacity(0.6);">${iconSymbol}</span>
            </div>
            <div style="position: absolute; bottom: -18px; font-family: monospace; font-size: 9.5px; font-weight: 600; background: rgba(15, 23, 42, 0.9); color: #94A3B8; padding: 1px 4px; border-radius: 4px; border: 1px solid rgba(100, 116, 139, 0.3); white-space: nowrap;">
              ${station.code}
            </div>
          </div>
        `
          : `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; cursor: pointer;">
            <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: ${markerColor}; opacity: ${isSelected ? 0.6 : 0.3}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 32px; height: 32px; border-radius: 9999px; background-color: #070B12; border: 2.5px solid ${markerColor}; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 0 15px ${markerColor}80; transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'}; transition: transform 0.2s;">
              ${iconSymbol}
            </div>
            <div style="position: absolute; bottom: -18px; font-family: monospace; font-size: 10px; font-weight: bold; background: rgba(7, 11, 18, 0.85); color: #F1F5F9; padding: 1px 4px; border-radius: 4px; border: 1px solid rgba(100, 116, 139, 0.4); white-space: nowrap;">
              ${station.code}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([station.lat, station.long], {
        icon: customIcon,
        zIndexOffset: isSelected ? 1000 : (isMissing ? -300 : 0),
      });

      marker.on('click', () => {
        onSelectStation(station);
      });

      markersLayer.addLayer(marker);
    });

  }, [stations, selectedStationId, onSelectStation]);

  // Render User Location & Radar Range Rings if available
  useEffect(() => {
    const map = mapInstanceRef.current;
    const userLayer = userLayerRef.current;
    if (!map || !userLayer) return;

    userLayer.clearLayers();

    if (userLocation) {
      // User Blue Dot Marker
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
            <div style="position: absolute; inset: 0; border-radius: 9999px; background-color: #38BDF8; opacity: 0.5; animation: ping 1.5s infinite;"></div>
            <div style="width: 14px; height: 14px; border-radius: 9999px; background-color: #0284C7; border: 2.5px solid #FFFFFF; box-shadow: 0 0 10px #38BDF8;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const userMarker = L.marker([userLocation.lat, userLocation.long], { icon: userIcon });
      userLayer.addLayer(userMarker);

      // Range Circle Radius in meters
      if (radiusKm) {
        const circle = L.circle([userLocation.lat, userLocation.long], {
          radius: radiusKm * 1000,
          color: '#06B6D4',
          fillColor: '#06B6D4',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '4, 6',
        });
        userLayer.addLayer(circle);
      }
    }
  }, [userLocation, radiusKm]);

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden rounded-3xl border border-slate-800 shadow-2xl bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Progressive Loading Pill for Flow Paths */}
      {flowPathsProgress !== null && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[450] pointer-events-none flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 shadow-2xl transition-all duration-300">
          <div className="relative flex items-center justify-center w-3 h-3">
            <div className="absolute w-full h-full rounded-full bg-cyan-400 opacity-75 animate-ping" />
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
          </div>
          <span className="text-xs font-semibold text-cyan-200 whitespace-nowrap">
            {isThai ? `กำลังโหลดโครงข่ายเส้นทางน้ำ ${flowPathsProgress}%` : `Loading Flow Paths ${flowPathsProgress}%`}
          </span>
          <div className="w-16 h-1.5 bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-150 rounded-full"
              style={{ width: `${flowPathsProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

