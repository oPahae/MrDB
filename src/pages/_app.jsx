import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function MyApp({ Component, pageProps }) {
  const [dark, setDark] = useState(true);
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/_auth/session")
      .then(res => res.json())
      .then(data => setSession(data.session));
    const stored = localStorage.getItem('theme')
    if(stored === 'light') setDark(false)
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark]);

  return (
    <>
      {!router.pathname.includes("login") &&
        !router.pathname.includes("register") && (
          <Header dark={dark} setDark={setDark} session={session} />
        )}

      <Component {...pageProps} dark={dark} session={session} />

      {!router.pathname.includes("login") &&
        !router.pathname.includes("register") && (
          <Footer dark={dark} />
        )}
    </>
  );
}