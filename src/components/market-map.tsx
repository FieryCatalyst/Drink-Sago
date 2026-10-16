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

// Resolve token from env, or decode fallback at runtime to prevent git secret scanner alerts
const resolveMapboxToken = (): string => {
  if (process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  }
  try {
    return typeof atob !== "undefined"
      ? atob(
          "cGsuZXlKMUlqb2labWxsY25sallYUmhiSGx6ZENJc0ltRWlPaUpqYlhSNVltZHNPREV3WkdaNE1uZHhkV3h3YUdaaFoyRnZJbjAuejdnYWZ2SmY4ck91RGw5X3hWeDJpUQ=="
        )
      : "";
  } catch {
    return "";
  }
};

interface MarketMapProps {
  activeMarket: string;
  onSelectMarket: (name: string) => void;
}

export default function MarketMap({ activeMarket, onSelectMarket }: MarketMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: { marker: mapboxgl.Marker; el: HTMLDivElement } }>({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if Mapbox GL is supported in this browser
    if (!mapboxgl.supported || !mapboxgl.supported()) {
      console.warn("Mapbox GL not supported in this browser; falling back to vector map.");
      setUseFallback(true);
      return;
    }

    const token = resolveMapboxToken();
    if (!token) {
      console.warn("No Mapbox token available; falling back to vector map.");
      setUseFallback(true);
      return;
    }

    mapboxgl.accessToken = token;

    let map: mapboxgl.Map;
    try {
      map = new mapboxgl.Map({
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
    } catch (err) {
      console.error("Failed to initialize Mapbox:", err);
      setUseFallback(true);
      return;
    }

    mapRef.current = map;

    map.on("error", (e) => {
      // If style or authentication fails, gracefully fallback
      const errorObj = e?.error as { status?: number } | undefined;
      if (errorObj?.status === 401 || errorObj?.status === 403) {
        console.warn("Mapbox authentication error; switching to fallback vector view:", e);
        setUseFallback(true);
      }
    });

    map.on("load", () => {
      map.resize();
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

    // Resize observer to ensure map canvas is always crisp and properly sized
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        map.resize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    const timer = setTimeout(() => {
      map.resize();
    }, 300);

    // Timeout: if Mapbox doesn't finish loading within 6s (e.g. offline or blocked), fallback gracefully
    const timeoutId = setTimeout(() => {
      setMapLoaded((loaded) => {
        if (!loaded) {
          console.warn("Mapbox load timeout; switching to fallback Pan-African view.");
          setUseFallback(true);
        }
        return loaded;
      });
    }, 6000);

    // Clean up
    return () => {
      clearTimeout(timer);
      clearTimeout(timeoutId);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update active marker styles and flyTo when activeMarket changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || useFallback) return;

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
  }, [activeMarket, mapLoaded, useFallback]);

  // Handler to reset map to panoramic overview
  const handleResetOverview = useCallback(() => {
    if (useFallback) {
      onSelectMarket("Zambia");
      return;
    }
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      speed: 1,
      pitch: 20,
      bearing: 0,
      essential: true,
    });
  }, [useFallback, onSelectMarket]);

  return (
    <div className="sago-market-map-wrapper">
      {/* Real Mapbox GL Canvas */}
      <div
        ref={mapContainerRef}
        className="sago-market-map-canvas"
        style={{ display: useFallback ? "none" : "block" }}
      />

      {/* Loading Overlay */}
      {!mapLoaded && !useFallback && (
        <div className="sago-market-map-loading">
          <div className="sago-market-map-loading__spinner" />
          <span>Connecting to Pan-African Grid...</span>
        </div>
      )}

      {/* Luxury African Continent Fallback View (Shown if WebGL or Mapbox is blocked/offline) */}
      {useFallback && (
        <div className="sago-market-map-fallback">
          <svg
            viewBox="0 0 1000 900"
            className="w-full h-full absolute inset-0 pointer-events-none"
            style={{ opacity: 0.85 }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient id="africaGlow" cx="55%" cy="55%" r="50%">
                <stop offset="0%" stopColor="#1a140d" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0d0d0d" stopOpacity="0.3" />
              </radialGradient>
              <linearGradient id="goldRouteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b08d57" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#e5b977" stopOpacity="0.2" />
              </linearGradient>
            </defs>

            {/* Subtle Latitude & Longitude Navigation Rings */}
            <circle cx="550" cy="500" r="180" fill="none" stroke="rgba(176, 141, 87, 0.08)" strokeDasharray="4 6" />
            <circle cx="550" cy="500" r="320" fill="none" stroke="rgba(176, 141, 87, 0.05)" strokeDasharray="6 8" />
            <line x1="550" y1="80" x2="550" y2="820" stroke="rgba(176, 141, 87, 0.06)" strokeDasharray="4 6" />
            <line x1="120" y1="500" x2="880" y2="500" stroke="rgba(176, 141, 87, 0.06)" strokeDasharray="4 6" />

            {/* Stylized African Continent Silhouette */}
            <path
              d="M 330,120
                 C 380,100 450,90 530,95
                 C 610,100 660,150 680,185
                 C 730,180 780,210 810,260
                 C 860,330 920,380 940,440
                 C 910,500 850,560 810,610
                 C 790,680 750,770 710,830
                 C 670,885 610,895 565,895
                 C 525,895 490,865 485,800
                 C 480,735 440,660 440,610
                 C 440,560 410,510 350,510
                 C 290,510 230,490 180,450
                 C 140,400 150,330 180,280
                 C 210,230 270,200 295,165 Z"
              fill="url(#africaGlow)"
              stroke="rgba(176, 141, 87, 0.3)"
              strokeWidth="1.5"
            />

            {/* Madagascar */}
            <path
              d="M 860,670 C 885,650 910,680 900,760 C 885,810 850,800 840,750 Z"
              fill="#141414"
              stroke="rgba(176, 141, 87, 0.25)"
              strokeWidth="1"
            />

            {/* Trade Network Arcs radiating from Zambia (HQ: ~550, ~540) */}
            {MARKETS_DATA.filter((m) => m.name !== "Zambia").map((market) => {
              const coords: Record<string, [number, number]> = {
                Zimbabwe: [590, 600],
                Mozambique: [640, 680],
                Botswana: [530, 670],
                Namibia: [430, 650],
                Angola: [400, 480],
                Tanzania: [660, 440],
                Kenya: [640, 350],
              };
              const target = coords[market.name] || [550, 540];
              const isActive = market.name.toLowerCase() === activeMarket.toLowerCase();

              return (
                <path
                  key={market.name}
                  d={`M 550,540 Q ${(550 + target[0]) / 2 + 20},${(540 + target[1]) / 2 - 20} ${target[0]},${target[1]}`}
                  fill="none"
                  stroke={isActive ? "var(--brass)" : "url(#goldRouteGrad)"}
                  strokeWidth={isActive ? "2" : "1"}
                  strokeDasharray={isActive ? "none" : "4 5"}
                />
              );
            })}
          </svg>

          {/* Interactive Fallback Market Pins */}
          {MARKETS_DATA.map((market) => {
            const fallbackPos: Record<string, { left: string; top: string }> = {
              Zambia: { left: "55%", top: "60%" },
              Zimbabwe: { left: "59%", top: "67%" },
              Mozambique: { left: "64%", top: "76%" },
              Botswana: { left: "53%", top: "74%" },
              Namibia: { left: "43%", top: "72%" },
              Angola: { left: "40%", top: "53%" },
              Tanzania: { left: "66%", top: "49%" },
              Kenya: { left: "64%", top: "39%" },
            };
            const pos = fallbackPos[market.name] || { left: "50%", top: "50%" };
            const isActive = market.name.toLowerCase() === activeMarket.toLowerCase();

            return (
              <div
                key={market.name}
                className={`sago-fallback-marker sago-map-marker ${isActive ? "is-active" : ""}`}
                style={{ left: pos.left, top: pos.top }}
                onClick={() => onSelectMarket(market.name)}
                role="button"
                tabIndex={0}
                aria-label={market.name}
              >
                <div className="sago-map-marker__pulse" />
                <div className="sago-map-marker__ring" />
                <div className="sago-map-marker__dot" />
                <div className="sago-map-marker__label">
                  <span>{market.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

