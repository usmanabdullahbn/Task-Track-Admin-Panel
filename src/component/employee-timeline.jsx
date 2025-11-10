import React, { Suspense, lazy } from "react";

// Lazy-load the map component (like Next.js dynamic import)
const MapComponent = lazy(() => import("./EmployeeMapComponent"));

const EmployeeTimeline = ({ employee, date }) => {
  return (
    <div style={{ height: "24rem", borderRadius: "10px", overflow: "hidden" }}>
      <Suspense fallback={<div>Loading map...</div>}>
        <MapComponent employee={employee} date={date} />
      </Suspense>
    </div>
  );
};

export default EmployeeTimeline;
