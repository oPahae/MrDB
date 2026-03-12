import { useState, useRef, useEffect } from "react";
import { Tv, Search, Moon, Sun, X, ArrowRight, Trophy, Film, Menu, LogIn, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

const TYPE_LABEL = {
  anime: "أنيم",
  series: "سيري",
  kdrama: "دراما كورية",
};

function RatingPill({ rating, size = "md" }) {
  const color =
    rating >= 9 ? "from-amber-400 to-orange-500" :
      rating >= 8 ? "from-yellow-400 to-amber-500" :
        rating >= 7 ? "from-lime-400 to-green-500" :
          "from-gray-400 to-gray-500";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  return (
    <div className={`inline-flex items-center gap-1 bg-gradient-to-r ${color} rounded-full px-2 py-0.5`}>
      <svg width={size === "sm" ? 10 : 12} height={size === "sm" ? 10 : 12} viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span className={`font-black text-white ${textSize}`}>{Number(rating).toFixed(1)}</span>
    </div>
  );
}

function SearchDropdown({ query, dark, onClose }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 1) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/series/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const data = await res.json();
        setResults(data);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  if (!query || query.trim().length < 1) return null;

  return (
    <div dir="rtl" className={`absolute top-full right-0 left-0 mt-2 rounded-2xl border shadow-2xl overflow-hidden z-50 ${dark ? "bg-zinc-900 border-white/10" : "bg-white border-gray-200"
      }`}>
      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <span className={`text-sm ${dark ? "text-zinc-400" : "text-gray-400"}`}>جاري البحث...</span>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center py-6 gap-2">
          <Search size={24} className={dark ? "text-zinc-600" : "text-gray-300"} />
          <span className={`text-sm ${dark ? "text-zinc-500" : "text-gray-400"}`}>لا توجد نتائج</span>
        </div>
      ) : (
        <div>
          {results.map((s, i) => (
            <Link
              key={s.id}
              href={`/series?id=${s.id}`}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${dark ? "hover:bg-white/5" : "hover:bg-gray-50"
                } ${i !== 0 ? (dark ? "border-t border-white/5" : "border-t border-gray-100") : ""}`}
            >
              <img
                src={s.img}
                alt={s.title}
                className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`font-bold text-sm leading-tight truncate ${dark ? "text-white" : "text-gray-900"}`}
                  style={{ fontFamily: "'Cairo', sans-serif" }}
                >
                  {s.title}
                </p>
                <p className={`text-xs mt-0.5 ${dark ? "text-zinc-500" : "text-gray-400"}`}>
                  {s.maker}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <RatingPill rating={s.rating} size="sm" />
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dark ? "bg-white/8 text-zinc-400" : "bg-gray-100 text-gray-500"
                    }`}>
                    {TYPE_LABEL[s.type] || s.type}
                  </span>
                </div>
              </div>
              <ArrowRight size={14} className={dark ? "text-zinc-600" : "text-gray-300"} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Header({ dark, setDark, session }) {
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const router = useRouter();

  const goSearch = () => {
    if (!search.trim()) return;
    router.push(`/search?key=${encodeURIComponent(search.trim())}`);
    setSearch("");
    setSearchFocused(false);
    setMobileSearchOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) {
        setMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change / resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    fetch("/api/_auth/logout").then(res => res.json()).then(data => {
      if (data.message === "success")
        window.location.href = "/"
    }).catch(err => alert(err))
  }

  const iconBtnClass = `w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 ${dark
    ? "bg-white/5 border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
    : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200"
    }`;

  const navLinkClass = (active = false) =>
    `flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all duration-200 ${active
      ? "bg-amber-500/15 text-amber-500"
      : dark
        ? "text-zinc-400 hover:text-white hover:bg-white/5"
        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
    }`;

  return (
    <>
      <nav dir="rtl" className={`fixed w-full top-0 z-50 backdrop-blur-xl border-b ${dark ? "bg-black/60 border-white/5" : "bg-white/70 border-gray-200/60"
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Tv size={18} className="text-white" />
              </div>
              <span
                className="text-xl font-black tracking-tight"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                <span className={dark ? "text-white" : "text-gray-900"}>MrDB</span>
                <span className="text-amber-500">.</span>
              </span>
            </Link>

            {/* Search — desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-4 relative" ref={searchContainerRef}>
              <div className={`relative w-full flex items-center rounded-xl overflow-hidden border transition-all duration-200 ${dark
                ? "bg-white/5 border-white/10 focus-within:border-amber-500/50 focus-within:bg-white/8"
                : "bg-gray-100 border-gray-200 focus-within:border-amber-400"
                }`}>
                <button
                  onClick={goSearch}
                  className={`absolute right-1 ${search ? "bg-amber-500 hover:bg-amber-600 duration-100" : ""} p-2 rounded-xl cursor-pointer`}
                >
                  <Search size={15} className="text-white font-bold" />
                </button>
                <input
                  onKeyDown={(e) => {
                    if (e.key === "Enter") goSearch();
                  }}
                  type="text"
                  placeholder="قلب على شي سيري ولا أنيم..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className={`w-full bg-transparent px-10 py-2.5 text-sm outline-none placeholder:text-current ${dark ? "text-white placeholder:text-zinc-600" : "text-gray-900 placeholder:text-gray-400"
                    }`}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute left-3 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {searchFocused && (
                <SearchDropdown
                  query={search}
                  dark={dark}
                  onClose={() => { setSearchFocused(false); setSearch(""); }}
                />
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">

              {/* Nav links — desktop only */}
              <div className="hidden md:flex items-center gap-1">
                <Link href="/all" className={navLinkClass()}>
                  <Film size={14} className="text-amber-500" />
                  <span style={{ fontFamily: "'Cairo', sans-serif" }}>كاع السيريات</span>
                </Link>
                <Link href="/top" className={navLinkClass()}>
                  <Trophy size={14} className="text-amber-500" />
                  <span style={{ fontFamily: "'Cairo', sans-serif" }}>أقود السيريات</span>
                </Link>
              </div>

              {/* Dark mode toggle */}
              <button
                onClick={() => setDark(!dark)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 ${dark
                  ? "bg-white/5 border-white/10 text-amber-400 hover:bg-white/10"
                  : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Login / Logout — icon only */}
              {session ? (
                <button
                  onClick={handleLogout}
                  title="تسجيل الخروج"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 bg-gradient-to-br from-amber-500 to-orange-500 border-transparent text-black hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20`}
                >
                  <LogOut size={16} />
                </button>
              ) : (
                <Link
                  href="/login"
                  title="تسجيل الدخول"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 bg-gradient-to-br from-amber-500 to-orange-500 border-transparent text-black hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20`}
                >
                  <LogIn size={16} />
                </Link>
              )}

              {session &&
                <Link
                  href="/profile"
                  title="بروفيل ديالك أجمي"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-200 bg-gradient-to-br from-amber-500 to-orange-500 border-transparent text-black hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20`}
                >
                  <User size={16} />
                </Link>
              }

              {/* Mobile: search icon */}
              <button
                className={`md:hidden ${iconBtnClass}`}
                onClick={() => setMobileSearchOpen((v) => !v)}
                aria-label="بحث"
              >
                <Search size={16} />
              </button>

              {/* Mobile: hamburger */}
              <button
                className={`md:hidden ${iconBtnClass}`}
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="القائمة"
              >
                {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        {mobileSearchOpen && (
          <div className={`md:hidden border-t px-4 py-3 ${dark ? "border-white/5 bg-black/80" : "border-gray-200 bg-white/90"}`} ref={mobileSearchRef}>
            <div className="relative" >
              <div className={`relative w-full flex items-center rounded-xl overflow-hidden border transition-all duration-200 ${dark
                ? "bg-white/5 border-white/10 focus-within:border-amber-500/50"
                : "bg-gray-100 border-gray-200 focus-within:border-amber-400"
                }`}>
                <button
                  onClick={goSearch}
                  className={`absolute right-1 ${search ? "bg-amber-500 hover:bg-amber-600 duration-100" : ""} p-2 rounded-xl cursor-pointer`}
                >
                  <Search size={15} className="text-white font-bold" />
                </button>
                <input
                  onKeyDown={(e) => {
                    if (e.key === "Enter") goSearch();
                  }}
                  type="text"
                  placeholder="ابحث عن سيري أو أنيمي..."
                  value={search}
                  autoFocus
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className={`w-full bg-transparent px-10 py-2.5 text-sm outline-none ${dark ? "text-white placeholder:text-zinc-600" : "text-gray-900 placeholder:text-gray-400"
                    }`}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute left-3 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {searchFocused && (
                <SearchDropdown
                  query={search}
                  dark={dark}
                  onClose={() => { setSearchFocused(false); setSearch(""); setMobileSearchOpen(false); }}
                />
              )}
            </div>
          </div>
        )}

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div dir="rtl" className={`md:hidden border-t px-4 py-3 flex flex-col gap-1 ${dark ? "border-white/5 bg-black/90" : "border-gray-200 bg-white/95"}`}>
            <Link
              href="/all"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-sm transition-colors ${dark ? "text-zinc-300 hover:bg-white/5 hover:text-white" : "text-gray-700 hover:bg-gray-100"}`}
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              <Film size={16} className="text-amber-500" />
              كاع الحلقات
            </Link>
            <Link
              href="/top"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl font-bold text-sm transition-colors ${dark ? "text-zinc-300 hover:bg-white/5 hover:text-white" : "text-gray-700 hover:bg-gray-100"}`}
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              <Trophy size={16} className="text-amber-500" />
              أقود السيريات
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}