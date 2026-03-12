import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function MyApp({ Component, pageProps }) {
  const [dark, setDark] = useState(true);
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/_auth/session")
      .then(res => res.json())
      .then(data => setSession(data.session));

    const stored = localStorage.getItem("theme");
    if (stored === "light") setDark(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <>
      <Head>
        <title>MrDB - Anime & Series Ratings</title>
        <meta name="description" content="Rate and discover your favorite anime and series on MrDB. Join a community of fans and explore ratings, reviews, and top picks." />
        <meta name="keywords" content="anime ratings, series ratings, anime reviews, TV shows, MrDB, top anime, top series" />
        <meta name="author" content="MrDB" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content="MrDB - Anime & Series Ratings" />
        <meta property="og:description" content="Rate and discover your favorite anime and series on MrDB. Join a community of fans and explore ratings, reviews, and top picks." />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.mrdb.com" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MrDB - Anime & Series Ratings" />
        <meta name="twitter:description" content="Rate and discover your favorite anime and series on MrDB. Join a community of fans and explore ratings, reviews, and top picks." />
        <meta name="twitter:image" content="/logo.png" />

        {/* Favicon / Logo */}
        <link rel="icon" href="/logo.png" type="image/png" />
      </Head>

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
