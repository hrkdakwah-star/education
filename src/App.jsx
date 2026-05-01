import { useState, useEffect, useRef } from "react";

/* ─── Google Fonts ─── */
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:       #0c0b0a;
      --surface:  #161412;
      --surface2: #1f1c19;
      --border:   #2e2a25;
      --gold:     #e8a020;
      --gold2:    #ffc84a;
      --text:     #f2ede4;
      --muted:    #7a7168;
      --danger:   #e05252;
      --success:  #52b788;
      --r:        14px;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'DM Sans', sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--surface); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

    /* Animations */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
    }
    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position:  200% 0; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-8px); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .fade-up  { animation: fadeUp  0.5s ease both; }
    .fade-in  { animation: fadeIn  0.4s ease both; }
    .delay-1  { animation-delay: 0.1s; }
    .delay-2  { animation-delay: 0.2s; }
    .delay-3  { animation-delay: 0.3s; }
    .delay-4  { animation-delay: 0.4s; }
    .delay-5  { animation-delay: 0.5s; }

    /* Noise overlay */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 9999;
      opacity: 0.35;
    }
  `}</style>
);

/* ─── Storage helpers ─── */
async function storageGet(key) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function storageSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
}

/* ─── AI Tutor call ─── */
async function askAI(messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: "Kamu adalah tutor AI yang ramah, sabar, dan cerdas bernama Spark. Bantu pengguna belajar dengan penjelasan yang jelas, contoh nyata, dan bahasa yang mudah dipahami. Kadang gunakan emoji untuk membuat penjelasan lebih menyenangkan. Jawab dalam bahasa yang sama dengan pertanyaan pengguna (Indonesia atau Inggris).",
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "Maaf, ada gangguan. Coba lagi ya!";
}

/* ─── Courses data ─── */
const COURSES = [
  { id: 1, emoji: "🧮", title: "Matematika Dasar", desc: "Aljabar, geometri, dan aritmatika", color: "#3b7dd8", level: "Pemula", lessons: 24 },
  { id: 2, emoji: "🧬", title: "Biologi Modern", desc: "Sel, genetika, dan ekosistem", color: "#52b788", level: "Menengah", lessons: 18 },
  { id: 3, emoji: "⚗️", title: "Kimia Organik", desc: "Senyawa karbon dan reaksi kimia", color: "#e05252", level: "Lanjutan", lessons: 30 },
  { id: 4, emoji: "🌍", title: "Sejarah Dunia", desc: "Peradaban kuno hingga modern", color: "#e8a020", level: "Pemula", lessons: 20 },
  { id: 5, emoji: "💻", title: "Pemrograman Web", desc: "HTML, CSS, JavaScript, React", color: "#9b5de5", level: "Menengah", lessons: 36 },
  { id: 6, emoji: "🗣️", title: "Bahasa Inggris", desc: "Grammar, speaking, dan writing", color: "#f15bb5", level: "Pemula", lessons: 28 },
  { id: 7, emoji: "📐", title: "Fisika Mekanika", desc: "Gaya, energi, dan gerak", color: "#00b4d8", level: "Menengah", lessons: 22 },
  { id: 8, emoji: "🎨", title: "Desain Grafis", desc: "Prinsip desain dan tipografi", color: "#ff6b35", level: "Pemula", lessons: 16 },
];

/* ═══════════════════════════════════════════════
   COMPONENTS
═══════════════════════════════════════════════ */

/* ── Gold Glow Button ── */
const GoldBtn = ({ children, onClick, style = {}, disabled, secondary }) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: "12px 28px",
    borderRadius: 10,
    border: secondary ? "1.5px solid var(--border)" : "none",
    background: secondary ? "transparent" : "linear-gradient(135deg, var(--gold), var(--gold2))",
    color: secondary ? "var(--muted)" : "#0c0b0a",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: 15,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.2s",
    boxShadow: secondary ? "none" : "0 4px 24px rgba(232,160,32,0.35)",
    ...style,
  }}
  onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = "translateY(-2px)"; }}
  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
  >{children}</button>
);

/* ── Input field ── */
const Field = ({ label, type = "text", value, onChange, placeholder, icon }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", fontSize: 13, color: "var(--muted)", marginBottom: 6, fontWeight: 500 }}>{label}</label>}
    <div style={{ position: "relative" }}>
      {icon && <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>{icon}</span>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{
          width: "100%", padding: icon ? "12px 14px 12px 42px" : "12px 14px",
          background: "var(--surface2)", border: "1.5px solid var(--border)",
          borderRadius: 10, color: "var(--text)", fontSize: 15,
          fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border 0.2s",
        }}
        onFocus={e => e.target.style.borderColor = "var(--gold)"}
        onBlur={e => e.target.style.borderColor = "var(--border)"}
      />
    </div>
  </div>
);

/* ═══ PAGE: LANDING ═══ */
const Landing = ({ onNav }) => {
  const orbs = [
    { size: 320, top: "-80px", left: "-60px", color: "rgba(232,160,32,0.12)" },
    { size: 200, top: "40%",   right: "5%",   color: "rgba(155,93,229,0.1)" },
    { size: 260, bottom: "0",  left: "30%",   color: "rgba(82,183,136,0.08)" },
  ];

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      {/* Background orbs */}
      {orbs.map((o, i) => (
        <div key={i} style={{
          position: "fixed", width: o.size, height: o.size,
          borderRadius: "50%", background: o.color,
          filter: "blur(80px)", top: o.top, left: o.left,
          right: o.right, bottom: o.bottom, pointerEvents: "none",
          animation: `float ${4 + i}s ease-in-out infinite`,
          animationDelay: `${i * 0.8}s`,
        }} />
      ))}

      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 48px", position: "relative", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, var(--gold), var(--gold2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✦</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px" }}>LearnSpark</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <GoldBtn secondary onClick={() => onNav("login")}>Masuk</GoldBtn>
          <GoldBtn onClick={() => onNav("register")}>Daftar Gratis</GoldBtn>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "80px 24px 60px", position: "relative", zIndex: 5 }}>
        <div className="fade-up" style={{ display: "inline-block", background: "rgba(232,160,32,0.12)", border: "1px solid rgba(232,160,32,0.3)", borderRadius: 100, padding: "6px 18px", fontSize: 13, color: "var(--gold)", marginBottom: 28, fontWeight: 500 }}>
          ✦ Belajar lebih cerdas dengan AI
        </div>
        <h1 className="fade-up delay-1" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(40px, 8vw, 80px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-2px" }}>
          Platform Belajar<br />
          <span style={{ background: "linear-gradient(90deg, var(--gold), var(--gold2))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Masa Depan</span>
        </h1>
        <p className="fade-up delay-2" style={{ fontSize: 18, color: "var(--muted)", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Belajar dari ribuan materi berkualitas, didampingi AI Tutor 24/7 yang siap bantu kamu memahami apapun.
        </p>
        <div className="fade-up delay-3" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <GoldBtn onClick={() => onNav("register")} style={{ padding: "14px 36px", fontSize: 16 }}>Mulai Belajar Gratis →</GoldBtn>
          <GoldBtn secondary onClick={() => onNav("login")} style={{ padding: "14px 36px", fontSize: 16 }}>Sudah punya akun</GoldBtn>
        </div>

        {/* Stats */}
        <div className="fade-up delay-4" style={{ display: "flex", gap: 48, justifyContent: "center", marginTop: 64, flexWrap: "wrap" }}>
          {[["50K+", "Pelajar Aktif"], ["200+", "Materi Kursus"], ["98%", "Tingkat Kepuasan"], ["24/7", "AI Tutor"]].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: "var(--gold)" }}>{num}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Course preview cards */}
      <div className="fade-up delay-5" style={{ padding: "0 24px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 36 }}>Kursus Populer</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {COURSES.slice(0, 4).map(c => (
            <div key={c.id} onClick={() => onNav("register")} style={{
              background: "var(--surface)", border: "1px solid var(--border)", borderRadius: var(--r), padding: 24,
              cursor: "pointer", transition: "all 0.25s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.transform = "translateY(-4px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>{c.emoji}</div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>{c.desc}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 11, background: `${c.color}22`, color: c.color, padding: "3px 10px", borderRadius: 100, fontWeight: 500 }}>{c.level}</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{c.lessons} Pelajaran</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <GoldBtn secondary onClick={() => onNav("register")}>Lihat semua kursus →</GoldBtn>
        </div>
      </div>
    </div>
  );
};

/* ═══ PAGE: AUTH (Login + Register) ═══ */
const Auth = ({ mode, onNav, onLogin }) => {
  const [tab, setTab] = useState(mode); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    setErr("");
    if (tab === "register") {
      if (!form.name || !form.email || !form.password) return setErr("Semua field wajib diisi.");
      if (form.password !== form.confirm) return setErr("Password tidak cocok.");
      if (form.password.length < 6) return setErr("Password minimal 6 karakter.");
    } else {
      if (!form.email || !form.password) return setErr("Email dan password wajib diisi.");
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));

    // Cek / buat user di storage
    const users = (await storageGet("ls_users")) || {};
    if (tab === "register") {
      if (users[form.email]) { setErr("Email sudah terdaftar."); setLoading(false); return; }
      users[form.email] = { name: form.name, email: form.email, password: form.password, joined: Date.now(), progress: {} };
      await storageSet("ls_users", users);
      onLogin({ name: form.name, email: form.email });
    } else {
      const u = users[form.email];
      if (!u || u.password !== form.password) { setErr("Email atau password salah."); setLoading(false); return; }
      onLogin({ name: u.name, email: u.email });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
      {/* Back orb */}
      <div style={{ position: "fixed", width: 400, height: 400, borderRadius: "50%", background: "rgba(232,160,32,0.08)", filter: "blur(100px)", top: "10%", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }} />

      {/* Logo */}
      <div className="fade-up" onClick={() => onNav("landing")} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40, cursor: "pointer" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, var(--gold), var(--gold2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✦</div>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700 }}>LearnSpark</span>
      </div>

      {/* Card */}
      <div className="fade-up delay-1" style={{ width: "100%", maxWidth: 420, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 36, position: "relative", zIndex: 5 }}>
        {/* Tabs */}
        <div style={{ display: "flex", background: "var(--surface2)", borderRadius: 10, padding: 4, marginBottom: 28 }}>
          {["login", "register"].map(t => (
            <button key={t} onClick={() => { setTab(t); setErr(""); }} style={{
              flex: 1, padding: "10px", borderRadius: 8, border: "none", cursor: "pointer",
              background: tab === t ? "var(--gold)" : "transparent",
              color: tab === t ? "#0c0b0a" : "var(--muted)",
              fontWeight: 600, fontSize: 14, transition: "all 0.2s",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {t === "login" ? "Masuk" : "Daftar"}
            </button>
          ))}
        </div>

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, marginBottom: 6 }}>
          {tab === "login" ? "Selamat datang kembali!" : "Buat akun baru"}
        </h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>
          {tab === "login" ? "Masuk untuk lanjutkan belajarmu." : "Gratis selamanya. Mulai belajar sekarang!"}
        </p>

        {tab === "register" && <Field label="Nama Lengkap" value={form.name} onChange={f("name")} placeholder="Budi Santoso" icon="👤" />}
        <Field label="Email" type="email" value={form.email} onChange={f("email")} placeholder="kamu@email.com" icon="📧" />
        <Field label="Password" type="password" value={form.password} onChange={f("password")} placeholder="••••••••" icon="🔒" />
        {tab === "register" && <Field label="Konfirmasi Password" type="password" value={form.confirm} onChange={f("confirm")} placeholder="••••••••" icon="🔒" />}

        {err && <div style={{ background: "rgba(224,82,82,0.12)", border: "1px solid rgba(224,82,82,0.3)", color: "#e05252", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginBottom: 16 }}>⚠ {err}</div>}

        <GoldBtn onClick={submit} disabled={loading} style={{ width: "100%", marginTop: 4 }}>
          {loading ? "⏳ Memproses..." : tab === "login" ? "Masuk →" : "Buat Akun →"}
        </GoldBtn>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginTop: 20 }}>
          {tab === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
          <span onClick={() => { setTab(tab === "login" ? "register" : "login"); setErr(""); }} style={{ color: "var(--gold)", cursor: "pointer", fontWeight: 500 }}>
            {tab === "login" ? "Daftar gratis" : "Masuk"}
          </span>
        </p>
      </div>

      <p className="fade-up delay-2" style={{ marginTop: 24, fontSize: 12, color: "var(--muted)" }}>
        Dengan mendaftar, kamu menyetujui Syarat & Ketentuan LearnSpark.
      </p>
    </div>
  );
};

/* ═══ PAGE: DASHBOARD ═══ */
const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("home"); // home | courses | tutor
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { role: "assistant", text: `Halo ${user.name}! 👋 Saya Spark, AI Tutor kamu. Tanya apapun tentang pelajaran, saya siap bantu! ✨` }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    storageGet(`ls_enrolled_${user.email}`).then(d => { if (d) setEnrolledCourses(d); });
  }, [user.email]);

  const toggleEnroll = async (courseId) => {
    const updated = enrolledCourses.includes(courseId)
      ? enrolledCourses.filter(id => id !== courseId)
      : [...enrolledCourses, courseId];
    setEnrolledCourses(updated);
    await storageSet(`ls_enrolled_${user.email}`, updated);
  };

  const sendChat = async () => {
    if (!chatInput.trim() || aiLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(p => [...p, { role: "user", text: userMsg }]);
    setAiLoading(true);
    const history = chatMessages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
    const reply = await askAI([...history, { role: "user", content: userMsg }]);
    setChatMessages(p => [...p, { role: "assistant", text: reply }]);
    setAiLoading(false);
  };

  const NAV = [
    { id: "home",    icon: "🏠", label: "Beranda" },
    { id: "courses", icon: "📚", label: "Kursus" },
    { id: "tutor",   icon: "🤖", label: "AI Tutor" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 72, transition: "width 0.3s ease",
        background: "var(--surface)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0,
        position: "sticky", top: 0, height: "100vh", overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 18px 24px", borderBottom: "1px solid var(--border)", marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, var(--gold), var(--gold2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>✦</div>
          {sidebarOpen && <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, whiteSpace: "nowrap" }}>LearnSpark</span>}
        </div>

        {NAV.map(n => (
          <button key={n.id} onClick={() => setActiveTab(n.id)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 18px",
            border: "none", background: activeTab === n.id ? "rgba(232,160,32,0.12)" : "transparent",
            color: activeTab === n.id ? "var(--gold)" : "var(--muted)",
            borderLeft: activeTab === n.id ? "3px solid var(--gold)" : "3px solid transparent",
            cursor: "pointer", width: "100%", textAlign: "left", fontSize: 15, fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.2s", fontWeight: activeTab === n.id ? 600 : 400,
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{n.icon}</span>
            {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{n.label}</span>}
          </button>
        ))}

        <div style={{ marginTop: "auto", padding: "12px 18px", borderTop: "1px solid var(--border)" }}>
          {sidebarOpen && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{user.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{user.email}</div>
            </div>
          )}
          <button onClick={onLogout} style={{
            display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "1px solid var(--border)",
            color: "var(--muted)", borderRadius: 8, padding: "8px 12px", cursor: "pointer",
            width: "100%", fontSize: 13, fontFamily: "'DM Sans', sans-serif",
          }}>
            <span>🚪</span>{sidebarOpen && "Keluar"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto", padding: 32 }}>

        {/* ── HOME ── */}
        {activeTab === "home" && (
          <div className="fade-in">
            {/* Welcome banner */}
            <div style={{ background: "linear-gradient(135deg, rgba(232,160,32,0.15), rgba(255,200,74,0.08))", border: "1px solid rgba(232,160,32,0.25)", borderRadius: 18, padding: "28px 32px", marginBottom: 32, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", right: 24, top: 24, fontSize: 64, opacity: 0.3, animation: "float 3s ease-in-out infinite" }}>✦</div>
              <div style={{ fontSize: 13, color: "var(--gold)", fontWeight: 500, marginBottom: 8 }}>Selamat datang kembali!</div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 8 }}>Halo, {user.name} 👋</h1>
              <p style={{ color: "var(--muted)", fontSize: 15 }}>
                Kamu terdaftar di <strong style={{ color: "var(--text)" }}>{enrolledCourses.length} kursus</strong>. Lanjutkan belajarmu!
              </p>
              <GoldBtn onClick={() => setActiveTab("courses")} style={{ marginTop: 16 }}>Lihat Kursus →</GoldBtn>
            </div>

            {/* Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
              {[
                { icon: "📚", val: enrolledCourses.length, label: "Kursus Diikuti", color: "#e8a020" },
                { icon: "🔥", val: "3", label: "Hari Berturut", color: "#e05252" },
                { icon: "🤖", val: "∞", label: "Sesi AI Tutor", color: "#9b5de5" },
                { icon: "⭐", val: "0", label: "Poin XP", color: "#52b788" },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px 22px" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Enrolled courses */}
            {enrolledCourses.length > 0 && (
              <>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 16 }}>Kursusmu</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginBottom: 32 }}>
                  {COURSES.filter(c => enrolledCourses.includes(c.id)).map(c => (
                    <CourseCard key={c.id} course={c} enrolled onToggle={toggleEnroll} />
                  ))}
                </div>
              </>
            )}

            {/* AI Tutor CTA */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, padding: 28, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <div style={{ fontSize: 48 }}>🤖</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 4 }}>Punya pertanyaan tentang pelajaran?</div>
                <div style={{ color: "var(--muted)", fontSize: 14 }}>AI Tutor Spark siap bantu kamu 24 jam sehari, 7 hari seminggu.</div>
              </div>
              <GoldBtn onClick={() => setActiveTab("tutor")}>Tanya Spark →</GoldBtn>
            </div>
          </div>
        )}

        {/* ── COURSES ── */}
        {activeTab === "courses" && (
          <div className="fade-in">
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 8 }}>Semua Kursus</h1>
            <p style={{ color: "var(--muted)", marginBottom: 28 }}>Klik kursus untuk mendaftar. Belajar kapan saja, di mana saja.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
              {COURSES.map(c => (
                <CourseCard key={c.id} course={c} enrolled={enrolledCourses.includes(c.id)} onToggle={toggleEnroll} />
              ))}
            </div>
          </div>
        )}

        {/* ── AI TUTOR ── */}
        {activeTab === "tutor" && (
          <div className="fade-in" style={{ maxWidth: 740, margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" }}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28 }}>🤖 AI Tutor — Spark</h1>
              <p style={{ color: "var(--muted)", fontSize: 14 }}>Tanya apa saja tentang pelajaran. Spark selalu siap membantu!</p>
            </div>

            {/* Chat area */}
            <div style={{ flex: 1, overflow: "auto", padding: "4px 0", display: "flex", flexDirection: "column", gap: 16 }}>
              {chatMessages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  {m.role === "assistant" && (
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, var(--gold), var(--gold2))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 10, marginTop: 4, fontSize: 16 }}>✦</div>
                  )}
                  <div style={{
                    maxWidth: "75%", padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: m.role === "user" ? "linear-gradient(135deg, var(--gold), var(--gold2))" : "var(--surface)",
                    border: m.role === "user" ? "none" : "1px solid var(--border)",
                    color: m.role === "user" ? "#0c0b0a" : "var(--text)",
                    fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap",
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, var(--gold), var(--gold2))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✦</div>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, padding: "12px 18px" }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gold)", animation: "pulse 1.2s ease infinite", animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div style={{ display: "flex", gap: 10, marginTop: 16, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "8px 8px 8px 16px", alignItems: "flex-end" }}>
              <textarea
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                placeholder="Tanya tentang pelajaran... (Enter untuk kirim)"
                rows={1}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "var(--text)", fontSize: 15, fontFamily: "'DM Sans', sans-serif",
                  resize: "none", lineHeight: 1.5, padding: "6px 0", maxHeight: 120, overflowY: "auto",
                }}
              />
              <button onClick={sendChat} disabled={aiLoading || !chatInput.trim()} style={{
                width: 40, height: 40, borderRadius: 10, border: "none",
                background: aiLoading || !chatInput.trim() ? "var(--surface2)" : "linear-gradient(135deg, var(--gold), var(--gold2))",
                color: "#0c0b0a", cursor: aiLoading || !chatInput.trim() ? "not-allowed" : "pointer",
                fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                transition: "all 0.2s",
              }}>↑</button>
            </div>

            {/* Quick questions */}
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {["Apa itu fotosintesis?", "Jelaskan hukum Newton", "Cara belajar yang efektif?"].map(q => (
                <button key={q} onClick={() => { setChatInput(q); }} style={{
                  background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--muted)",
                  borderRadius: 100, padding: "5px 14px", fontSize: 12, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
                >{q}</button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

/* ── Course Card ── */
const CourseCard = ({ course: c, enrolled, onToggle }) => (
  <div style={{
    background: "var(--surface)", border: `1px solid ${enrolled ? c.color + "55" : "var(--border)"}`,
    borderRadius: 16, padding: 24, transition: "all 0.25s", position: "relative",
  }}
  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 40px ${c.color}22`; }}
  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
  >
    {enrolled && (
      <div style={{ position: "absolute", top: 16, right: 16, background: `${c.color}22`, color: c.color, fontSize: 11, padding: "3px 10px", borderRadius: 100, fontWeight: 600 }}>✓ Terdaftar</div>
    )}
    <div style={{ fontSize: 40, marginBottom: 12 }}>{c.emoji}</div>
    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{c.title}</div>
    <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16, lineHeight: 1.5 }}>{c.desc}</div>
    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
      <span style={{ fontSize: 11, background: `${c.color}22`, color: c.color, padding: "3px 10px", borderRadius: 100, fontWeight: 500 }}>{c.level}</span>
      <span style={{ fontSize: 11, color: "var(--muted)", padding: "3px 10px" }}>📖 {c.lessons} Pelajaran</span>
    </div>
    <button onClick={() => onToggle(c.id)} style={{
      width: "100%", padding: "10px", borderRadius: 10, border: `1.5px solid ${enrolled ? "var(--border)" : c.color}`,
      background: enrolled ? "transparent" : `${c.color}22`,
      color: enrolled ? "var(--muted)" : c.color,
      fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
    }}>
      {enrolled ? "Batalkan Pendaftaran" : "Daftar Kursus"}
    </button>
  </div>
);

/* ═══════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("landing"); // landing | login | register | dashboard
  const [user, setUser] = useState(null);

  useEffect(() => {
    storageGet("ls_session").then(u => { if (u) { setUser(u); setPage("dashboard"); } });
  }, []);

  const handleLogin = async (u) => {
    setUser(u);
    await storageSet("ls_session", u);
    setPage("dashboard");
  };

  const handleLogout = async () => {
    await storageSet("ls_session", null);
    setUser(null);
    setPage("landing");
  };

  return (
    <>
      <FontLink />
      {page === "landing" && <Landing onNav={setPage} />}
      {(page === "login" || page === "register") && <Auth mode={page} onNav={setPage} onLogin={handleLogin} />}
      {page === "dashboard" && user && <Dashboard user={user} onLogout={handleLogout} />}
    </>
  );
}
