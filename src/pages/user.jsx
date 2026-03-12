import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import {
  User, Star, Tv, Heart, ArrowRight,
  Loader2, AlertCircle, Clock, CheckCircle,
} from "lucide-react";
import NextLink from "next/link";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  const map = {
    anime:  { label: "أنيمي", emoji: "🎌", cls: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
    series: { label: "مسلسل", emoji: "📺", cls: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
    kdrama: { label: "دراما", emoji: "🇰🇷", cls: "bg-rose-500/15 text-rose-400 border-rose-500/20" },
    other:  { label: "أخرى",  emoji: "🎬", cls: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20" },
  };
  const t = map[type] || map.other;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${t.cls}`}>
      <span>{t.emoji}</span>{t.label}
    </span>
  );
}

// ─── API calls ────────────────────────────────────────────────────────────────

async function fetchUser(id) {
  const res = await fetch(`/api/users/get?id=${id}`);
  if (!res.ok) throw new Error("المستخدم غير موجود");
  return res.json();
}

async function fetchFavorites(id) {
  const res = await fetch(`/api/users/favorites?id=${id}`);
  if (!res.ok) throw new Error("فشل تحميل المفضلة");
  return res.json();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function UserPage({ dark = true }) {
  const router = useRouter();
  const { id } = router.query;

  const [user, setUser]   = useState(null);
  const [favs, setFavs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([fetchUser(id), fetchFavorites(id)])
      .then(([userData, favsData]) => {
        setUser(userData.user);
        setFavs(favsData.favorites || []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const bg    = dark ? "bg-[#080810]" : "bg-[#f4f1eb]";
  const text  = dark ? "text-white"   : "text-gray-900";
  const muted = dark ? "text-zinc-500" : "text-gray-400";
  const card  = dark ? "bg-white/[0.03] border-white/8" : "bg-white border-gray-100 shadow-sm";

  return (
    <>
      <Head>
        <title>{user ? `${user.name} — MrDB` : "المستخدم — MrDB"}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div dir="rtl" className={`min-h-screen transition-colors duration-300 ${bg} ${text}`}
        style={{ fontFamily: "'Tajawal', sans-serif" }}>
        {dark && (
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-amber-500/4 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-violet-500/4 rounded-full blur-[100px]" />
          </div>
        )}

        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">

          {/* ── Back ── */}
          <NextLink href="/" className={`inline-flex items-center gap-2 text-xs transition-colors ${
            dark ? "text-zinc-500 hover:text-zinc-300" : "text-gray-400 hover:text-gray-700"
          }`}>
            <ArrowRight size={13} />الرئيسية
          </NextLink>

          {/* ── States ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 size={32} className="animate-spin text-amber-400" />
              <p className={`text-sm ${muted}`}>جاري تحميل الملف الشخصي...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <AlertCircle size={32} className="text-rose-400" />
              <p className="text-rose-400 font-bold">{error}</p>
              <button
                onClick={() => router.back()}
                className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all"
              >
                العودة
              </button>
            </div>
          ) : (
            <>
              {/* ── Profile Card ── */}
              <div className={`rounded-3xl border p-6 ${card}`}>
                <div className="flex items-center gap-5">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                    <span
                      className="text-3xl font-black text-amber-400"
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                    >
                      {user.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h1
                      className={`text-2xl font-black truncate ${text}`}
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                    >
                      {user.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`flex items-center gap-1.5 text-xs ${muted}`}>
                        <User size={12} />
                        {user.email}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className={`flex items-center gap-4 mt-5 pt-5 border-t ${dark ? "border-white/6" : "border-gray-100"}`}>
                  <div className="text-center">
                    <p className={`text-xl font-black ${text}`} style={{ fontFamily: "'Cairo', sans-serif" }}>
                      {favs.length}
                    </p>
                    <p className={`text-[11px] ${muted}`}>مفضلة</p>
                  </div>
                </div>
              </div>

              {/* ── Favorites ── */}
              <div className={`rounded-3xl border p-6 space-y-4 ${card}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                    <Heart size={16} className="text-amber-400" />
                  </div>
                  <h2 className="text-base font-black" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    المفضلة
                  </h2>
                  <span className={`mr-auto text-xs font-bold px-2.5 py-1 rounded-xl border ${
                    dark ? "bg-white/4 border-white/8 text-zinc-500" : "bg-gray-100 border-gray-200 text-gray-400"
                  }`}>
                    {favs.length}
                  </span>
                </div>

                {favs.length === 0 ? (
                  <div className="flex flex-col items-center py-10 gap-2">
                    <Heart size={24} className={muted} />
                    <p className={`text-sm ${muted}`}>لا توجد مسلسلات في المفضلة</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {favs.map(sr => (
                      <div
                        key={sr.favID}
                        onClick={() => router.push(`/series?id=${sr.id}`)}
                        className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 border cursor-pointer transition-all ${
                          dark
                            ? "bg-white/[0.02] border-white/6 hover:bg-white/[0.055] hover:border-amber-500/20"
                            : "bg-gray-50 border-gray-100 hover:border-amber-300 hover:shadow-sm"
                        }`}
                      >
                        {/* Poster */}
                        <div className="w-10 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-900">
                          {sr.img ? (
                            <img
                              src={sr.img}
                              alt={sr.title}
                              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Tv size={12} className="text-zinc-600" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-bold truncate transition-colors group-hover:text-amber-400 ${text}`}
                            style={{ fontFamily: "'Cairo', sans-serif" }}
                          >
                            {sr.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <TypeBadge type={sr.type} />
                            {sr.rating > 0 && (
                              <span className="flex items-center gap-1">
                                <Star size={10} className="text-amber-400 fill-amber-400" />
                                <span className={`text-[11px] font-bold ${dark ? "text-zinc-400" : "text-gray-500"}`}>
                                  {Number(sr.rating).toFixed(1)}
                                </span>
                              </span>
                            )}
                            {sr.finished
                              ? <span className="flex items-center gap-1 text-[10px] text-emerald-400"><CheckCircle size={9} />مكتمل</span>
                              : <span className="flex items-center gap-1 text-[10px] text-sky-400"><Clock size={9} />مستمر</span>
                            }
                          </div>
                        </div>

                        {/* Arrow hint */}
                        <ArrowRight size={14} className={`flex-shrink-0 transition-colors ${
                          dark ? "text-zinc-700 group-hover:text-amber-400" : "text-gray-300 group-hover:text-amber-400"
                        }`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="h-16" />
        </div>
      </div>
    </>
  );
}