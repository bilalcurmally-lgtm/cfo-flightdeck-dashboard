import { state } from "../store/state.js";
import { els } from "../store/elements.js";
import { render } from "../store/renderer.js";
import { escapeHtml } from "../core/escape.js";
import { shareOf, truncate } from "../core/format.js";
import { humanPeriodLabel } from "../core/date.js";
import { shortCurrency, formatCurrency } from "../config/currency.js";
import { markUpdated } from "./motion.js";

/* ── ResizeObserver: re-render charts when container resizes ─── */
let _resizeObserver = null;
let _lastPeriodSummary = null;
let _lastHeadSummary = null;

function watchResize() {
  if (_resizeObserver) return;
  _resizeObserver = new ResizeObserver(() => {
    let dirty = false;
    if (_lastPeriodSummary) { renderTrendChart(_lastPeriodSummary); dirty = true; }
    if (_lastHeadSummary)   { renderHeadChart(_lastHeadSummary);   dirty = true; }
  });
  _resizeObserver.observe(els.trendChart);
  _resizeObserver.observe(els.headChart);
}

/* ── Shared floating tooltip ─────────────────────────────────── */
let _tip = null;
function getTooltip() {
  if (!_tip) {
    _tip = document.createElement("div");
    _tip.id = "chart-tooltip";
    _tip.className = "chart-tooltip";
    _tip.style.display = "none";
    document.body.appendChild(_tip);
  }
  return _tip;
}

function showTooltip(e, html) {
  const tip = getTooltip();
  tip.innerHTML = html;
  tip.style.display = "block";
  positionTooltip(e, tip);
}

function positionTooltip(e, tip) {
  const gap = 16;
  const tw = tip.offsetWidth || 200;
  const th = tip.offsetHeight || 120;
  let x = e.clientX + gap;
  let y = e.clientY - th / 2;
  if (x + tw > window.innerWidth - 8) x = e.clientX - tw - gap;
  if (y < 8) y = 8;
  if (y + th > window.innerHeight - 8) y = window.innerHeight - th - 8;
  tip.style.left = `${x}px`;
  tip.style.top  = `${y}px`;
}

function hideTooltip() {
  getTooltip().style.display = "none";
}

/* ── Smart label step: target ≤12 visible x-axis labels ──────── */
function labelStep(n) {
  if (n <= 12)  return 1;
  if (n <= 24)  return 2;
  if (n <= 48)  return 4;
  if (n <= 84)  return 7;
  if (n <= 180) return 14;
  return Math.ceil(n / 12);
}

/* ── Measure real pixel width of a container ─────────────────── */
function containerWidth(el) {
  const rect = el.getBoundingClientRect();
  return Math.max(Math.floor(rect.width || el.clientWidth || 400), 300);
}

/* ─────────────────────────────────────────────────────────────
   TREND CHART
───────────────────────────────────────────────────────────── */
export function renderTrendChart(periodSummary) {
  _lastPeriodSummary = periodSummary;
  watchResize();

  if (!periodSummary.length) {
    els.trendChart.innerHTML = `<div class="chart-empty">No period data to plot.</div>`;
    return;
  }

  /* Dimensions: charts scale to the instrument bay instead of forcing horizontal panning. */
  const baseW = containerWidth(els.trendChart);
  const n = periodSummary.length;
  const ml = baseW < 520 ? 44 : 62;
  const mr = baseW < 520 ? 10 : 24;
  const W = baseW;
  const innerW = W - ml - mr;

  const BAR_ZONE  = baseW < 520 ? 320 : 390;
  const NET_TOP   = BAR_ZONE + 34;
  const NET_H     = baseW < 520 ? 88 : 112;
  const LABEL_H   = 34;
  const H         = NET_TOP + NET_H + LABEL_H;

  const slotW    = innerW / n;
  const barW     = Math.max(2, Math.min(28, slotW * 0.34));
  const step     = labelStep(n);

  const maxBar   = Math.max(...periodSummary.flatMap(d => [d.revenue, d.outflow]), 1);

  /* Y-axis grid */
  const gridFracs = [0.25, 0.5, 0.75, 1.0];
  const gridLines = gridFracs.map(f => {
    const y  = BAR_ZONE - f * (BAR_ZONE - 20);
    const lbl = shortCurrency(f * maxBar);
    return `
      <line x1="${ml}" y1="${y}" x2="${W - mr}" y2="${y}" stroke="rgba(80,110,200,0.09)"/>
      <text x="${ml - 6}" y="${y + 4}" text-anchor="end" font-size="10"
            fill="rgba(100,130,200,0.38)" font-family="JetBrains Mono,monospace">${lbl}</text>`;
  }).join("");

  /* Bars */
  const bars = periodSummary.map((item, i) => {
    const cx  = ml + i * slotW + slotW / 2;
    const rh  = (item.revenue / maxBar) * (BAR_ZONE - 20);
    const oh  = (item.outflow / maxBar) * (BAR_ZONE - 20);
    const ry  = BAR_ZONE - rh;
    const oy  = BAR_ZONE - oh;
    const isActive  = state.filters.focusedPeriod === item.period;
    const isDrilled = !!state.filters.focusedPeriod;
    const opacity   = isDrilled ? (isActive ? 1 : 0.22) : 0.90;
    const showLbl   = i % step === 0;
    const lbl = truncate(humanPeriodLabel(item.period, state.grain), 9);

    return `
      <g class="bar-group" data-period-drill="${escapeHtml(item.period)}"
         style="opacity:${opacity};cursor:pointer"
         role="button" tabindex="0">
        <rect class="trend-bar revenue" style="--motion-index:${i}" x="${cx - barW - 1}" y="${ry}" width="${barW}" height="${Math.max(rh,2)}" rx="2"
              fill="${isActive ? "#a78bfa" : "rgba(167,139,250,0.82)"}"
              ${isActive ? 'filter="url(#gg)"' : ''}/>
        <rect class="trend-bar outflow" style="--motion-index:${i}" x="${cx + 1}" y="${oy}" width="${barW}" height="${Math.max(oh,2)}" rx="2"
              fill="${isActive ? "#fb7185" : "rgba(251,113,133,0.82)"}"
              ${isActive ? 'filter="url(#ga)"' : ''}/>
        ${showLbl ? `<text x="${cx}" y="${BAR_ZONE + LABEL_H - 2}" text-anchor="middle"
              font-size="10" fill="rgba(100,130,200,0.45)"
              font-family="JetBrains Mono,monospace">${escapeHtml(lbl)}</text>` : ""}
        <rect x="${cx - slotW/2}" y="20" width="${slotW}" height="${BAR_ZONE - 20}"
              fill="transparent" class="bar-hit"/>
      </g>`;
  }).join("");

  /* Net strip */
  const netVals = periodSummary.map(d => d.net);
  const netMin  = Math.min(...netVals, 0);
  const netMax  = Math.max(...netVals, 0);
  const netRange = Math.max(netMax - netMin, 1);
  const netY = v => NET_TOP + NET_H - ((v - netMin) / netRange) * NET_H;
  const zeroY = netY(0);

  const pts = periodSummary.map((d, i) => {
    const cx = ml + i * slotW + slotW / 2;
    return { x: cx, y: netY(d.net), net: d.net };
  });
  const lineStr = pts.map(p => `${p.x},${p.y}`).join(" ");

  /* Filled area split at zero */
  function buildPoly(coords, base) {
    if (!coords.length) return "";
    return [`${coords[0].x},${base}`,
            ...coords.map(p => `${p.x},${p.y}`),
            `${coords[coords.length-1].x},${base}`].join(" ");
  }
  let posAreas = "", negAreas = "";
  let curP = [], curN = [];
  for (const p of pts) {
    if (p.net >= 0) {
      if (curN.length) { negAreas += `<polygon points="${buildPoly(curN, zeroY)}" fill="rgba(251,113,133,0.11)"/>`; curN = []; }
      curP.push(p);
    } else {
      if (curP.length) { posAreas += `<polygon points="${buildPoly(curP, zeroY)}" fill="rgba(56,189,248,0.09)"/>`; curP = []; }
      curN.push(p);
    }
  }
  if (curP.length) posAreas += `<polygon points="${buildPoly(curP, zeroY)}" fill="rgba(56,189,248,0.09)"/>`;
  if (curN.length) negAreas += `<polygon points="${buildPoly(curN, zeroY)}" fill="rgba(251,113,133,0.11)"/>`;

  els.trendChart.innerHTML = `
    <svg class="chart-redraw" viewBox="0 0 ${W} ${H}" width="100%" height="${H}"
         role="img" aria-label="Revenue and outflow trend chart" style="overflow:visible;display:block">
      <defs>
        <filter id="gg" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="ga" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      ${gridLines}
      <line x1="${ml}" y1="${BAR_ZONE}" x2="${W-mr}" y2="${BAR_ZONE}" stroke="rgba(80,110,200,0.18)"/>
      ${bars}

      <!-- legend -->
      <rect x="${ml}" y="6" width="8" height="8" rx="2" fill="rgba(167,139,250,0.85)"/>
      <text x="${ml+12}" y="14" font-size="10" fill="rgba(167,139,250,0.65)"
            font-family="JetBrains Mono,monospace">Revenue</text>
      <rect x="${ml+76}" y="6" width="8" height="8" rx="2" fill="rgba(251,113,133,0.85)"/>
      <text x="${ml+88}" y="14" font-size="10" fill="rgba(251,113,133,0.65)"
            font-family="JetBrains Mono,monospace">Outflow</text>

      <!-- net strip -->
      <line x1="${ml}" y1="${NET_TOP-1}" x2="${W-mr}" y2="${NET_TOP-1}" stroke="rgba(80,110,200,0.13)"/>
      <text x="${ml}" y="${NET_TOP+10}" font-size="9" fill="rgba(100,130,200,0.38)"
            font-family="JetBrains Mono,monospace" letter-spacing="0.10em">NET CASH</text>
      <text x="${ml-6}" y="${NET_TOP+11}" text-anchor="end" font-size="9"
            fill="rgba(56,189,248,0.50)" font-family="JetBrains Mono,monospace">${shortCurrency(netMax)}</text>
      <text x="${ml-6}" y="${NET_TOP+NET_H}" text-anchor="end" font-size="9"
            fill="rgba(251,113,133,0.50)" font-family="JetBrains Mono,monospace">${shortCurrency(netMin)}</text>
      <line x1="${ml}" y1="${zeroY}" x2="${W-mr}" y2="${zeroY}"
            stroke="rgba(251,113,133,0.22)" stroke-dasharray="4 3"/>
      ${posAreas}${negAreas}
      <polyline fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.60"
                stroke-linejoin="round" points="${lineStr}"/>
    </svg>`;
  markUpdated(els.trendChart, "slice-glow");

  /* Events */
  Array.from(els.trendChart.querySelectorAll(".bar-group")).forEach(node => {
    const period = node.dataset.periodDrill;
    const item   = periodSummary.find(d => d.period === period);
    if (!item) return;
    const lbl    = humanPeriodLabel(item.period, state.grain);
    const nc     = item.net >= 0 ? "#38bdf8" : "#fb7185";

    node.addEventListener("mouseenter", e => showTooltip(e, `
      <div class="tip-title">${escapeHtml(lbl)}</div>
      <div class="tip-row"><span class="tip-dot" style="background:#a78bfa"></span><span>Revenue</span><strong>${formatCurrency(item.revenue)}</strong></div>
      <div class="tip-row"><span class="tip-dot" style="background:#fb7185"></span><span>Outflow</span><strong>${formatCurrency(item.outflow)}</strong></div>
      <div class="tip-row tip-net"><span class="tip-dot" style="background:${nc}"></span><span>Net</span><strong style="color:${nc}">${formatCurrency(item.net)}</strong></div>
      <div class="tip-hint">Click to drill in</div>`));
    node.addEventListener("mousemove",  e => positionTooltip(e, getTooltip()));
    node.addEventListener("mouseleave", hideTooltip);
    node.addEventListener("click", () => {
      hideTooltip();
      state.filters.focusedPeriod = state.filters.focusedPeriod === period ? "" : period;
      render();
    });
    node.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        state.filters.focusedPeriod = state.filters.focusedPeriod === period ? "" : period;
        render();
      }
    });
  });
}

/* ─────────────────────────────────────────────────────────────
   HEAD CHART
───────────────────────────────────────────────────────────── */
export function renderHeadChart(headSummary) {
  _lastHeadSummary = headSummary;
  watchResize();

  if (!headSummary.length) {
    els.headChart.innerHTML = `<div class="chart-empty">No head data to plot.</div>`;
    return;
  }

  const topHeads = [...headSummary]
    .sort((a, b) => (b.revenue + b.outflow) - (a.revenue + a.outflow))
    .slice(0, 10);
  const totalRevenue = headSummary.reduce((sum, item) => sum + item.revenue, 0);
  const totalOutflow = headSummary.reduce((sum, item) => sum + item.outflow, 0);

  const W        = containerWidth(els.headChart);
  const rowH     = W < 520 ? 48 : 58;
  const H        = topHeads.length * rowH + 56;
  const mid      = W / 2;
  const maxVal   = Math.max(...topHeads.flatMap(d => [d.revenue, d.outflow]), 1);
  const labelW   = Math.min(270, Math.max(128, W * 0.28));
  const maxBarW  = Math.max(24, mid - labelW - 20);
  const isDrilled = !!state.filters.focusedHead;

  const rows = topHeads.map((item, idx) => {
    const y      = 28 + idx * rowH;
    const rw     = (item.revenue / maxVal) * maxBarW;
    const ow     = (item.outflow / maxVal) * maxBarW;
    const isActive = state.filters.focusedHead === item.head;
    const opacity  = isDrilled ? (isActive ? 1 : 0.22) : 0.90;
    const nameMax  = Math.max(12, Math.floor(labelW / 7));
    return `
      <g class="head-group" data-head-drill="${escapeHtml(item.head)}"
         style="opacity:${opacity};cursor:pointer" role="button" tabindex="0">
        <text x="${mid - Math.max(ow,2) - 10}" y="${y+13}" text-anchor="end"
              font-size="11" fill="rgba(100,130,200,0.60)"
              font-family="JetBrains Mono,monospace">${escapeHtml(truncate(item.head, nameMax))}</text>
        <rect class="head-bar-motion outflow" style="--motion-index:${idx}" x="${mid - Math.max(ow,2)}" y="${y}" width="${Math.max(ow,2)}" height="12" rx="2"
              fill="${isActive ? "#fb7185" : "rgba(251,113,133,0.80)"}"/>
        <rect class="head-bar-motion revenue" style="--motion-index:${idx}" x="${mid+1}" y="${y}" width="${Math.max(rw,2)}" height="12" rx="2"
              fill="${isActive ? "#a78bfa" : "rgba(167,139,250,0.80)"}"/>
        <text x="${mid - Math.max(ow,2) - 10}" y="${y+26}" text-anchor="end"
              font-size="9.5" fill="rgba(251,113,133,0.65)"
              font-family="JetBrains Mono,monospace">${shortCurrency(item.outflow)} · ${shareOf(item.outflow, totalOutflow)}</text>
        <text x="${mid + Math.max(rw,2) + 10}" y="${y+26}" text-anchor="start"
              font-size="9.5" fill="rgba(167,139,250,0.65)"
              font-family="JetBrains Mono,monospace">${shortCurrency(item.revenue)} · ${shareOf(item.revenue, totalRevenue)}</text>
        <rect x="0" y="${y-2}" width="${W}" height="${rowH}" fill="transparent" class="head-hit"/>
      </g>`;
  }).join("");

  els.headChart.innerHTML = `
    <svg class="chart-redraw" viewBox="0 0 ${W} ${H}" width="100%" height="${H}"
         role="img" aria-label="Top account heads chart" style="overflow:visible;display:block">
      <text x="${mid-14}" y="16" text-anchor="end" font-size="9.5"
            fill="rgba(251,113,133,0.50)" font-family="JetBrains Mono,monospace"
            letter-spacing="0.08em">← OUTFLOW</text>
      <text x="${mid+14}" y="16" text-anchor="start" font-size="9.5"
            fill="rgba(167,139,250,0.50)" font-family="JetBrains Mono,monospace"
            letter-spacing="0.08em">REVENUE →</text>
      <line x1="${mid}" y1="20" x2="${mid}" y2="${H-8}" stroke="rgba(80,110,200,0.16)"/>
      ${rows}
    </svg>`;
  markUpdated(els.headChart, "slice-glow");

  Array.from(els.headChart.querySelectorAll(".head-group")).forEach(node => {
    const head = node.dataset.headDrill;
    const item = topHeads.find(d => d.head === head);
    if (!item) return;

    node.addEventListener("mouseenter", e => showTooltip(e, `
      <div class="tip-title">${escapeHtml(item.head)}</div>
      <div class="tip-row"><span class="tip-dot" style="background:#a78bfa"></span><span>Revenue</span><strong>${formatCurrency(item.revenue)} · ${shareOf(item.revenue, totalRevenue)}</strong></div>
      <div class="tip-row"><span class="tip-dot" style="background:#fb7185"></span><span>Outflow</span><strong>${formatCurrency(item.outflow)} · ${shareOf(item.outflow, totalOutflow)}</strong></div>
      <div class="tip-hint">Click to drill in</div>`));
    node.addEventListener("mousemove",  e => positionTooltip(e, getTooltip()));
    node.addEventListener("mouseleave", hideTooltip);
    node.addEventListener("click", () => {
      hideTooltip();
      state.filters.focusedHead = state.filters.focusedHead === head ? "" : head;
      render();
    });
    node.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        state.filters.focusedHead = state.filters.focusedHead === head ? "" : head;
        render();
      }
    });
  });
}
