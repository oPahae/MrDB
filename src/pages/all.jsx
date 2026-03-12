import { useState, useEffect, useCallback, useRef } from "react";
import Head from "next/head";
import {
  Star, TrendingUp, Flame, Search, ArrowRight, Eye,
  SlidersHorizontal, ChevronDown, Award, Sparkles, Film,
  Layers, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import Link from "next/link";

// ─── Constants ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 50;

const GENRES = ["الكل", "أنيم", "سيري", "دراما كورية"];
const SORT_OPTIONS = [
  { value: "rating",   label: "الأعلى تقييماً" },
  { value: "newest",   label: "الأحدث" },
  { value: "oldest",   label: "الأقدم" },
  { value: "episodes", label: "أكثر حلقات" },
];
const GENRE_TO_TYPE = {
  "أنيم":        "anime",
  "سيري":        "series",
  "دراما كورية": "kdrama",
};
const TYPE_LABEL = {
  anime:  "أنيم",
  series: "سيري",
  kdrama: "دراما كورية",
  other:  "أخرى",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

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

function SeriesCard({ series, dark, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={`/series?id=${series.id}`}
      className="group relative cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
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
            className={`w-full h-full object-cover transition-transform duration-700 ${hovered ? "scale-110" : "scale-100"}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
            {series.trending && (
              <div className="flex items-center gap-1 bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg">
                <Flame size={10} className="fill-white" />
                <span>رائج</span>
              </div>
            )}
            {series.rating > 0 && <RatingPill rating={series.rating} size="sm" />}
          </div>

          <div className="absolute top-3 left-3">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md
              ${dark ? "bg-white/10 text-white border border-white/20" : "bg-black/30 text-white"}`}>
              {TYPE_LABEL[series.type] || series.type}
            </span>
          </div>

          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}>
            <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/40 hover:bg-amber-400 transition-colors">
              <ArrowRight size={22} className="text-white mr-[-2px]" />
            </div>
          </div>

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
            <div className="hidden md:flex items-center gap-1">
              <Eye size={11} />
              <span>مشاهدة</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function HeroSeries({ series, dark }) {
  if (!series) return null;
  return (
    <div className="relative w-full rounded-3xl overflow-hidden mb-12" style={{ minHeight: 420 }}>
      <img
        src={series.img}
        alt={series.title}
        className="absolute inset-0 w-full h-full object-cover scale-105"
        style={{ filter: "blur(2px)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-l from-black/95 via-black/60 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      <div className="relative h-full flex items-center p-8 md:p-14" style={{ minHeight: 420 }}>
        <div className="max-w-lg">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-amber-400" />
            <span className="text-amber-400 text-sm font-bold tracking-widest uppercase">الأعلى تقييماً</span>
          </div>
          <h1
            className="text-white text-4xl md:text-5xl font-black mb-3 leading-tight"
            style={{ fontFamily: "'Cairo', sans-serif", textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}
          >
            {series.title}
          </h1>
          <div className="flex items-center gap-3 mb-4">
            {series.rating > 0 && <RatingPill rating={series.rating} />}
            <StatusBadge isOngoing={series.finished == false} />
            <span className="text-white/50 text-sm">{series.seasons} مواسم</span>
          </div>
          <p className="text-white/70 text-sm leading-relaxed mb-6 line-clamp-3">{series.descr}</p>
          <div className="flex items-center gap-3">
            <Link
              href={`/series?id=${series.id}`}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-xl shadow-amber-500/30"
            >
              <ArrowRight size={16} />
              <span>شاهد <span className="hidden lg:inline">الآن</span></span>
            </Link>
            <Link
              href={`/series?id=${series.id}`}
              className="flex items-center gap-2 font-bold px-6 py-3 rounded-xl border transition-all duration-200 hover:scale-105 border-white/30 text-white hover:bg-white/10"
            >
              <Eye size={16} />
              <span>التفاصيل</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ meta, onPageChange, dark }) {
  if (!meta || meta.totalPages <= 1) return null;

  const { page, totalPages } = meta;

  const getPages = () => {
    let start = Math.max(1, page - 2);
    let end   = Math.min(totalPages, page + 2);
    if (end - start < 4) {
      if (start === 1) end = Math.min(totalPages, start + 4);
      else start = Math.max(1, end - 4);
    }
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const base     = "flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200";
  const active   = "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/25 scale-105";
  const inactive = dark
    ? "bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white hover:border-white/20"
    : "bg-white border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-600 shadow-sm";
  const disabled = "opacity-30 cursor-not-allowed";

  return (
    <div className="flex items-center justify-center gap-2 mt-10 flex-wrap" dir="ltr">
      <button onClick={() => onPageChange(1)} disabled={!meta.hasPrev}
        className={`${base} ${!meta.hasPrev ? disabled : inactive}`}>
        <ChevronsRight size={15} />
      </button>
      <button onClick={() => onPageChange(page - 1)} disabled={!meta.hasPrev}
        className={`${base} ${!meta.hasPrev ? disabled : inactive}`}>
        <ChevronRight size={15} />
      </button>

      {getPages().map((p) => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`${base} ${p === page ? active : inactive}`}>
          {p}
        </button>
      ))}

      <button onClick={() => onPageChange(page + 1)} disabled={!meta.hasNext}
        className={`${base} ${!meta.hasNext ? disabled : inactive}`}>
        <ChevronLeft size={15} />
      </button>
      <button onClick={() => onPageChange(totalPages)} disabled={!meta.hasNext}
        className={`${base} ${!meta.hasNext ? disabled : inactive}`}>
        <ChevronsLeft size={15} />
      </button>

      <span className={`text-xs mr-2 ${dark ? "text-zinc-500" : "text-gray-400"}`} dir="rtl">
        {page} / {totalPages}
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home({ dark }) {
  const [heroSeries, setHeroSeries]   = useState(null);
  const [trendingSeries, setTrending] = useState([]);
  const [globalStats, setStats]       = useState({ count: 0, episodes: 0, avgRating: "—" });

  const [series, setSeries]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta]       = useState(null);

  const [genre, setGenre]       = useState("الكل");
  const [sort, setSort]         = useState("rating");
  const [page, setPage]         = useState(1);
  const [sortOpen, setSortOpen] = useState(false);

  const gridRef = useRef(null);

  // Hero + trending: one-time fetch of top 100 by rating
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/series/getAll?page=1&limit=100&sort=rating");
        if (!res.ok) return;
        const json = await res.json();
        const all  = json.data || [];
        setHeroSeries(all[0] || null);
        setTrending(all.filter((s) => s.trending));
        setStats({
          count:     json.meta?.total || all.length,
          episodes:  all.reduce((a, s) => a + (s.episodes || 0), 0),
          avgRating: all.length
            ? (all.reduce((a, s) => a + (Number(s.rating) || 0), 0) / all.length).toFixed(1)
            : "—",
        });
      } catch (e) { console.error(e); }
    })();
  }, []);

  // Paginated list
  const fetchPage = useCallback(async (p, g, s) => {
    setLoading(true);
    try {
      const type   = GENRE_TO_TYPE[g] || "";
      const params = new URLSearchParams({
        page: p, limit: PAGE_SIZE, sort: s,
        ...(type ? { type } : {}),
      });
      const res  = await fetch(`/api/series/getAll?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setSeries(json.data || []);
      setMeta(json.meta || null);
    } catch { setSeries([]); setMeta(null); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchPage(page, genre, sort); }, [page, genre, sort, fetchPage]);

  const handleGenre = (g) => { setGenre(g); setPage(1); };
  const handleSort  = (s) => { setSort(s);  setPage(1); setSortOpen(false); };
  const handlePage  = (p) => {
    setPage(p);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Head>
        <title>MrDB — تقييم السيريات والأنميات</title>
        <meta name="description" content="قيّم وتابع أفضل الأنميات والسيريات العالمية" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;500;700;900&display=swap" rel="stylesheet" />
      </Head>

      <div
        dir="rtl"
        className={`min-h-screen transition-colors duration-300 ${dark ? "bg-[#0a0a0f] text-white" : "bg-[#f4f1eb] text-gray-900"}`}
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        <div className="fixed inset-0 pointer-events-none z-0" style={{
          backgroundImage: dark
            ? "radial-gradient(ellipse at 20% 50%,rgba(245,158,11,.04) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(99,102,241,.04) 0%,transparent 50%)"
            : "radial-gradient(ellipse at 20% 50%,rgba(245,158,11,.08) 0%,transparent 60%)",
        }} />

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {heroSeries && <HeroSeries series={heroSeries} dark={dark} />}

          {/* Stats */}
          <div className={`grid grid-cols-2 md:flex md:items-center md:justify-center gap-8 md:gap-16 p-6 mb-10 rounded-2xl ${
            dark ? "bg-white/3 border border-white/5" : "bg-white border border-gray-100 shadow-sm"
          }`}>
            {[
              { icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>, label: "سيري وأنيمي",  value: `${globalStats.count}+` },
              { icon: <Film size={18} className="text-sky-400" />,                                                                                                                                                                                                      label: "حلقة مسجلة",  value: globalStats.episodes.toLocaleString("ar") },
              { icon: <Star size={18} className="text-yellow-400 fill-yellow-400" />,                                                                                                                                                                                   label: "متوسط التقييم", value: globalStats.avgRating },
              { icon: <Award size={18} className="text-rose-400" />,                                                                                                                                                                                                    label: "تقييم موثّق",   value: "12 ألف+" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                {stat.icon}
                <span className={`text-xl font-black ${dark ? "text-white" : "text-gray-900"}`} style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {stat.value}
                </span>
                <span className={`text-[11px] ${dark ? "text-zinc-500" : "text-gray-400"}`}>{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Trending */}
          {trendingSeries.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Flame size={18} className="text-orange-500 fill-orange-500" />
                <h2 className="text-lg font-black" style={{ fontFamily: "'Cairo', sans-serif" }}>الأكثر رواجاً الآن</h2>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {trendingSeries.map((s) => (
                  <Link key={s.id} href={`/series?id=${s.id}`}
                    className={`flex-shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 hover:scale-105 ${
                      dark ? "bg-white/5 border-white/8 hover:border-amber-500/30" : "bg-white border-gray-200 hover:border-amber-400 shadow-sm"
                    }`}>
                    <img src={s.img} alt={s.title} className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-bold leading-tight">{s.title}</p>
                      {s.rating > 0 && <RatingPill rating={s.rating} size="sm" />}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Filters header */}
          <div className="mb-6" ref={gridRef}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={20} className="text-amber-400" />
                <h2 className="text-xl font-black" style={{ fontFamily: "'Cairo', sans-serif" }}>جميع السيريات</h2>
                {meta && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${dark ? "bg-amber-500/15 text-amber-400" : "bg-amber-100 text-amber-700"}`}>
                    {meta.total}
                  </span>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${
                    dark ? "bg-white/5 border-white/10 hover:border-white/20" : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
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
                        <button key={opt.value} onClick={() => handleSort(opt.value)}
                          className={`w-full text-right px-4 py-2.5 text-sm transition-colors ${
                            sort === opt.value ? "text-amber-400 font-bold" : dark ? "hover:bg-white/5" : "hover:bg-gray-50"
                          }`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {GENRES.map((g) => (
                <button key={g} onClick={() => handleGenre(g)}
                  className={`flex-shrink-0 text-sm font-bold px-4 py-2 rounded-xl transition-all duration-200 ${
                    genre === g
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/25"
                      : dark
                      ? "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-transparent"
                      : "bg-white text-gray-500 hover:text-gray-900 border border-gray-200 shadow-sm"
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className={`rounded-2xl overflow-hidden animate-pulse ${dark ? "bg-white/5" : "bg-gray-200"}`}>
                  <div className="aspect-[2/3]" />
                  <div className="p-3 space-y-2">
                    <div className={`h-3 rounded w-3/4 ${dark ? "bg-white/10" : "bg-gray-300"}`} />
                    <div className={`h-3 rounded w-1/2 ${dark ? "bg-white/5"  : "bg-gray-200"}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : series.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${dark ? "bg-white/5" : "bg-gray-100"}`}>
                <Search size={32} className={dark ? "text-zinc-600" : "text-gray-300"} />
              </div>
              <p className={`text-lg font-bold ${dark ? "text-zinc-500" : "text-gray-400"}`}>لا توجد نتائج مطابقة</p>
              <button onClick={() => handleGenre("الكل")} className="text-amber-500 text-sm hover:underline">
                إعادة تعيين الفلتر
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {series.map((s, i) => <SeriesCard key={s.id} series={s} dark={dark} index={i} />)}
              </div>

              <Pagination meta={meta} onPageChange={handlePage} dark={dark} />

              {meta && (
                <p className={`text-center text-xs mt-4 ${dark ? "text-zinc-600" : "text-gray-400"}`}>
                  عرض {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} من {meta.total} نتيجة
                </p>
              )}
            </>
          )}

          <div className="h-16" />
        </main>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .group { animation: fadeSlideUp 0.45s ease-out both; }
      `}</style>
    </>
  );
}