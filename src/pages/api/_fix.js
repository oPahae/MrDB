import pool from "./_connect";

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function isAnime(title) {
  try {
    const res = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=10`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        }
      }
    );

    if (!res.ok) return false;

    const json = await res.json();
    const target = normalize(title);

    for (const anime of json.data || []) {
      const titles = [
        anime.title,
        anime.title_english,
        ...(anime.title_synonyms || [])
      ].filter(Boolean);

      for (const t of titles) {
        if (normalize(t) === target) return true;
      }
    }

    return false;

  } catch (err) {
    console.log("❌ Jikan error for:", title);
    return false;
  }
}

export default async function handler(req, res) {

  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  try {

    console.log("🚀 Starting series type correction...");

    const [series] = await pool.query(
      "SELECT id, title FROM series"
    );

    console.log(`📦 ${series.length} series found`);

    let animeCount = 0;
    let serieCount = 0;
    let errors = 0;

    const results = [];

    let index = 1;

    for (const s of series) {

      console.log(`🔍 [${index}/${series.length}] : ${s.title}`);

      let type = "serie";

      try {

        const anime = await isAnime(s.title);

        if (anime) {
          type = "anime";
          animeCount++;
          console.log(`✅ Anime`);
        } else {
          serieCount++;
          console.log(`❌ Serie`);
        }

        await pool.query(
          "UPDATE series SET type=? WHERE id=?",
          [type, s.id]
        );

      } catch (err) {
        errors++;
        console.log(`❌ Error processing: ${s.title}`);
      }

      results.push({
        id: s.id,
        title: s.title,
        type
      });

      index++;

      // éviter rate limit
      await new Promise(r => setTimeout(r, 400));
    }

    console.log("🏁 Processing finished");
    console.log(`🎌 Anime: ${animeCount}`);
    console.log(`📺 Series: ${serieCount}`);
    console.log(`⚠️ Errors: ${errors}`);

    return res.status(200).json({
      total: series.length,
      anime: animeCount,
      series: serieCount,
      errors,
      results
    });

  } catch (err) {

    console.log("❌ API crash:", err.message);

    return res.status(500).json({
      error: err.message
    });

  }
}