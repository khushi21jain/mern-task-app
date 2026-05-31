import { useState } from "react";
import { register } from "../api/auth";

export default function Register({ onLogin, switchToLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) return setError("All fields required");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");
    try {
      setLoading(true);
      const res = await register(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      setLoading(false);
    }
  };

  const G = {
    bg: "#0A0A0F", surface: "#0F0F1A", card: "#13131F",
    border: "rgba(255,255,255,0.07)", text: "#E2E8F0", muted: "#64748B",
  };

  return (
    <div style={{ minHeight: "100vh", background: G.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "0 1rem" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: "48px", height: "48px", background: "linear-gradient(135deg, #818CF8, #C084FC)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 0 20px rgba(129,140,248,0.4)" }}>
            <span style={{ fontSize: "22px" }}>⚡</span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", background: "linear-gradient(90deg, #818CF8, #C084FC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>TaskFlow</h1>
          <p style={{ color: G.muted, fontSize: "13px", marginTop: "6px" }}>Create your account</p>
        </div>

        {/* Card */}
        <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: "16px", padding: "2rem" }}>

          {error && (
            <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "8px", padding: "10px 14px", marginBottom: "1rem", fontSize: "13px", color: "#F87171" }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "12px", color: G.muted, fontWeight: "500", display: "block", marginBottom: "6px" }}>Full Name</label>
            <input
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${G.border}`, background: G.card, color: G.text, fontSize: "13px", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "12px", color: G.muted, fontWeight: "500", display: "block", marginBottom: "6px" }}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${G.border}`, background: G.card, color: G.text, fontSize: "13px", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontSize: "12px", color: G.muted, fontWeight: "500", display: "block", marginBottom: "6px" }}>Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: `1px solid ${G.border}`, background: G.card, color: G.text, fontSize: "13px", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: "100%", padding: "11px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #818CF8, #C084FC)", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer", boxShadow: "0 0 16px rgba(129,140,248,0.4)", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "13px", color: G.muted }}>
            Already have an account?{" "}
            <span onClick={switchToLogin} style={{ color: "#818CF8", cursor: "pointer", fontWeight: "500" }}>
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}