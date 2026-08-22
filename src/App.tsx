import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
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

export default function App() {
  const [activeTab, setActiveTab] = useState("calendar");
  const [calendarView, setCalendarView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const [masterData, setMasterData] = useState(initialMasterData);
  const [contents, setContents] = useState<any[]>([]);
  const [monthNotes, setMonthNotes] = useState<any>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>({});
  const [progressDetailFilter, setProgressDetailFilter] = useState<any>(null);

  const [editingMaster, setEditingMaster] = useState<any>(null);
  const [editMasterVal, setEditMasterVal] = useState("");

  // --- FIREBASE SYNC (REAL-TIME) ---
  useEffect(() => {
    const unsubContent = onSnapshot(
      collection(db, "contentItems"),
      (snapshot) => {
        const items: any[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setContents(items.sort((a, b) => b.createdAt - a.createdAt));
      },
    );

    const unsubMaster = onSnapshot(
      doc(db, "settings", "masterData"),
      (docSnap) => {
        if (docSnap.exists()) {
          setMasterData(docSnap.data() as any);
        } else {
          setDoc(doc(db, "settings", "masterData"), initialMasterData);
        }
      },
    );

    const unsubNotes = onSnapshot(
      doc(db, "settings", "monthNotes"),
      (docSnap) => {
        if (docSnap.exists()) {
          setMonthNotes(docSnap.data());
        }
      },
    );

    return () => {
      unsubContent();
      unsubMaster();
      unsubNotes();
    };
  }, []);

  // --- CRUD HANDLERS (FIREBASE) ---
  const handleSaveContent = async (content: any) => {
    const itemToSave = {
      ...content,
      id: content.id || Date.now().toString(),
      title: content.title || "Untitled",
      createdAt: content.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    await setDoc(doc(db, "contentItems", itemToSave.id), itemToSave);
    setIsModalOpen(false);
    setEditingContent({});
  };

  const handleDeleteContent = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus konten ini?")) {
      await deleteDoc(doc(db, "contentItems", id));
      setIsModalOpen(false);
    }
  };

  const handleDuplicateContent = async (content: any) => {
    const newContent = {
      ...content,
      id: Date.now().toString(),
      title: `${content.title || "Untitled"} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await setDoc(doc(db, "contentItems", newContent.id), newContent);
  };

  const onDragStart = (e: any, id: string) => {
    e.dataTransfer.setData("contentId", id);
  };

  const onDragOver = (e: any) => {
    e.preventDefault();
  };

  const onDrop = async (
    e: any,
    dateStr: string | null,
    statusTarget: string | null = null,
  ) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("contentId");
    const targetItem = contents.find((c) => c.id === id);
    if (!targetItem) return;

    let updated = { ...targetItem };
    if (dateStr !== null) updated.scheduledDate = dateStr;
    if (statusTarget) {
      updated.status = statusTarget;
      if (statusTarget === "draft" && !dateStr) updated.scheduledDate = null;
    }
    await setDoc(doc(db, "contentItems", id), updated);
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

  const addMasterData = async (catId: string, value: string) => {
    const val = value.trim();
    if (!val) return;
    const newItem: any = { id: Date.now().toString(), name: val };
    if (catId === "pillar")
      newItem.color = "#" + Math.floor(Math.random() * 16777215).toString(16);

    const newMaster = {
      ...masterData,
      [catId]: [...(masterData as any)[catId], newItem],
    };
    setMasterData(newMaster);
    await setDoc(doc(db, "settings", "masterData"), newMaster);
  };

  const deleteMasterData = async (catId: string, itemId: string) => {
    if (confirm("Hapus data ini?")) {
      const newMaster = {
        ...masterData,
        [catId]: (masterData as any)[catId].filter(
          (item: any) => item.id !== itemId,
        ),
      };
      setMasterData(newMaster);
      await setDoc(doc(db, "settings", "masterData"), newMaster);
    }
  };

  const saveEditMasterData = async (catId: string, itemId: string) => {
    const newMaster = {
      ...masterData,
      [catId]: (masterData as any)[catId].map((item: any) =>
        item.id === itemId ? { ...item, name: editMasterVal } : item,
      ),
    };
    setMasterData(newMaster);
    await setDoc(doc(db, "settings", "masterData"), newMaster);
    setEditingMaster(null);
  };

  const renderCard = (c: any, compact = false) => {
    const pillarData = c.pillarIds?.[0]
      ? masterData.pillar.find((p: any) => p.id === c.pillarIds[0])
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

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden selection:bg-[#c79d3a] selection:text-[#011f3f]">
      <div className="w-[360px] bg-white border-r border-slate-200 flex flex-col z-20 shadow-2xl flex-shrink-0">
        <div className="p-6 pb-6 bg-[#011f3f] text-white shadow-lg relative overflow-hidden">
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

        {activeTab === "calendar" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
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
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
        <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10 shadow-sm">
          {activeTab === "calendar" && (
            <div className="flex items-center gap-6 w-full">
              <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
                {["month"].map((view) => (
                  <button
                    key={view}
                    onClick={() => setCalendarView(view)}
                    className="px-5 py-2 rounded-lg text-sm font-bold capitalize bg-[#011f3f] text-[#c79d3a] shadow-md"
                  >
                    {view}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4 ml-auto">
                <button onClick={prevTime} className="p-2 border rounded-xl">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-black text-[#011f3f] min-w-[200px] text-center">
                  {monthNames[currentDate.getMonth()]}{" "}
                  {currentDate.getFullYear()}
                </h2>
                <button onClick={nextTime} className="p-2 border rounded-xl">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {activeTab === "calendar" && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/80">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
              <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden shrink-0">
                <div className="grid grid-cols-7 bg-[#011f3f] text-[#c79d3a]">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="py-4 text-center text-sm font-black uppercase"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">{renderCalendarMonth()}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#011f3f] px-8 py-6 flex justify-between items-center text-white border-b-4 border-[#c79d3a]">
              <h2 className="text-2xl font-black">Ide Konten Baru</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6">
              <div>
                <label className="block text-sm font-black text-[#011f3f] uppercase mb-2">
                  Judul Konten
                </label>
                <input
                  type="text"
                  className="w-full border rounded-2xl px-5 py-4 font-bold text-lg"
                  placeholder="Judul Konten..."
                  value={editingContent?.title || ""}
                  onChange={(e) =>
                    setEditingContent({
                      ...editingContent,
                      title: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="p-6 border-t flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 font-bold text-slate-500"
              >
                Batal
              </button>
              <button
                onClick={() => handleSaveContent(editingContent)}
                className="px-8 py-3 bg-[#011f3f] text-[#c79d3a] rounded-xl font-black flex items-center gap-2"
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
