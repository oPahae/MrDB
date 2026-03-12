import { useState, useEffect } from "react";
import Head from "next/head";
import {
  Star,
  TrendingUp,
  Flame,
  Search,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  Award,
  Sparkles,
  Film,
  Layers,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

const GENRES = ["الكل", "أنيم", "سيري", "دراما كورية"];
const SORT_OPTIONS = [
  { value: "rating",   label: "الأعلى تقييماً" },
  { value: "newest",   label: "الأحدث" },
  { value: "oldest",   label: "الأقدم" },
  { value: "episodes", label: "أكثر حلقات" },
];

const GENRE_TO_TYPE = {
  "أنيم":       "anime",
  "سيري":       "series",
  "دراما كورية": "kdrama",
};

const TYPE_LABEL = {
  anime:  "أنيم",
  series: "سيري",
  kdrama: "دراما كورية",
};

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmModal({ series, dark, onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className={`relative w-full max-w-sm rounded-3xl p-6 shadow-2xl border ${
          dark ? "bg-zinc-900 border-white/10" : "bg-white border-gray-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 flex items-center justify-center">
            <AlertTriangle size={26} className="text-rose-400" />
          </div>
          <h3
            className={`text-lg font-black ${dark ? "text-white" : "text-gray-900"}`}
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            حذف السلسلة؟
          </h3>
          <p className={`text-sm ${dark ? "text-zinc-400" : "text-gray-500"}`}>
            هل أنت متأكد من حذف{" "}
            <span className="font-bold text-rose-400">{series?.title}</span>؟
            <br />
            سيتم حذف جميع مواسمها وحلقاتها بشكل نهائي.
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
              dark
                ? "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            إلغاء
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-60 text-white text-sm font-black transition-all"
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            {deleting ? "جاري الحذف..." : "حذف نهائياً"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RatingPill({ rating, size = "md" }) {
  const color =
    rating >= 9 ? "from-amber-400 to-orange-500" :
    rating >= 8 ? "from-yellow-400 to-amber-500" :
    rating >= 7 ? "from-lime-400 to-green-500" :
    "from-gray-400 to-gray-500";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  return (
    <div className={`inline-flex items-center gap-1 bg-gradient-to-r ${color} rounded-full px-2 py-0.5`}>
      <Star size={size === "sm" ? 10 : 12} className="fill-white text-white" />
      <span className={`font-black text-white ${textSize}`}>{Number(rating).toFixed(1)}</span>
    </div>
  );
}

function StatusBadge({ isOngoing }) {
  return (
    <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full border ${
      isOngoing
        ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
        : "text-sky-400 border-sky-500/40 bg-sky-500/10"
    }`}>
      {isOngoing ? "● مستمر" : "✓ مكتمل"}
    </span>
  );
}

function SeriesCard({ series, dark, index, onDeleteRequest }) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  return (
    <div
      className="group relative cursor-pointer"
      style={{ animationDelay: `${index * 40}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`relative overflow-hidden rounded-2xl transition-all duration-500 ease-out
        ${hovered ? "scale-[1.03] shadow-2xl" : "scale-100 shadow-lg"}
        ${dark
          ? "bg-zinc-900 shadow-black/60 hover:shadow-amber-900/20"
          : "bg-white shadow-gray-200/80 hover:shadow-amber-200/60"
        }
      `}>
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={series.img}
            alt={series.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              hovered ? "scale-110" : "scale-100"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {/* Rating & trending */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
            {series.trending && (
              <div className="flex items-center gap-1 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
                <Flame size={10} className="fill-white" />
                <span>رائج</span>
              </div>
            )}
            {series.rating && <RatingPill rating={series.rating} size="sm" />}
          </div>

          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md
              ${dark ? "bg-white/10 group-hover:opacity-0 text-white border border-white/20" : "bg-black/30 text-white"}`}>
              {TYPE_LABEL[series.type] || series.type}
            </span>
          </div>

          {/* Admin action buttons — visible on hover */}
          <div
            className={`absolute top-3 inset-x-3 flex items-start justify-between transition-all duration-200 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Edit button */}
            <Link
              href={`/admin/updateSeries?id=${series.id}`}
              className="flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black transition-all z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <Pencil size={11} />
              تعديل
            </Link>

            {/* Delete button */}
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteRequest(series); }}
              className="flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white transition-all"
            >
              <Trash2 size={11} />
              حذف
            </button>
          </div>

          {/* Hover arrow overlay */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}>
            <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/40 hover:bg-amber-400 transition-colors">
              <ArrowRight size={22} className="text-white mr-[-2px]" />
            </div>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3
              className="text-white font-black text-base leading-tight mb-1 line-clamp-2"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              {series.title}
            </h3>
            <p className="text-white/60 text-[11px]">{series.maker}</p>
          </div>
        </div>

        <div className={`px-4 py-3 ${dark ? "bg-zinc-900" : "bg-white"}`}>
          <div className="flex items-center justify-between mb-2">
            <StatusBadge isOngoing={series.finished == false} />
            <span className={`text-[11px] ${dark ? "text-zinc-500" : "text-gray-400"}`}>
              {series.start}{series.end ? ` — ${series.end}` : " — الآن"}
            </span>
          </div>

          <div className={`flex items-center justify-between text-[11px] pt-2 border-t ${
            dark ? "border-zinc-800 text-zinc-500" : "border-gray-100 text-gray-400"
          }`}>
            <div className="flex items-center gap-1">
              <Layers size={11} />
              <span>{series.seasons} مواسم</span>
            </div>
            <div className="flex items-center gap-1">
              <Film size={11} />
              <span>{series.episodes} حلقة</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={11} />
              <span>مشاهدة</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home({ dark }) {
  const [series, setSeries]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [genre, setGenre]         = useState("الكل");
  const [sort, setSort]           = useState("rating");
  const [sortOpen, setSortOpen]   = useState(false);
  const [search, setSearch]       = useState("");
  const [toDelete, setToDelete]   = useState(null);   // series object pending deletion
  const [deleting, setDeleting]   = useState(false);

  useEffect(() => {
    fetchSeries();
  }, []);

  const fetchSeries = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/series/getAll");
      if (!res.ok) throw new Error("فشل في تحميل البيانات");
      const data = await res.json();
      setSeries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/deleteSeries?id=${toDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل الحذف");
      setSeries((prev) => prev.filter((s) => s.id !== toDelete.id));
      setToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = series
    .filter((s) => {
      const matchGenre  = genre === "الكل" || s.type === GENRE_TO_TYPE[genre];
      const matchSearch = !search.trim() || s.title.toLowerCase().includes(search.trim().toLowerCase());
      return matchGenre && matchSearch;
    })
    .sort((a, b) => {
      if (sort === "rating")   return (b.rating || 0) - (a.rating || 0);
      if (sort === "episodes") return (b.episodes || 0) - (a.episodes || 0);
      if (sort === "newest")   return (b.start || 0) > (a.start || 0) ? 1 : -1;
      if (sort === "oldest")   return (a.start || 0) > (b.start || 0) ? 1 : -1;
      return 0;
    });

  const heroSeries    = [...series].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
  const trendingSeries = series.filter((s) => s.trending);

  return (
    <>
      <Head>
        <title>MrDB — تقييم السيريات والأنميات</title>
        <meta name="description" content="قيّم وتابع أفضل الأنميات والسيريات العالمية" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;500;700;900&display=swap" rel="stylesheet" />
      </Head>

      {/* Delete confirmation modal */}
      {toDelete && (
        <ConfirmModal
          series={toDelete}
          dark={dark}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setToDelete(null)}
          deleting={deleting}
        />
      )}

      <div
        dir="rtl"
        className={`min-h-screen transition-colors duration-300 ${
          dark ? "bg-[#0a0a0f] text-white" : "bg-[#f4f1eb] text-gray-900"
        }`}
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        {/* Background texture */}
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: dark
              ? "radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.04) 0%, transparent 50%)"
              : "radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.08) 0%, transparent 60%)",
          }}
        />
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Trending row */}
          {trendingSeries.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Flame size={18} className="text-orange-500 fill-orange-500" />
                <h2 className="text-lg font-black" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  الأكثر رواجاً الآن
                </h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {trendingSeries.map((s) => (
                  <div
                    key={s.id}
                    className={`flex-shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-105 ${
                      dark
                        ? "bg-white/5 border-white/8 hover:border-amber-500/30"
                        : "bg-white border-gray-200 hover:border-amber-400 shadow-sm"
                    }`}
                  >
                    <img src={s.img} alt={s.title} className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-bold leading-tight">{s.title}</p>
                      <RatingPill rating={s.rating} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section header + search + filters */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-amber-400" />
                <h2 className="text-xl font-black" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  جميع السيريات
                </h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  dark ? "bg-amber-500/15 text-amber-400" : "bg-amber-100 text-amber-700"
                }`}>
                  {filtered.length}
                </span>
              </div>

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${
                    dark
                      ? "bg-white/5 border-white/10 hover:border-white/20"
                      : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
                  }`}
                >
                  <SlidersHorizontal size={14} />
                  <span>{SORT_OPTIONS.find((o) => o.value === sort)?.label}</span>
                  <ChevronDown size={14} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                </button>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setSortOpen(false)} />
                    <div className={`absolute left-0 top-full mt-2 w-44 rounded-xl border overflow-hidden shadow-2xl z-50 ${
                      dark ? "bg-zinc-900 border-white/10" : "bg-white border-gray-200"
                    }`}>
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setSort(opt.value); setSortOpen(false); }}
                          className={`w-full text-right px-4 py-2.5 text-sm transition-colors ${
                            sort === opt.value
                              ? "text-amber-400 font-bold"
                              : dark ? "hover:bg-white/5" : "hover:bg-gray-50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Search bar */}
            <div className={`relative mb-4`}>
              <Search size={15} className={`absolute top-1/2 -translate-y-1/2 right-4 ${dark ? "text-zinc-500" : "text-gray-400"}`} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن سلسلة..."
                className={`w-full rounded-2xl pr-10 pl-10 py-3 text-sm outline-none border transition-all ${
                  dark
                    ? "bg-white/5 border-white/10 text-white placeholder-zinc-600 focus:border-amber-500/40 focus:bg-white/8"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-amber-400 shadow-sm"
                }`}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className={`absolute top-1/2 -translate-y-1/2 left-4 transition-colors ${dark ? "text-zinc-500 hover:text-white" : "text-gray-400 hover:text-gray-700"}`}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Genre tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {GENRES.map((g) => (
                <button
                  key={g}
                  onClick={() => setGenre(g)}
                  className={`flex-shrink-0 text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200 ${
                    genre === g
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/25"
                      : dark
                      ? "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-transparent"
                      : "bg-white text-gray-500 hover:text-gray-900 border border-gray-200 shadow-sm"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Series grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-2xl overflow-hidden animate-pulse ${dark ? "bg-white/5" : "bg-gray-200"}`}
                >
                  <div className="aspect-[2/3]" />
                  <div className="p-3 space-y-2">
                    <div className={`h-3 rounded w-3/4 ${dark ? "bg-white/10" : "bg-gray-300"}`} />
                    <div className={`h-3 rounded w-1/2 ${dark ? "bg-white/5" : "bg-gray-200"}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${
                dark ? "bg-white/5" : "bg-gray-100"
              }`}>
                <Search size={32} className={dark ? "text-zinc-600" : "text-gray-300"} />
              </div>
              <p className={`text-lg font-bold ${dark ? "text-zinc-500" : "text-gray-400"}`}>
                لا توجد نتائج مطابقة
              </p>
              <button
                onClick={() => { setGenre("الكل"); setSearch(""); }}
                className="text-amber-500 text-sm hover:underline"
              >
                إعادة تعيين الفلتر
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map((s, i) => (
                <SeriesCard
                  key={s.id}
                  series={s}
                  dark={dark}
                  index={i}
                  onDeleteRequest={setToDelete}
                />
              ))}
            </div>
          )}

          <div className="h-16" />
        </main>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .group {
          animation: fadeSlideUp 0.5s ease-out both;
        }
      `}</style>
    </>
  );
}