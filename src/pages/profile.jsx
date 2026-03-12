import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  User, Mail, Lock, Trash2, Heart, ArrowRight,
  Save, Eye, EyeOff, AlertCircle, CheckCircle2,
  Loader2, Star, Tv, Clock, CheckCircle, LogOut,
} from "lucide-react";
import NextLink from "next/link";
import { verifyAuth } from "@/middlewares/user";

// ─── Server-side auth ─────────────────────────────────────────────────────────

export async function getServerSideProps({ req, res }) {
  const user = verifyAuth(req, res);
  if (!user) return { redirect: { destination: "/login", permanent: false } };
  return { props: { session: { id: user.id, name: user.name, email: user.email } } };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  const map = {
    anime:  { label: "أنيمي", emoji: "🎌", cls: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
    series: { label: "سيري", emoji: "📺", cls: "bg-sky-500/15 text-sky-400 border-sky-500/20" },
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

function Alert({ type, msg }) {
  if (!msg) return null;
  const isErr = type === "error";
  return (
    <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border ${
      isErr
        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
    }`}>
      {isErr ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
      {msg}
    </div>
  );
}

function SectionCard({ icon, title, children, dark }) {
  return (
    <div className={`rounded-3xl border p-6 space-y-5 ${
      dark ? "bg-white/[0.03] border-white/8" : "bg-white border-gray-100 shadow-sm"
    }`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <h2 className="text-base font-black" style={{ fontFamily: "'Cairo', sans-serif" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function FieldInput({ label, type = "text", value, onChange, placeholder, dark, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className={`block text-xs font-bold ${dark ? "text-zinc-400" : "text-gray-500"}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all border ${
            children ? "pl-10" : ""
          } ${
            dark
              ? "bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-amber-500/50"
              : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-amber-400"
          }`}
        />
        {children && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2">{children}</span>
        )}
      </div>
    </div>
  );
}

function EyeToggle({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-zinc-500 hover:text-zinc-300 transition-colors"
    >
      {show ? <EyeOff size={14} /> : <Eye size={14} />}
    </button>
  );
}

function ActionBtn({ onClick, loading, icon, label, danger = false }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all disabled:opacity-50 ${
        danger
          ? "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
          : "bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30"
      }`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}

// ─── Info Section ─────────────────────────────────────────────────────────────

function InfoSection({ session, onUpdate, dark }) {
  const [name, setName]   = useState(session.name);
  const [email, setEmail] = useState(session.email);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const save = async () => {
    if (!name.trim() || !email.trim())
      return setAlert({ type: "error", msg: "جميع الحقول مطلوبة" });
    setLoading(true); setAlert(null);
    try {
      const res = await fetch("/api/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: session.id, name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUpdate({ name, email });
      setAlert({ type: "success", msg: "تم تحديث البيانات بنجاح" });
    } catch (e) {
      setAlert({ type: "error", msg: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionCard icon={<User size={16} className="text-amber-400" />} title="المعلومات الشخصية" dark={dark}>
      <FieldInput label="الاسم" value={name} onChange={e => setName(e.target.value)} placeholder="اسمك" dark={dark} />
      <FieldInput label="البريد الإلكتروني" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" dark={dark} />
      <Alert {...(alert || {})} msg={alert?.msg} />
      <ActionBtn onClick={save} loading={loading} icon={<Save size={14} />} label="حفظ التغييرات" />
    </SectionCard>
  );
}

// ─── Password Section ─────────────────────────────────────────────────────────

function PasswordSection({ session, dark }) {
  const [current, setCurrent]   = useState("");
  const [next, setNext]         = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showCur, setShowCur]   = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [alert, setAlert]       = useState(null);

  const save = async () => {
    if (!current || !next || !confirm)
      return setAlert({ type: "error", msg: "جميع الحقول مطلوبة" });
    if (next !== confirm)
      return setAlert({ type: "error", msg: "كلمتا المرور غير متطابقتان" });
    setLoading(true); setAlert(null);
    try {
      const res = await fetch("/api/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: session.id, currentPassword: current, newPassword: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCurrent(""); setNext(""); setConfirm("");
      setAlert({ type: "success", msg: "تم تغيير كلمة المرور بنجاح" });
    } catch (e) {
      setAlert({ type: "error", msg: e.message });
    } finally {
      setLoading(false);
    }
  };

  const passClass = (dark) =>
    `w-full rounded-xl px-4 py-2.5 pl-10 text-sm outline-none transition-all border ${
      dark
        ? "bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-amber-500/50"
        : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-amber-400"
    }`;

  return (
    <SectionCard icon={<Lock size={16} className="text-amber-400" />} title="تغيير كلمة المرور" dark={dark}>
      {/* Current */}
      <div className="space-y-1.5">
        <label className={`block text-xs font-bold ${dark ? "text-zinc-400" : "text-gray-500"}`}>
          كلمة المرور الحالية
        </label>
        <div className="relative">
          <input type={showCur ? "text" : "password"} value={current}
            onChange={e => setCurrent(e.target.value)} placeholder="••••••••" className={passClass(dark)} />
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <EyeToggle show={showCur} onToggle={() => setShowCur(v => !v)} />
          </span>
        </div>
      </div>

      {/* New */}
      <div className="space-y-1.5">
        <label className={`block text-xs font-bold ${dark ? "text-zinc-400" : "text-gray-500"}`}>
          كلمة المرور الجديدة
        </label>
        <div className="relative">
          <input type={showNext ? "text" : "password"} value={next}
            onChange={e => setNext(e.target.value)} placeholder="••••••••" className={passClass(dark)} />
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <EyeToggle show={showNext} onToggle={() => setShowNext(v => !v)} />
          </span>
        </div>
      </div>

      {/* Confirm */}
      <FieldInput label="تأكيد كلمة المرور" type="password" value={confirm}
        onChange={e => setConfirm(e.target.value)} placeholder="••••••••" dark={dark} />

      <Alert {...(alert || {})} msg={alert?.msg} />
      <ActionBtn onClick={save} loading={loading} icon={<Lock size={14} />} label="تحديث كلمة المرور" />
    </SectionCard>
  );
}

// ─── Favorites Section ────────────────────────────────────────────────────────

function FavoritesSection({ session, dark }) {
  const router = useRouter();
  const [favs, setFavs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  const muted = dark ? "text-zinc-500" : "text-gray-400";
  const text  = dark ? "text-white"   : "text-gray-900";

  useEffect(() => {
    fetch(`/api/users/favorites?id=${session.id}`)
      .then(r => r.json())
      .then(d => setFavs(d.favorites || []))
      .finally(() => setLoading(false));
  }, [session.id]);

  const remove = async (seriesID) => {
    setRemoving(seriesID);
    try {
      await fetch("/api/users/unfavorite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID: session.id, seriesID }),
      });
      setFavs(prev => prev.filter(f => f.id !== seriesID));
    } finally {
      setRemoving(null);
    }
  };

  return (
    <SectionCard
      icon={<Heart size={16} className="text-amber-400" />}
      title={`المفضلة${!loading ? ` (${favs.length})` : ""}`}
      dark={dark}
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-amber-400" />
        </div>
      ) : favs.length === 0 ? (
        <div className="flex flex-col items-center py-8 gap-2">
          <Heart size={24} className={muted} />
          <p className={`text-sm ${muted}`}>لا توجد سيريات في المفضلة</p>
        </div>
      ) : (
        <div className="space-y-2">
          {favs.map(sr => (
            <div
              key={sr.favID}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 border transition-all ${
                dark
                  ? "bg-white/[0.02] border-white/6 hover:bg-white/[0.04]"
                  : "bg-gray-50 border-gray-100 hover:border-gray-200"
              }`}
            >
              <div
                className="w-10 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-900 cursor-pointer"
                onClick={() => router.push(`/series?id=${sr.id}`)}
              >
                {sr.img
                  ? <img src={sr.img} alt={sr.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Tv size={12} className="text-zinc-600" /></div>
                }
              </div>

              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/series?id=${sr.id}`)}>
                <p
                  className={`text-sm font-bold truncate hover:text-amber-400 transition-colors ${text}`}
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

              <button
                onClick={() => remove(sr.id)}
                disabled={removing === sr.id}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all disabled:opacity-50"
              >
                {removing === sr.id
                  ? <Loader2 size={13} className="animate-spin" />
                  : <Trash2 size={13} />
                }
              </button>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

// ─── Danger Section ───────────────────────────────────────────────────────────

function DangerSection({ session, dark }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [alert, setAlert]       = useState(null);

  const drop = async () => {
    if (!password) return setAlert({ type: "error", msg: "أدخل كلمة المرور للتأكيد" });
    setLoading(true); setAlert(null);
    try {
      const res = await fetch("/api/users/drop", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: session.id, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/");
    } catch (e) {
      setAlert({ type: "error", msg: e.message });
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-3xl border p-6 space-y-5 ${
      dark ? "bg-rose-500/[0.03] border-rose-500/10" : "bg-rose-50 border-rose-100"
    }`}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-500/15 flex items-center justify-center flex-shrink-0">
          <Trash2 size={16} className="text-rose-400" />
        </div>
        <h2 className="text-base font-black text-rose-400" style={{ fontFamily: "'Cairo', sans-serif" }}>
          منطقة الخطر
        </h2>
      </div>

      <p className={`text-sm ${dark ? "text-zinc-500" : "text-gray-400"}`}>
        سيُحذف حسابك بشكل نهائي مع جميع بياناتك وتقييماتك ومفضلتك. هذا الإجراء لا يمكن التراجع عنه.
      </p>

      {!confirmed ? (
        <button
          onClick={() => setConfirmed(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold hover:bg-rose-500/20 transition-all"
        >
          <Trash2 size={14} />حذف حسابي
        </button>
      ) : (
        <div className="space-y-3 p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5">
          <p className="text-sm font-bold text-rose-400">تأكيد الحذف — أدخل كلمة المرور</p>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-xl px-4 py-2.5 pl-10 text-sm outline-none transition-all border ${
                dark
                  ? "bg-white/5 border-rose-500/20 text-white placeholder-white/20 focus:border-rose-500/50"
                  : "bg-gray-50 border-rose-200 text-gray-900 placeholder-gray-400 focus:border-rose-400"
              }`}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <EyeToggle show={showPass} onToggle={() => setShowPass(v => !v)} />
            </span>
          </div>
          <Alert {...(alert || {})} msg={alert?.msg} />
          <div className="flex items-center gap-2">
            <ActionBtn onClick={drop} loading={loading} icon={<Trash2 size={14} />} label="تأكيد الحذف" danger />
            <button
              onClick={() => { setConfirmed(false); setPassword(""); setAlert(null); }}
              className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                dark
                  ? "border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Profile({ session, dark = true }) {
  const router = useRouter();
  // local copy so InfoSection can optimistically update displayed name/email
  const [localSession, setLocalSession] = useState(session);

  const bg    = dark ? "bg-[#080810]" : "bg-[#f4f1eb]";
  const text  = dark ? "text-white"   : "text-gray-900";
  const muted = dark ? "text-zinc-500" : "text-gray-400";

  const logout = () => router.push("/api/auth/logout"); // adapt to your logout route

  return (
    <>
      <Head>
        <title>الملف الشخصي — MrDB</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div dir="rtl" className={`pt-12 min-h-screen transition-colors duration-300 ${bg} ${text}`}
        style={{ fontFamily: "'Tajawal', sans-serif" }}>
        {dark && (
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-amber-500/4 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-violet-500/4 rounded-full blur-[100px]" />
          </div>
        )}

        <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">

          {/* ── Header ── */}
          <div>
            <NextLink href="/" className={`inline-flex items-center gap-2 text-xs mb-4 transition-colors ${
              dark ? "text-zinc-500 hover:text-zinc-300" : "text-gray-400 hover:text-gray-700"
            }`}>
              <ArrowRight size={13} />الرئيسية
            </NextLink>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-black text-amber-400" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {localSession.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <div>
                  <h1 className={`text-2xl font-black ${text}`} style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {localSession.name}
                  </h1>
                  <p className={`text-sm ${muted}`}>{localSession.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sections ── */}
          <InfoSection
            session={localSession}
            onUpdate={(data) => setLocalSession(prev => ({ ...prev, ...data }))}
            dark={dark}
          />
          <PasswordSection session={localSession} dark={dark} />
          <FavoritesSection session={localSession} dark={dark} />
          <DangerSection session={localSession} dark={dark} />

          <div className="h-16" />
        </div>
      </div>
    </>
  );
}