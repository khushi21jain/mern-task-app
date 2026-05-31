import { useState } from "react";
import TaskBoard from "./components/TaskBoard";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [page, setPage] = useState("login");

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("login");
  };

  if (!user) {
    return page === "login"
      ? <Login onLogin={handleLogin} switchToRegister={() => setPage("register")} />
      : <Register onLogin={handleLogin} switchToLogin={() => setPage("login")} />;
  }

  return <TaskBoard user={user} onLogout={handleLogout} />;
}

export default App;