import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Layers,
  Save,
  ArrowRight,
  Link,
  Type,
  Calendar,
  User,
  Check,
  AlertCircle,
  Loader2,
  Tv,
  Clapperboard,
  Image,
} from "lucide-react";
import NextLink from "next/link";

const TYPE_OPTIONS = [
  { value: "anime", label: "أنيمي", emoji: "🎌" },
  { value: "series", label: "سيري", emoji: "📺" },
  { value: "kdrama", label: "دراما كورية", emoji: "🇰🇷" },
  { value: "other", label: "أخرى", emoji: "🎬" },
];

// ─── Styled primitives ────────────────────────────────────────────────────────

function Field({ label, icon: Icon, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-zinc-400">
        {Icon && <Icon size={12} />}
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-rose-400 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

function Input({ dark, className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all border ${
        dark
          ? "bg-white/5 border-white/10 text-white placeholder-white focus:border-amber-500/50 focus:bg-white/8"
          : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:bg-white"
      } ${className}`}
      {...props}
    />
  );
}

function Textarea({ dark, className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none border ${
        dark
          ? "bg-white/5 border-white/10 text-white placeholder-white focus:border-amber-500/50 focus:bg-white/8"
          : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:bg-white"
      } ${className}`}
      {...props}
    />
  );
}

// ─── Episode row ──────────────────────────────────────────────────────────────

function EpisodeRow({ ep, index, onChange, onRemove, seasonIndex, dark }) {
  const inputCls = `bg-transparent border outline-none transition-all text-xs rounded-lg ${
    dark
      ? "border-white/10 text-white placeholder-white focus:border-amber-500/40"
      : "border-gray-200 text-gray-900 placeholder-gray-400 focus:border-amber-400"
  }`;

  return (
    <div className="flex items-center gap-2 group">
      <span className={`text-xs font-black w-6 text-center flex-shrink-0 ${dark ? "text-white" : "text-gray-400"}`}>
        {index + 1}
      </span>
      <input
        type="number"
        min={1}
        value={ep.number || index + 1}
        onChange={(e) => onChange(seasonIndex, index, "number", e.target.value)}
        placeholder="رقم"
        className={`w-16 px-2 py-2 text-center ${inputCls}`}
      />
      <input
        type="text"
        value={ep.title}
        onChange={(e) => onChange(seasonIndex, index, "title", e.target.value)}
        placeholder="عنوان الحلقة"
        className={`flex-1 px-3 py-2 ${inputCls}`}
      />
      <input
        type="text"
        value={ep.img}
        onChange={(e) => onChange(seasonIndex, index, "img", e.target.value)}
        placeholder="رابط صورة الحلقة"
        className={`flex-1 px-3 py-2 ${inputCls}`}
      />
      <button
        onClick={() => onRemove(seasonIndex, index)}
        className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

// ─── Season card ──────────────────────────────────────────────────────────────

function SeasonCard({ season, index, onChange, onRemove, onAddEpisode, onRemoveEpisode, onChangeEpisode, totalSeasons, dark }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`border rounded-2xl overflow-hidden ${
      dark ? "border-white/8 bg-white/2" : "border-gray-200 bg-white shadow-sm"
    }`}>
      {/* Header */}
      <div className={`flex items-center gap-3 px-5 py-3 border-b ${
        dark ? "bg-white/3 border-white/6" : "bg-gray-50 border-gray-100"
      }`}>
        <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Layers size={14} className="text-amber-400" />
        </div>
        <input
          type="text"
          value={season.title}
          onChange={(e) => onChange(index, "title", e.target.value)}
          placeholder={`الموسم ${index + 1}`}
          className={`flex-1 bg-transparent text-sm font-bold outline-none ${
            dark ? "text-white placeholder-white" : "text-gray-900 placeholder-gray-400"
          }`}
          style={{ fontFamily: "'Cairo', sans-serif" }}
        />
        <div className="flex items-center gap-2">
          <span className={`text-xs ${dark ? "text-white" : "text-gray-400"}`}>{season.episodes.length} حلقة</span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
              dark ? "hover:bg-white/5 text-zinc-500" : "hover:bg-gray-100 text-gray-400"
            }`}
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          {totalSeasons > 1 && (
            <button
              onClick={() => onRemove(index)}
              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:bg-rose-500/10 hover:text-rose-400 ${
                dark ? "text-white" : "text-gray-400"
              }`}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Episodes */}
      {!collapsed && (
        <div className="p-4 space-y-2">
          {season.episodes.length === 0 ? (
            <p className={`text-center text-xs py-4 ${dark ? "text-white" : "text-gray-400"}`}>
              لا توجد حلقات — أضف أول حلقة
            </p>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-1 px-6">
                <span className={`text-[10px] w-16 text-center ${dark ? "text-white" : "text-gray-400"}`}>الرقم</span>
                <span className={`text-[10px] flex-1 ${dark ? "text-white" : "text-gray-400"}`}>العنوان</span>
                <span className={`text-[10px] flex-1 ${dark ? "text-white" : "text-gray-400"}`}>رابط الصورة</span>
                <span className="w-7" />
              </div>
              {season.episodes.map((ep, epIndex) => (
                <EpisodeRow
                  key={epIndex}
                  ep={ep}
                  index={epIndex}
                  seasonIndex={index}
                  onChange={onChangeEpisode}
                  onRemove={onRemoveEpisode}
                  dark={dark}
                />
              ))}
            </>
          )}
          <button
            onClick={() => onAddEpisode(index)}
            className={`mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed text-xs font-bold transition-all hover:border-amber-500/30 hover:text-amber-500/70 ${
              dark ? "border-white/10 text-white" : "border-gray-200 text-gray-400"
            }`}
          >
            <Plus size={13} />
            إضافة حلقة
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-bold ${
      type === "success"
        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-500"
        : "bg-rose-500/20 border-rose-500/30 text-rose-500"
    }`}>
      {type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const emptyEpisode = () => ({ number: "", title: "", img: "" });
const emptySeason = () => ({ title: "", episodes: [emptyEpisode()] });

export default function AddSeries({ dark = true }) {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    img: "",
    trailer: "",
    descr: "",
    type: "anime",
    finished: true,
    start: "",
    end: "",
    maker: "",
  });

  const [seasons, setSeasons] = useState([emptySeason()]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  };

  const addSeason = () => setSeasons((s) => [...s, emptySeason()]);
  const removeSeason = (i) => setSeasons((s) => s.filter((_, idx) => idx !== i));
  const changeSeason = (i, key, value) =>
    setSeasons((s) => s.map((se, idx) => idx === i ? { ...se, [key]: value } : se));

  const addEpisode = (seasonIdx) =>
    setSeasons((s) => s.map((se, i) =>
      i === seasonIdx ? { ...se, episodes: [...se.episodes, emptyEpisode()] } : se
    ));
  const removeEpisode = (seasonIdx, epIdx) =>
    setSeasons((s) => s.map((se, i) =>
      i === seasonIdx ? { ...se, episodes: se.episodes.filter((_, j) => j !== epIdx) } : se
    ));
  const changeEpisode = (seasonIdx, epIdx, key, value) =>
    setSeasons((s) => s.map((se, i) =>
      i === seasonIdx
        ? { ...se, episodes: se.episodes.map((ep, j) => j === epIdx ? { ...ep, [key]: value } : ep) }
        : se
    ));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "العنوان مطلوب";
    if (!form.img.trim()) e.img = "رابط الصورة مطلوب";
    if (!form.type) e.type = "النوع مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async () => {
    if (!validate()) {
        alert('Missing data');
        return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/addSeries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, seasons }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      showToast("تمت إضافة السلسلة بنجاح ✓");
      setTimeout(() => router.push(`/series?id=${data.id}`), 1500);
    } catch (err) {
      showToast(err.message || "حدث خطأ ما", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Theme helpers ──
  const bg = dark ? "bg-[#080810]" : "bg-[#f4f1eb]";
  const text = dark ? "text-white" : "text-gray-900";
  const card = dark
    ? "bg-white/[0.03] border border-white/8"
    : "bg-white border border-gray-100 shadow-sm";
  const muted = dark ? "text-zinc-500" : "text-gray-400";
  const divider = dark ? "border-white/6" : "border-gray-100";
  const addSeasonBtn = dark
    ? "bg-white/5 border-white/10 text-zinc-400"
    : "bg-white border-gray-200 text-gray-500 shadow-sm";

  return (
    <>
      <Head>
        <title>إضافة سلسلة جديدة — MrDB Admin</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;500;700;900&display=swap" rel="stylesheet" />
      </Head>

      {toast && <Toast {...toast} />}

      <div
        dir="rtl"
        className={`min-h-screen transition-colors duration-300 pt-10 ${bg} ${text}`}
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        {/* Dark-only ambient background */}
        {dark && (
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-amber-500/4 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-violet-500/4 rounded-full blur-[100px]" />
          </div>
        )}

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* ── Page header ── */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <NextLink
                href="/admin"
                className={`inline-flex items-center gap-2 text-xs transition-colors mb-3 ${
                  dark ? "text-zinc-500 hover:text-zinc-300" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                <ArrowRight size={13} />
                لوحة التحكم
              </NextLink>
              <h1
                className={`text-3xl font-black ${text}`}
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                إضافة سلسلة جديدة
              </h1>
              <p className={`text-sm mt-1 ${muted}`}>أدخل بيانات السلسلة مع مواسمها وحلقاتها</p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 text-black font-black px-6 py-3 rounded-2xl transition-all hover:scale-105 shadow-xl shadow-amber-500/20 text-sm"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "جاري الحفظ..." : "حفظ السلسلة"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Main info (2/3) ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Basic info */}
              <div className={`${card} rounded-3xl p-6 space-y-5`}>
                <div className="flex items-center gap-2 mb-1">
                  <Tv size={15} className="text-amber-400" />
                  <h2 className={`font-black text-base ${text}`} style={{ fontFamily: "'Cairo', sans-serif" }}>
                    المعلومات الأساسية
                  </h2>
                </div>

                <Field label="العنوان" icon={Type} error={errors.title}>
                  <Input
                    dark={dark}
                    value={form.title}
                    onChange={(e) => setField("title", e.target.value)}
                    placeholder="اسم السلسلة..."
                    className={errors.title ? "border-rose-500/50" : ""}
                  />
                </Field>

                <Field label="الوصف" icon={Type}>
                  <Textarea
                    dark={dark}
                    value={form.descr}
                    onChange={(e) => setField("descr", e.target.value)}
                    placeholder="نبذة مختصرة عن السلسلة..."
                    rows={4}
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="المصنّع / الاستوديو" icon={User}>
                    <Input
                      dark={dark}
                      value={form.maker}
                      onChange={(e) => setField("maker", e.target.value)}
                      placeholder="Studio Ghibli..."
                    />
                  </Field>

                  <Field label="النوع" error={errors.type}>
                    <div className="grid grid-cols-2 gap-2">
                      {TYPE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setField("type", opt.value)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                            form.type === opt.value
                              ? "bg-amber-500/20 border-amber-500/40 text-amber-500"
                              : dark
                                ? "bg-white/3 border-white/8 text-zinc-500 hover:border-white/20"
                                : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          <span>{opt.emoji}</span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="تاريخ البدء" icon={Calendar}>
                    <Input
                      dark={dark}
                      type="date"
                      value={form.start}
                      onChange={(e) => setField("start", e.target.value)}
                    />
                  </Field>
                  <Field label="تاريخ الانتهاء" icon={Calendar}>
                    <Input
                      dark={dark}
                      type="date"
                      value={form.end}
                      onChange={(e) => setField("end", e.target.value)}
                      disabled={!form.finished}
                      className="disabled:opacity-40"
                    />
                  </Field>
                </div>

                {/* Status toggle */}
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                  dark ? "bg-white/3 border-white/8" : "bg-gray-50 border-gray-200"
                }`}>
                  <div>
                    <p className={`text-sm font-bold ${text}`}>حالة السلسلة</p>
                    <p className={`text-xs mt-0.5 ${muted}`}>
                      {form.finished ? "مكتملة — انتهت جميع مواسمها" : "مستمرة — لا تزال تُبث"}
                    </p>
                  </div>
                  <button
                    onClick={() => setField("finished", !form.finished)}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                      form.finished ? "bg-sky-500" : "bg-emerald-500"
                    }`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${
                      form.finished ? "right-0.5" : "left-0.5"
                    }`} />
                  </button>
                </div>
              </div>

              {/* Media */}
              <div className={`${card} rounded-3xl p-6 space-y-5`}>
                <div className="flex items-center gap-2 mb-1">
                  <Image size={15} className="text-amber-400" />
                  <h2 className={`font-black text-base ${text}`} style={{ fontFamily: "'Cairo', sans-serif" }}>
                    الوسائط
                  </h2>
                </div>

                <Field label="رابط الصورة الرئيسية (Poster)" icon={Link} error={errors.img}>
                  <Input
                    dark={dark}
                    value={form.img}
                    onChange={(e) => setField("img", e.target.value)}
                    placeholder="https://..."
                    className={errors.img ? "border-rose-500/50" : ""}
                  />
                </Field>

                {form.img && (
                  <div className={`flex gap-4 items-start p-3 rounded-2xl border ${
                    dark ? "bg-white/3 border-white/6" : "bg-gray-50 border-gray-200"
                  }`}>
                    <img
                      src={form.img}
                      alt="preview"
                      onError={(e) => (e.target.style.display = "none")}
                      className={`w-20 rounded-xl object-cover border ${dark ? "border-white/10" : "border-gray-200"}`}
                      style={{ aspectRatio: "2/3" }}
                    />
                    <div>
                      <p className={`text-xs mb-1 ${muted}`}>معاينة الصورة</p>
                      <p className={`text-xs break-all ${dark ? "text-white" : "text-gray-400"}`}>{form.img}</p>
                    </div>
                  </div>
                )}

                <Field label="رابط الإعلان (YouTube)" icon={Link}>
                  <Input
                    dark={dark}
                    value={form.trailer}
                    onChange={(e) => setField("trailer", e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </Field>
              </div>
            </div>

            {/* ── Summary sidebar (1/3) ── */}
            <div className="space-y-4">
              <div className={`${card} rounded-3xl p-5 sticky top-6`}>
                <h2 className={`font-black text-sm mb-4 tracking-widest uppercase ${muted}`}>ملخص</h2>

                <div className="space-y-3">
                  {[
                    { label: "المواسم", value: seasons.length, accent: true },
                    {
                      label: "الحلقات",
                      value: seasons.reduce((acc, s) => acc + s.episodes.length, 0),
                      accent: true,
                    },
                    {
                      label: "النوع",
                      value: TYPE_OPTIONS.find((t) => t.value === form.type)?.label,
                      accent: false,
                    },
                  ].map(({ label, value, accent }) => (
                    <div key={label} className="flex justify-between items-center text-sm">
                      <span className={muted}>{label}</span>
                      <span className={`font-black ${accent ? "text-amber-400" : text}`}>{value}</span>
                    </div>
                  ))}

                  <div className="flex justify-between items-center text-sm">
                    <span className={muted}>الحالة</span>
                    <span className={`font-black text-xs px-2 py-0.5 rounded-full ${
                      form.finished
                        ? "text-sky-400 bg-sky-500/10"
                        : "text-emerald-400 bg-emerald-500/10"
                    }`}>
                      {form.finished ? "مكتملة" : "مستمرة"}
                    </span>
                  </div>
                </div>

                <div className={`border-t mt-4 pt-4 space-y-2 ${divider}`}>
                  {seasons.map((s, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className={`truncate flex-1 ${dark ? "text-white" : "text-gray-400"}`}>
                        {s.title || `الموسم ${i + 1}`}
                      </span>
                      <span className={`flex-shrink-0 mr-2 ${muted}`}>{s.episodes.length} ح</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 text-black font-black py-3 rounded-xl transition-all text-sm"
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? "جاري الحفظ..." : "حفظ الآن"}
                </button>
              </div>
            </div>
          </div>

          {/* ── Seasons & Episodes ── */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clapperboard size={16} className="text-amber-400" />
                <h2 className={`font-black text-lg ${text}`} style={{ fontFamily: "'Cairo', sans-serif" }}>
                  المواسم والحلقات
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold">
                  {seasons.length} مواسم
                </span>
              </div>
              <button
                onClick={addSeason}
                className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all hover:border-amber-500/30 hover:text-amber-400 ${addSeasonBtn}`}
              >
                <Plus size={13} />
                إضافة موسم
              </button>
            </div>

            <div className="space-y-4">
              {seasons.map((season, idx) => (
                <SeasonCard
                  key={idx}
                  season={season}
                  index={idx}
                  totalSeasons={seasons.length}
                  onChange={changeSeason}
                  onRemove={removeSeason}
                  onAddEpisode={addEpisode}
                  onRemoveEpisode={removeEpisode}
                  onChangeEpisode={changeEpisode}
                  dark={dark}
                />
              ))}
            </div>

            <button
              onClick={addSeason}
              className={`mt-4 w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed text-sm font-bold transition-all hover:border-amber-500/30 hover:text-amber-500/60 ${
                dark ? "border-white/8 text-white" : "border-gray-200 text-black"
              }`}
            >
              <Plus size={16} />
              إضافة موسم جديد
            </button>
          </div>

          <div className="h-20" />
        </div>
      </div>
    </>
  );
}