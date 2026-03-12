import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Star,
  ArrowRight,
  Film,
  ChevronDown,
  Check,
  Edit2,
  Users,
  BarChart2,
  MessageCircle,
  Crown,
  Sparkles,
  X,
} from "lucide-react";
import { verifyAuth } from "@/middlewares/user";

const TYPE_LABEL = { anime: "أنيم", series: "سيري", kdrama: "دراما كورية", other: "أخرى" };

const rating_COLOR = (s) => {
  if (s >= 9) return { bar: "from-amber-400 to-orange-500", text: "text-amber-400", bg: "bg-amber-500/15" };
  if (s >= 7) return { bar: "from-lime-400 to-green-500", text: "text-lime-400", bg: "bg-lime-500/15" };
  if (s >= 5) return { bar: "from-sky-400 to-blue-500", text: "text-sky-400", bg: "bg-sky-500/15" };
  return { bar: "from-rose-400 to-red-500", text: "text-rose-400", bg: "bg-rose-500/15" };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRater({ value, onChange }) {
  const [hovered, setHovered] = useState(null);
  const display = hovered ?? value;
  return (
    <div className="flex gap-1 flex-row-reverse justify-center">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-125 active:scale-110"
        >
          <Star
            size={26}
            className={`transition-all duration-100 ${star <= display ? "fill-amber-400 text-amber-400" : "text-zinc-700"
              }`}
          />
        </button>
      ))}
    </div>
  );
}

function BigRating({ rating, total, dark }) {
  const color =
    rating >= 9 ? "from-amber-400 to-orange-500" :
      rating >= 8 ? "from-yellow-400 to-amber-500" :
        rating >= 7 ? "from-lime-400 to-green-500" :
          rating >= 5 ? "from-sky-400 to-blue-500" :
            "from-rose-400 to-red-500";

  return (
    <div className="flex flex-col items-center justify-center py-8 px-6">
      <div className={`relative flex items-end gap-1 bg-gradient-to-br ${color} bg-clip-text`}>
        <span
          className="font-black leading-none"
          style={{
            fontFamily: "'Cairo', sans-serif",
            fontSize: "clamp(5rem, 15vw, 8rem)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
          }}
        >
          {rating > 0 ? Number(rating).toFixed(1) : "—"}
        </span>
        <span
          className={`font-bold pb-3 text-2xl ${dark ? "text-zinc-600" : "text-gray-300"}`}
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          /10
        </span>
      </div>

      <div className="flex items-center gap-2 mt-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={16}
            className={`${rating / 2 >= i ? "fill-amber-400 text-amber-400" :
              rating / 2 >= i - 0.5 ? "fill-amber-400/50 text-amber-400" :
                dark ? "text-zinc-700" : "text-gray-300"
              }`}
          />
        ))}
      </div>

      <div className="flex items-center gap-1.5 mt-3">
        <Users size={13} className={dark ? "text-zinc-500" : "text-gray-400"} />
        <span className={`text-sm font-bold ${dark ? "text-zinc-400" : "text-gray-500"}`}>
          {total > 0
            ? `${Number(total).toLocaleString("ar")} تقييم`
            : "لا توجد تقييمات بعد"}
        </span>
      </div>
    </div>
  );
}

function DistributionChart({ distribution, total, dark }) {
  const distMap = {};
  distribution.forEach((d) => { distMap[d.rating] = Number(d.count); });
  const maxCount = Math.max(...Object.values(distMap), 1);

  return (
    <div className="px-6 pb-6">
      <div className="space-y-2">
        {Array.from({ length: 10 }, (_, i) => 10 - i).map((rating) => {
          const count = distMap[rating] || 0;
          const pct = (count / maxCount) * 100;
          const userPct = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
          const { bar, text } = rating_COLOR(rating);
          return (
            <div key={rating} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-10 flex-shrink-0 justify-end">
                <Star size={11} className={`${text} fill-current`} />
                <span className={`text-sm font-black ${text}`}>{rating}</span>
              </div>
              <div className={`flex-1 rounded-full h-5 overflow-hidden ${dark ? "bg-white/5" : "bg-gray-100"}`}>
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${bar} transition-all duration-700 ease-out`}
                  style={{ width: `${Math.max(pct, count > 0 ? 2 : 0)}%` }}
                />
              </div>
              <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                <span className={`text-sm font-black tabular-nums ${count > 0 ? (dark ? "text-white" : "text-gray-900") : dark ? "text-zinc-700" : "text-gray-300"
                  }`}>
                  {count} شخص
                </span>
                {count > 0 && (
                  <span className={`text-xs ${dark ? "text-zinc-500" : "text-gray-400"}`}>
                    {userPct}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewCard({ review, dark, isOwn }) {
  const { text: ratingText, bg: ratingBg } = rating_COLOR(review.rating);
  const hasFeedback = review.feedback && review.feedback.trim();
  const router = useRouter();
  return (
    <div onClick={() => router.push(`/user?id=${review.userID}`)} className={`cursor-pointer px-4 py-3.5 rounded-2xl border transition-all ${isOwn
      ? dark ? "border-amber-500/30 bg-amber-500/5" : "border-amber-300 bg-amber-50"
      : dark ? "border-white/6 bg-white/2 hover:bg-white/4" : "border-gray-100 bg-white hover:bg-gray-50"
      }`}>
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${dark ? "bg-zinc-800 text-zinc-400" : "bg-gray-100 text-gray-600"
          }`}>
          {review.userName?.[0]?.toUpperCase() || "?"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-bold truncate ${dark ? "text-zinc-200" : "text-gray-800"}`}>
              {review.userName}
            </p>
            {isOwn && (
              <span className="text-[10px] font-bold text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full flex-shrink-0">
                أنت
              </span>
            )}
          </div>
        </div>

        <div className={`flex items-center gap-1 px-3 py-1 rounded-full flex-shrink-0 ${ratingBg}`}>
          <Star size={12} className={`${ratingText} fill-current`} />
          <span className={`font-black text-sm ${ratingText}`}>{review.rating}/10</span>
        </div>
      </div>

      {hasFeedback && (
        <p className={`mt-2.5 text-sm leading-relaxed pr-12 ${dark ? "text-zinc-400" : "text-gray-600"}`}>
          {review.feedback}
        </p>
      )}
    </div>
  );
}

function AuthPrompt({ episodeID, onClose }) {
  return (
    <div dir="rtl" className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-sm bg-zinc-900 text-white rounded-3xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-3" style={{ fontFamily: "'Cairo', sans-serif" }}>
          خاصك تكون داير كونط
        </h3>
        <p className="text-sm mb-6">باش تقدر تقييم هاذ الحلقة، خصك تكون مسجّل.</p>
        <Link
          href={`/register?back=${episodeID}`}
          className="w-full inline-flex justify-center bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 rounded-xl transition-all"
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          دير واحد بالخف
        </Link>
        <button
          onClick={onClose}
          className="absolute top-3 left-3 text-zinc-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

function RatingModal({ dark, episodeID, userID, existing, onClose, onSaved }) {
  const [rating, setRating] = useState(existing?.rating || 0);
  const [feedback, setFeedback] = useState(existing?.feedback || "");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSave = async () => {
    if (!rating) return;
    setSaving(true);
    try {
      const res = await fetch("/api/episodes/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, episodeID, rating, feedback }),
      });
      const data = await res.json();
      setDone(true);
      setTimeout(() => { onSaved({ rating, feedback, newAvg: data.newAvg }); onClose(); }, 700);
    } finally {
      setSaving(false);
    }
  };

  const label =
    rating >= 10 ? "تحفة فنية لا تُنسى" :
      rating >= 9 ? "استثنائي جداً" :
        rating >= 8 ? "رائع جداً" :
          rating >= 7 ? "جيد جداً" :
            rating >= 6 ? "جيد" :
              rating >= 5 ? "مقبول" :
                rating >= 4 ? "دون المتوسط" :
                  rating >= 3 ? "ضعيف" :
                    rating >= 2 ? "سيء جداً" :
                      rating >= 1 ? "مروع" : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div
        className={`relative w-full max-w-md rounded-3xl p-7 shadow-2xl border ${dark ? "bg-zinc-950 border-white/10" : "bg-white border-gray-200"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 left-4 text-zinc-500 hover:text-zinc-300 transition-colors">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <h3 className="text-xl font-black mb-1" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {existing ? "تعديل تقييمك" : "قيّم على هاذ الحلقة"}
          </h3>
          <p className={`text-sm ${dark ? "text-zinc-500" : "text-gray-400"}`}>ختار تقييم من 1 تال 10</p>
        </div>

        <StarRater value={rating} onChange={setRating} />

        <div className="text-center my-4" style={{ minHeight: 56 }}>
          {rating > 0 ? (
            <>
              <div className={`text-6xl font-black leading-none ${rating >= 9 ? "text-amber-400" : rating >= 7 ? "text-lime-400" : rating >= 5 ? "text-sky-400" : "text-rose-400"
                }`} style={{ fontFamily: "'Cairo', sans-serif" }}>
                {rating}
              </div>
              <p className={`text-sm mt-1 font-semibold ${dark ? "text-zinc-400" : "text-gray-500"}`}>{label}</p>
            </>
          ) : (
            <p className={`text-sm pt-4 ${dark ? "text-zinc-600" : "text-gray-400"}`}>كليكي على النجوم باش تختار تقييم</p>
          )}
        </div>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="شارك رأيك بالتفصيل... (اختياري)"
          rows={3}
          className={`w-full rounded-xl px-4 py-3 text-sm resize-none outline-none border transition-colors mb-4 ${dark
            ? "bg-white/5 border-white/10 focus:border-amber-500/50 text-white placeholder-zinc-600"
            : "bg-gray-50 border-gray-200 focus:border-amber-400 text-gray-900 placeholder-gray-400"
            }`}
        />

        <button
          onClick={handleSave}
          disabled={!rating || saving || done}
          className={`w-full py-3.5 rounded-xl font-black text-base transition-all flex items-center justify-center gap-2 ${done
            ? "bg-emerald-500 text-white scale-95"
            : rating
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:scale-[1.02] shadow-xl shadow-amber-500/25"
              : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
            }`}
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          {done ? <><Check size={18} /> تم الحفظ!</> : saving ? "جاري الحفظ..." : "حفظ التقييم"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EpisodePage({ dark, session }) {
  const router = useRouter();
  const { id } = router.query;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingModal, setRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [authPrompt, setAuthPrompt] = useState(false);
  const userID = session ? session.id : null;

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/episodes/getOne?id=${id}&userID=${userID}`);
      const json = await res.json();
      setData(json);
      setUserRating(json.userRating ? { rating: Number(json.userRating.rating) } : null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) load(); }, [id]);

  const handleRatingSaved = ({ rating, feedback, newAvg }) => {
    setUserRating({ rating, feedback });
    setData((prev) => {
      if (!prev) return prev;
      const prevrating = prev.userRating?.rating || null;
      const newDist = [...prev.distribution];
      if (prevrating) {
        const idx = newDist.findIndex((d) => Number(d.rating) === prevrating);
        if (idx !== -1) newDist[idx] = { ...newDist[idx], count: Math.max(0, Number(newDist[idx].count) - 1) };
      }
      const idx = newDist.findIndex((d) => Number(d.rating) === rating);
      if (idx !== -1) {
        newDist[idx] = { ...newDist[idx], count: Number(newDist[idx].count) + 1 };
      } else {
        newDist.push({ rating, count: 1 });
        newDist.sort((a, b) => a.rating - b.rating);
      }
      const newTotal = prevrating ? prev.total : prev.total + 1;
      const newReviews = prev.reviews.filter((r) => r.userID !== userID);
      newReviews.unshift({ id: Date.now(), userID, userName: "أنت", rating, feedback });
      return {
        ...prev,
        episode: { ...prev.episode, rating: newAvg },
        distribution: newDist,
        total: newTotal,
        userRating: { rating, feedback },
        reviews: newReviews,
      };
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dark ? "bg-[#0a0a0f]" : "bg-[#f4f1eb]"}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.episode) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dark ? "bg-[#0a0a0f] text-white" : "bg-[#f4f1eb]"}`}>
        <p>الحلقة غير موجودة</p>
      </div>
    );
  }

  const { episode, distribution, reviews, total } = data;
  const filteredReviews = ratingFilter
    ? reviews.filter((r) => Number(r.rating) === ratingFilter)
    : reviews;

  return (
    <>
      <Head>
        <title>{episode.title} — MrDB</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;500;700;900&display=swap" rel="stylesheet" />
      </Head>

      {ratingModal && (
        <RatingModal
          dark={dark}
          episodeID={episode.id}
          userID={userID}
          existing={userRating}
          onClose={() => setRatingModal(false)}
          onSaved={handleRatingSaved}
        />
      )}

      {authPrompt && <AuthPrompt episodeID={episode.id} onClose={() => setAuthPrompt(false)} />}

      <div
        dir="rtl"
        className={`min-h-screen transition-colors duration-300 ${dark ? "bg-[#0a0a0f] text-white" : "bg-[#f4f1eb] text-gray-900"
          }`}
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: dark
              ? "radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.04) 0%, transparent 50%)"
              : "radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.08) 0%, transparent 60%)",
          }}
        />

        <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">

          {/* Back */}
          <Link
            href={`/series/${episode.serieID}`}
            className={`inline-flex items-center gap-2 mb-6 text-sm font-semibold transition-colors ${dark ? "text-zinc-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
              }`}
          >
            <ArrowRight size={16} />
            <span>{episode.seriesTitle}</span>
          </Link>

          {/* ── HERO ── */}
          <div className="relative w-full rounded-3xl overflow-hidden mb-8" style={{ minHeight: 340 }}>
            {episode.img ? (
              <img src={episode.img} alt={episode.title} className="absolute inset-0 w-full h-full object-cover scale-105" style={{ filter: "blur(3px)" }} />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-l from-black/80 to-transparent" />

            <div className="relative h-full flex items-end p-8" style={{ minHeight: 340 }}>
              <div className="w-full">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 mb-3 text-xs text-white/40">
                  <span onClick={() => router.push(`series?id=${episode.serieID}`)} className="cursor-pointer text-amber-400 underline">{episode.seriesTitle}</span>
                  <span>·</span>
                  <span>{TYPE_LABEL[episode.seriesType] || ""}</span>
                  <span>·</span>
                  <span>{episode.seasonTitle}</span>
                  <span>·</span>
                  <span className="text-amber-400/80">الحلقة {episode.number}</span>
                </div>

                <h1
                  className="text-white text-3xl md:text-4xl font-black mb-4 leading-tight"
                  style={{ fontFamily: "'Cairo', sans-serif", textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}
                >
                  {episode.title}
                </h1>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      if (!userID) {
                        setAuthPrompt(true);
                      } else {
                        setRatingModal(true);
                      }
                    }}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black px-5 py-2.5 rounded-xl transition-all hover:scale-105 shadow-xl shadow-amber-500/30 text-sm"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    {userRating ? (
                      <><Edit2 size={14} /> تعديل تقييمك ({userRating.rating}/10)</>
                    ) : (
                      <><Star size={14} className="fill-black" /> قيّم على الحلقة</>
                    )}
                  </button>
                  {userRating && (
                    <span className="text-emerald-400 text-xs flex items-center gap-1">
                      <Check size={12} /> ديجا قيمتي على هاذ الحلقة
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── RATING CARD ── */}
          <div className={`rounded-3xl border mb-6 overflow-hidden ${dark ? "bg-white/3 border-white/6" : "bg-white border-gray-100 shadow-sm"
            }`}>
            {/* Big rating */}
            <BigRating rating={episode.rating || 0} total={total} dark={dark} />

            {/* Divider */}
            <div className={`h-px mx-6 ${dark ? "bg-white/6" : "bg-gray-100"}`} />

            {/* Distribution chart */}
            <div className="pt-5">
              <div className="flex items-center gap-2 px-6 mb-4">
                <BarChart2 size={15} className="text-amber-400" />
                <h3 className="font-black text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  توزيع التقييمات
                </h3>
              </div>
              <DistributionChart distribution={distribution} total={total} dark={dark} />
            </div>
          </div>

          {/* ── REVIEWS ── */}
          <div className={`rounded-3xl border ${dark ? "bg-white/3 border-white/6" : "bg-white border-gray-100 shadow-sm"
            }`}>
            <div className={`flex items-center justify-between flex-wrap gap-4 px-6 py-4 border-b ${dark ? "border-white/6" : "border-gray-100"}`}>
              <div className="flex items-center gap-2">
                <MessageCircle size={15} className="text-amber-400" />
                <h3 className="font-black text-base" style={{ fontFamily: "'Cairo', sans-serif" }}>
                  تقييمات بنادم
                </h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${dark ? "bg-amber-500/15 text-amber-400" : "bg-amber-100 text-amber-700"
                  }`}>
                  {reviews.length}
                </span>
              </div>

              {/* rating filter */}
              <div className="relative">
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className={`flex items-center gap-2 text-sm font-semibold px-3.5 py-2 rounded-xl border transition-all ${ratingFilter
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                    : dark
                      ? "bg-white/5 border-white/10 hover:border-white/20"
                      : "bg-gray-50 border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <Star size={13} className={ratingFilter ? "fill-amber-400 text-amber-400" : ""} />
                  <span>{ratingFilter ? `تقييم ${ratingFilter}` : "كل التقييمات"}</span>
                  <ChevronDown size={13} className={`transition-transform ${filterOpen ? "rotate-180" : ""}`} />
                </button>
                {filterOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
                    <div className={`grid grid-cols-2 absolute right-0 md:left-0 top-full mt-2 w-52 rounded-xl border overflow-hidden shadow-2xl z-50 ${dark ? "bg-zinc-900 border-white/10" : "bg-white border-gray-200"
                      }`}>
                      <button
                        onClick={() => { setRatingFilter(null); setFilterOpen(false); }}
                        className={`w-full col-span-2 text-right px-4 py-2.5 text-sm transition-colors ${!ratingFilter ? "text-amber-400 font-bold" : dark ? "hover:bg-white/5" : "hover:bg-gray-50"
                          }`}
                      >
                        كل التقييمات
                      </button>
                      {Array.from({ length: 10 }, (_, i) => 10 - i).map((rating) => {
                        const { text } = rating_COLOR(rating);
                        const count = distribution.find((d) => Number(d.rating) === rating)?.count || 0;
                        return (
                          <button
                            key={rating}
                            onClick={() => { setRatingFilter(rating); setFilterOpen(false); }}
                            className={`w-full text-right px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${ratingFilter === rating ? "text-amber-400 font-bold" : dark ? "hover:bg-white/5" : "hover:bg-gray-50"
                              }`}
                          >
                            <span>تقييم {rating}</span>
                            <span className={`text-xs font-bold ${text}`}>({count})</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 space-y-2">
              {filteredReviews.length === 0 ? (
                <div className="flex flex-col items-center py-12 gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${dark ? "bg-white/5" : "bg-gray-100"}`}>
                    <MessageCircle size={24} className={dark ? "text-zinc-700" : "text-gray-300"} />
                  </div>
                  <p className={`text-sm font-bold ${dark ? "text-zinc-500" : "text-gray-400"}`}>
                    {ratingFilter ? `لا توجد تقييمات بـ ${ratingFilter}` : "لا توجد تقييمات بعد"}
                  </p>
                  {!userRating && (
                    <button
                      onClick={() => setRatingModal(true)}
                      className="text-amber-500 text-sm hover:underline font-semibold"
                    >
                      كن أول من يقيّم!
                    </button>
                  )}
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    dark={dark}
                    isOwn={review.userID === userID}
                  />
                ))
              )}
            </div>
          </div>

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
      `}</style>
    </>
  );
}

export async function getServerSideProps({ req, res }) {
  const user = verifyAuth(req, res);

  if (!user) {
    return {
      props: { session: null },
    };
  }

  return {
    props: { session: { id: user.id, name: user.name, email: user.email } },
  };
}