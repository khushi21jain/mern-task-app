import { useEffect, useState } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";

const COLS = [
  { id: "todo",   label: "To Do" },
  { id: "inprog", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done",   label: "Done" },
];

export default function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(null);
  const [newTask, setNewTask] = useState({ title: "", priority: "med", tags: "", dueDate: "", assignee: "" });
  const [dragging, setDragging] = useState(null);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch tasks");
      setLoading(false);
    }
  };

  const handleCreate = async (colId) => {
    if (!newTask.title.trim()) return;
    try {
      const res = await createTask({
        title: newTask.title,
        priority: newTask.priority,
        tags: newTask.tags ? [newTask.tags] : [],
        status: colId,
        dueDate: newTask.dueDate || null,
        assignee: newTask.assignee || "",
      });
      setTasks([res.data, ...tasks]);
      setOpenForm(null);
      setNewTask({ title: "", priority: "med", tags: "", dueDate: "", assignee: "" });
    } catch (err) {
      setError("Failed to create task");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  const handleDrop = async (colId) => {
    if (!dragging) return;
    try {
      const res = await updateTask(dragging, { status: colId });
      setTasks(tasks.map((t) => (t._id === dragging ? res.data : t)));
      setDragging(null);
    } catch (err) {
      setError("Failed to update task");
    }
  };

  // Filter tasks based on search and priority
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignee?.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = filterPriority === "all" || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  if (loading) return <p style={{ padding: "2rem" }}>Loading tasks...</p>;
  if (error)   return <p style={{ padding: "2rem", color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1.5rem", fontFamily: "sans-serif" }}>

      {/* Header */}
      <h1 style={{ marginBottom: "1rem", fontSize: "22px" }}>Task Board</h1>

      {/* Search and filter bar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          placeholder="Search tasks or assignee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: "7px 12px", borderRadius: "8px", border: "0.5px solid #ddd", fontSize: "13px", minWidth: "200px" }}
        />
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={{ padding: "7px 12px", borderRadius: "8px", border: "0.5px solid #ddd", fontSize: "13px" }}
        >
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="med">Medium</option>
          <option value="low">Low</option>
        </select>
        {(search || filterPriority !== "all") && (
          <button
            onClick={() => { setSearch(""); setFilterPriority("all"); }}
            style={{ padding: "7px 12px", borderRadius: "8px", border: "0.5px solid #ddd", fontSize: "13px", cursor: "pointer", color: "#888" }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Kanban columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {COLS.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.id)}
            style={{ background: "#f5f5f5", borderRadius: "12px", padding: "12px", minHeight: "300px" }}
          >
            {/* Column header */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontWeight: "500", fontSize: "13px" }}>{col.label}</span>
              <span style={{ fontSize: "11px", background: "#e0e0e0", borderRadius: "99px", padding: "2px 8px" }}>
                {filteredTasks.filter((t) => t.status === col.id).length}
              </span>
            </div>

            {/* Task cards */}
            {filteredTasks
              .filter((t) => t.status === col.id)
              .map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={() => setDragging(task._id)}
                  style={{ background: "#fff", border: "0.5px solid #ddd", borderRadius: "8px", padding: "10px 12px", marginBottom: "8px", cursor: "grab" }}
                >
                  {/* Title and delete */}
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", fontWeight: "500" }}>{task.title}</span>
                    <button
                      onClick={() => handleDelete(task._id)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#999" }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Badges row */}
                  <div style={{ marginTop: "6px", display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>

                    {/* Priority badge */}
                    <span style={{
                      fontSize: "11px", padding: "2px 8px", borderRadius: "99px",
                      background: task.priority === "high" ? "#FAECE7" : task.priority === "med" ? "#FAEEDA" : "#EAF3DE",
                      color: task.priority === "high" ? "#993C1D" : task.priority === "med" ? "#854F0B" : "#3B6D11",
                    }}>
                      {task.priority === "high" ? "High" : task.priority === "med" ? "Medium" : "Low"}
                    </span>

                    {/* Tags */}
                    {task.tags?.map((tag) => (
                      <span key={tag} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "99px", background: "#f0f0f0", color: "#555" }}>
                        {tag}
                      </span>
                    ))}

                    {/* Due date */}
                    {task.dueDate && (
                      <span style={{
                        fontSize: "11px", padding: "2px 8px", borderRadius: "99px",
                        background: new Date(task.dueDate) < new Date() ? "#FCEBEB" : "#E6F1FB",
                        color: new Date(task.dueDate) < new Date() ? "#A32D2D" : "#185FA5",
                      }}>
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}

                    {/* Assignee avatar */}
                    {task.assignee && (
                      <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "99px", background: "#F1EFE8", color: "#5F5E5A", display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#378ADD", color: "#fff", fontSize: "9px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "600" }}>
                          {task.assignee.charAt(0).toUpperCase()}
                        </span>
                        {task.assignee}
                      </span>
                    )}
                  </div>
                </div>
              ))}

            {/* Add task form */}
            {openForm === col.id ? (
              <div style={{ background: "#fff", border: "0.5px solid #ddd", borderRadius: "8px", padding: "10px", marginTop: "8px" }}>
                <input
                  placeholder="Task title..."
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  style={{ width: "100%", padding: "5px 8px", marginBottom: "6px", borderRadius: "6px", border: "0.5px solid #ddd", fontSize: "13px" }}
                />
                <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    style={{ flex: 1, padding: "5px", borderRadius: "6px", border: "0.5px solid #ddd", fontSize: "13px" }}
                  >
                    <option value="high">High</option>
                    <option value="med">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <input
                    placeholder="Tag"
                    value={newTask.tags}
                    onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                    style={{ flex: 1, padding: "5px 8px", borderRadius: "6px", border: "0.5px solid #ddd", fontSize: "13px" }}
                  />
                </div>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  style={{ width: "100%", padding: "5px 8px", marginBottom: "6px", borderRadius: "6px", border: "0.5px solid #ddd", fontSize: "13px" }}
                />
                <input
                  placeholder="Assignee name..."
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  style={{ width: "100%", padding: "5px 8px", marginBottom: "6px", borderRadius: "6px", border: "0.5px solid #ddd", fontSize: "13px" }}
                />
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => handleCreate(col.id)}
                    style={{ flex: 1, padding: "5px", borderRadius: "6px", border: "0.5px solid #ddd", cursor: "pointer", fontWeight: "500", fontSize: "12px" }}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setOpenForm(null)}
                    style={{ flex: 1, padding: "5px", borderRadius: "6px", border: "0.5px solid #ddd", cursor: "pointer", fontSize: "12px", color: "#888" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setOpenForm(col.id)}
                style={{ width: "100%", marginTop: "8px", padding: "7px", borderRadius: "8px", border: "0.5px dashed #ccc", background: "none", cursor: "pointer", fontSize: "12px", color: "#888" }}
              >
                + Add task
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}