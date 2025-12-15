import React, { useState, useEffect } from "react";
import Sidebar from "../component/sidebar";
import { apiClient } from "../lib/api-client";
import { FaChevronLeft, FaChevronRight, FaThLarge, FaList } from "react-icons/fa";

const SchedulePage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("week"); // "month", "week", or "day"
  const [displayMode, setDisplayMode] = useState("grid"); // "grid" or "list"
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("all");

  // Generate dummy tasks
  const generateDummyTasks = () => {
    const taskTitles = [
      "Team Meeting",
      "Code Review",
      "Design Review",
      "Client Call",
      "Project Planning",
      "Bug Fixing",
      "Database Optimization",
      "API Development",
      "Testing Sprint",
      "Documentation",
      "Deployment",
      "Performance Tuning",
      "Security Audit",
      "User Testing",
      "Marketing Review",
    ];

    const statuses = ["Todo", "In Progress", "Completed", "On Hold"];
    const priorities = ["Low", "Medium", "High"];
    const employees = employees.length > 0 ? employees : dummyEmployees.filter(emp => emp.id !== "all");
    const dummyTasks = [];

    // Create tasks for random days in the current month
    for (let i = 0; i < 40; i++) {
      const randomDay = Math.floor(Math.random() * 28) + 1; // Days 1-28
      const randomHour = Math.floor(Math.random() * 24);
      const randomMinute = Math.floor(Math.random() * 60);
      const randomTitle =
        taskTitles[Math.floor(Math.random() * taskTitles.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomPriority =
        priorities[Math.floor(Math.random() * priorities.length)];
      const randomEmployee = employees[Math.floor(Math.random() * employees.length)];

      const taskDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        randomDay,
        randomHour,
        randomMinute
      );

      dummyTasks.push({
        _id: `dummy-${i}`,
        title: `${randomTitle} ${i + 1}`,
        description: `This is a dummy task for testing purposes`,
        status: randomStatus,
        priority: randomPriority,
        user: randomEmployee,
        start_time: taskDate.toISOString(),
        end_time: new Date(taskDate.getTime() + 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return dummyTasks;
  };

  // Fetch all tasks and employees on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch employees
        const employeesResponse = await apiClient.getUsers();
        console.log("getUsers response:", employeesResponse);
        let allEmployees = [];
        if (Array.isArray(employeesResponse)) {
          allEmployees = employeesResponse;
        } else if (Array.isArray(employeesResponse.Users)) {
          allEmployees = employeesResponse.Users;
        } else if (Array.isArray(employeesResponse.users)) {
          allEmployees = employeesResponse.users;
        } else if (Array.isArray(employeesResponse.data)) {
          allEmployees = employeesResponse.data;
        }
        setEmployees(allEmployees);
        console.log("Total employees loaded:", allEmployees.length, allEmployees);
        
        // Fetch tasks
        const tasksResponse = await apiClient.getTasks();
        console.log("getTasks response:", tasksResponse);
        
        let allTasks = [];
        if (Array.isArray(tasksResponse)) {
          allTasks = tasksResponse;
        } else if (Array.isArray(tasksResponse.tasks)) {
          allTasks = tasksResponse.tasks;
        } else if (Array.isArray(tasksResponse.data)) {
          allTasks = tasksResponse.data;
        }
        
        // If no tasks from API, use dummy tasks for development
        if (allTasks.length === 0) {
          allTasks = generateDummyTasks();
          console.log("Generated dummy tasks:", allTasks);
        }
        
        setTasks(allTasks);
        console.log("Total tasks loaded:", allTasks.length, allTasks);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        // Use dummy tasks on error
        setTasks(generateDummyTasks());
        setEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentDate]);

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Get tasks for a specific date
  const getTasksForDate = (day) => {
    if (!day) return [];
    
    const targetDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    
    const dateStr = targetDate.toLocaleDateString('en-CA'); // YYYY-MM-DD in local timezone

    const filtered = tasks.filter((task) => {
      if (!task.start_time) return false;
      const taskDateObj = new Date(task.start_time);
      const taskDate = taskDateObj.toLocaleDateString('en-CA'); // Local date
      const dateMatch = taskDate === dateStr;
      const employeeMatch = selectedEmployee === "all" || task.user?.id === selectedEmployee || task.user?._id === selectedEmployee;
      return dateMatch && employeeMatch;
    });

    return filtered.sort((a, b) => {
      // Sort by start time
      const timeA = new Date(a.start_time).getTime();
      const timeB = new Date(b.start_time).getTime();
      return timeA - timeB;
    });
  };

  // Format time from ISO string
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get week start (Sunday) from a given date
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  // Get days in week starting from current date
  const getWeekDays = () => {
    const weekStart = getWeekStart(currentDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Navigate to previous month
  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  // Navigate to today
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Navigate by week
  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // Navigate by day
  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Create array of days (with empty slots for days before month starts)
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="flex-1 overflow-y-auto bg-gray-50 p-6 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule</h1>
          <p className="text-gray-600">View tasks on a calendar</p>
        </div>

        {/* Calendar Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Calendar Header - New Design */}
          <div className="border-b border-gray-200 p-4 flex items-center justify-between">
            {/* Left Section: Navigation and Date */}
            <div className="flex items-center gap-4">
              <button
                onClick={
                  viewMode === "month"
                    ? handlePreviousMonth
                    : viewMode === "week"
                    ? handlePreviousWeek
                    : handlePreviousDay
                }
                className="p-1.5 hover:bg-gray-100 rounded transition text-gray-600"
                title="Previous"
              >
                <FaChevronLeft size={16} />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="text-base font-semibold text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded transition"
                >
                  {viewMode === "month"
                    ? `${currentDate.toLocaleString("default", { month: "long" })}, ${currentDate.getFullYear()}`
                    : viewMode === "week"
                    ? (() => {
                        const weekStart = getWeekStart(currentDate);
                        const weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekEnd.getDate() + 6);
                        return `${weekStart.toLocaleString("default", {
                          weekday: "short",
                          day: "numeric",
                        })} - ${weekEnd.toLocaleString("default", {
                          weekday: "short",
                          day: "numeric",
                        })}, ${currentDate.toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        })}`;
                      })()
                    : `${currentDate.getDate()}, ${currentDate.toLocaleString("default", {
                        month: "long",
                        year: "numeric",
                      })}`}
                </button>

                {/* Date Picker Dropdown */}
                {showDatePicker && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 w-64">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Year</label>
                        <select
                          value={currentDate.getFullYear()}
                          onChange={(e) => {
                            const newDate = new Date(currentDate);
                            newDate.setFullYear(parseInt(e.target.value));
                            setCurrentDate(newDate);
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Month</label>
                        <select
                          value={currentDate.getMonth()}
                          onChange={(e) => {
                            const newDate = new Date(currentDate);
                            newDate.setMonth(parseInt(e.target.value));
                            setCurrentDate(newDate);
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {[
                            "January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"
                          ].map((month, idx) => (
                            <option key={month} value={idx}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Day</label>
                        <select
                          value={currentDate.getDate()}
                          onChange={(e) => {
                            const newDate = new Date(currentDate);
                            newDate.setDate(parseInt(e.target.value));
                            setCurrentDate(newDate);
                            setShowDatePicker(false);
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={
                  viewMode === "month"
                    ? handleNextMonth
                    : viewMode === "week"
                    ? handleNextWeek
                    : handleNextDay
                }
                className="p-1.5 hover:bg-gray-100 rounded transition text-gray-600"
                title="Next"
              >
                <FaChevronRight size={16} />
              </button>
            </div>

            {/* Right Section: View Mode, Display Mode, Today Button */}
            <div className="flex items-center gap-3">
              {/* Employee Filter */}
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer"
              >
                <option value="all">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp._id || emp.id} value={emp._id || emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>

              {/* View Mode Dropdown */}
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer"
              >
                <option value="month">Month</option>
                <option value="week">Week</option>
                <option value="day">Day</option>
              </select>

              {/* Display Mode Toggle (Grid/List) */}
              <div className="flex border border-gray-300 rounded">
                <button
                  onClick={() => setDisplayMode("grid")}
                  className={`p-2 transition ${
                    displayMode === "grid"
                      ? "bg-gray-200 text-gray-900"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Grid View"
                >
                  <FaThLarge size={14} />
                </button>
                <button
                  onClick={() => setDisplayMode("list")}
                  className={`p-2 transition border-l border-gray-300 ${
                    displayMode === "list"
                      ? "bg-gray-200 text-gray-900"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                  title="List View"
                >
                  <FaList size={14} />
                </button>
              </div>

              {/* Today Button with Date */}
              <button
                onClick={handleToday}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition"
              >
                {new Date().toLocaleDateString("default", { month: "short", day: "numeric" })}
              </button>
            </div>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 bg-gray-100 border-b">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-3 text-center font-semibold text-gray-700 text-sm"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid - Different views based on viewMode */}
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading tasks...</div>
          ) : viewMode === "month" ? (
            // MONTH VIEW
            <div className="grid grid-cols-7 bg-white min-h-96">
              {days.map((day, index) => {
                const tasksForDay = day ? getTasksForDate(day) : [];
                const isToday =
                  day &&
                  day === new Date().getDate() &&
                  currentDate.getMonth() === new Date().getMonth() &&
                  currentDate.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={index}
                    className={`border p-3 min-h-24 ${
                      day ? "bg-white" : "bg-gray-50"
                    } ${isToday ? "bg-blue-50" : ""} overflow-y-auto`}
                  >
                    {day && (
                      <>
                        {/* Day Number */}
                        <div
                          className={`text-sm font-semibold mb-2 ${
                            isToday
                              ? "text-blue-600"
                              : currentDate.getMonth() !==
                                  new Date().getMonth()
                                ? "text-gray-400"
                                : "text-gray-900"
                          }`}
                        >
                          {currentDate.toLocaleString("default", {
                            month: "short",
                          })}{" "}
                          {day}
                        </div>

                        {/* Tasks List with times */}
                        <div className="space-y-1">
                          {tasksForDay.length > 0 ? (
                            tasksForDay.map((task) => (
                              <div
                                key={task._id}
                                className="text-xs bg-orange-100 text-orange-800 p-1.5 rounded hover:bg-orange-200 transition cursor-pointer"
                                title={`${task.title} - ${task.user?.name || 'Unknown'}`}
                              >
                                <div className="flex items-start gap-1">
                                  <span className="text-orange-500 mt-0.5">●</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                      {task.title}
                                    </p>
                                    <p className="text-orange-700">
                                      {formatTime(task.start_time)}
                                    </p>
                                    <p className="text-orange-600 text-xs">
                                      {task.user?.name || 'Unknown'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-400">No tasks</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : viewMode === "week" ? (
            // WEEK VIEW
            <div className="grid grid-cols-7 bg-white min-h-96">
              {getWeekDays().map((date, index) => {
                const day = date.getDate();
                const tasksForDay = getTasksForDate(day);
                const isToday =
                  date.getDate() === new Date().getDate() &&
                  date.getMonth() === new Date().getMonth() &&
                  date.getFullYear() === new Date().getFullYear();

                return (
                  <div
                    key={index}
                    className={`border p-3 min-h-full ${
                      isToday ? "bg-blue-50" : "bg-white"
                    } overflow-y-auto`}
                  >
                    <div
                      className={`text-sm font-semibold mb-2 ${
                        isToday ? "text-blue-600" : "text-gray-900"
                      }`}
                    >
                      {date.toLocaleString("default", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>

                    {/* Tasks List with times */}
                    <div className="space-y-1">
                      {tasksForDay.length > 0 ? (
                        tasksForDay.map((task) => (
                          <div
                            key={task._id}
                            className="text-xs bg-orange-100 text-orange-800 p-1.5 rounded hover:bg-orange-200 transition cursor-pointer"
                            title={`${task.title} - ${task.user?.name || 'Unknown'}`}
                          >
                            <div className="flex items-start gap-1">
                              <span className="text-orange-500 mt-0.5">●</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {task.title}
                                </p>
                                <p className="text-orange-700">
                                  {formatTime(task.start_time)}
                                </p>
                                <p className="text-orange-600 text-xs">
                                  {task.user?.name || 'Unknown'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400">No tasks</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // DAY VIEW
            <div className="bg-white p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {currentDate.toLocaleString("default", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>

                {getTasksForDate(currentDate.getDate()).length > 0 ? (
                  <div className="space-y-3">
                    {getTasksForDate(currentDate.getDate()).map((task) => (
                      <div
                        key={task._id}
                        className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {task.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {task.description}
                            </p>
                            <p className="text-sm text-orange-600 mt-2">
                              Assigned to: {task.user?.name || 'Unknown'}
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Start:</span>
                                <p className="font-medium text-gray-900">
                                  {formatTime(task.start_time)}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">Status:</span>
                                <p className="font-medium text-orange-600">
                                  {task.status}
                                </p>
                              </div>
                            </div>
                          </div>
                          <span className="text-orange-500 text-2xl">●</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No tasks scheduled for this day</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-lg">●</span>
            <span>Task scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-50 rounded text-xs border border-blue-200">Today</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SchedulePage;
