import { useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  LogIn,
} from "lucide-react";
import { verifyAuth } from "@/middlewares/user";

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

function Toast({ message, type }) {
  return (
    <div
      className={`fixed top-6 right-6 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-bold ${
        type === "success"
          ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
          : "bg-rose-500/20 border-rose-500/30 text-rose-400"
      }`}
    >
      {type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const setField = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "البريد الإلكتروني مطلوب";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "بريد إلكتروني غير صالح";
    if (!form.password) e.password = "كلمة المرور مطلوبة";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/_auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل تسجيل الدخول");
      showToast("مرحباً بك ✓");
      setTimeout(() => window.location.href = router.query.back ? `/episode?id=${router.query.back}` : "/", 1500);
    } catch (err) {
      showToast(err.message || "حدث خطأ ما", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const inputCls = (hasError) =>
    `w-full rounded-xl px-4 py-2.5 text-sm outline-none transition-all border bg-white/5 text-white placeholder-zinc-500 focus:bg-white/8 ${
      hasError
        ? "border-rose-500/50 focus:border-rose-500/70"
        : "border-white/10 focus:border-amber-500/50"
    }`;

  return (
    <>
      <Head>
        <title>تسجيل الدخول — MrDB</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      {toast && <Toast {...toast} />}

      <div
        dir="rtl"
        className="min-h-screen bg-[#080810] text-white flex items-center justify-center px-4 py-10"
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        {/* Ambient */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-amber-500/4 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-violet-500/4 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 mb-4 shadow-xl shadow-amber-500/25">
              <Sparkles size={24} className="text-black" />
            </div>
            <h1
              className="text-3xl font-black text-white"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              MrDB
            </h1>
            <p className="text-zinc-500 text-sm mt-1">مرحباً بعودتك</p>
          </div>

          {/* Card */}
          <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-8 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <LogIn size={15} className="text-amber-400" />
              <h2
                className="font-black text-base text-white"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                تسجيل الدخول
              </h2>
            </div>

            <Field label="البريد الإلكتروني" icon={Mail} error={errors.email}>
              <input
                type="email"
                className={inputCls(!!errors.email)}
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="example@email.com"
                dir="ltr"
              />
            </Field>

            <Field label="كلمة المرور" icon={Lock} error={errors.password}>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  className={inputCls(!!errors.password) + " pr-4 pl-10"}
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 text-black font-black py-3 rounded-2xl transition-all hover:scale-[1.02] shadow-xl shadow-amber-500/20 text-sm mt-2"
              style={{ fontFamily: "'Cairo', sans-serif" }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              {loading ? "جاري الدخول..." : "تسجيل الدخول"}
            </button>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex-1 h-px bg-white/6" />
              <span className="text-xs text-zinc-600">أو</span>
              <div className="flex-1 h-px bg-white/6" />
            </div>

            <p className="text-center text-sm text-zinc-500">
              ليس لديك حساب؟{" "}
              <NextLink
                href="/register"
                className="text-amber-400 font-bold hover:text-amber-300 transition-colors"
              >
                أنشئ حساباً
              </NextLink>
            </p>
          </div>

          <p className="text-center mt-6">
            <NextLink
              href="/"
              className="inline-flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <ArrowRight size={12} />
              العودة للرئيسية
            </NextLink>
          </p>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ req, res }) {
  const user = verifyAuth(req, res);

  if (user) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: { session: null },
  };
}