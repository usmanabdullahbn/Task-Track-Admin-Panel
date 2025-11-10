import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const locationPoints = [
  { lat: 24.8566, lng: 67.0228, name: "Lea Chat" },
  { lat: 24.8576, lng: 67.0238, name: "Lea Market" },
  { lat: 24.8596, lng: 67.0258, name: "Khalti" },
  { lat: 24.8616, lng: 67.0278, name: "Gadha Gall" },
  { lat: 24.8636, lng: 67.0298, name: "Police Line Road" },
  { lat: 24.8656, lng: 67.0318, name: "Ranchore Puri Street" },
];

const EmployeeMapComponent = ({ employee, date }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map only once
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([24.8566, 67.0228], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(mapInstance.current);
    }

    // Remove old markers and lines
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        mapInstance.current.removeLayer(layer);
      }
    });

    // Add markers and route
    const latLngs = [];
    locationPoints.forEach((point, index) => {
      L.marker([point.lat, point.lng])
        .addTo(mapInstance.current)
        .bindPopup(`${index + 1}. ${point.name}`);

      latLngs.push(L.latLng(point.lat, point.lng));
    });

    // Draw connecting line
    if (latLngs.length > 0) {
      L.polyline(latLngs, { color: "blue", weight: 3 }).addTo(mapInstance.current);
    }
  }, [employee, date]);

  return <div ref={mapRef} style={{ height: "100%", width: "100%", borderRadius: "10px" }} />;
};

export default EmployeeMapComponent;
