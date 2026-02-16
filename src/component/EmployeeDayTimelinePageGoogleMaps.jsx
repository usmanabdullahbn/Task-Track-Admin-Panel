import React, { useState, useEffect, useMemo } from "react"
import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsRenderer } from "@react-google-maps/api"
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

        // Map users to have both _id and id for compatibility, and filter by designation
        const mappedUsers = userList
          .map(user => ({
            ...user,
            id: user._id || user.id // Use _id from MongoDB, fallback to id
          }))
          .filter(user => {
            const designation = (user.designation || "").toLowerCase()
            return designation.includes("technician") || designation.includes("supervisor")
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

  // Fetch timeline data when user or date changes
  useEffect(() => {
    if (!selectedUserId) return

    const fetchTimeline = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiClient.getTimelineByEmployeeIdAndDate(
          selectedUserId,
          selectedDate
        )

        const timeline = response.timeline || response.data

        if (timeline) {
          setSelectedUser({
            id: timeline.employeeId,
            name: timeline.employeeName,
            date: timeline.date,
            office: timeline.office,
            tasks: timeline.tasks || [],
          })
        } else {
          throw new Error("Timeline not found")
        }
      } catch (err) {
        console.error("Failed to fetch timeline:", err)

        // Get user info from the users list
        const user = users.find(u => String(u.id) === String(selectedUserId))

        // If no timeline found, show empty timeline with office location
        if (user) {
          setSelectedUser({
            id: user.id,
            name: user.name,
            date: selectedDate,
            office: {
              lat: 25.2854,  // Doha, Qatar
              lng: 51.5310,
              title: "Head Office - Doha"
            },
            tasks: [],  // No tasks scheduled
          })
          setError(`No timeline found for ${selectedDate}. Showing office location only.`)
        } else {
          setError(`Failed to load timeline: ${err.message}`)
          // Fallback to dummy data if user not found
          const fallbackUser = dummyEmployees.find(emp => emp.id === selectedUserId)
          if (fallbackUser) {
            setSelectedUser({ ...fallbackUser, date: selectedDate })
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

  // Fetch directions when user data loads
  useEffect(() => {
    if (!selectedUser) return
    if (routePath.length <= 1) return
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
                    {/* Office Marker */}
                    <Marker
                      position={{
                        lat: selectedUser.office.lat,
                        lng: selectedUser.office.lng,
                      }}
                      onClick={() => setSelectedMarker({ type: "office", data: selectedUser.office })}
                      icon={{
                        path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z",
                        fillColor: "#15803d",
                        fillOpacity: 1,
                        strokeColor: "#ffffff",
                        strokeWeight: 2,
                        scale: 1.2,
                      }}
                    >
                      {selectedMarker?.type === "office" && (
                        <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                          <div className="text-sm">
                            <strong>{selectedUser.office.title}</strong>
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>

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

                    {/* Real Road Route using DirectionsRenderer */}
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

              {/* Task Route List */}
              <div className="rounded-lg border bg-white p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Task Route
                </h2>

                {selectedUser.tasks.length === 0 ? (
                  <p className="text-gray-500 text-sm">No tasks scheduled for this date.</p>
                ) : (
                  <ol className="space-y-3">
                    <li className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full bg-green-700 text-white flex items-center justify-center text-xs">
                        O
                      </span>
                      <span className="text-sm text-gray-700">
                        {selectedUser.office.title} (Start Point)
                      </span>
                    </li>

                    {selectedUser.tasks.map((task, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <span className="text-sm text-gray-700 font-medium">
                            {task.title}
                          </span>
                          {(task.start_time || task.end_time) && (
                            <p className="text-xs text-gray-500">
                              {task.start_time} - {task.end_time}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
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
