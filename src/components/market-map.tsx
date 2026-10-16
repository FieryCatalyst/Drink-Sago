"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Maximize2, Sparkles } from "lucide-react";

export interface MarketLocation {
  name: string;
  city: string;
  status: string;
  lng: number;
  lat: number;
  description: string;
}

export const MARKETS_DATA: MarketLocation[] = [
  {
    name: "Zambia",
    city: "Lusaka",
    status: "Origin & Headquarters",
    lng: 28.3228,
    lat: -15.3875,
    description: "The birthplace and home of SAGO Whisky. Distilled, blended and crafted with authentic African pride.",
  },
  {
    name: "Zimbabwe",
    city: "Harare",
    status: "Active Distribution",
    lng: 31.053,
    lat: -17.8248,
    description: "Distributed across prestigious retail purveyors, private clubs, and premier celebration lounges.",
  },
  {
    name: "Mozambique",
    city: "Maputo",
    status: "Coastal Distribution",
    lng: 32.5732,
    lat: -25.9692,
    description: "Connecting our spirits with the vibrant coastal hospitality scene and oceanfront resorts.",
  },
  {
    name: "Botswana",
    city: "Gaborone",
    status: "Licensed Retail",
    lng: 25.9231,
    lat: -24.6282,
    description: "Serving discerning whisky aficionados in high-end private lounges and boutique cellars.",
  },
  {
    name: "Namibia",
    city: "Windhoek",
    status: "Select Partners",
    lng: 17.0658,
    lat: -22.5609,
    description: "Featured in luxury safari reserves, heritage hotels, and premier spirit collections.",
  },
  {
    name: "Angola",
    city: "Luanda",
    status: "Atlantic Hub",
    lng: 13.2343,
    lat: -8.839,
    description: "Expanding the SAGO footprint into West-Central Africa's dynamic cultural capital.",
  },
  {
    name: "Tanzania",
    city: "Dar es Salaam",
    status: "Regional Gateway",
    lng: 39.2083,
    lat: -6.7924,
    description: "Rapidly expanding presence across high-energy metropolitan venues and island retreats.",
  },
  {
    name: "Kenya",
    city: "Nairobi",
    status: "East Africa Flagship",
    lng: 36.8219,
    lat: -1.2921,
    description: "Leading the modern African cocktail culture in Nairobi's most celebrated rooftop lounges.",
  },
];

const DEFAULT_CENTER: [number, number] = [28.0, -16.0];
const DEFAULT_ZOOM = 3.6;

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface MarketMapProps {
  activeMarket: string;
  onSelectMarket: (name: string) => void;
}

export default function MarketMap({ activeMarket, onSelectMarket }: MarketMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: { marker: mapboxgl.Marker; el: HTMLDivElement } }>({});
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current || !MAPBOX_TOKEN) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 2.5,
      maxZoom: 9,
      pitch: 20,
      bearing: 0,
      attributionControl: false,
      cooperativeGestures: true,
    });

    mapRef.current = map;

    map.on("load", () => {
      setMapLoaded(true);

      // Add navigation controls with custom styling
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

      // Create luxury custom markers
      MARKETS_DATA.forEach((market) => {
        const markerEl = document.createElement("div");
        markerEl.className = `sago-map-marker ${market.name === activeMarket ? "is-active" : ""}`;
        markerEl.setAttribute("aria-label", market.name);

        markerEl.innerHTML = `
          <div class="sago-map-marker__pulse"></div>
          <div class="sago-map-marker__ring"></div>
          <div class="sago-map-marker__dot"></div>
          <div class="sago-map-marker__label">
            <span>${market.name}</span>
          </div>
        `;

        markerEl.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelectMarket(market.name);
        });

        const marker = new mapboxgl.Marker({
          element: markerEl,
          anchor: "center",
        })
          .setLngLat([market.lng, market.lat])
          .addTo(map);

        markersRef.current[market.name] = { marker, el: markerEl };
      });
    });

    // Clean up
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update active marker styles and flyTo when activeMarket changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    Object.entries(markersRef.current).forEach(([name, { el }]) => {
      if (name.toLowerCase() === activeMarket.toLowerCase()) {
        el.classList.add("is-active");
      } else {
        el.classList.remove("is-active");
      }
    });

    const target = MARKETS_DATA.find((m) => m.name.toLowerCase() === activeMarket.toLowerCase());
    if (target) {
      mapRef.current.flyTo({
        center: [target.lng, target.lat],
        zoom: 5.2,
        speed: 1.1,
        curve: 1.4,
        essential: true,
      });
    }
  }, [activeMarket, mapLoaded]);

  // Handler to reset map to panoramic overview
  const handleResetOverview = useCallback(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      speed: 1,
      pitch: 20,
      bearing: 0,
      essential: true,
    });
  }, []);

  return (
    <div className="sago-market-map-wrapper">
      {/* Real Mapbox GL Canvas */}
      <div ref={mapContainerRef} className="sago-market-map-canvas" />

      {/* Luxury Vignette & Grain Overlay */}
      <div className="sago-market-map-vignette" />

      {/* Overview Button */}
      <button
        type="button"
        className="sago-market-overview-btn"
        onClick={handleResetOverview}
        title="View all markets"
        aria-label="View all markets"
      >
        <Maximize2 size={13} />
        <span>Pan-African View</span>
      </button>

      {/* Subdued Brand Watermark */}
      <div className="sago-market-watermark">
        <Sparkles size={11} />
        <span>SAGO FOOTPRINT · PAN-AFRICA</span>
      </div>
    </div>
  );
}
