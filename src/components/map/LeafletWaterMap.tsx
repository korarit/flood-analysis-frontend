import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Station } from '../../types/station';
import { SituationStatus } from '../../types/basin';
import { useLanguage } from '../../hooks/useLanguage';

interface LeafletWaterMapProps {
  stations: Station[];
  center: [number, number];
  zoom: number;
  selectedStationId?: string | null;
  onSelectStation: (st: Station) => void;
  baseMapType: 'dark' | 'streets' | 'satellite';
  userLocation?: { lat: number; long: number } | null;
  radiusKm?: number;
}

export const LeafletWaterMap: React.FC<LeafletWaterMapProps> = ({
  stations,
  center,
  zoom,
  selectedStationId,
  onSelectStation,
  baseMapType,
  userLocation,
  radiusKm,
}) => {
  const { t, isThai } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userLayerRef = useRef<L.LayerGroup | null>(null);

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

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
      userLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Base Map Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; OpenStreetMap &copy; CARTO';

    if (baseMapType === 'streets') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    } else if (baseMapType === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri';
    }

    const tileLayer = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = tileLayer;
  }, [baseMapType]);

  // Center update when center prop changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom]);

  // Render Station Pulse Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    stations.forEach((station) => {
      const isWater = station.stationType === 'water_level';
      const status = station.status;
      const isSelected = selectedStationId === station.id;

      // Color mapping for status halo
      const colorHex: Record<SituationStatus, string> = {
        normal: '#10B981',
        watch: '#F59E0B',
        warning: '#F97316',
        critical: '#EF4444',
        missing: '#64748B',
      };

      const markerColor = colorHex[status] || '#06B6D4';
      const iconSymbol = isWater ? '🌊' : '🌧️';

      // Custom HTML Marker with glowing pulse and icon
      const customIcon = L.divIcon({
        className: 'custom-water-marker',
        html: `
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

      const marker = L.marker([station.lat, station.long], { icon: customIcon });

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
    </div>
  );
};
