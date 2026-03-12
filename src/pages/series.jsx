import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Star, Film, Layers, Sparkles, ArrowRight, ArrowLeft,
  Play, Trophy, Crown, ChevronDown, Heart, ImageIcon, Loader2,
} from "lucide-react";
import { verifyAuth } from "@/middlewares/user";

const TYPE_LABEL = {
  anime: "أنيم", series: "سيري", kdrama: "دراما كورية", other: "أخرى",
};

// ─── Color system ─────────────────────────────────────────────────────────────

function getRatingColor(r) {
  const v = parseFloat(r);
  if (!v || v === 0) return { hex: "#1e1e2e", border: "#3f3f5a", text: "#6b6b8a", label: "غير مقيّم", range: "—" };
  if (v >= 9) return { hex: "#0d2137", border: "#2563eb", text: "#60a5fa", label: "ممتاز جداً", range: "9–10" };
  if (v >= 8) return { hex: "#0d2318", border: "#16a34a", text: "#4ade80", label: "ممتاز", range: "8–9" };
  if (v >= 7) return { hex: "#2a1a0a", border: "#d97706", text: "#fbbf24", label: "جيد جداً", range: "7–8" };
  if (v >= 5) return { hex: "#2a0d0d", border: "#dc2626", text: "#f87171", label: "متوسط", range: "5–7" };
  return { hex: "#1a0d2a", border: "#7c3aed", text: "#c084fc", label: "ضعيف", range: "<5" };
}

const LEGEND = [
  { range: "9–10", label: "ممتاز جداً", hex: "#2563eb", text: "#60a5fa" },
  { range: "8–9", label: "ممتاز", hex: "#16a34a", text: "#4ade80" },
  { range: "7–8", label: "جيد جداً", hex: "#d97706", text: "#fbbf24" },
  { range: "5–7", label: "متوسط", hex: "#dc2626", text: "#f87171" },
  { range: "<5", label: "ضعيف", hex: "#7c3aed", text: "#c084fc" },
  { range: "—", label: "غير مقيّم", hex: "#3f3f5a", text: "#6b6b8a" },
];

// ─── Canvas generator ─────────────────────────────────────────────────────────

async function generateCard({ serie, allSeasonsEpisodes }) {
  const W = 1600, H = 960;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  const loadImg = (src) => new Promise((res) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });

  // ── 1. Deep background ──────────────────────────────────────────────────────
  ctx.fillStyle = "#08080f";
  ctx.fillRect(0, 0, W, H);

  // Noise texture
  ctx.save();
  ctx.globalAlpha = 0.018;
  for (let i = 0; i < 18000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "#fff" : "#888";
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
  }
  ctx.restore();

  // ── 2. Poster panel (left 38%) ───────────────────────────────────────────────
  const POSTER_W = Math.round(W * 0.38);
  const poster = serie.img ? await loadImg(serie.img) : null;

  if (poster) {
    ctx.save();
    ctx.filter = "blur(80px)";
    ctx.globalAlpha = 0.45;
    const bScale = Math.max(POSTER_W / poster.width, H / poster.height);
    const bW = poster.width * bScale, bH = poster.height * bScale;
    ctx.drawImage(poster, (POSTER_W - bW) / 2 - 40, (H - bH) / 2, bW + 80, bH);
    ctx.filter = "none";
    ctx.globalAlpha = 1;
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, POSTER_W, H);
    ctx.clip();
    const pScale = Math.max(POSTER_W / poster.width, H / poster.height);
    const pW = poster.width * pScale, pH = poster.height * pScale;
    ctx.drawImage(poster, (POSTER_W - pW) / 2, (H - pH) / 2, pW, pH);
    ctx.restore();
  }

  // Fade poster → dark
  const fadeGrad = ctx.createLinearGradient(POSTER_W * 0.55, 0, POSTER_W + 60, 0);
  fadeGrad.addColorStop(0, "rgba(8,8,15,0)");
  fadeGrad.addColorStop(1, "rgba(8,8,15,1)");
  ctx.fillStyle = fadeGrad;
  ctx.fillRect(POSTER_W * 0.55, 0, POSTER_W * 0.45 + 60, H);

  const topVig = ctx.createLinearGradient(0, 0, 0, 160);
  topVig.addColorStop(0, "rgba(8,8,15,0.7)");
  topVig.addColorStop(1, "rgba(8,8,15,0)");
  ctx.fillStyle = topVig;
  ctx.fillRect(0, 0, POSTER_W, 160);

  const btmVig = ctx.createLinearGradient(0, H - 160, 0, H);
  btmVig.addColorStop(0, "rgba(8,8,15,0)");
  btmVig.addColorStop(1, "rgba(8,8,15,0.85)");
  ctx.fillStyle = btmVig;
  ctx.fillRect(0, H - 160, POSTER_W, 160);

  // ── 3. Ambient glows ────────────────────────────────────────────────────────
  const drawGlow = (x, y, r, color) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  drawGlow(W - 160, 120, 380, "rgba(37,99,235,0.06)");
  drawGlow(POSTER_W + 200, H - 80, 300, "rgba(124,58,237,0.05)");
  drawGlow(W - 80, H * 0.5, 260, "rgba(22,163,74,0.04)");

  // ── 4. Right panel ──────────────────────────────────────────────────────────
  const RX = POSTER_W + 48;
  const RW = W - RX - 40;

  const roundRect = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  // Type badge
  ctx.font = "600 13px 'Cairo', Arial";
  ctx.textBaseline = "middle";
  const typeLabel = TYPE_LABEL[serie.type] || serie.type;
  const typeW = ctx.measureText(typeLabel).width + 28;
  ctx.fillStyle = "rgba(245,158,11,0.12)";
  roundRect(RX, 44, typeW, 28, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(245,158,11,0.3)";
  ctx.lineWidth = 1;
  roundRect(RX, 44, typeW, 28, 8);
  ctx.stroke();
  ctx.fillStyle = "#f59e0b";
  ctx.textAlign = "center";
  ctx.fillText(typeLabel, RX + typeW / 2, 58);

  // Title
  ctx.textAlign = "right";
  ctx.textBaseline = "top";
  ctx.font = "900 52px 'Cairo', Arial";
  ctx.fillStyle = "#ffffff";
  let title = serie.title || "";
  while (ctx.measureText(title).width > RW && title.length > 4) title = title.slice(0, -1);
  if (title !== serie.title) title += "…";
  ctx.fillText(title, W - 40, 42);

  const titleW = Math.min(ctx.measureText(serie.title || "").width, RW);
  const tlGrad = ctx.createLinearGradient(W - 40 - titleW, 0, W - 40, 0);
  tlGrad.addColorStop(0, "rgba(245,158,11,0)");
  tlGrad.addColorStop(1, "rgba(245,158,11,0.7)");
  ctx.fillStyle = tlGrad;
  ctx.fillRect(W - 40 - Math.min(titleW, 320), 100, Math.min(titleW, 320), 2);

  if (serie.maker) {
    ctx.font = "400 19px 'Tajawal', Arial";
    ctx.fillStyle = "rgba(255,255,255,0.32)";
    ctx.fillText(serie.maker, W - 40, 113);
  }

  // Meta pills
  const metaY = serie.maker ? 155 : 120;
  const metaItems = [
    serie.rating > 0 ? `★ ${Number(serie.rating).toFixed(1)}` : null,
    serie.start ? String(new Date(serie.start).getFullYear()) : null,
    serie.finished == false ? "● مستمر" : "✓ مكتمل",
    `${serie.seasons || 0} مواسم · ${serie.episodes || 0} حلقة`,
  ].filter(Boolean);

  ctx.textBaseline = "middle";
  let pillX = W - 40;
  for (const item of metaItems) {
    ctx.font = "600 14px 'Cairo', Arial";
    const tw = ctx.measureText(item).width;
    const pw = tw + 22, ph = 30, pr = 8;
    pillX -= pw;
    const isRating = item.startsWith("★");
    ctx.fillStyle = isRating ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.06)";
    roundRect(pillX, metaY, pw, ph, pr);
    ctx.fill();
    ctx.strokeStyle = isRating ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    roundRect(pillX, metaY, pw, ph, pr);
    ctx.stroke();
    ctx.fillStyle = isRating ? "#f59e0b" : "rgba(255,255,255,0.6)";
    ctx.textAlign = "center";
    ctx.fillText(item, pillX + pw / 2, metaY + 15);
    pillX -= 10;
  }

  // Description
  if (serie.descr) {
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.font = "400 16px 'Tajawal', Arial";
    ctx.fillStyle = "rgba(255,255,255,0.38)";
    const descY = metaY + 48;
    const words = serie.descr.split(" ");
    let line = "", lineY = descY, count = 0;
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > RW && line) {
        ctx.fillText(line, W - 40, lineY);
        line = word; lineY += 24; count++;
        if (count >= 2) { ctx.fillText(line + "…", W - 40, lineY); break; }
      } else line = test;
    }
    if (count < 2 && line) ctx.fillText(line, W - 40, lineY);
  }

  // ── 5. Divider ──────────────────────────────────────────────────────────────
  const DIV_Y = 292;
  const divGrad = ctx.createLinearGradient(RX, 0, W - 40, 0);
  divGrad.addColorStop(0, "rgba(245,158,11,0.7)");
  divGrad.addColorStop(0.5, "rgba(245,158,11,0.3)");
  divGrad.addColorStop(1, "rgba(245,158,11,0)");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(RX, DIV_Y); ctx.lineTo(W - 40, DIV_Y);
  ctx.stroke();

  // ── 6. Legend ────────────────────────────────────────────────────────────────
  const LEG_Y = DIV_Y + 16;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.font = "600 12px 'Tajawal', Arial";
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillText("دليل الألوان:", RX, LEG_Y + 7);

  let legX = RX + 96;
  for (const it of LEGEND) {
    ctx.fillStyle = it.hex;
    ctx.beginPath();
    ctx.arc(legX + 6, LEG_Y + 7, 5, 0, Math.PI * 2);
    ctx.fill();
    const dotGlow = ctx.createRadialGradient(legX + 6, LEG_Y + 7, 0, legX + 6, LEG_Y + 7, 12);
    dotGlow.addColorStop(0, it.hex + "55");
    dotGlow.addColorStop(1, "transparent");
    ctx.fillStyle = dotGlow;
    ctx.beginPath();
    ctx.arc(legX + 6, LEG_Y + 7, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "600 12px 'Cairo', Arial";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    const lbl = `${it.range} ${it.label}`;
    ctx.fillText(lbl, legX + 16, LEG_Y + 7);
    legX += ctx.measureText(lbl).width + 30;
  }

  // ── 7. Season grid ───────────────────────────────────────────────────────────
  const GRID_TOP = LEG_Y + 38;
  const GRID_H = H - GRID_TOP - 56;
  const CELL = 26;
  const CELL_GAP = 4;
  const LABEL_H = 36;
  const SEA_GAP = 18;
  const N = allSeasonsEpisodes.length;

  if (N > 0) {
    const seaW = Math.floor((RW - (N - 1) * SEA_GAP) / N);
    const COLS = Math.max(1, Math.floor((seaW + CELL_GAP) / (CELL + CELL_GAP)));

    for (let si = 0; si < N; si++) {
      const { season, episodes: eps } = allSeasonsEpisodes[si];
      const colX = RX + si * (seaW + SEA_GAP);

      const rows = Math.ceil(eps.length / COLS);
      const cardH = Math.min(LABEL_H + rows * (CELL + CELL_GAP) + 14, GRID_H);

      // Season card bg
      ctx.fillStyle = "rgba(255,255,255,0.028)";
      roundRect(colX, GRID_TOP, seaW, cardH, 14);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 1;
      roundRect(colX, GRID_TOP, seaW, cardH, 14);
      ctx.stroke();

      // Season label
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "700 13px 'Cairo', Arial";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      let slabel = season.title || `الموسم ${season.number}`;
      while (ctx.measureText(slabel).width > seaW - 20 && slabel.length > 3)
        slabel = slabel.slice(0, -1);
      if (slabel !== (season.title || `الموسم ${season.number}`)) slabel += "…";
      ctx.fillText(slabel, colX + seaW / 2, GRID_TOP + LABEL_H / 2 - 6);
      ctx.font = "600 10px 'Cairo', Arial";
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillText(`${eps.length} ح`, colX + seaW / 2, GRID_TOP + LABEL_H / 2 + 9);

      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(colX + 12, GRID_TOP + LABEL_H);
      ctx.lineTo(colX + seaW - 12, GRID_TOP + LABEL_H);
      ctx.stroke();

      // Episode cells
      const cellsStartX = colX + (seaW - COLS * (CELL + CELL_GAP) + CELL_GAP) / 2;

      for (let ei = 0; ei < eps.length; ei++) {
        const ep = eps[ei];
        const row = Math.floor(ei / COLS);
        const col = ei % COLS;
        const cx = cellsStartX + col * (CELL + CELL_GAP);
        const cy = GRID_TOP + LABEL_H + 8 + row * (CELL + CELL_GAP);

        if (cy + CELL > GRID_TOP + GRID_H) break;

        const { hex, border, text } = getRatingColor(ep.rating);

        // Cell background (dark, color-tinted)
        ctx.fillStyle = hex;
        roundRect(cx, cy, CELL, CELL, 5);
        ctx.fill();

        // Cell border
        ctx.strokeStyle = border;
        ctx.lineWidth = 1;
        roundRect(cx, cy, CELL, CELL, 5);
        ctx.stroke();

        // Top accent bar
        ctx.fillStyle = border;
        ctx.fillRect(cx + 3, cy, CELL - 6, 2);

        // Rating text — white
        ctx.font = "bold 9px 'Cairo', Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (ep.rating > 0) {
          ctx.fillText(Number(ep.rating).toFixed(1), cx + CELL / 2, cy + CELL / 2);
        } else {
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.fillRect(cx + CELL / 2 - 4, cy + CELL / 2 - 0.5, 8, 1);
        }
      }
    }
  }

  // ── 8. Bottom bar ────────────────────────────────────────────────────────────
  const barY = H - 46;
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(RX, barY); ctx.lineTo(W - 40, barY);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = "900 16px 'Cairo', Arial";
  ctx.fillStyle = "#f59e0b";
  ctx.fillText("MrDB", RX, barY + 20);
  ctx.font = "400 13px 'Tajawal', Arial";
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fillText("mrdb.app", RX + 54, barY + 20);

  const totalEps = allSeasonsEpisodes.reduce((acc, s) => acc + s.episodes.length, 0);
  ctx.textAlign = "right";
  ctx.font = "400 13px 'Tajawal', Arial";
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillText(`${allSeasonsEpisodes.length} مواسم · ${totalEps} حلقة`, W - 40, barY + 20);

  return canvas.toDataURL("image/png");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RatingPill({ rating, size = "md", count }) {
  const color =
    rating >= 9 ? "from-blue-500 to-blue-600" :
      rating >= 8 ? "from-green-500 to-green-600" :
        rating >= 7 ? "from-orange-400 to-amber-500" :
          rating >= 5 ? "from-red-500 to-red-600" :
            "from-violet-500 to-violet-600";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  return (
    <div className="inline-flex items-center gap-1.5">
      <div className={`inline-flex items-center gap-1 bg-gradient-to-r ${color} rounded-full px-2 py-0.5`}>
        <Star size={size === "sm" ? 10 : 12} className="fill-white text-white" />
        <span className={`font-black text-white ${textSize}`}>{Number(rating).toFixed(1)}</span>
      </div>
      {count != null && <span className="text-[10px] text-zinc-500">({Number(count).toLocaleString("ar")})</span>}
    </div>
  );
}

function StatusBadge({ isOngoing }) {
  return (
    <span className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full border ${isOngoing
      ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
      : "text-sky-400 border-sky-500/40 bg-sky-500/10"
      }`}>
      {isOngoing ? "● مستمر" : "✓ مكتمل"}
    </span>
  );
}

function EpisodeCard({ ep, dark, topBadge, tops = false }) {
  return (
    <Link
      href={`/episode?id=${ep.id}`}
      className={`group flex items-center gap-4 p-3 rounded-2xl border transition-all duration-200 hover:scale-[1.01] ${dark
        ? "bg-white/3 border-white/6 hover:border-amber-500/30 hover:bg-white/6"
        : "bg-white border-gray-100 hover:border-amber-300 shadow-sm hover:shadow-md"
        }`}
    >
      <div className="relative flex-shrink-0 w-24 aspect-video rounded-xl overflow-hidden bg-zinc-800">
        {ep.img ? (
          <img src={ep.img} alt={ep.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film size={20} className="text-zinc-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
            <Play size={14} className="text-black fill-black mr-[-1px]" />
          </div>
        </div>
        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          {ep.number}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="font-bold text-sm truncate">{ep.title}</p>
          {tops && (
            <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black flex-shrink-0">
              {ep.season}
            </span>
          )}
          {!tops && topBadge === "best" && (
            <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-black flex-shrink-0">
              <Crown size={9} /> أقود حلقة فهاذ السيزون
            </span>
          )}
          {!tops && topBadge === "top" && (
            <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white flex-shrink-0">
              <Trophy size={9} /> من أقود الحلقات فيه
            </span>
          )}
        </div>
        <RatingPill rating={ep.rating} size="sm" count={ep.ratingCount} />
      </div>
      <ArrowLeft size={16} className={`flex-shrink-0 transition-colors ${dark ? "text-zinc-600 group-hover:text-amber-400" : "text-gray-300 group-hover:text-amber-500"
        }`} />
    </Link>
  );
}

function RatingLegend({ dark }) {
  return (
    <div className={`flex items-center gap-x-4 gap-y-2 flex-wrap px-5 py-3.5 rounded-2xl border text-xs ${dark ? "bg-white/[0.025] border-white/8" : "bg-white border-gray-100 shadow-sm"
      }`}>
      <span className={`font-bold text-[11px] shrink-0 ${dark ? "text-zinc-500" : "text-gray-400"}`}>
        دليل الألوان:
      </span>
      {LEGEND.map(it => (
        <span key={it.hex} className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{
            background: it.hex,
            boxShadow: `0 0 6px ${it.hex}99`,
          }} />
          <span className={dark ? "text-zinc-400" : "text-gray-600"}>
            {it.label}
            <span className={`ml-1 ${dark ? "text-zinc-600" : "text-gray-400"}`}>({it.range})</span>
          </span>
        </span>
      ))}
    </div>
  );
}

function DownloadCardButton({ serie, allSeasonsEpisodes, dark }) {
  const [state, setState] = useState("idle");

  const handle = async () => {
    setState("loading");
    try {
      const url = await generateCard({ serie, allSeasonsEpisodes });
      const a = document.createElement("a");
      a.href = url;
      a.download = `${serie.title || "series"}-card.png`;
      a.click();
      setState("done");
      setTimeout(() => setState("idle"), 2500);
    } catch (e) {
      console.error(e);
      setState("idle");
    }
  };

  return (
    <button
      onClick={handle}
      disabled={state !== "idle"}
      className={`flex items-center gap-2 font-black px-5 py-2.5 rounded-xl transition-all text-sm border ${state === "done"
        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
        : dark
          ? "bg-violet-500/15 border-violet-500/30 text-violet-300 hover:bg-violet-500/25 hover:border-violet-400/50 hover:scale-105"
          : "bg-violet-100 border-violet-300 text-violet-700 hover:bg-violet-200 hover:scale-105"
        } disabled:opacity-70 disabled:cursor-not-allowed`}
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      {state === "loading" && <><Loader2 size={15} className="animate-spin" />جاري التوليد...</>}
      {state === "done" && <><ImageIcon size={15} />تم التنزيل ✓</>}
      {state === "idle" && <><ImageIcon size={15} />تيليشارجي بطاقة السيري</>}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SeriesPage({ dark, session }) {
  const router = useRouter();
  const { id } = router.query;

  const [serie, setSerie] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [allSeasonsEpisodes, setAllSeasonsEpisodes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [epLoading, setEpLoading] = useState(false);
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [userID, setUserID] = useState(null);

  useEffect(() => { if (session?.id) setUserID(session.id); }, [session]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const [serieRes, seasonsRes, favRes] = await Promise.all([
          fetch(`/api/series/getOne?id=${id}`),
          fetch(`/api/series/getSeason?seriesID=${id}`),
          fetch(`/api/series/getFavorite?userID=${userID}&seriesID=${id}`),
        ]);
        const serieData = await serieRes.json();
        const seasonsData = await seasonsRes.json();
        const favData = await favRes.json();

        setSerie(serieData);
        setSeasons(seasonsData);
        setIsFavorite(favData.isFavorite);
        if (seasonsData.length > 0) setSelectedSeason(seasonsData[0]);

        const all = await Promise.all(
          seasonsData.map(async (s) => {
            const r = await fetch(`/api/series/getSeason?seasonID=${s.id}`);
            return { season: s, episodes: await r.json() };
          })
        );
        setAllSeasonsEpisodes(all);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (!selectedSeason) return;
    (async () => {
      setEpLoading(true);
      try {
        const res = await fetch(`/api/series/getSeason?seasonID=${selectedSeason.id}`);
        setEpisodes(await res.json());
      } finally {
        setEpLoading(false);
      }
    })();
  }, [selectedSeason]);

  const handleToggleFavorite = async () => {
    setFavLoading(true);
    try {
      const res = await fetch("/api/series/toggleFavorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, seriesID: serie.id }),
      });
      setIsFavorite((await res.json()).isFavorite);
    } finally {
      setFavLoading(false);
    }
  };

  const allEpisodes = allSeasonsEpisodes.flatMap(s => s.episodes);

  const allRatings = allEpisodes
    .map(e => e.rating || 0)
    .sort((a, b) => b - a);

  const maxRating = allRatings[0] || 0;

  const top15Threshold =
    allRatings[Math.floor(allRatings.length * 0.15)] || 0;

  const getEpBadge = (ep) => {
    if ((ep.rating || 0) === maxRating && maxRating > 0) return "best";
    if ((ep.rating || 0) >= top15Threshold && top15Threshold > 0) return "top";
    return null;
  };

  const topEpisodes = [...allEpisodes]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${dark ? "bg-[#0a0a0f]" : "bg-[#f4f1eb]"}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">جاري التحميل...</p>
      </div>
    </div>
  );

  if (!serie) return (
    <div className={`min-h-screen flex items-center justify-center ${dark ? "bg-[#0a0a0f] text-white" : "bg-[#f4f1eb] text-gray-900"}`}>
      <p>السلسلة غير موجودة</p>
    </div>
  );

  const isOngoing = serie.finished == false;

  return (
    <>
      <Head>
        <title>{serie.title} — MrDB</title>
        <meta name="description" content={serie.descr} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=Tajawal:wght@400;500;700;900&display=swap" rel="stylesheet" />
      </Head>

      <div dir="rtl"
        className={`min-h-screen transition-colors duration-300 ${dark ? "bg-[#0a0a0f] text-white" : "bg-[#f4f1eb] text-gray-900"}`}
        style={{ fontFamily: "'Tajawal', sans-serif" }}
      >
        <div className="fixed inset-0 pointer-events-none z-0" style={{
          backgroundImage: dark
            ? "radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.04) 0%, transparent 50%)"
            : "radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.08) 0%, transparent 60%)",
        }} />

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <Link href="/" className={`inline-flex items-center gap-2 mb-6 text-sm font-semibold transition-colors ${dark ? "text-zinc-400 hover:text-white" : "text-gray-500 hover:text-gray-900"
            }`}>
            <ArrowRight size={16} /><span>رجع لور</span>
          </Link>

          {/* ── HERO ── */}
          <div className="relative w-full rounded-3xl overflow-hidden mb-6" style={{ minHeight: 480 }}>
            <img src={serie.img} alt={serie.title}
              className="absolute inset-0 w-full h-full object-cover scale-105"
              style={{ filter: "blur(2px)" }} />
            <div className="absolute inset-0 bg-gradient-to-l from-black/98 via-black/60 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

            <div className="relative h-full flex items-center p-8 md:p-14 gap-10" style={{ minHeight: 480 }}>
              <div className="hidden md:block flex-shrink-0 w-48 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 border border-white/10">
                <img src={serie.img} alt={serie.title} className="w-full h-full object-cover" style={{ aspectRatio: "2/3" }} />
              </div>

              <div className="flex-1 max-w-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-amber-400" />
                  <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">
                    {TYPE_LABEL[serie.type] || serie.type}
                  </span>
                </div>
                <h1 className="text-white text-4xl md:text-5xl font-black mb-4 leading-tight"
                  style={{ fontFamily: "'Cairo', sans-serif", textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}>
                  {serie.title}
                </h1>
                {serie.maker && <p className="text-white/50 text-sm mb-3">{serie.maker}</p>}
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <RatingPill rating={serie.rating} count={serie.ratingCount} />
                  <StatusBadge isOngoing={isOngoing} />
                  <span className="text-white/40 text-sm">
                    {serie.start ? new Date(serie.start).getFullYear() : ""}
                    {serie.end ? ` — ${new Date(serie.end).getFullYear()}` : isOngoing ? " — الآن" : ""}
                  </span>
                </div>
                <div className="flex gap-6 mb-5">
                  <div className="flex items-center gap-1.5 text-white/50 text-sm">
                    <Layers size={14} /><span>{serie.seasons} مواسم</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/50 text-sm">
                    <Film size={14} /><span>{serie.episodes} حلقة</span>
                  </div>
                </div>
                {serie.descr && (
                  <p className="text-white/65 text-sm leading-relaxed mb-6 line-clamp-3 max-w-lg">
                    {serie.descr}
                  </p>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleToggleFavorite}
                    disabled={favLoading}
                    className={`flex items-center gap-2 font-black px-5 py-2.5 rounded-xl transition-all hover:scale-105 text-sm border ${isFavorite
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-400 hover:bg-rose-500/30"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:border-rose-500/40 hover:text-rose-400"
                      } ${favLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    <Heart size={15} className={isFavorite ? "fill-rose-400 text-rose-400" : ""} />
                    {isFavorite ? "في المفضلة" : "زيدو فالمفضلة"}
                  </button>
                  <DownloadCardButton serie={serie} allSeasonsEpisodes={allSeasonsEpisodes} dark={dark} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Legend ── */}
          <div className="mb-6"><RatingLegend dark={dark} /></div>

          {/* ── Trailer + Top Episodes ── */}
          <div className="w-full flex flex-col md:flex-row gap-6">
            <div className={`w-full md:w-1/2 rounded-3xl p-6 mb-10 border ${dark ? "bg-white/3 border-white/6" : "bg-white border-gray-100 shadow-sm"
              }`}>
              <div className="flex items-center gap-2 mb-4">
                <Play size={16} className="text-amber-400 fill-amber-400" />
                <h2 className="font-black text-lg" style={{ fontFamily: "'Cairo', sans-serif" }}>الإعلان الرسمي</h2>
              </div>
              {serie.trailer ? (
                <div className="relative w-full rounded-2xl overflow-hidden" style={{ paddingTop: "56.25%" }}>
                  <iframe
                    src={
                      serie.trailer.includes("youtube.com/watch?v=")
                        ? serie.trailer.replace("watch?v=", "embed/")
                        : serie.trailer.includes("youtu.be/")
                          ? serie.trailer.replace("youtu.be/", "www.youtube.com/embed/")
                          : serie.trailer
                    }
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen title="trailer"
                  />
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center py-12 rounded-2xl border-2 border-dashed gap-3 ${dark ? "border-white/8 text-zinc-600" : "border-gray-200 text-gray-400"
                  }`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${dark ? "bg-white/5" : "bg-gray-100"}`}>
                    <Play size={24} className={dark ? "text-zinc-700" : "text-gray-300"} />
                  </div>
                  <p className="font-bold text-sm">الإعلان غير متاح حالياً</p>
                </div>
              )}
            </div>

            {topEpisodes.length > 0 && (
              <div className="w-full md:w-1/2 mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy size={18} className="text-amber-400" />
                  <h2 className="text-lg font-black" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    أقود حلقات فيه
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {topEpisodes.map(ep => (
                    <EpisodeCard key={ep.id} ep={{ ...ep, season: selectedSeason.title }} dark={dark} topBadge={getEpBadge(ep)} tops={true} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Episodes List ── */}
          {seasons.length > 0 && (
            <div className={`rounded-3xl border ${dark ? "bg-white/3 border-white/6" : "bg-white border-gray-100 shadow-sm"
              }`}>
              <div className={`flex items-center justify-between flex-wrap gap-4 px-6 py-4 border-b ${dark ? "border-white/6" : "border-gray-100"
                }`}>
                <div className="flex items-center gap-2">
                  <Film size={16} className="text-amber-400" />
                  <h2 className="font-black text-lg" style={{ fontFamily: "'Cairo', sans-serif" }}>قائمة الحلقات</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${dark ? "bg-amber-500/15 text-amber-400" : "bg-amber-100 text-amber-700"
                    }`}>{episodes.length}</span>
                </div>
                {seasons.length > 1 && (
                  <div className="relative">
                    <button
                      onClick={() => setSeasonOpen(!seasonOpen)}
                      className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-all ${dark ? "bg-white/5 border-white/10 hover:border-white/20" : "bg-gray-50 border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <Layers size={13} />
                      <span>{selectedSeason?.title || "الموسم"}</span>
                      <ChevronDown size={13} className={`transition-transform ${seasonOpen ? "rotate-180" : ""}`} />
                    </button>
                    {seasonOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setSeasonOpen(false)} />
                        <div className={`absolute right-0 md:translate-x-10 top-full mt-2 w-52 rounded-xl border overflow-hidden shadow-2xl z-50 ${dark ? "bg-zinc-900 border-white/10" : "bg-white border-gray-200"
                          }`}>
                          {seasons.map(s => (
                            <button key={s.id}
                              onClick={() => { setSelectedSeason(s); setSeasonOpen(false); }}
                              className={`w-full text-right px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${selectedSeason?.id === s.id ? "text-amber-400 font-bold" : dark ? "hover:bg-white/5" : "hover:bg-gray-50"
                                }`}
                            >
                              <span>{s.title}</span>
                              <span className={`text-xs ${dark ? "text-zinc-600" : "text-gray-400"}`}>{s.episodeCount} ح</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                {epLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className={`h-16 rounded-2xl animate-pulse ${dark ? "bg-white/5" : "bg-gray-100"}`} />
                  ))
                ) : episodes.length === 0 ? (
                  <div className="flex flex-col items-center py-12 gap-3 text-zinc-500">
                    <Film size={32} className="opacity-30" />
                    <p className="text-sm">لا توجد حلقات في هذا الموسم</p>
                  </div>
                ) : (
                  episodes.map(ep => (
                    <EpisodeCard key={ep.id} ep={ep} dark={dark} topBadge={getEpBadge(ep)} />
                  ))
                )}
              </div>
            </div>
          )}

          <div className="h-16" />
        </main>
      </div>
    </>
  );
}

export async function getServerSideProps({ req, res }) {
  const user = verifyAuth(req, res);
  if (!user) return { props: { session: null } };
  return { props: { session: { id: user.id, name: user.name, email: user.email } } };
}