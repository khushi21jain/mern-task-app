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
  const [newTask, setNewTask] = useState({ title: "", priority: "med", tags: "" });
  const [dragging, setDragging] = useState(null);

  // Fetch all tasks from MongoDB on load
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

  // Create a new task
  const handleCreate = async (colId) => {
    if (!newTask.title.trim()) return;
    try {
      const res = await createTask({
        title: newTask.title,
        priority: newTask.priority,
        tags: newTask.tags ? [newTask.tags] : [],
        status: colId,
      });
      setTasks([res.data, ...tasks]);
      setOpenForm(null);
      setNewTask({ title: "", priority: "med", tags: "" });
    } catch (err) {
      setError("Failed to create task");
    }
  };

  // Delete a task
  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  // Drag and drop — update status in MongoDB
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

  if (loading) return <p style={{ padding: "2rem" }}>Loading tasks...</p>;
  if (error)   return <p style={{ padding: "2rem", color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1.5rem", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: "1.5rem", fontSize: "22px" }}>Task Board</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {COLS.map((col) => (
          <div
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.id)}
            style={{
              background: "#f5f5f5",
              borderRadius: "12px",
              padding: "12px",
              minHeight: "300px",
            }}
          >
            {/* Column header */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontWeight: "500", fontSize: "13px" }}>{col.label}</span>
              <span style={{ fontSize: "11px", background: "#e0e0e0", borderRadius: "99px", padding: "2px 8px" }}>
                {tasks.filter((t) => t.status === col.id).length}
              </span>
            </div>

            {/* Task cards */}
            {tasks
              .filter((t) => t.status === col.id)
              .map((task) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={() => setDragging(task._id)}
                  style={{
                    background: "#fff",
                    border: "0.5px solid #ddd",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    marginBottom: "8px",
                    cursor: "grab",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", fontWeight: "500" }}>{task.title}</span>
                    <button
                      onClick={() => handleDelete(task._id)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#999" }}
                    >
                      ×
                    </button>
                  </div>
                  <div style={{ marginTop: "6px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: "11px", padding: "2px 8px", borderRadius: "99px",
                      background: task.priority === "high" ? "#FAECE7" : task.priority === "med" ? "#FAEEDA" : "#EAF3DE",
                      color: task.priority === "high" ? "#993C1D" : task.priority === "med" ? "#854F0B" : "#3B6D11",
                    }}>
                      {task.priority === "high" ? "High" : task.priority === "med" ? "Medium" : "Low"}
                    </span>
                    {task.tags?.map((tag) => (
                      <span key={tag} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "99px", background: "#f0f0f0", color: "#555" }}>
                        {tag}
                      </span>
                    ))}
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