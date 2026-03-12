import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Star,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Loader2,
  AlertCircle,
  Tv,
  Trophy,
  X,
} from "lucide-react";
import NextLink from "next/link";

const TYPE_OPTIONS = [
  { value: "all", label: "الكل", emoji: "🌐" },
  { value: "anime", label: "أنيمي", emoji: "🎌" },
  { value: "series", label: "سيري", emoji: "📺" },
  { value: "kdrama", label: "دراما كورية", emoji: "🇰🇷" },
  { value: "other", label: "أخرى", emoji: "🎬" },
];

function RankBadge({ rank, dark }) {
  const base = "flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full font-bold text-sm flex-shrink-0";
  if (rank === 1)
    return <span className={`${base} bg-gradient-to-br from-blue-500 to-blue-700 text-white`}>1</span>;
  if (rank === 2)
    return <span className={`${base} bg-gradient-to-br from-green-500 to-green-700 text-white`}>2</span>;
  if (rank === 3)
    return <span className={`${base} bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-full`}>3</span>;
  return (
    <span
      className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-black text-xs flex-shrink-0 ${dark ? "bg-white/4 border border-white/8 text-zinc-500" : "bg-gray-100 border border-gray-200 text-gray-400"
        }`}
    >
      {rank}
    </span>
  );
}

function TypeBadge({ type }) {
  const map = {
    anime: { label: "أنيمي", emoji: "🎌", cls: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
    series: { label: "سيري", emoji: "📺", cls: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
    kdrama: { label: "دراما", emoji: "🇰🇷", cls: "bg-rose-500/15 text-rose-400 border-rose-500/20" },
    other: { label: "أخرى", emoji: "🎬", cls: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20" },
  };
  const t = map[type] || map.other;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.cls}`}>
      <span>{t.emoji}</span>
      {t.label}
    </span>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function EpisodeRow({ ep, rank, dark }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/episode?id=${ep.id}`)}
      className={`group flex items-center gap-2 sm:gap-4 border rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 cursor-pointer transition-all duration-150 ${dark
          ? "bg-white/[0.025] border-white/6 hover:bg-white/[0.055] hover:border-amber-500/20 active:bg-white/[0.07]"
          : "bg-white border-gray-100 hover:border-amber-300 shadow-sm hover:shadow-md active:shadow-sm"
        } ${rank <= 3 && dark ? "ring-1 ring-amber-500/10" : ""}`}
    >
      {/* Rank */}
      <RankBadge rank={rank} dark={dark} />

      {/* Thumbnail */}
      <div className="relative w-20 sm:w-32 aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-zinc-900">
        {ep.img || ep.seriesImg ? (
          <img
            src={ep.img || ep.seriesImg}
            alt={ep.title}
            className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 ${!ep.img ? "opacity-40" : ""}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tv size={14} className="text-zinc-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute bottom-1 right-1 text-[8px] sm:text-[9px] font-black text-white/80 bg-black/20 px-1 py-0.5 rounded-lg backdrop-blur-sm">
          ح {ep.number}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <h3
          className={`text-xs sm:text-sm font-bold leading-snug line-clamp-2 sm:truncate transition-colors group-hover:text-amber-400 ${dark ? "text-white" : "text-gray-900"}`}
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          {ep.title}
        </h3>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] sm:text-xs font-bold text-white bg-gradient-to-br from-amber-500 to-amber-700 px-1.5 py-0.5 rounded-lg truncate max-w-[120px] sm:max-w-[160px]">
            {ep.seriesTitle}
          </span>
          <span className={`text-[10px] hidden xs:inline ${dark ? "text-zinc-700" : "text-gray-300"}`}>·</span>
          <span className={`text-[10px] sm:text-xs hidden xs:inline truncate max-w-[80px] ${dark ? "text-zinc-600" : "text-gray-400"}`}>
            {ep.seasonTitle || `الموسم ${ep.seasonNumber}`}
          </span>
        </div>
        {/* Type badge visible on mobile inline */}
        <div className="sm:hidden">
          <TypeBadge type={ep.seriesType} />
        </div>
      </div>

      <span className={`text-[10px] ${dark ? "text-zinc-700" : "text-gray-300"}`}>({ep.totalRatings || 0})</span>

      {/* Type — desktop only */}
      <div className="hidden sm:block flex-shrink-0">
        <TypeBadge type={ep.seriesType} />
      </div>

      {/* Rating */}
      <div className="flex-shrink-0 flex flex-col items-center gap-0 min-w-[40px] sm:min-w-[52px]">
        {ep.rating > 0 ? (
          <>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Star size={14} className="text-amber-400 fill-amber-400 sm:hidden" />
              <Star size={18} className="text-amber-400 fill-amber-400 hidden sm:block" />
              <span className={`text-base sm:text-2xl font-black ${dark ? "text-white" : "text-gray-900"}`}>
                {Number(ep.rating).toFixed(1)}
              </span>
            </div>
            <span className={`text-[9px] sm:text-[10px] ${dark ? "text-zinc-600" : "text-gray-400"}`}>/10</span>
          </>
        ) : (
          <span className={`text-xs ${dark ? "text-zinc-700" : "text-gray-300"}`}>—</span>
        )}
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, pages, onPage, dark }) {
  if (pages <= 1) return null;
  const muted = dark ? "text-zinc-500" : "text-gray-400";
  const base = "w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold transition-all border";
  const inactive = dark
    ? "bg-white/3 border-white/8 text-zinc-400 hover:border-white/20 hover:text-white"
    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 shadow-sm";
  const active = "bg-amber-500 border-amber-500 text-black";
  const disabled = "opacity-30 cursor-not-allowed";

  // On mobile, show fewer page buttons
  const range = [];
  for (let i = Math.max(1, page - 1); i <= Math.min(pages, page + 1); i++) range.push(i);

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className={`${base} ${inactive} ${page === 1 ? disabled : ""}`}
      >
        <ChevronRight size={13} />
      </button>

      {range[0] > 1 && (
        <>
          <button onClick={() => onPage(1)} className={`${base} ${inactive}`}>1</button>
          {range[0] > 2 && <span className={`px-0.5 text-xs ${muted}`}>…</span>}
        </>
      )}
      {range.map((p) => (
        <button key={p} onClick={() => onPage(p)} className={`${base} ${p === page ? active : inactive}`}>{p}</button>
      ))}
      {range[range.length - 1] < pages && (
        <>
          {range[range.length - 1] < pages - 1 && <span className={`px-0.5 text-xs ${muted}`}>…</span>}
          <button onClick={() => onPage(pages)} className={`${base} ${inactive}`}>{pages}</button>
        </>
      )}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === pages}
        className={`${base} ${inactive} ${page === pages ? disabled : ""}`}
      >
        <ChevronLeft size={13} />
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const LIMIT = 25;

export default function TopEpisodes({ dark = true }) {
  const [episodes, setEpisodes] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const fetchEpisodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT, sort: "rating" });
      if (type !== "all") params.set("type", type);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/top/eps?${params}`);
      if (!res.ok) throw new Error("فشل تحميل البيانات");
      const data = await res.json();
      setEpisodes(data.episodes);
      setTotal(data.total);
      setPages(data.pages);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, type, search]);

  useEffect(() => { fetchEpisodes(); }, [fetchEpisodes]);

  const handleType = (v) => { setType(v); setPage(1); };
  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); setPage(1); };
  const handlePage = (p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const clearSearch = () => { setSearch(""); setSearchInput(""); setPage(1); };

  const bg = dark ? "bg-[#080810]" : "bg-[#f4f1eb]";
  const text = dark ? "text-white" : "text-gray-900";
  const card = dark ? "bg-white/[0.03] border border-white/8" : "bg-white border border-gray-100 shadow-sm";
  const muted = dark ? "text-zinc-500" : "text-gray-400";
  const rankStart = (page - 1) * LIMIT + 1;

  return (
    <>
      <Head>
        <title>أقود الحلقات — MrDB</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        dir="rtl"
        className={`pt-2 min-h-screen transition-colors duration-300 ${bg} ${text}`}
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        {dark && (
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[250px] sm:h-[400px] bg-amber-500/4 rounded-full blur-[80px] sm:blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[300px] bg-violet-500/4 rounded-full blur-[70px] sm:blur-[100px]" />
          </div>
        )}

        <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10">

          {/* ── Header ── */}
          <div className="my-5 sm:my-8">
            <NextLink
              href="/all"
              className={`inline-flex items-center gap-2 text-xs transition-colors mb-3 ${dark ? "text-zinc-500 hover:text-zinc-300" : "text-gray-400 hover:text-gray-700"
                }`}
            >
              <ArrowRight size={13} />
              الرئيسية
            </NextLink>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Trophy size={18} className="text-amber-400" />
              </div>
              <div className="min-w-0">
                <h1
                  className={`text-xl sm:text-3xl font-black leading-tight ${text}`}
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  أقود الحلقات فالتقييم
                </h1>
                <p className={`text-xs sm:text-sm mt-0.5 ${muted}`}>
                  {loading
                    ? "جاري التحميل..."
                    : `${total.toLocaleString()} حلقة مرتبين من المقودة تال الخارية`}
                </p>
              </div>
            </div>
          </div>

          {/* ── Filters ── */}
          <div className={`${card} rounded-2xl sm:rounded-3xl p-3 sm:p-5 mb-4 sm:mb-6 space-y-3 sm:space-y-4`}>
            {/* Search */}
            <form onSubmit={handleSearch} className="relative flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={13}
                  className={`absolute top-1/2 -translate-y-1/2 right-3 pointer-events-none ${muted}`}
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="قلب على شي حلقة ولا سيري..."
                  className={`w-full rounded-xl pr-9 pl-3 py-2.5 text-sm outline-none transition-all border ${dark
                      ? "bg-white/5 border-white/10 text-white placeholder-zinc-600 focus:border-amber-500/50"
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-amber-400"
                    }`}
                />
              </div>
              {/* Clear button inside search row on mobile */}
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className={`flex-shrink-0 w-10 flex items-center justify-center rounded-xl border transition-all ${dark
                      ? "bg-white/5 border-white/10 text-zinc-500 hover:text-white"
                      : "bg-gray-100 border-gray-200 text-gray-400"
                    }`}
                >
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Type filter — scrollable on mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleType(opt.value)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${type === opt.value
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-500"
                      : dark
                        ? "bg-white/3 border-white/8 text-zinc-500 hover:border-white/20 hover:text-zinc-300"
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                >
                  <span>{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
              {search && (
                <button
                  onClick={clearSearch}
                  className="flex-shrink-0 mr-auto flex items-center gap-1 text-[11px] sm:text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors px-2.5 sm:px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 whitespace-nowrap"
                >
                  <X size={11} />
                  مسح البحث
                </button>
              )}
            </div>
          </div>

          {/* ── List ── */}
          {loading ? (
            <div className="flex items-center justify-center py-24 sm:py-32">
              <div className="flex flex-col items-center gap-4">
                <Loader2 size={28} className="animate-spin text-amber-400" />
                <p className={`text-sm ${muted}`}>جاري تحميل الترتيب...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 sm:py-32 gap-4">
              <AlertCircle size={28} className="text-rose-400" />
              <p className="text-rose-400 font-bold text-sm">{error}</p>
              <button
                onClick={fetchEpisodes}
                className="px-5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-bold hover:bg-amber-500/30 transition-all"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : episodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 sm:py-32 gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white/5 flex items-center justify-center">
                <Tv size={24} className={muted} />
              </div>
              <p className={`font-bold text-sm ${text}`}>لا توجد نتائج</p>
              <p className={`text-xs sm:text-sm ${muted}`}>جرب تغيير فلاتر البحث</p>
            </div>
          ) : (
            <>
              {/* Column headers — hidden on very small screens */}
              <div className={`hidden xs:flex items-center gap-2 sm:gap-4 px-3 sm:px-4 mb-2`}>
                <span className={`w-8 sm:w-9 text-center text-[9px] sm:text-[10px] font-bold tracking-widest uppercase ${muted}`}>#</span>
                <span className="w-20 sm:w-32 flex-shrink-0" />
                <span className={`flex-1 text-[9px] sm:text-[10px] font-bold tracking-widest uppercase ${muted}`}>الحلقة</span>
                <span className={`hidden sm:block w-16 text-center text-[10px] font-bold tracking-widest uppercase ${muted}`}>النوع</span>
                <span className={`w-10 sm:w-12 text-center text-[9px] sm:text-[10px] font-bold tracking-widest uppercase ${muted}`}>التقييم</span>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                {episodes.map((ep, i) => (
                  <EpisodeRow key={ep.id} ep={ep} rank={rankStart + i} dark={dark} />
                ))}
              </div>

              <p className={`text-center text-[11px] sm:text-xs mt-3 sm:mt-4 ${muted}`}>
                {rankStart}–{Math.min(rankStart + episodes.length - 1, total)} من {total.toLocaleString()}
              </p>

              <Pagination page={page} pages={pages} onPage={handlePage} dark={dark} />
            </>
          )}

          <div className="h-10 sm:h-16" />
        </div>
      </div>
    </>
  );
}