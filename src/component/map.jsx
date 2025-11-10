import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const MapComponent = ({ lat, lng }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([lat, lng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapInstance.current);
    } else {
      // Update map view
      mapInstance.current.setView([lat, lng], 13);
    }

    // Clear existing markers
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstance.current.removeLayer(layer);
      }
    });

    // Add marker
    L.marker([lat, lng])
      .addTo(mapInstance.current)
      .bindPopup(`Location: ${lat}, ${lng}`);
  }, [lat, lng]);

  return <div ref={mapRef} style={{ height: "100%", width: "100%", borderRadius: "10px" }} />;
};

export default MapComponent;
