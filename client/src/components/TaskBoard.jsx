import { useEffect, useState } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";

const COLS = [
  { id: "todo",   label: "To Do",       color: "#818CF8", bg: "rgba(129,140,248,0.1)", glow: "rgba(129,140,248,0.3)" },
  { id: "inprog", label: "In Progress", color: "#FBBF24", bg: "rgba(251,191,36,0.1)",  glow: "rgba(251,191,36,0.3)" },
  { id: "review", label: "Review",      color: "#F472B6", bg: "rgba(244,114,182,0.1)", glow: "rgba(244,114,182,0.3)" },
  { id: "done",   label: "Done",        color: "#34D399", bg: "rgba(52,211,153,0.1)",  glow: "rgba(52,211,153,0.3)" },
];

const PRIORITY_CONFIG = {
  high: { bg: "rgba(248,113,113,0.15)", color: "#F87171", label: "High" },
  med:  { bg: "rgba(251,191,36,0.15)",  color: "#FBBF24", label: "Medium" },
  low:  { bg: "rgba(52,211,153,0.15)",  color: "#34D399", label: "Low" },
};

const G = {
  bg:      "#0A0A0F",
  surface: "#0F0F1A",
  card:    "#13131F",
  border:  "rgba(255,255,255,0.07)",
  text:    "#E2E8F0",
  muted:   "#64748B",
};

export default function TaskBoard({ user, onLogout }) {
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [openForm, setOpenForm]     = useState(null);
  const [newTask, setNewTask]       = useState({ title: "", priority: "med", tags: "", dueDate: "", assignee: "" });
  const [dragging, setDragging]     = useState(null);
  const [dragOver, setDragOver]     = useState(null);
  const [search, setSearch]         = useState("");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => { fetchTasks(); }, []);

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
      setDragOver(null);
    } catch (err) {
      setError("Failed to update task");
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignee?.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = filterPriority === "all" || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const totalTasks   = tasks.length;
  const doneTasks    = tasks.filter((t) => t.status === "done").length;
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;
  const inProgTasks  = tasks.filter((t) => t.status === "inprog").length;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: G.bg, fontFamily: "Inter, sans-serif" }}>
      <p style={{ color: "#818CF8", fontSize: "14px", letterSpacing: "0.1em" }}>Loading your board...</p>
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: G.bg }}>
      <p style={{ color: "#F87171", background: "rgba(248,113,113,0.1)", padding: "12px 20px", borderRadius: "8px", border: "1px solid rgba(248,113,113,0.3)" }}>{error}</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: G.bg, fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Navbar */}
      <div style={{ background: G.surface, borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #818CF8, #C084FC)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(129,140,248,0.5)" }}>
            <span style={{ color: "#fff", fontSize: "16px" }}>&#9889;</span>
          </div>
          <span style={{ fontWeight: "700", fontSize: "16px", background: "linear-gradient(90deg, #818CF8, #C084FC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-0.3px" }}>TaskFlow</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #818CF8, #C084FC)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px", fontWeight: "600", boxShadow: "0 0 10px rgba(129,140,248,0.4)" }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: "13px", color: "#818CF8", fontWeight: "500" }}>{user?.name}</span>
          </div>
          <button
            onClick={onLogout}
            style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.1)", color: "#F87171", fontSize: "12px", cursor: "pointer", fontWeight: "500" }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>

        {/* Page title */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "26px", fontWeight: "700", margin: 0, letterSpacing: "-0.5px", background: "linear-gradient(90deg, #818CF8, #F472B6, #34D399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Project Board
          </h1>
          <p style={{ fontSize: "13px", color: G.muted, marginTop: "4px" }}>Manage and track your team tasks</p>
        </div>

        {/* Stats bar */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {[
            { label: "Total Tasks",  value: totalTasks,   color: "#818CF8", rgb: "129,140,248" },
            { label: "Completed",    value: doneTasks,    color: "#34D399", rgb: "52,211,153"  },
            { label: "Overdue",      value: overdueTasks, color: "#F87171", rgb: "248,113,113" },
            { label: "In Progress",  value: inProgTasks,  color: "#FBBF24", rgb: "251,191,36"  },
          ].map((stat) => (
            <div key={stat.label} style={{ background: G.surface, border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "14px 20px", display: "flex", alignItems: "center", gap: "12px", minWidth: "140px", flex: 1 }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: `rgba(${stat.rgb},0.15)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 10px rgba(${stat.rgb},0.3)` }}>
                <span style={{ fontSize: "16px", fontWeight: "700", color: stat.color }}>{stat.value}</span>
              </div>
              <span style={{ fontSize: "12px", color: G.muted, fontWeight: "500" }}>{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Search and filter */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, position: "relative", minWidth: "200px" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: G.muted, fontSize: "14px" }}>&#128269;</span>
            <input
              placeholder="Search tasks or assignee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", fontSize: "13px", background: G.surface, color: G.text, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", fontSize: "13px", background: G.surface, color: G.text, cursor: "pointer" }}
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="med">Medium</option>
            <option value="low">Low</option>
          </select>
          {(search || filterPriority !== "all") && (
            <button
              onClick={() => { setSearch(""); setFilterPriority("all"); }}
              style={{ padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)", fontSize: "13px", background: G.surface, color: G.muted, cursor: "pointer" }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Kanban columns */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {COLS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                onDragOver={(e) => { e.preventDefault(); setDragOver(col.id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => handleDrop(col.id)}
                style={{
                  background: dragOver === col.id ? col.bg : G.surface,
                  border: dragOver === col.id ? "1px solid " + col.color + "60" : "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "16px",
                  padding: "16px",
                  minHeight: "400px",
                  transition: "all 0.2s ease",
                  boxShadow: dragOver === col.id ? "0 0 20px " + col.glow : "none",
                }}
              >
                {/* Column header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: col.color, boxShadow: "0 0 8px " + col.color }}></div>
                    <span style={{ fontWeight: "600", fontSize: "13px", color: col.color }}>{col.label}</span>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "600", background: col.bg, color: col.color, borderRadius: "99px", padding: "2px 9px", border: "1px solid " + col.color + "40" }}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Task cards */}
                {colTasks.map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={() => setDragging(task._id)}
                    onDragEnd={() => setDragging(null)}
                    style={{
                      background: G.card,
                      border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: "12px",
                      padding: "12px 14px",
                      marginBottom: "10px",
                      cursor: "grab",
                      opacity: dragging === task._id ? 0.4 : 1,
                      transition: "all 0.15s ease",
                      boxShadow: dragging === task._id ? "none" : "0 2px 12px rgba(0,0,0,0.3)",
                    }}
                  >
                    {/* Title and delete */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#F1F5F9", lineHeight: "1.4", flex: 1, paddingRight: "8px" }}>{task.title}</span>
                      <button
                        onClick={() => handleDelete(task._id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: G.muted, fontSize: "16px", lineHeight: 1, padding: 0, flexShrink: 0 }}
                        onMouseOver={(e) => e.target.style.color = "#F87171"}
                        onMouseOut={(e) => e.target.style.color = G.muted}
                      >&#215;</button>
                    </div>

                    {/* Badges */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: "11px", fontWeight: "500", padding: "2px 8px", borderRadius: "99px", background: PRIORITY_CONFIG[task.priority]?.bg, color: PRIORITY_CONFIG[task.priority]?.color, border: "1px solid " + PRIORITY_CONFIG[task.priority]?.color + "40" }}>
                        {PRIORITY_CONFIG[task.priority]?.label}
                      </span>
                      {task.tags?.map((tag) => (
                        <span key={tag} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "99px", background: "rgba(129,140,248,0.1)", color: "#818CF8", fontWeight: "500", border: "1px solid rgba(129,140,248,0.25)" }}>
                          {tag}
                        </span>
                      ))}
                      {task.dueDate && (
                        <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "99px", fontWeight: "500", background: new Date(task.dueDate) < new Date() ? "rgba(248,113,113,0.15)" : "rgba(96,165,250,0.15)", color: new Date(task.dueDate) < new Date() ? "#F87171" : "#60A5FA", border: "1px solid " + (new Date(task.dueDate) < new Date() ? "rgba(248,113,113,0.3)" : "rgba(96,165,250,0.3)") }}>
                          &#128197; {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                      {task.assignee && (
                        <span style={{ fontSize: "11px", padding: "2px 8px 2px 4px", borderRadius: "99px", background: "rgba(192,132,252,0.1)", color: "#C084FC", fontWeight: "500", display: "flex", alignItems: "center", gap: "4px", border: "1px solid rgba(192,132,252,0.25)" }}>
                          <span style={{ width: "18px", height: "18px", borderRadius: "50%", background: "linear-gradient(135deg, #818CF8, #C084FC)", color: "#fff", fontSize: "9px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
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
                  <div style={{ background: G.card, border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "12px", marginTop: "8px" }}>
                    <input
                      placeholder="Task title..."
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      onKeyDown={(e) => e.key === "Enter" && handleCreate(col.id)}
                      style={{ width: "100%", padding: "8px 10px", marginBottom: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.07)", fontSize: "13px", background: G.surface, color: G.text, boxSizing: "border-box", outline: "none" }}
                      autoFocus
                    />
                    <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                        style={{ flex: 1, padding: "7px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.07)", fontSize: "12px", background: G.surface, color: G.text }}
                      >
                        <option value="high">High</option>
                        <option value="med">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      <input
                        placeholder="Tag"
                        value={newTask.tags}
                        onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                        style={{ flex: 1, padding: "7px 10px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.07)", fontSize: "12px", background: G.surface, color: G.text }}
                      />
                    </div>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      style={{ width: "100%", padding: "7px 10px", marginBottom: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.07)", fontSize: "12px", background: G.surface, color: G.text, boxSizing: "border-box" }}
                    />
                    <input
                      placeholder="Assignee name..."
                      value={newTask.assignee}
                      onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                      style={{ width: "100%", padding: "7px 10px", marginBottom: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.07)", fontSize: "12px", background: G.surface, color: G.text, boxSizing: "border-box" }}
                    />
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        onClick={() => handleCreate(col.id)}
                        style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #818CF8, #C084FC)", color: "#fff", cursor: "pointer", fontWeight: "600", fontSize: "12px", boxShadow: "0 0 12px rgba(129,140,248,0.4)" }}
                      >
                        Add Task
                      </button>
                      <button
                        onClick={() => setOpenForm(null)}
                        style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.07)", background: "none", color: G.muted, cursor: "pointer", fontSize: "12px" }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setOpenForm(col.id)}
                    style={{ width: "100%", marginTop: "8px", padding: "9px", borderRadius: "10px", border: "1.5px dashed rgba(255,255,255,0.07)", background: "none", cursor: "pointer", fontSize: "12px", color: G.muted, fontWeight: "500", transition: "all 0.15s" }}
                    onMouseOver={(e) => { e.currentTarget.style.borderColor = col.color; e.currentTarget.style.color = col.color; e.currentTarget.style.boxShadow = "0 0 10px " + col.glow; }}
                    onMouseOut={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = G.muted; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    + Add Task
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}