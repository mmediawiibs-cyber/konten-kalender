import React, { useState, useEffect } from "react";
import {
  Calendar,
  AlignLeft,
  Database,
  Plus,
  Trash2,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  LayoutDashboard,
  Briefcase,
  Camera,
  MapPin,
  Cpu,
  Monitor,
  User,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Check,
  Copy,
  Link2,
  ExternalLink,
} from "lucide-react";

const initialMasterData = {
  talent: [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Sarah Jane" },
  ],
  equipment: [
    { id: "1", name: "Sony A7IV" },
    { id: "2", name: "Rode Mic" },
    { id: "3", name: "Lighting Godox" },
  ],
  location: [
    { id: "1", name: "Studio A" },
    { id: "2", name: "Cafe Senja" },
  ],
  pillar: [
    { id: "1", name: "Edukasi", color: "#3b82f6" },
    { id: "2", name: "Hiburan", color: "#f59e0b" },
    { id: "3", name: "Promosi", color: "#10b981" },
  ],
  platform: [
    { id: "1", name: "Instagram" },
    { id: "2", name: "TikTok" },
    { id: "3", name: "YouTube" },
  ],
  producer: [
    { id: "1", name: "Andi (Videografer)" },
    { id: "2", name: "Budi (Editor)" },
  ],
};

const categories = [
  { id: "talent", title: "Talent", icon: <Briefcase className="w-5 h-5" /> },
  { id: "equipment", title: "Peralatan", icon: <Camera className="w-5 h-5" /> },
  { id: "location", title: "Lokasi", icon: <MapPin className="w-5 h-5" /> },
  { id: "pillar", title: "Pillar Konten", icon: <Cpu className="w-5 h-5" /> },
  {
    id: "platform",
    title: "Platform Medsos",
    icon: <Monitor className="w-5 h-5" />,
  },
  { id: "producer", title: "Tim Produksi", icon: <User className="w-5 h-5" /> },
];

const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const getWeekLabel = (currentDate, today) => {
  const c = new Date(currentDate);
  c.setHours(0, 0, 0, 0);
  c.setDate(c.getDate() - c.getDay()); // Ambil awal pekan (Minggu) dari currentDate

  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  t.setDate(t.getDate() - t.getDay()); // Ambil awal pekan (Minggu) dari hari ini

  const diff = Math.round(
    (c.getTime() - t.getTime()) / (1000 * 60 * 60 * 24 * 7),
  );
  if (diff === 0) return "Pekan ini";
  if (diff > 0) return `Pekan +${diff}`;
  return `Pekan ${diff}`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState("calendar");
  const [calendarView, setCalendarView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [masterData, setMasterData] = useState(initialMasterData);
  const [contents, setContents] = useState([]);
  const [monthNotes, setMonthNotes] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState({});
  const [progressDetailFilter, setProgressDetailFilter] = useState(null);

  const [editingMaster, setEditingMaster] = useState(null);
  const [editMasterVal, setEditMasterVal] = useState("");

  useEffect(() => {
    // Simulasi Fetch dari Firebase (menggunakan localStorage untuk purwarupa)
    const savedContents = localStorage.getItem("hq_contents");
    const savedMaster = localStorage.getItem("hq_masterData");
    const savedNotes = localStorage.getItem("hq_monthNotes");

    if (savedContents) setContents(JSON.parse(savedContents));
    if (savedMaster) setMasterData(JSON.parse(savedMaster));
    if (savedNotes) setMonthNotes(JSON.parse(savedNotes));
  }, []);

  useEffect(() => {
    // Simulasi Save ke Firebase
    localStorage.setItem("hq_contents", JSON.stringify(contents));
    localStorage.setItem("hq_masterData", JSON.stringify(masterData));
    localStorage.setItem("hq_monthNotes", JSON.stringify(monthNotes));
  }, [contents, masterData, monthNotes]);

  const handleSaveContent = (content) => {
    if (content.id) {
      setContents(
        contents.map((c) =>
          c.id === content.id ? { ...content, updatedAt: Date.now() } : c,
        ),
      );
    } else {
      setContents([
        ...contents,
        { ...content, id: Date.now().toString(), createdAt: Date.now() },
      ]);
    }
    setIsModalOpen(false);
    setEditingContent({});
  };

  const handleDeleteContent = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus konten ini?")) {
      setContents(contents.filter((c) => c.id !== id));
      setIsModalOpen(false);
    }
  };

  const handleDuplicateContent = (content) => {
    const newContent = {
      ...content,
      id: Date.now().toString(),
      title: `${content.title || "Untitled"} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setContents([...contents, newContent]);
  };

  const onDragStart = (e, id) => {
    e.dataTransfer.setData("contentId", id);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, dateStr, statusTarget = null) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("contentId");
    setContents(
      contents.map((c) => {
        if (c.id === id) {
          let newC = { ...c };
          if (dateStr !== null) newC.scheduledDate = dateStr;
          if (statusTarget) {
            newC.status = statusTarget;
            if (statusTarget === "draft" && !dateStr) newC.scheduledDate = null;
          }
          return newC;
        }
        return c;
      }),
    );
  };

  const prevTime = () => {
    const newDate = new Date(currentDate);
    if (calendarView === "month") newDate.setMonth(newDate.getMonth() - 1);
    if (calendarView === "semester") newDate.setMonth(newDate.getMonth() - 6);
    if (calendarView === "week") newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextTime = () => {
    const newDate = new Date(currentDate);
    if (calendarView === "month") newDate.setMonth(newDate.getMonth() + 1);
    if (calendarView === "semester") newDate.setMonth(newDate.getMonth() + 6);
    if (calendarView === "week") newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const addMasterData = (catId, value) => {
    const val = value.trim();
    if (!val) return;
    const newItem = { id: Date.now().toString(), name: val };
    if (catId === "pillar")
      newItem.color = "#" + Math.floor(Math.random() * 16777215).toString(16); // Random color
    setMasterData({ ...masterData, [catId]: [...masterData[catId], newItem] });
  };

  const deleteMasterData = (catId, itemId) => {
    if (confirm("Hapus data ini?")) {
      setMasterData({
        ...masterData,
        [catId]: masterData[catId].filter((item) => item.id !== itemId),
      });
    }
  };

  const saveEditMasterData = (catId, itemId) => {
    setMasterData({
      ...masterData,
      [catId]: masterData[catId].map((item) =>
        item.id === itemId ? { ...item, name: editMasterVal } : item,
      ),
    });
    setEditingMaster(null);
  };

  const renderCard = (c, compact = false) => {
    const isCompleted = c.status === "selesai";
    const pillarData = c.pillarIds?.[0]
      ? masterData.pillar.find((p) => p.id === c.pillarIds[0])
      : null;
    const cardBorderColor = pillarData ? pillarData.color : "#e2e8f0";

    return (
      <div
        key={c.id}
        draggable
        onDragStart={(e) => onDragStart(e, c.id)}
        style={{ borderLeftColor: cardBorderColor, borderLeftWidth: "4px" }}
        className={`bg-white rounded-xl shadow-sm border border-slate-200 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${compact ? "text-xs" : "text-sm"} relative overflow-hidden`}
      >
        <div className="flex justify-between items-start mb-1">
          <h4 className="font-bold text-[#011f3f] truncate pr-12">
            {c.title || "Untitled"}
          </h4>
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all bg-white shadow-sm rounded-md border border-slate-100">
            <button
              onClick={() => handleDuplicateContent(c)}
              className="p-1 text-slate-400 hover:text-[#c79d3a] hover:bg-slate-50 rounded transition-colors"
              title="Duplikat Konten"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleDeleteContent(c.id)}
              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Hapus Konten"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {pillarData && (
          <span
            className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white mb-2"
            style={{ backgroundColor: pillarData.color }}
          >
            {pillarData.name}
          </span>
        )}

        {!compact && (
          <div className="flex justify-between items-center mt-2 border-t border-slate-50 pt-2">
            <span
              className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                c.status === "selesai"
                  ? "bg-green-100 text-green-700"
                  : c.status === "tunda"
                    ? "bg-orange-100 text-orange-700"
                    : c.status === "batal"
                      ? "bg-red-100 text-red-700"
                      : "bg-slate-100 text-slate-600"
              }`}
            >
              {c.status || "draft"}
            </span>
            <div className="flex items-center gap-3">
              {c.status === "selesai" && c.liveUrl && (
                <a
                  href={c.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 transition-colors"
                  title="Buka Link Postingan Live"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => {
                  setEditingContent(c);
                  setIsModalOpen(true);
                }}
                className="text-[#011f3f] hover:text-[#c79d3a] transition-colors"
                title="Edit Konten"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCalendarMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++)
      days.push(
        <div
          key={`empty-${i}`}
          className="bg-slate-50/50 border-r border-b border-slate-100 min-h-[140px]"
        ></div>,
      );

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const dayContents = contents.filter((c) => c.scheduledDate === dateStr);
      const isToday =
        new Date().toDateString() === new Date(year, month, i).toDateString();

      days.push(
        <div
          key={i}
          className={`min-h-[140px] border-r border-b border-slate-100 bg-white p-2 transition-colors hover:bg-slate-50/50 ${isToday ? "bg-blue-50/30" : ""}`}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, dateStr)}
        >
          <div
            className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-2 ${isToday ? "bg-[#c79d3a] text-white" : "text-slate-400"}`}
          >
            {i}
          </div>
          <div className="space-y-1.5">
            {dayContents.map((c) => renderCard(c, true))}
          </div>
        </div>,
      );
    }
    return days;
  };

  const renderCalendarWeek = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const days = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const dayContents = contents.filter((c) => c.scheduledDate === dateStr);
      const isToday = new Date().toDateString() === d.toDateString();

      days.push(
        <div
          key={i}
          className="min-h-[400px] border-r border-slate-100 bg-white p-3"
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, dateStr)}
        >
          <div
            className={`text-sm font-bold p-2 text-center rounded-lg mb-3 ${isToday ? "bg-[#011f3f] text-[#c79d3a]" : "bg-slate-50 text-slate-600"}`}
          >
            {d.getDate()} {monthNames[d.getMonth()].substring(0, 3)}
          </div>
          <div className="space-y-2">
            {dayContents.map((c) => renderCard(c, false))}
          </div>
        </div>,
      );
    }
    return days;
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden selection:bg-[#c79d3a] selection:text-[#011f3f]">
      {/* SIDEBAR NAVIGATION & WORKFLOW */}
      <div className="w-[360px] bg-white border-r border-slate-200 flex flex-col z-20 shadow-2xl flex-shrink-0">
        {/* Brand Area */}
        <div className="p-6 pb-6 bg-[#011f3f] text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 mb-8 px-2 relative z-10">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10 text-[#c79d3a]">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            ContentHQ.
          </h1>
          <nav className="flex flex-col gap-2 relative z-10">
            {[
              {
                id: "calendar",
                icon: <Calendar className="w-5 h-5" />,
                label: "Kalender Planner",
              },
              {
                id: "progress",
                icon: <AlignLeft className="w-5 h-5" />,
                label: "Progress & Analitik",
              },
              {
                id: "master",
                icon: <Database className="w-5 h-5" />,
                label: "Master Data",
              },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => setActiveTab(nav.id)}
                className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === nav.id ? "bg-[#c79d3a] text-white shadow-md" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
              >
                {nav.icon} {nav.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Workflow Containers (Only show in Calendar tab) */}
        {activeTab === "calendar" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {/* Draft / Backlog */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-400"></div> Ide
                Konten
                <span className="ml-auto bg-slate-100 text-slate-500 py-0.5 px-2 rounded-full text-xs">
                  {contents.filter((c) => !c.scheduledDate).length}
                </span>
              </h3>
              <div
                className="min-h-[80px] space-y-2"
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, null, "draft")}
              >
                {contents
                  .filter((c) => !c.scheduledDate)
                  .map((c) => renderCard(c))}
              </div>
              <button
                onClick={() => {
                  setEditingContent({ status: "draft" });
                  setIsModalOpen(true);
                }}
                className="mt-3 w-full py-2 bg-slate-50 text-[#011f3f] border border-slate-200 rounded-xl font-bold text-sm hover:bg-[#011f3f] hover:text-white transition-colors flex justify-center items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Buat Ide Baru
              </button>
            </div>

            {/* Scheduled / In Progress */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-orange-400">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-400"></div>{" "}
                Menunggu / Proses
                <span className="ml-auto bg-orange-100 text-orange-600 py-0.5 px-2 rounded-full text-xs">
                  {
                    contents.filter(
                      (c) => c.scheduledDate && c.status !== "selesai",
                    ).length
                  }
                </span>
              </h3>
              <div
                className="min-h-[80px] space-y-2"
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, null, "in_progress")}
              >
                {contents
                  .filter((c) => c.scheduledDate && c.status !== "selesai")
                  .map((c) => renderCard(c))}
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-green-500">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>{" "}
                Selesai
                <span className="ml-auto bg-green-100 text-green-700 py-0.5 px-2 rounded-full text-xs">
                  {contents.filter((c) => c.status === "selesai").length}
                </span>
              </h3>
              <div
                className="min-h-[80px] space-y-2"
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, null, "selesai")}
              >
                {contents
                  .filter((c) => c.status === "selesai")
                  .map((c) => renderCard(c))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        {/* Topbar */}
        <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10 shadow-sm">
          {activeTab === "calendar" && (
            <div className="flex items-center gap-6 w-full">
              <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
                {["week", "month", "semester"].map((view) => (
                  <button
                    key={view}
                    onClick={() => setCalendarView(view)}
                    className={`px-5 py-2 rounded-lg text-sm font-bold capitalize transition-all ${calendarView === view ? "bg-[#011f3f] text-[#c79d3a] shadow-md" : "text-slate-500 hover:text-[#011f3f]"}`}
                  >
                    {view}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 ml-auto">
                <button
                  onClick={prevTime}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 text-slate-600"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-black text-[#011f3f] min-w-[200px] text-center">
                  {calendarView === "semester"
                    ? `Semester ${currentDate.getMonth() < 6 ? "1" : "2"} - ${currentDate.getFullYear()}`
                    : calendarView === "week"
                      ? getWeekLabel(currentDate, new Date())
                      : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                </h2>
                <button
                  onClick={nextTime}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 text-slate-600"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          {activeTab !== "calendar" && (
            <h2 className="text-2xl font-black text-[#011f3f] capitalize tracking-tight flex items-center gap-3">
              {activeTab === "progress"
                ? "Analitik & Progress"
                : "Master Data System"}
            </h2>
          )}
        </div>

        {/* TAB 1: CALENDAR VIEW */}
        {activeTab === "calendar" && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/80">
            {calendarView === "semester" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 h-full pb-10">
                {(() => {
                  const year = currentDate.getFullYear();
                  const isGanjil = currentDate.getMonth() < 6;
                  const semesterMonths = isGanjil
                    ? [0, 1, 2, 3, 4, 5]
                    : [6, 7, 8, 9, 10, 11];

                  return semesterMonths.map((m) => {
                    const monthContents = contents.filter(
                      (c) =>
                        c.scheduledDate &&
                        new Date(c.scheduledDate).getMonth() === m &&
                        new Date(c.scheduledDate).getFullYear() === year,
                    );
                    return (
                      <div
                        key={m}
                        className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col"
                      >
                        <div className="bg-[#011f3f] px-5 py-4 text-[#c79d3a] font-bold text-lg text-center tracking-wide">
                          {monthNames[m]}
                        </div>
                        <div className="p-4 flex-1 overflow-y-auto space-y-2 min-h-[150px] bg-slate-50/50">
                          {monthContents.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-4 font-medium italic">
                              Kosong
                            </p>
                          ) : (
                            monthContents.map((c) => renderCard(c, true))
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="max-w-7xl mx-auto flex flex-col gap-6">
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden shrink-0">
                  <div className="grid grid-cols-7 bg-[#011f3f] text-[#c79d3a]">
                    {dayNames.map((day, idx) => (
                      <div
                        key={day}
                        className={`py-4 text-center text-sm font-black tracking-widest uppercase ${idx !== 6 ? "border-r border-[#c79d3a]/20" : ""}`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {calendarView === "month"
                      ? renderCalendarMonth()
                      : renderCalendarWeek()}
                  </div>
                </div>

                {/* Catatan Bulan Ini */}
                {calendarView === "month" && (
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 shrink-0 mb-10">
                    <h3 className="font-bold text-[#011f3f] mb-3 flex items-center gap-2">
                      <div className="bg-[#c79d3a]/20 p-1.5 rounded-lg text-[#c79d3a]">
                        <AlignLeft className="w-4 h-4" />
                      </div>
                      Catatan Bulan {monthNames[currentDate.getMonth()]}
                    </h3>
                    <textarea
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#011f3f] focus:border-transparent transition-all min-h-[120px] placeholder:text-slate-400"
                      placeholder="Tuliskan target campaign, evaluasi performa, atau catatan penting untuk bulan ini. Otomatis tersimpan."
                      value={
                        monthNotes[
                          `${currentDate.getFullYear()}-${currentDate.getMonth()}`
                        ] || ""
                      }
                      onChange={(e) =>
                        setMonthNotes({
                          ...monthNotes,
                          [`${currentDate.getFullYear()}-${currentDate.getMonth()}`]:
                            e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROGRESS ANALYTICS */}
        {activeTab === "progress" &&
          (() => {
            const stats = {
              total: contents.length,
              selesai: contents.filter((c) => c.status === "selesai").length,
              tertunda: contents.filter(
                (c) => c.status === "tunda" || c.status === "batal",
              ).length,
              upcoming: contents.filter(
                (c) =>
                  c.scheduledDate &&
                  new Date(c.scheduledDate) >= new Date() &&
                  c.status !== "selesai",
              ).length,
            };
            const statCards = [
              {
                id: "total",
                title: "Total Ide",
                value: stats.total,
                bg: "bg-blue-50 text-blue-700 border-blue-200",
                icon: <Database />,
              },
              {
                id: "selesai",
                title: "Telah Selesai",
                value: stats.selesai,
                bg: "bg-green-50 text-green-700 border-green-200",
                icon: <CheckCircle />,
              },
              {
                id: "tertunda",
                title: "Tertunda / Batal",
                value: stats.tertunda,
                bg: "bg-red-50 text-red-700 border-red-200",
                icon: <AlertCircle />,
              },
              {
                id: "upcoming",
                title: "Segera Datang",
                value: stats.upcoming,
                bg: "bg-orange-50 text-orange-700 border-orange-200",
                icon: <Clock />,
              },
            ];

            return (
              <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
                <div className="max-w-6xl mx-auto space-y-8">
                  <div className="grid grid-cols-4 gap-6">
                    {statCards.map((stat) => (
                      <div
                        key={stat.id}
                        onClick={() => setProgressDetailFilter(stat.id)}
                        className={`${stat.bg} border rounded-3xl p-6 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}
                      >
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-110 transition-transform">
                          {React.cloneElement(stat.icon, {
                            className: "w-24 h-24",
                          })}
                        </div>
                        <div className="flex justify-between items-start mb-4 relative z-10">
                          <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl">
                            {stat.icon}
                          </div>
                        </div>
                        <h3 className="text-4xl font-black mb-1 relative z-10">
                          {stat.value}
                        </h3>
                        <p className="text-sm font-bold opacity-80 relative z-10 uppercase tracking-wide">
                          {stat.title}
                        </p>
                      </div>
                    ))}
                  </div>

                  {progressDetailFilter && (
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                      <div className="bg-[#011f3f] px-6 py-4 flex justify-between items-center text-[#c79d3a]">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          <AlignLeft className="w-5 h-5" /> Daftar Detail:{" "}
                          {
                            statCards.find((s) => s.id === progressDetailFilter)
                              ?.title
                          }
                        </h3>
                        <button
                          onClick={() => setProgressDetailFilter(null)}
                          className="text-white hover:text-red-400 p-1 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="p-6 bg-slate-50/50">
                        {(() => {
                          let filteredList = [];
                          if (progressDetailFilter === "total")
                            filteredList = contents;
                          if (progressDetailFilter === "selesai")
                            filteredList = contents.filter(
                              (c) => c.status === "selesai",
                            );
                          if (progressDetailFilter === "tertunda")
                            filteredList = contents.filter(
                              (c) =>
                                c.status === "tunda" || c.status === "batal",
                            );
                          if (progressDetailFilter === "upcoming")
                            filteredList = contents.filter(
                              (c) =>
                                c.scheduledDate &&
                                new Date(c.scheduledDate) >= new Date() &&
                                c.status !== "selesai",
                            );

                          if (filteredList.length === 0)
                            return (
                              <p className="text-center text-slate-400 py-8 italic font-medium">
                                Tidak ada data untuk kategori ini.
                              </p>
                            );

                          return (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                              {filteredList.map((c) => renderCard(c, false))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        {/* TAB 3: MASTER DATA */}
        {activeTab === "master" && (
          <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-3xl p-6 shadow-md border border-slate-200 flex flex-col h-[400px]"
                >
                  <h3 className="text-xl font-black text-[#011f3f] mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
                    <span className="bg-[#c79d3a]/20 text-[#c79d3a] p-2.5 rounded-xl">
                      {cat.icon}
                    </span>
                    {cat.title}
                  </h3>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-2 mb-4 custom-scrollbar">
                    {masterData[cat.id]?.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#c79d3a]/50 hover:bg-[#c79d3a]/5 transition-colors"
                      >
                        {editingMaster === item.id ? (
                          <input
                            type="text"
                            autoFocus
                            className="flex-1 bg-white border border-[#c79d3a] rounded px-2 py-1 text-sm outline-none"
                            value={editMasterVal}
                            onChange={(e) => setEditMasterVal(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" &&
                              saveEditMasterData(cat.id, item.id)
                            }
                          />
                        ) : (
                          <div className="flex items-center gap-2 flex-1">
                            {item.color && (
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                              ></div>
                            )}
                            <span className="font-semibold text-slate-700 text-sm">
                              {item.name}
                            </span>
                          </div>
                        )}

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {editingMaster === item.id ? (
                            <button
                              onClick={() =>
                                saveEditMasterData(cat.id, item.id)
                              }
                              className="p-1.5 text-green-600 bg-green-50 rounded-lg hover:bg-green-100"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingMaster(item.id);
                                  setEditMasterVal(item.name);
                                }}
                                className="p-1.5 text-[#011f3f] bg-slate-100 rounded-lg hover:bg-slate-200"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  deleteMasterData(cat.id, item.id)
                                }
                                className="p-1.5 text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {masterData[cat.id]?.length === 0 && (
                      <p className="text-xs text-center text-slate-400 mt-4 italic">
                        Belum ada data.
                      </p>
                    )}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      addMasterData(cat.id, e.target.elements.newItem.value);
                      e.target.reset();
                    }}
                    className="flex gap-2 pt-4 border-t border-slate-100"
                  >
                    <input
                      name="newItem"
                      type="text"
                      placeholder={`Tambah ${cat.title}...`}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#011f3f] focus:ring-1 focus:ring-[#011f3f] font-medium"
                    />
                    <button
                      type="submit"
                      className="bg-[#011f3f] text-white p-2.5 rounded-xl hover:bg-[#c79d3a] transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#011f3f] px-8 py-6 flex justify-between items-center text-white border-b-4 border-[#c79d3a]">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm text-[#c79d3a]">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                {editingContent?.id ? "Edit Konten" : "Ide Konten Baru"}
              </h2>
              <div className="flex gap-3">
                {editingContent?.id && (
                  <button
                    onClick={() => handleDeleteContent(editingContent.id)}
                    className="p-2 text-white/70 hover:text-red-400 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-8 bg-slate-50/50">
              {/* Row 1: Title */}
              <div>
                <label className="block text-sm font-black text-[#011f3f] uppercase tracking-wider mb-2">
                  Judul Konten
                </label>
                <input
                  type="text"
                  className="w-full bg-white border border-slate-300 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#c79d3a] focus:border-transparent font-bold text-lg text-slate-800 shadow-sm"
                  placeholder="Contoh: Tips Membuat Kopi Susu Gula Aren"
                  value={editingContent?.title || ""}
                  onChange={(e) =>
                    setEditingContent({
                      ...editingContent,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              {/* Row 1.5: Reference Link */}
              <div>
                <label className="flex items-center gap-2 text-sm font-black text-[#011f3f] uppercase tracking-wider mb-2">
                  <Link2 className="w-4 h-4 text-[#c79d3a]" /> Link Referensi
                </label>
                <input
                  type="url"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c79d3a] font-medium text-slate-700 shadow-sm placeholder:text-slate-300"
                  placeholder="Contoh: https://tiktok.com/@referensi_ide_konten"
                  value={editingContent?.referenceLink || ""}
                  onChange={(e) =>
                    setEditingContent({
                      ...editingContent,
                      referenceLink: e.target.value,
                    })
                  }
                />
              </div>

              {/* Conditional Row: Live Link (Dipindahkan ke atas Status) */}
              {editingContent?.status === "selesai" && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <label className="block text-sm font-black text-green-600 uppercase tracking-wider mb-2">
                    Link Source / Live URL
                  </label>
                  <input
                    type="url"
                    className="w-full bg-green-50 border-2 border-green-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-green-800 font-bold shadow-sm"
                    placeholder="Masukkan URL postingan yang sudah tayang..."
                    value={editingContent?.liveUrl || ""}
                    onChange={(e) =>
                      setEditingContent({
                        ...editingContent,
                        liveUrl: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              {/* Row 2: Date & Status */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-[#011f3f] uppercase tracking-wider mb-2">
                    Tanggal Tayang
                  </label>
                  <input
                    type="date"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c79d3a] font-medium text-slate-700 shadow-sm"
                    value={editingContent?.scheduledDate || ""}
                    onChange={(e) =>
                      setEditingContent({
                        ...editingContent,
                        scheduledDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-[#011f3f] uppercase tracking-wider mb-2">
                    Status Workflow
                  </label>
                  <select
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c79d3a] font-bold text-slate-700 shadow-sm"
                    value={editingContent?.status || "draft"}
                    onChange={(e) =>
                      setEditingContent({
                        ...editingContent,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="draft">Mulai Ide (Draft)</option>
                    <option value="in_progress">Sedang Diproses</option>
                    <option value="selesai">Selesai (Ready to Post)</option>
                    <option value="tunda">Ditunda</option>
                    <option value="batal">Dibatalkan</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Dynamic Selections (Multi-Select Pills) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-[#011f3f] uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  Kebutuhan Spesifik
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                  {categories.map((cat) => (
                    <div key={cat.id}>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-2">
                        {cat.icon} {cat.title}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {masterData[cat.id]?.map((item) => {
                          const isSelected = (
                            editingContent?.[`${cat.id}Ids`] || []
                          ).includes(item.id);
                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                const currentIds =
                                  editingContent?.[`${cat.id}Ids`] || [];
                                const newIds = isSelected
                                  ? currentIds.filter((id) => id !== item.id)
                                  : [...currentIds, item.id];
                                setEditingContent({
                                  ...editingContent,
                                  [`${cat.id}Ids`]: newIds,
                                });
                              }}
                              className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all ${
                                isSelected
                                  ? "bg-[#011f3f] border-[#011f3f] text-[#c79d3a] shadow-md transform scale-[1.02]"
                                  : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                              }`}
                            >
                              {item.name}
                            </button>
                          );
                        })}
                        {masterData[cat.id]?.length === 0 && (
                          <span className="text-xs text-slate-400 italic">
                            Data kosong
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row 4: Script Area */}
              <div>
                <label className="block text-sm font-black text-[#011f3f] uppercase tracking-wider mb-2">
                  Script / Caption
                </label>
                <textarea
                  className="w-full bg-white border border-slate-300 rounded-2xl p-5 focus:outline-none focus:ring-2 focus:ring-[#c79d3a] min-h-[150px] text-sm leading-relaxed font-medium shadow-sm placeholder:text-slate-300"
                  placeholder="Tulis script video atau caption postingan secara detail di sini..."
                  value={editingContent?.script || ""}
                  onChange={(e) =>
                    setEditingContent({
                      ...editingContent,
                      script: e.target.value,
                    })
                  }
                />
              </div>

              {/* Row 5: Notes */}
              <div>
                <label className="block text-sm font-black text-[#011f3f] uppercase tracking-wider mb-2">
                  Catatan Tambahan (Notes)
                </label>
                <textarea
                  className="w-full bg-white border border-slate-300 rounded-2xl p-5 focus:outline-none focus:ring-2 focus:ring-[#c79d3a] min-h-[100px] text-sm leading-relaxed font-medium shadow-sm placeholder:text-slate-300"
                  placeholder="Catatan untuk editor, detail properti, atau arahan khusus talent..."
                  value={editingContent?.notes || ""}
                  onChange={(e) =>
                    setEditingContent({
                      ...editingContent,
                      notes: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 bg-white border-t border-slate-100 flex justify-end gap-4 shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleSaveContent(editingContent)}
                className="px-8 py-3 bg-[#011f3f] hover:bg-[#011f3f]/90 text-[#c79d3a] rounded-xl font-black shadow-xl shadow-[#011f3f]/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> Simpan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
