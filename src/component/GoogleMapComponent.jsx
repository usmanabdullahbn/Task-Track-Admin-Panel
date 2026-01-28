import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const GoogleMapComponent = ({ lat, lng }) => {
  const mapContainerStyle = {
    width: "100%",
    height: "100%",
    borderRadius: "10px",
  };

  const center = {
    lat: lat,
    lng: lng,
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_API_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
      >
        {/* Marker */}
        <Marker
          position={{
            lat: lat,
            lng: lng,
          }}
          title={`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`}
        />
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapComponent;
