import React, { useState, useEffect, useMemo } from "react"
import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsRenderer, Polyline } from "@react-google-maps/api"
import Sidebar from "../component/sidebar"
import { Link } from "react-router-dom"
import { apiClient } from "../lib/api-client"

/**
 * FALLBACK DUMMY DATA
 * Used when API is not available
 */
const dummyEmployees = [
  {
    id: 1,
    name: "John Doe",
    date: "2025-10-09",
    office: {
      lat: 24.8607,
      lng: 67.0011,
      title: "Head Office",
    },
    tasks: [
      {
        lat: 24.8719,
        lng: 67.0569,
        title: "Install Equipment – ABC Traders",
        start_time: "09:00",
        end_time: "11:00",
      },
      {
        lat: 24.8934,
        lng: 67.0286,
        title: "System Configuration – XYZ Corp",
        start_time: "11:30",
        end_time: "13:00",
      },
      {
        lat: 24.9051,
        lng: 67.0822,
        title: "Maintenance – Iota Beverages",
        start_time: "14:00",
        end_time: "16:00",
      },
    ],
  },
  {
    id: 2,
    name: "Jane Smith",
    date: "2025-10-09",
    office: {
      lat: 24.8607,
      lng: 67.0011,
      title: "Head Office",
    },
    tasks: [
      {
        lat: 24.8800,
        lng: 67.0500,
        title: "Network Setup – Tech Solutions",
        start_time: "10:00",
        end_time: "12:00",
      },
      {
        lat: 24.8900,
        lng: 67.0300,
        title: "Software Update – Global Inc",
        start_time: "13:00",
        end_time: "15:00",
      },
    ],
  },
  {
    id: 3,
    name: "Bob Johnson",
    date: "2025-10-09",
    office: {
      lat: 24.8607,
      lng: 67.0011,
      title: "Head Office",
    },
    tasks: [
      {
        lat: 24.8700,
        lng: 67.0600,
        title: "Hardware Repair – Quick Fix",
        start_time: "08:00",
        end_time: "10:00",
      },
      {
        lat: 24.9000,
        lng: 67.0400,
        title: "Training Session – EduCorp",
        start_time: "10:30",
        end_time: "12:30",
      },
      {
        lat: 24.9100,
        lng: 67.0700,
        title: "Audit Check – Secure Ltd",
        start_time: "14:00",
        end_time: "16:00",
      },
    ],
  },
]

const EmployeeDayTimelinePageGoogleMaps = () => {
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [directions, setDirections] = useState(null)

  // Fetch all users (technical and supervisor) on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiClient.getUsers()
        console.log("Users response:", response)

        // Handle the actual response structure: { Users: [...], success: true, total: 12 }
        const userList = response.Users || response.users || response.data || []

        if (userList.length === 0) {
          throw new Error("No users found")
        }

        // Map users to have both _id and id for compatibility, and filter by role (technician / supervisor)
        const mappedUsers = userList
          .map(user => ({
            ...user,
            id: user._id || user.id // Use _id from MongoDB, fallback to id
          }))
          .filter(user => {
            const role = (user.role || "").toLowerCase()
            return role.includes("technician") || role.includes("supervisor")
          })

        if (mappedUsers.length === 0) {
          throw new Error("No technicians or supervisors found")
        }

        setUsers(mappedUsers)

        // Set default selected user to the first one
        setSelectedUserId(mappedUsers[0].id)
      } catch (err) {
        console.error("Failed to fetch users:", err)
        setError("Failed to load users. Using sample data.")
        // Fallback to dummy data
        setUsers(dummyEmployees)
        setSelectedUserId(1)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Fetch timeline data when user or date changes (uses new tracking/timeline API)
  useEffect(() => {
    if (!selectedUserId) return

    const fetchTimeline = async () => {
      try {
        setLoading(true)
        setError(null)

        // New API: tracking/timeline?workerId=&date=
        const response = await apiClient.getTimeline(selectedUserId, selectedDate)

        // Backend returns: { session, locations, tasks, idleLogs, idleMinutes }
        const { session, locations = [], tasks = [], idleLogs = [], idleMinutes = 0 } = response || {}

        if (session) {
          const userFromList = users.find(u => String(u.id) === String(selectedUserId))

          // derive start / end points from location array
          const startLocation = locations.find(loc => loc.locationType === 'start') || locations[0]
          const endLocation = locations.find(loc => loc.locationType === 'end') || locations[locations.length - 1]

          // Process idle logs with start/end times
          const idleLocations = (idleLogs || []).map((idle, idx) => {
            const correspondingLocation = locations.find(loc => 
              loc.timestamp >= idle.startTime && loc.timestamp <= (idle.endTime || new Date())
            )
            
            return {
              lat: correspondingLocation?.latitude || 24.8607,
              lng: correspondingLocation?.longitude || 67.0011,
              title: correspondingLocation?.locationName || `Idle Location ${idx + 1}`,
              start_time: idle.startTime ? new Date(idle.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              end_time: idle.endTime ? new Date(idle.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ongoing',
            }
          })

          setSelectedUser({
            id: session.workerId || selectedUserId,
            name: session.workerName || userFromList?.name || `Worker ${selectedUserId}`,
            date: session.date || selectedDate,
            startLocation,
            endLocation,
            locations,
            office: startLocation
              ? { lat: startLocation.latitude, lng: startLocation.longitude, title: 'Start Location' }
              : (userFromList?.office || { lat: 25.2854, lng: 51.5310, title: 'Office' }),
            tasks: (tasks || []).map((t, idx) => ({
              lat: t.latitude ?? t.lat,
              lng: t.longitude ?? t.lng,
              title: t.taskTitle || (t.taskId && t.taskId.title) || (t.taskId && t.taskId.name) || `Task ${idx + 1}`,
              start_time: t.startTime ? new Date(t.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (t.start_time || ''),
              end_time: t.endTime ? new Date(t.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (t.end_time || ''),
            })),
            idleLocations,
            idleMinutes,
          })
        } else {
          throw new Error('No session found')
        }
      } catch (err) {
        console.error('Failed to fetch timeline:', err)

        const user = users.find(u => String(u.id) === String(selectedUserId))

        if (user) {
          setSelectedUser({
            id: user.id,
            name: user.name,
            date: selectedDate,
            office: {
              lat: 25.2854,
              lng: 51.5310,
              title: 'Head Office - Doha',
            },
            tasks: [],
            idleLocations: [],
          })
          setError(`No timeline found for ${selectedDate}. Showing office location only.`)
        } else {
          setError(`Failed to load timeline: ${err.message}`)
          const fallbackUser = dummyEmployees.find(emp => emp.id === selectedUserId)
          if (fallbackUser) {
            setSelectedUser({ ...fallbackUser, date: selectedDate, idleLocations: [] })
          }
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTimeline()
  }, [selectedUserId, selectedDate, users])

  // Handle user selection change
  const handleUserChange = (e) => {
    const selectedId = e.target.value
    setSelectedUserId(selectedId)
  }

  // Memoize routePath to prevent infinite recalculation
  const routePath = useMemo(() => {
    if (!selectedUser) return []

    // prefer raw GPS locations if available, otherwise fall back to office+task list
    if (selectedUser.locations && selectedUser.locations.length > 0) {
      return selectedUser.locations.map(loc => ({ lat: loc.latitude, lng: loc.longitude }))
    }

    return [
      { lat: selectedUser.office.lat, lng: selectedUser.office.lng },
      ...selectedUser.tasks.map((t) => ({
        lat: t.lat,
        lng: t.lng,
      })),
    ]
  }, [selectedUser])

  // Reset directions when user or date changes
  useEffect(() => {
    setDirections(null)
  }, [selectedUserId, selectedDate])

  // Fetch directions when user data loads (only used when we don't have raw GPS locations)
  useEffect(() => {
    if (!selectedUser) return
    if (routePath.length <= 1) return
    // if we are using GPS location points we render our own polyline, no need for directions
    if (selectedUser.locations && selectedUser.locations.length > 0) return
    if (directions) return // Prevent recalculation if already fetched

    const directionsService = new window.google.maps.DirectionsService()

    const waypoints = selectedUser.tasks.slice(0, -1).map(task => ({
      location: { lat: task.lat, lng: task.lng },
      stopover: true
    }))

    directionsService.route(
      {
        origin: routePath[0],
        destination: routePath[routePath.length - 1],
        waypoints: waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result)
        }
      }
    )
  }, [selectedUser])

  const mapCenter = selectedUser ? {
    lat: selectedUser.office.lat,
    lng: selectedUser.office.lng,
  } : {
    lat: 25.2854,   // Doha, Qatar
    lng: 51.5310,
  }

  const mapContainerStyle = {
    width: "100%",
    height: "500px",
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 sm:p-6 md:p-8">

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && !selectedUser && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading timeline...</p>
              </div>
            </div>
          )}

          {/* Main Content */}
          {selectedUser && (
            <>
              {/* Header */}
              <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
                <Link to="/employees" className="text-green-700 hover:text-green-900">
                  ← Back
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Timeline
                  </h1>
                  <p className="text-sm text-gray-600">
                    {selectedUser.name} — {selectedDate}
                  </p>
                  {selectedUser.idleMinutes !== undefined && (
                    <p className="text-sm text-orange-600">
                      Idle Time: {selectedUser.idleMinutes} minutes
                    </p>
                  )}
                </div>
                <div className="ml-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="date-filter" className="text-sm font-medium text-gray-700">
                      Date:
                    </label>
                    <input
                      id="date-filter"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <select
                    value={selectedUserId || ""}
                    onChange={handleUserChange}
                    className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {users.length === 0 ? (
                      <option value="">No users available</option>
                    ) : (
                      users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-lg border bg-white p-4 shadow-sm mb-6">
                <LoadScript googleMapsApiKey={import.meta.env.VITE_API_GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={selectedUser?.tasks?.length ? 12 : 13}
                  >
                    {/* Start Marker (first GPS point) */}
                    {selectedUser.startLocation && (
                      <Marker
                        position={{
                          lat: selectedUser.startLocation.latitude,
                          lng: selectedUser.startLocation.longitude,
                        }}
                        onClick={() => setSelectedMarker({ type: "start", data: selectedUser.startLocation })}
                        icon={{
                          path: "M12 2C6.48 2 2 6.48 2 12c0 4.84 3.94 8 10 13.1C18 20 22 16.84 22 12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z",
                          fillColor: "#15803d", // green
                          fillOpacity: 1,
                          strokeColor: "#ffffff",
                          strokeWeight: 2,
                          scale: 1.2,
                        }}
                      >
                        {selectedMarker?.type === "start" && (
                          <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                            <div className="text-sm">
                              <strong>Start</strong><br />
                              {selectedUser.startLocation.timeFormatted || new Date(selectedUser.startLocation.timestamp).toLocaleTimeString()}
                            </div>
                          </InfoWindow>
                        )}
                      </Marker>
                    )}

                    {/* End Marker (last GPS point) */}
                    {selectedUser.endLocation && (
                      <Marker
                        position={{
                          lat: selectedUser.endLocation.latitude,
                          lng: selectedUser.endLocation.longitude,
                        }}
                        onClick={() => setSelectedMarker({ type: "end", data: selectedUser.endLocation })}
                        icon={{
                          path: "M12 2C6.48 2 2 6.48 2 12c0 4.84 3.94 8 10 13.1C18 20 22 16.84 22 12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z",
                          fillColor: "#dc2626", // red
                          fillOpacity: 1,
                          strokeColor: "#ffffff",
                          strokeWeight: 2,
                          scale: 1.2,
                        }}
                      >
                        {selectedMarker?.type === "end" && (
                          <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                            <div className="text-sm">
                              <strong>End</strong><br />
                              {selectedUser.endLocation.timeFormatted || new Date(selectedUser.endLocation.timestamp).toLocaleTimeString()}
                            </div>
                          </InfoWindow>
                        )}
                      </Marker>
                    )}

                    {/* Task Markers - Blue Location Icons */}
                    {selectedUser.tasks.map((task, index) => (
                      <Marker
                        key={index}
                        position={{ lat: task.lat, lng: task.lng }}
                        onClick={() => setSelectedMarker({ type: "task", data: task, index })}
                        icon={{
                          path: "M12 2C6.48 2 2 6.48 2 12c0 4.84 3.94 8 10 13.1C18 20 22 16.84 22 12c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z",
                          fillColor: "#2563eb",
                          fillOpacity: 1,
                          strokeColor: "#ffffff",
                          strokeWeight: 2,
                          scale: 1.2,
                        }}
                      >
                        {selectedMarker?.type === "task" && selectedMarker.index === index && (
                          <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                            <div className="text-sm">
                              <strong>Task {index + 1}</strong>
                              <br />
                              {task.title}
                              <br />
                              {task.start_time && task.end_time && (
                                <small>{task.start_time} - {task.end_time}</small>
                              )}
                            </div>
                          </InfoWindow>
                        )}
                      </Marker>
                    ))}

                    {/* Idle Location Markers - Yellow Icons */}
                    {selectedUser.idleLocations && selectedUser.idleLocations.map((idle, index) => (
                      <Marker
                        key={`idle-${index}`}
                        position={{ lat: idle.lat, lng: idle.lng }}
                        onClick={() => setSelectedMarker({ type: "idle", data: idle, index })}
                        icon={{
                          path: "M6 4h4v16H6V4zm8 0h4v16h-4V4z",
                          fillColor: "#f59e0b",
                          fillOpacity: 1,
                          strokeColor: "#ffffff",
                          strokeWeight: 2,
                          scale: 1.2,
                        }}
                      >
                        {selectedMarker?.type === "idle" && selectedMarker.index === index && (
                          <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                            <div className="text-sm">
                              <strong>Idle Location {index + 1}</strong>
                              <br />
                              {idle.title}
                              <br />
                              {idle.start_time && idle.end_time && (
                                <small>{idle.start_time} - {idle.end_time}</small>
                              )}
                            </div>
                          </InfoWindow>
                        )}
                      </Marker>
                    ))}


                    {/* If we have raw GPS locations draw direct polyline */}
                    {selectedUser.locations && selectedUser.locations.length > 1 && (
                      <Polyline
                        path={selectedUser.locations.map(loc => ({ lat: loc.latitude, lng: loc.longitude }))}
                        options={{
                          strokeColor: "#15803d",
                          strokeOpacity: 1,
                          strokeWeight: 5,
                        }}
                      />
                    )}

                    {/* Real Road Route using DirectionsRenderer (fallback if no GPS path) */}
                    {directions && (
                      <DirectionsRenderer
                        options={{
                          directions: directions,
                          polylineOptions: {
                            strokeColor: "#15803d",
                            strokeOpacity: 1,
                            strokeWeight: 5,
                          },
                          suppressMarkers: true, // Don't show default markers
                        }}
                      />
                    )}
                  </GoogleMap>
                </LoadScript>
              </div>

              {/* Task Route List with All Location Types */}
              <div className="rounded-lg border bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Complete Route Timeline
                </h2>

                {selectedUser.tasks && selectedUser.tasks.length === 0 && (!selectedUser.locations || selectedUser.locations.length === 0) ? (
                  <p className="text-gray-500 text-sm">No tasks, locations or idle records for this date.</p>
                ) : (
                  <ol className="space-y-3">
                    {/* Start Location */}
                    {selectedUser.startLocation && (
                      <li className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-bold">
                          S
                        </span>
                        <div className="flex-1">
                          <span className="text-sm text-gray-700 font-medium">
                            Start – {selectedUser.startLocation.locationName || ''}
                          </span>
                          {selectedUser.startLocation.timeFormatted && (
                            <p className="text-xs text-gray-500 mt-1">
                              {selectedUser.startLocation.timeFormatted}
                            </p>
                          )}
                        </div>
                      </li>
                    )}

                    {/* Tasks */}
                    {selectedUser.tasks && selectedUser.tasks.map((task, index) => (
                      <li key={`task-${index}`} className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                          T{index + 1}
                        </span>
                        <div className="flex-1">
                          <span className="text-sm text-gray-700 font-medium">
                            {task.title}
                          </span>
                          {(task.start_time || task.end_time) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {task.start_time} - {task.end_time}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}

                    {/* Idle Locations */}
                    {selectedUser.idleLocations && selectedUser.idleLocations.map((idle, index) => (
                      <li key={`idle-${index}`} className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                          I{index + 1}
                        </span>
                        <div className="flex-1">
                          <span className="text-sm text-gray-700 font-medium">
                            Idle Location {index + 1}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {idle.title}
                            {idle.start_time && idle.end_time && (
                              <> • {idle.start_time} - {idle.end_time}</>
                            )}
                          </p>
                        </div>
                      </li>
                    ))}

                    {/* End Location */}
                    {selectedUser.endLocation && (
                      <li className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs font-bold">
                          E
                        </span>
                        <div className="flex-1">
                          <span className="text-sm text-gray-700 font-medium">
                            End – {selectedUser.endLocation.locationName || ''}
                          </span>
                          {selectedUser.endLocation.timeFormatted && (
                            <p className="text-xs text-gray-500 mt-1">
                              {selectedUser.endLocation.timeFormatted}
                            </p>
                          )}
                        </div>
                      </li>
                    )}
                  </ol>
                )}

                {/* Idle Time Summary */}
                {selectedUser.idleMinutes > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-700">
                      <strong>Total Idle Time:</strong> {selectedUser.idleMinutes} minutes
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  )
}

export default EmployeeDayTimelinePageGoogleMaps
