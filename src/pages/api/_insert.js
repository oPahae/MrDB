// /api/_insert.js
// Uses Jikan API v4 (jikan.moe) — free, no key, MAL data
// Fixes: franchise grouping via relations graph + fuzzy title matching

import pool from './_connect';

const JIKAN_BASE = 'https://api.jikan.moe/v4';
const DELAY_MS = 600;
const MAX_RETRIES = 5;

// ─── Fetch helpers ────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function jikanFetch(path, retries = 0) {
  const url = `${JIKAN_BASE}${path}`;
  try {
    const res = await fetch(url);
    if (res.status === 429) {
      const wait = Math.pow(2, retries) * 1200 + Math.random() * 600;
      process.stdout.write(`\n  ⏳ Rate limited — waiting ${(wait / 1000).toFixed(1)}s…`);
      await sleep(wait);
      return jikanFetch(path, retries + 1);
    }
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`HTTP ${res.status}`);
    }
    const json = await res.json();
    await sleep(DELAY_MS);
    return json;
  } catch (err) {
    if (retries < MAX_RETRIES) {
      await sleep(Math.pow(2, retries) * 1000);
      return jikanFetch(path, retries + 1);
    }
    return null;
  }
}

async function fetchAllEpisodes(malId) {
  const episodes = [];
  let page = 1;
  while (true) {
    const data = await jikanFetch(`/anime/${malId}/episodes?page=${page}`);
    if (!data?.data?.length) break;
    episodes.push(...data.data);
    if (!data.pagination?.has_next_page) break;
    page++;
  }
  return episodes;
}

// Fetch relations to find all sequels/prequels
async function fetchRelatedAnimeIds(malId) {
  const data = await jikanFetch(`/anime/${malId}/relations`);
  if (!data?.data) return new Set();
  const related = new Set();
  for (const rel of data.data) {
    const type = rel.relation?.toLowerCase();
    if (['sequel', 'prequel', 'alternative version', 'alternative setting', 'spin-off'].includes(type)) {
      for (const entry of rel.entry) {
        if (entry.type === 'anime') related.add(entry.mal_id);
      }
    }
  }
  return related;
}

// ─── Title utilities ──────────────────────────────────────────────────────────

function getEnglishTitle(titles = [], fallback = '') {
  return (
    titles.find((t) => t.type === 'English')?.title ||
    titles.find((t) => t.type === 'Default')?.title ||
    fallback
  );
}

/**
 * Aggressively normalize a title for comparison:
 * removes special chars (', °, :), sequel keywords, numbers, extra spaces
 */
function normalizeForGrouping(title = '') {
  return title
    .toLowerCase()
    .replace(/[''`´°!?:,.\-–—]/g, ' ')
    .replace(/\b(season|part|cour|chapter|arc|final|the|last|attack|version|special|ova|movie|film|gekijouban)\b/gi, ' ')
    .replace(/\b\d+(st|nd|rd|th)?\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function similarity(a, b) {
  if (!a || !b) return 0;
  const na = normalizeForGrouping(a);
  const nb = normalizeForGrouping(b);
  if (na === nb) return 1;
  if (na.startsWith(nb) || nb.startsWith(na)) return 0.95;
  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return maxLen === 0 ? 1 : 1 - dist / maxLen;
}

const SIMILARITY_THRESHOLD = 0.72;

// ─── Progress bar ─────────────────────────────────────────────────────────────

function printProgress(current, total, label = '') {
  const pct = Math.round((current / total) * 100);
  const filled = Math.round(pct / 2);
  const bar = '█'.repeat(filled) + '░'.repeat(50 - filled);
  const truncated = label.length > 35 ? label.slice(0, 32) + '…' : label.padEnd(35);
  process.stdout.write(`\r  [${bar}] ${String(pct).padStart(3)}%  (${current}/${total})  ${truncated}`);
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  return;
  const conn = await pool.getConnection();

  try {
    // ── Step 1: Fetch anime list ────────────────────────────────────────────
    const PAGE_LIMIT = 5; // 5 × 25 = 125 animes. Increase as needed.
    console.log('\n🚀 Fetching anime list…\n');

    let allAnime = [];
    for (let p = 1; p <= PAGE_LIMIT; p++) {
      const data = await jikanFetch(`/top/anime?page=${p}&limit=25`);
      if (!data?.data?.length) break;
      allAnime.push(...data.data);
      process.stdout.write(`\r  Page ${p}/${PAGE_LIMIT} → ${allAnime.length} animes`);
    }
    console.log(`\n✅ ${allAnime.length} animes to process.\n`);

    // ── Step 2: Build relations graph ───────────────────────────────────────
    console.log('🔗 Building relations graph (sequel/prequel links)…\n');
    const relationsMap = new Map();
    for (let i = 0; i < allAnime.length; i++) {
      const anime = allAnime[i];
      printProgress(i + 1, allAnime.length, anime.title);
      const related = await fetchRelatedAnimeIds(anime.mal_id);
      relationsMap.set(anime.mal_id, related);
    }
    console.log('\n✅ Relations graph built.\n');

    // ── Step 3: Union-Find clustering ───────────────────────────────────────
    const malIds = allAnime.map((a) => a.mal_id);
    const malIdSet = new Set(malIds);
    const parent = new Map(malIds.map((id) => [id, id]));

    function find(x) {
      if (parent.get(x) !== x) parent.set(x, find(parent.get(x)));
      return parent.get(x);
    }
    function union(x, y) {
      const px = find(x), py = find(y);
      if (px !== py) parent.set(px, py);
    }

    // Union by explicit Jikan relations
    for (const [malId, related] of relationsMap) {
      for (const relId of related) {
        if (malIdSet.has(relId)) union(malId, relId);
      }
    }

    // Union by fuzzy title similarity (catches Gintama', Gintama°, etc.)
    for (let i = 0; i < allAnime.length; i++) {
      const titleI = getEnglishTitle(allAnime[i].titles, allAnime[i].title);
      for (let j = i + 1; j < allAnime.length; j++) {
        const titleJ = getEnglishTitle(allAnime[j].titles, allAnime[j].title);
        if (similarity(titleI, titleJ) >= SIMILARITY_THRESHOLD) {
          union(allAnime[i].mal_id, allAnime[j].mal_id);
        }
      }
    }

    // Group by cluster root, sort chronologically
    const clusters = new Map();
    for (const anime of allAnime) {
      const root = find(anime.mal_id);
      if (!clusters.has(root)) clusters.set(root, []);
      clusters.get(root).push(anime);
    }
    for (const group of clusters.values()) {
      group.sort((a, b) => {
        const da = a.aired?.from ? new Date(a.aired.from) : new Date(0);
        const db = b.aired?.from ? new Date(b.aired.from) : new Date(0);
        return da - db;
      });
    }

    console.log(`📦 ${clusters.size} franchises from ${allAnime.length} animes.\n`);
    console.log('💾 Inserting into database…\n');

    // ── Step 4: Insert ──────────────────────────────────────────────────────
    await conn.beginTransaction();

    let doneAnimes = 0;
    const stats = { series: 0, updated: 0, skipped: 0, seasons: 0, episodes: 0 };

    for (const [, group] of clusters) {
      const rep = group[0];
      const seriesTitle = getEnglishTitle(rep.titles, rep.title);
      const imgUrl = rep.images?.jpg?.large_image_url || rep.images?.jpg?.image_url || null;
      const trailer = rep.trailer?.url || null;
      const descr = rep.synopsis || null;
      const maker = rep.studios?.map((s) => s.name).join(', ') || null;
      const rating = parseFloat(rep.score) || 0;
      const startDate = rep.aired?.from?.slice(0, 10) || null;
      const endDate = group[group.length - 1].aired?.to?.slice(0, 10) || null;
      const finished = group.every((a) => a.status === 'Finished Airing');

      // ── Check if series already exists by title ─────────────────────────
      const [existing] = await conn.execute(
        `SELECT id, type FROM series WHERE title = ? LIMIT 1`,
        [seriesTitle]
      );

      let seriesDbId;

      if (existing.length > 0) {
        // Series already exists — update type to 'anime' if needed, skip re-insert
        seriesDbId = existing[0].id;
        if (existing[0].type !== 'anime') {
          await conn.execute(
            `UPDATE series SET type = 'anime' WHERE id = ?`,
            [seriesDbId]
          );
          process.stdout.write(`\n  ♻️  Updated type → anime: ${seriesTitle}`);
          stats.updated++;
        } else {
          process.stdout.write(`\n  ⏭️  Already exists, skipped: ${seriesTitle}`);
          stats.skipped++;
        }
        doneAnimes += group.length;
        printProgress(doneAnimes, allAnime.length, seriesTitle);
        continue; // Skip seasons & episodes insertion for existing series
      } else {
        // New series — insert it
        const [srResult] = await conn.execute(
          `INSERT INTO series (title, img, trailer, descr, finished, type, start, end, maker, rating)
           VALUES (?, ?, ?, ?, ?, 'anime', ?, ?, ?, ?)`,
          [seriesTitle, imgUrl, trailer, descr, finished, startDate, endDate, maker, rating]
        );
        seriesDbId = srResult.insertId;
        stats.series++;
      }

      for (let s = 0; s < group.length; s++) {
        const anime = group[s];
        const seasonTitle = getEnglishTitle(anime.titles, anime.title);

        printProgress(++doneAnimes, allAnime.length, `${seriesTitle} → S${s + 1}`);

        const [snResult] = await conn.execute(
          `INSERT INTO seasons (serieID, title, number) VALUES (?, ?, ?)`,
          [seriesDbId, seasonTitle, s + 1]
        );
        const seasonDbId = snResult.insertId;
        stats.seasons++;

        let episodes = [];
        try {
          episodes = await fetchAllEpisodes(anime.mal_id);
        } catch (e) {
          process.stdout.write(`\n  ⚠️  Episodes failed: ${seasonTitle}`);
        }

        for (let epIdx = 0; epIdx < episodes.length; epIdx++) {
          const ep = episodes[epIdx];

          // episode_id can be undefined on some Jikan responses — fall back to array index
          const epNumber = ep.episode_id ?? ep.mal_id ?? (epIdx + 1);

          const epTitle = (() => {
            if (ep.titles?.length) {
              const ar = ep.titles.find((t) => t.type === 'Arabic')?.title;
              if (ar) return ar;
              const en = ep.titles.find((t) => t.type === 'English')?.title;
              if (en) return en;
            }
            // Only use ep.title if it looks Latin (not romanji/Japanese)
            if (ep.title && /^[a-zA-Z0-9 .,!?'\-]+$/.test(ep.title)) return ep.title;
            return `Episode ${epNumber}`;
          })();

          const epImg   = ep.images?.jpg?.image_url ?? null;
          const epScore = (ep.score != null && !isNaN(parseFloat(ep.score))) ? parseFloat(ep.score) : 0;

          await conn.execute(
            `INSERT INTO episodes (seasonID, number, title, img, rating) VALUES (?, ?, ?, ?, ?)`,
            [seasonDbId, epNumber, epTitle, epImg, epScore]
          );
          stats.episodes++;
        }
      }
    }

    await conn.commit();

    console.log('\n\n✅ Import complete!');
    console.log(`   📺 Series inserted : ${stats.series}`);
    console.log(`   ♻️  Series updated  : ${stats.updated}`);
    console.log(`   ⏭️  Series skipped  : ${stats.skipped}`);
    console.log(`   🎬 Seasons         : ${stats.seasons}`);
    console.log(`   📝 Episodes        : ${stats.episodes}\n`);

    return res.status(200).json({ success: true, stats });
  } catch (err) {
    await conn.rollback();
    console.error('\n❌ Import failed:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
}