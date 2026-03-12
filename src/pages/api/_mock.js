import pool from "./_connect";

const users = [
  { id: 201, name: "AnimeHunter", email: "bot201@bot.bot", password: "pass201" },
  { id: 202, name: "DarkWeeb", email: "bot202@bot.bot", password: "pass202" },
  { id: 203, name: "TitanRider", email: "bot203@bot.bot", password: "pass203" },
  { id: 204, name: "OtakuStorm", email: "bot204@bot.bot", password: "pass204" },
  { id: 205, name: "AnimeKnightX", email: "bot205@bot.bot", password: "pass205" },
  { id: 206, name: "ShadowWeeb", email: "bot206@bot.bot", password: "pass206" },
  { id: 207, name: "TitanLegend", email: "bot207@bot.bot", password: "pass207" },
  { id: 208, name: "EpicOtaku", email: "bot208@bot.bot", password: "pass208" },
  { id: 209, name: "AnimeRogue", email: "bot209@bot.bot", password: "pass209" },
  { id: 210, name: "NightSamurai", email: "bot210@bot.bot", password: "pass210" },

  { id: 211, name: "ملك الأنمي 2", email: "bot211@bot.bot", password: "pass211" },
  { id: 212, name: "قاتل التايتنز", email: "bot212@bot.bot", password: "pass212" },
  { id: 213, name: "عاشق الأنمي", email: "bot213@bot.bot", password: "pass213" },
  { id: 214, name: "ظل الأنمي", email: "bot214@bot.bot", password: "pass214" },
  { id: 215, name: "المحارب الخفي", email: "bot215@bot.bot", password: "pass215" },
  { id: 216, name: "نينجا الأنمي", email: "bot216@bot.bot", password: "pass216" },
  { id: 217, name: "أوتاكو العرب", email: "bot217@bot.bot", password: "pass217" },
  { id: 218, name: "ملك التايتنز", email: "bot218@bot.bot", password: "pass218" },
  { id: 219, name: "ظل الحلقات", email: "bot219@bot.bot", password: "pass219" },
  { id: 220, name: "نجم الأنمي", email: "bot220@bot.bot", password: "pass220" },

  { id: 221, name: "WeebMaster", email: "bot221@bot.bot", password: "pass221" },
  { id: 222, name: "TitanKnight", email: "bot222@bot.bot", password: "pass222" },
  { id: 223, name: "AnimeCommander", email: "bot223@bot.bot", password: "pass223" },
  { id: 224, name: "OtakuWarlord", email: "bot224@bot.bot", password: "pass224" },
  { id: 225, name: "DarkWatcher", email: "bot225@bot.bot", password: "pass225" },
  { id: 226, name: "AnimeHero", email: "bot226@bot.bot", password: "pass226" },
  { id: 227, name: "ShadowHero", email: "bot227@bot.bot", password: "pass227" },
  { id: 228, name: "TitanOracle", email: "bot228@bot.bot", password: "pass228" },
  { id: 229, name: "AnimeGhost", email: "bot229@bot.bot", password: "pass229" },
  { id: 230, name: "OtakuHunter", email: "bot230@bot.bot", password: "pass230" },

  { id: 231, name: "فارس التايتنز", email: "bot231@bot.bot", password: "pass231" },
  { id: 232, name: "ملك الأنمي الجديد", email: "bot232@bot.bot", password: "pass232" },
  { id: 233, name: "محارب الأنمي", email: "bot233@bot.bot", password: "pass233" },
  { id: 234, name: "مستكشف الحلقات", email: "bot234@bot.bot", password: "pass234" },
  { id: 235, name: "قائد التايتنز", email: "bot235@bot.bot", password: "pass235" },
  { id: 236, name: "سيد الأنمي", email: "bot236@bot.bot", password: "pass236" },
  { id: 237, name: "أمير الأنمي", email: "bot237@bot.bot", password: "pass237" },
  { id: 238, name: "ظل التايتنز", email: "bot238@bot.bot", password: "pass238" },
  { id: 239, name: "مقاتل الأنمي", email: "bot239@bot.bot", password: "pass239" },
  { id: 240, name: "نجم الحلقات", email: "bot240@bot.bot", password: "pass240" },

  { id: 241, name: "AnimeLegendX", email: "bot241@bot.bot", password: "pass241" },
  { id: 242, name: "TitanOverlord", email: "bot242@bot.bot", password: "pass242" },
  { id: 243, name: "WeebPhantom", email: "bot243@bot.bot", password: "pass243" },
  { id: 244, name: "AnimeKingX", email: "bot244@bot.bot", password: "pass244" },
  { id: 245, name: "DarkOtakuX", email: "bot245@bot.bot", password: "pass245" },
  { id: 246, name: "ShadowCommander", email: "bot246@bot.bot", password: "pass246" },
  { id: 247, name: "TitanSpecter", email: "bot247@bot.bot", password: "pass247" },
  { id: 248, name: "AnimeSultan", email: "bot248@bot.bot", password: "pass248" },
  { id: 249, name: "OtakuLegendX", email: "bot249@bot.bot", password: "pass249" },
  { id: 250, name: "NightTitan", email: "bot250@bot.bot", password: "pass250" },

  { id: 251, name: "ملك الأنمي الأخير", email: "bot251@bot.bot", password: "pass251" },
  { id: 252, name: "فارس الظلام", email: "bot252@bot.bot", password: "pass252" },
  { id: 253, name: "محب الحلقات", email: "bot253@bot.bot", password: "pass253" },
  { id: 254, name: "مستكشف التايتنز", email: "bot254@bot.bot", password: "pass254" },
  { id: 255, name: "أوتاكو الأسطورة", email: "bot255@bot.bot", password: "pass255" },
  { id: 256, name: "نينجا الأنمي", email: "bot256@bot.bot", password: "pass256" },
  { id: 257, name: "ملك الأنمي العظيم", email: "bot257@bot.bot", password: "pass257" },
  { id: 258, name: "الظل النهائي", email: "bot258@bot.bot", password: "pass258" },
  { id: 259, name: "قاهر الحلقات", email: "bot259@bot.bot", password: "pass259" },
  { id: 260, name: "سيد التايتنز", email: "bot260@bot.bot", password: "pass260" }
];

const reviews = [
  { rating: 10, feedback: "absolute peak 🔥" },
  { rating: 9, feedback: "insane episode" },
  { rating: 8, feedback: "really good" },
  { rating: 10, feedback: "GOAT episode 🐐" },
  { rating: 9, feedback: "crazy ending" },
  { rating: 8, feedback: "solid episode" },
  { rating: 10, feedback: "perfect" },
  { rating: 9, feedback: "amazing ngl" },
  { rating: 8, feedback: "" },
  { rating: 10, feedback: "peak fiction" },
  { rating: 9, feedback: "that twist 😱" },
  { rating: 8, feedback: "really enjoyed it" },

  { rating: 10, feedback: "زوينة بزاف 🔥" },
  { rating: 9, feedback: "نهاية خرافية" },
  { rating: 8, feedback: "مزيانة" },
  { rating: 10, feedback: "أسطورية 🐐" },
  { rating: 9, feedback: "ماشي معقول" },
  { rating: 8, feedback: "" },
  { rating: 10, feedback: "أحسن حلقة" },
  { rating: 9, feedback: "بزاف هادي" },
  { rating: 8, feedback: "نادية" },
  { rating: 10, feedback: "مجنونة الحلقة" },
  { rating: 9, feedback: "هاد المشهد 🔥" },
  { rating: 8, feedback: "مزيانة بصح" },

  { rating: 10, feedback: "goosebumps" },
  { rating: 9, feedback: "crazy good" },
  { rating: 8, feedback: "" },
  { rating: 10, feedback: "masterpiece" },
  { rating: 9, feedback: "really epic" },
  { rating: 8, feedback: "pretty great" },

  { rating: 10, feedback: "ويلي 🔥" },
  { rating: 9, feedback: "توب تير" },
  { rating: 8, feedback: "" },
  { rating: 10, feedback: "أسطوري" },
  { rating: 9, feedback: "بغيت نبكي 😭" },
  { rating: 8, feedback: "كتمشي" },

  { rating: 10, feedback: "legendary" },
  { rating: 9, feedback: "super hype" },
  { rating: 8, feedback: "" },
  { rating: 10, feedback: "peak anime" },
  { rating: 9, feedback: "crazy episode" },
  { rating: 8, feedback: "nice one" },
  { rating: 10, feedback: "unbelievable episode 🔥" },
  { rating: 9, feedback: "so good" },
  { rating: 8, feedback: "loved it" },
  { rating: 10, feedback: "best ever" },
  { rating: 9, feedback: "insane" },
  { rating: 8, feedback: "great" },
  { rating: 10, feedback: "perfection" },
  { rating: 9, feedback: "amazing" },
  { rating: 8, feedback: "solid" },
  { rating: 10, feedback: "peak" },
  { rating: 9, feedback: "wow" },
  { rating: 8, feedback: "nice" },

  { rating: 10, feedback: "مجنونة الحلقة 🔥" },
  { rating: 9, feedback: "ممتازة" },
  { rating: 8, feedback: "مزيانة" },
  { rating: 10, feedback: "أسطورية" },
  { rating: 9, feedback: "توب تير" },
  { rating: 8, feedback: "كتمشي" },
  { rating: 10, feedback: "ممتازة بزاف" },
  { rating: 9, feedback: "ماشي معقول" },
  { rating: 8, feedback: "نادية" },
  { rating: 10, feedback: "مجنونة" },
  { rating: 9, feedback: "هاد المشهد 🔥" },
  { rating: 8, feedback: "مزيانة بصح" },

  { rating: 10, feedback: "mind-blowing" },
  { rating: 9, feedback: "so epic" },
  { rating: 8, feedback: "good" },
  { rating: 10, feedback: "legendary" },
  { rating: 9, feedback: "crazy" },
  { rating: 8, feedback: "nice" },
  { rating: 10, feedback: "perfect" },
  { rating: 9, feedback: "amazing" },
  { rating: 8, feedback: "solid" },
  { rating: 10, feedback: "peak" },
  { rating: 9, feedback: "wow" },
  { rating: 8, feedback: "great" },

  { rating: 10, feedback: "مجنونة الحلقة 🔥" },
  { rating: 9, feedback: "ممتازة" },
  { rating: 8, feedback: "مزيانة" },
  { rating: 10, feedback: "أسطورية" },
  { rating: 9, feedback: "توب تير" },
  { rating: 8, feedback: "كتمشي" },
  { rating: 10, feedback: "ممتازة بزاف" },
  { rating: 9, feedback: "ماشي معقول" },
  { rating: 8, feedback: "نادية" },
  { rating: 10, feedback: "مجنونة" },
  { rating: 9, feedback: "هاد المشهد 🔥" },
  { rating: 8, feedback: "مزيانة بصح" },

  { rating: 10, feedback: "unreal" },
  { rating: 9, feedback: "so good" },
  { rating: 8, feedback: "loved it" },
  { rating: 10, feedback: "best ever" },
  { rating: 9, feedback: "insane" },
  { rating: 8, feedback: "great" },
  { rating: 10, feedback: "perfection" },
  { rating: 9, feedback: "amazing" },
  { rating: 8, feedback: "solid" },
  { rating: 10, feedback: "peak" },
  { rating: 9, feedback: "wow" },
  { rating: 8, feedback: "nice" }
];

const targetEpisodes = [
  "Ozymandias",
  "Felina",
  "Face Off",
  "Battle of the Bastards",
  "The Rains of Castamere",
  "The Winds of Winter",
  "Hardhome",
];

const targetSeries = [
  "Attack on Titan",
  "Breaking Bad",
  "Game of Thrones",
  "Mr. Robot",
  "Hannibal",
  "Vinland Saga"
];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function ratingNear99() {
  return Math.random() < 0.95 ? 10 : 9;
}

export default async function handler(req, res) {

  if (req.method !== "GET") return res.status(405).end();

  const conn = await pool.getConnection();

  for (const u of users) {
    await conn.query(
      `INSERT IGNORE INTO users (id,name,email,password)
     VALUES (?,?,?,?)`,
      [u.id, u.name, u.email, u.password]
    );
  }

  try {

    const [episodes] = await conn.query(`
      SELECT e.id,e.title
      FROM episodes e
      JOIN seasons ss ON ss.id=e.seasonID
      JOIN series s ON s.id=ss.serieID
      WHERE s.title IN (${targetSeries.map(() => "?").join(",")})
      AND e.title IN (${targetEpisodes.map(() => "?").join(",")})
    `, [...targetSeries, ...targetEpisodes]);

    console.log("Episodes found:", episodes.length);

    let totalRatings = 0;

    for (const ep of episodes) {

      const reviewCount = randInt(40, 60);
      const usedUsers = new Set();

      for (let i = 0; i < reviewCount; i++) {

        let user;
        do {
          user = rand(users);
        } while (usedUsers.has(user.id));

        usedUsers.add(user.id);

        const review = rand(reviews);

        await conn.query(`
          INSERT INTO ratingep (userID,episodeID,rating,feedback)
          VALUES (?,?,?,?)
          ON DUPLICATE KEY UPDATE rating=VALUES(rating),feedback=VALUES(feedback)
        `, [
          user.id,
          ep.id,
          ratingNear99(),
          review.feedback
        ]);

        totalRatings++;

      }

      console.log(`Episode done: ${ep.title}`);

      await conn.query(
        `UPDATE episodes e
JOIN (
    SELECT episodeID, ROUND(AVG(rating),1) AS avg_rating
    FROM ratingep
    GROUP BY episodeID
) r ON r.episodeID = e.id
SET e.rating = r.avg_rating;
UPDATE series s
JOIN (
    SELECT ss.serieID, ROUND(AVG(e.rating),1) AS avg_rating
    FROM seasons ss
    JOIN episodes e ON e.seasonID = ss.id
    GROUP BY ss.serieID
) t ON t.serieID = s.id
SET s.rating = t.avg_rating;`,
      );

    }

    conn.release();

    res.json({
      success: true,
      episodesSeeded: episodes.length,
      ratingsInserted: totalRatings,
      targetAverage: "≈9.9"
    });

  } catch (e) {

    conn.release();
    res.status(500).json({ error: e.message });

  }

}