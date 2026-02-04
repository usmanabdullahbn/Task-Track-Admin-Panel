import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const GoogleMapsLocationPickerModal = ({
  isOpen,
  initialLat,
  initialLng,
  onClose,
  onSelectLocation,
}) => {
  const [selectedLocation, setSelectedLocation] = useState({
    lat: initialLat,
    lng: initialLng,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);

  const apiKey = import.meta.env.VITE_API_GOOGLE_MAPS_API_KEY;

  // Set mapLoaded to true after a short delay to ensure the script loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const mapCenter = {
    lat: selectedLocation.lat,
    lng: selectedLocation.lng,
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setSelectedLocation({ lat, lng });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError("");

    try {
      // Using Google Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          searchQuery
        )}&key=${import.meta.env.VITE_API_GOOGLE_MAPS_API_KEY}`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      console.log("Geocoding API response:", data);

      // Check API status
      if (data.status === "REQUEST_DENIED") {
        setSearchError("API request denied. Check API key & billing.");
        return;
      }

      if (data.status === "ZERO_RESULTS") {
        setSearchError("Location not found. Try a different search term.");
        return;
      }

      if (data.status === "OVER_QUERY_LIMIT") {
        setSearchError("Search quota exceeded. Please try again later.");
        return;
      }

      if (data.status === "INVALID_REQUEST") {
        setSearchError("Invalid search request. Please try again.");
        return;
      }

      if (data.status !== "OK") {
        setSearchError(`Error: ${data.status}`);
        return;
      }

      // If results found
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const lat = result.geometry.location.lat;
        const lng = result.geometry.location.lng;

        setSelectedLocation({ lat, lng });
        console.log("Location found:", { lat, lng, address: result.formatted_address });
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setSearchError("Search failed. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleConfirm = () => {
    onSelectLocation({
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4"
        style={{ zIndex: 9999 }}
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Pick Location</h2>

          {/* Search Section */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for a location (e.g., New York, Eiffel Tower)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={searchLoading}
              />
              <button
                onClick={handleSearch}
                disabled={searchLoading || !searchQuery.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {searchLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Searching...
                  </>
                ) : (
                  "Search"
                )}
              </button>
            </div>
            {searchError && (
              <p className="mt-2 text-sm text-red-600">{searchError}</p>
            )}
          </div>

          <div className="mb-4">
            <div
              className="rounded-lg border border-gray-300 overflow-hidden relative bg-gray-100"
              style={{ width: "100%", height: "400px" }}
            >
              {!apiKey && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
                  <p className="text-red-600 font-semibold">Google Maps API Key not configured</p>
                </div>
              )}
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading map...</p>
                  </div>
                </div>
              )}
              {apiKey && (
                <LoadScript
                  googleMapsApiKey={apiKey}
                  onLoad={() => setMapLoaded(true)}
                >
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={mapCenter}
                    zoom={15}
                    onClick={handleMapClick}
                  >
                    {/* Location Marker */}
                    <Marker
                      position={{
                        lat: selectedLocation.lat,
                        lng: selectedLocation.lng,
                      }}
                      title={`Lat: ${selectedLocation.lat.toFixed(6)}, Lng: ${selectedLocation.lng.toFixed(6)}`}
                    />
                  </GoogleMap>
                </LoadScript>
              )}
            </div>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Selected Location:</strong>
              <br />
              Latitude: {selectedLocation.lat.toFixed(6)}
              <br />
              Longitude: {selectedLocation.lng.toFixed(6)}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsLocationPickerModal;
