import React, { useState, useEffect } from "react";
import Sidebar from "../component/sidebar";
import { apiClient } from "../lib/api-client";
import { FaChevronLeft, FaChevronRight, FaThLarge, FaList } from "react-icons/fa";

// Constants
const START_HOUR = 9, END_HOUR = 20, HOUR_WIDTH = 120, DAY_VIEW_HOUR_WIDTH = 150;
const TASK_COLOR_MAP = {
  'High': 'bg-red-100 border-red-400 text-red-900',
  'Medium': 'bg-yellow-100 border-yellow-400 text-yellow-900',
  'Low': 'bg-blue-100 border-blue-400 text-blue-900',
};
const DEMO_TASKS_DATA = [
  { id: 'task-1', title: 'AC Fixing', desc: 'Air conditioning system fixing', hours: [15, 40], endHours: [17, 10], status: 'In Progress', priority: 'High' },
  { id: 'task-2', title: 'Door Fixing', desc: 'Door repair and maintenance', hours: [14, 0], endHours: [15, 0], status: 'In Progress', priority: 'Medium' },
  { id: 'task-3', title: 'Generator Fixing', desc: 'Generator maintenance and repair', hours: [18, 29], endHours: [21, 29], status: 'Todo', priority: 'High' },
];

// Helper functions
const getMinutesFromStart = (date) => {
  const d = new Date(date);
  return (d.getHours() - START_HOUR) * 60 + d.getMinutes();
};
const getDurationMinutes = (start, end) => (new Date(end) - new Date(start)) / 60000;
const parseApiResponse = (response) => Array.isArray(response) ? response : response?.Users || response?.users || response?.tasks || response?.data || [];
const createDemoTasks = (employee, date) => DEMO_TASKS_DATA.map(task => ({
  _id: task.id, title: task.title, description: task.desc, status: task.status, priority: task.priority, user: employee,
  start_time: new Date(date.getFullYear(), date.getMonth(), date.getDate(), task.hours[0], task.hours[1]).toISOString(),
  end_time: new Date(date.getFullYear(), date.getMonth(), date.getDate(), task.endHours[0], task.endHours[1]).toISOString(),
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
}));

const SchedulePage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("week");
  const [displayMode, setDisplayMode] = useState("grid");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [checkedTasks, setCheckedTasks] = useState({});
  const headerRightRef = React.useRef(null);
  const bodyRightRef = React.useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allEmployees = parseApiResponse(await apiClient.getUsers());
        setEmployees(allEmployees);

        let allTasks = parseApiResponse(await apiClient.getTasks());
        if (allTasks.length === 0) {
          const shehbazEmployee = allEmployees.find(emp => emp.name?.toLowerCase() === "shehbaz");
          allTasks = shehbazEmployee ? createDemoTasks(shehbazEmployee, currentDate) : [];
        }
        setTasks(allTasks);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        const demoEmployee = { _id: "demo-emp", id: "demo-emp", name: "Shehbaz", role: "Employee" };
        setTasks(createDemoTasks(demoEmployee, currentDate));
        setEmployees([demoEmployee]);
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
  const formatTime = (isoString) => !isoString ? "" : new Date(isoString).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  // Get week start (Sunday) from a given date
  const getWeekStart = (date) => {
    const d = new Date(date);
    return new Date(d.setDate(d.getDate() - d.getDay()));
  };

  // Get days in week starting from current date
  const getWeekDays = () => {
    const weekStart = getWeekStart(currentDate);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      return date;
    });
  };

  // Navigate to previous month
  const handlePreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));

  // Navigate to next month
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  // Navigate to today
  const handleToday = () => setCurrentDate(new Date());

  // Sync header scroll with body scroll
  const handleBodyScroll = (e) => {
    if (headerRightRef.current) headerRightRef.current.scrollLeft = e.target.scrollLeft;
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
                  className={`p-2 transition ${displayMode === "grid"
                    ? "bg-gray-200 text-gray-900"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  title="Grid View"
                >
                  <FaThLarge size={14} />
                </button>
                <button
                  onClick={() => setDisplayMode("list")}
                  className={`p-2 transition border-l border-gray-300 ${displayMode === "list"
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
                    className={`border p-3 min-h-24 ${day ? "bg-white" : "bg-gray-50"
                      } ${isToday ? "bg-blue-50" : ""} overflow-y-auto`}
                  >
                    {day && (
                      <>
                        {/* Day Number */}
                        <div
                          className={`text-sm font-semibold mb-2 ${isToday
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
            // WEEK VIEW - Single Unified Table with Frozen Left Column
            <div className="border-t bg-white overflow-hidden flex flex-col">
              {/* Table Header - Frozen at top with sticky positioning */}
              <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-20">
                {/* Header Left Column */}
                <div className="w-80 shrink-0 border-r border-gray-200 p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Team Members</h3>
                </div>

                {/* Header Right Columns - No overflow, will match table scroll */}
                <div className="flex-1 overflow-hidden" ref={headerRightRef}>
                  <div className="flex min-w-max">
                    {getWeekDays().map((date) => (
                      <div key={date.toDateString()} className="w-48 border-r border-gray-200">
                        <div className="p-3 text-center border-b border-gray-200">
                          <p className="font-semibold text-gray-900">
                            {date.toLocaleDateString("default", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        {/* Mini time slots for the day */}
                        <div className="flex text-xs text-gray-500 text-center divide-x divide-gray-200">
                          <div className="flex-1 py-1">12 AM</div>
                          <div className="flex-1 py-1">6 AM</div>
                          <div className="flex-1 py-1">12 PM</div>
                          <div className="flex-1 py-1">6 PM</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table Body - Unified vertical scrolling */}
              <div className="flex flex-1 overflow-hidden">
                {/* Left Column - Frozen */}
                <div className="w-80 shrink-0 border-r border-gray-200 bg-white overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {employees.map((emp) => (
                    <div
                      key={emp._id || emp.id}
                      className="p-4 border-b border-gray-100 h-32 hover:bg-blue-50 transition flex flex-col justify-start bg-white"
                    >
                      <p className="font-medium text-gray-900">{emp.name}</p>
                      <p className="text-sm text-gray-500">{emp.role || emp.designation || "Employee"}</p>
                      {/* Progress circle */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600">
                          {Math.floor(Math.random() * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Columns - Horizontally and Vertically Scrollable */}
                <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" ref={bodyRightRef} onScroll={handleBodyScroll}>
                  <div className="flex min-w-max">
                    {employees.map((emp) => {
                      const weekDays = getWeekDays();
                      return (
                        <div key={`emp-${emp._id || emp.id}`} className="flex flex-col">
                          {weekDays.map((date) => {
                            const dayTasks = tasks.filter(
                              (t) =>
                                (t.user?._id || t.user?.id) === (emp._id || emp.id) &&
                                new Date(t.start_time).toDateString() === date.toDateString()
                            );

                            return (
                              <div
                                key={date.toDateString()}
                                className="w-48 h-32 border-r border-b border-gray-200 p-2 bg-white overflow-y-auto group hover:bg-gray-50 transition"
                              >
                                <div className="flex flex-col gap-1">
                                  {dayTasks.map((task) => {
                                    const durationMinutes = getDurationMinutes(task.start_time, task.end_time);
                                    const hours = Math.floor(durationMinutes / 60);
                                    const mins = Math.floor(durationMinutes % 60);
                                    const durationText = `${hours}h ${mins}m`;
                                    const isChecked = checkedTasks[task._id];
                                    const taskColor = TASK_COLOR_MAP[task.priority] || TASK_COLOR_MAP['Medium'];

                                    return (
                                      <div
                                        key={task._id}
                                        className={`border-l-4 rounded px-2 py-1.5 text-xs ${taskColor}`}
                                        title={`${task.title}\n${formatTime(task.start_time)} - ${formatTime(task.end_time)}\nDuration: ${durationText}`}
                                      >
                                        <div className="flex items-start gap-1 mb-0.5">
                                          <input
                                            type="checkbox"
                                            checked={isChecked || false}
                                            onChange={(e) => {
                                              e.stopPropagation();
                                              setCheckedTasks(prev => ({
                                                ...prev,
                                                [task._id]: !prev[task._id]
                                              }));
                                            }}
                                            className="w-3 h-3 cursor-pointer flex-shrink-0"
                                          />
                                          <p className="font-semibold truncate text-xs">{task.title}</p>
                                        </div>
                                        <div className="text-xs opacity-85 pl-4">
                                          <p className="truncate">{formatTime(task.start_time)} - {formatTime(task.end_time)}</p>
                                          <p className="opacity-75 text-xs">{durationText}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // DAY VIEW - Single Unified Table with Frozen Left Column
            <div className="border-t bg-white overflow-hidden flex flex-col">
              {/* Table Header - Frozen at top with sticky positioning */}
              <div className="flex border-b border-gray-200 bg-gray-50 sticky top-0 z-20">
                {/* Header Left Column */}
                <div className="w-80 shrink-0 border-r border-gray-200 p-4 bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Team Members</h3>
                </div>

                {/* Header Right Columns - No overflow, will match table scroll */}
                <div className="flex-1 overflow-hidden" ref={headerRightRef}>
                  <div className="flex min-w-max">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const hour = i;
                      const ampm = hour < 12 ? 'AM' : 'PM';
                      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                      return (
                        <div
                          key={i}
                          style={{ width: DAY_VIEW_HOUR_WIDTH }}
                          className="border-r border-gray-200 p-3 text-center text-sm font-semibold text-gray-700"
                        >
                          {displayHour}:00 {ampm}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Table Body - Unified vertical scrolling */}
              <div className="flex flex-1 overflow-hidden">
                {/* Left Column - Frozen */}
                <div className="w-80 shrink-0 border-r border-gray-200 bg-white overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {employees.map((emp) => (
                    <div
                      key={emp._id || emp.id}
                      className="p-4 border-b border-gray-100 h-28 hover:bg-blue-50 transition flex flex-col justify-start bg-white"
                    >
                      <p className="font-medium text-gray-900">{emp.name}</p>
                      <p className="text-sm text-gray-500">{emp.role || emp.designation || "Employee"}</p>
                      {/* Progress circle */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600">
                          {Math.floor(Math.random() * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Columns - Horizontally and Vertically Scrollable */}
                <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" ref={bodyRightRef} onScroll={handleBodyScroll}>
                  <div className="flex flex-col min-w-max">
                    {employees.map((emp) => {
                      const empTasks = tasks.filter(
                        (t) =>
                          (t.user?._id || t.user?.id) === (emp._id || emp.id) &&
                          new Date(t.start_time).toDateString() === currentDate.toDateString()
                      );

                      return (
                        <div
                          key={`emp-${emp._id || emp.id}`}
                          className="flex border-b border-gray-200 h-28 relative bg-white group hover:bg-gray-50 transition"
                        >
                          {/* Hour slots background */}
                          {Array.from({ length: 24 }).map((_, i) => (
                            <div
                              key={i}
                              style={{ width: DAY_VIEW_HOUR_WIDTH }}
                              className={`border-r border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                            />
                          ))}

                          {/* Tasks overlaid on timeline */}
                          <div className="absolute inset-0">
                            {empTasks.map((task) => {
                              const taskStart = new Date(task.start_time);
                              const startMinutesFromMidnight = taskStart.getHours() * 60 + taskStart.getMinutes();
                              const left = (startMinutesFromMidnight / 60) * DAY_VIEW_HOUR_WIDTH;
                              const durationMinutes = getDurationMinutes(task.start_time, task.end_time);
                              const width = (durationMinutes / 60) * DAY_VIEW_HOUR_WIDTH;
                              const isChecked = checkedTasks[task._id];
                              const taskColor = TASK_COLOR_MAP[task.priority] || TASK_COLOR_MAP['Medium'];
                              const hours = Math.floor(durationMinutes / 60);
                              const mins = Math.floor(durationMinutes % 60);
                              const durationText = `${hours}h ${mins}m`;

                              return (
                                <div
                                  key={task._id}
                                  style={{
                                    left: `${left}px`,
                                    width: `${Math.max(width, 100)}px`,
                                  }}
                                  className={`absolute top-2 bottom-2 border-l-4 rounded px-2 py-1 text-xs flex flex-col justify-start hover:shadow-lg transition ${taskColor}`}
                                  title={`${task.title}\n${formatTime(task.start_time)} - ${formatTime(task.end_time)}\nDue: ${new Date(task.start_time).toLocaleDateString()}`}
                                >
                                  {/* Checkbox */}
                                  <div className="flex items-start gap-1.5 mb-1">
                                    <input
                                      type="checkbox"
                                      checked={isChecked || false}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        setCheckedTasks(prev => ({
                                          ...prev,
                                          [task._id]: !prev[task._id]
                                        }));
                                      }}
                                      className="w-4 h-4 cursor-pointer mt-0.5 flex-shrink-0"
                                    />
                                    <span className="font-semibold truncate">{task.title}</span>
                                  </div>
                                  {/* Time and Duration */}
                                  <div className="text-xs opacity-85 pl-5.5">
                                    <p>{formatTime(task.start_time)} - {formatTime(task.end_time)}</p>
                                    <p className="opacity-75">Duration: {durationText}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Task Priority Colors</h3>
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-red-100 border-l-4 border-red-400 rounded"></div>
              <span className="text-gray-600">High Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-100 border-l-4 border-yellow-400 rounded"></div>
              <span className="text-gray-600">Medium Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 border-l-4 border-blue-400 rounded"></div>
              <span className="text-gray-600">Low Priority</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SchedulePage;
