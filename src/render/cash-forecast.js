import { escapeHtml } from "../core/escape.js";
import { formatCurrency, shortCurrency } from "../config/currency.js";

export function renderCashForecast(forecast, target) {
  if (!target) return;
  if (!forecast) {
    target.innerHTML = `<div class="chart-empty">Load data and enter a current bank balance to project the next 13 weeks.</div>`;
    return;
  }

  const statusClass = forecast.cashOutDate ? "critical" : (forecast.hasLimitedHistory ? "warning" : "normal");
  const statusText = forecast.cashOutDate
    ? `Projected cash crosses below zero in the week of ${forecast.cashOutDate}.`
    : `Projected ending cash is ${formatCurrency(forecast.endingCash)} after 13 weeks.`;
  const lowPoint = `Lowest projected week: ${forecast.minimumCashWeek} at ${formatCurrency(forecast.minimumCash)}.`;

  target.innerHTML = `
    <div class="cash-forecast-hero ${statusClass}">
      ${renderForecastSvg(forecast)}
      <div class="forecast-legend" aria-label="Forecast visual legend">
        <span><i class="legend-dot ending"></i>Ending cash dot</span>
        <span><i class="legend-bar in"></i>Weekly net bar</span>
        <span><i class="legend-pin"></i>Manual event</span>
      </div>
      <div class="cash-forecast-summary">
        <article class="forecast-callout ${statusClass}">
          <strong>${escapeHtml(statusText)}</strong>
          <span>${escapeHtml(lowPoint)}</span>
        </article>
        <article>
          <strong>${formatCurrency(forecast.startingCash)}</strong>
          <span>Starting cash</span>
        </article>
        <article>
          <strong>${formatCurrency(forecast.averageWeeklyInflow)}</strong>
          <span>Avg weekly cash in</span>
        </article>
        <article>
          <strong>${formatCurrency(forecast.averageWeeklyOutflow)}</strong>
          <span>Avg weekly cash out</span>
        </article>
      </div>
    </div>
  `;
}

export function renderForecastEvents(events, target) {
  if (!target) return;
  if (!events.length) {
    target.innerHTML = `
      <div class="chip-note">No upcoming manual cash events yet.</div>
      <article class="hero-stat"><div class="l">Manual Events</div><div class="v">0</div></article>
      <article class="hero-stat"><div class="l">Cadence</div><div class="v">13 <span class="unit">weeks</span></div></article>
      <article class="hero-stat"><div class="l">Forecast Type</div><div class="v">Actuals</div></article>
    `;
    return;
  }

  target.innerHTML = events.map((event) => `
    <article class="forecast-event">
      <div>
        <strong>${escapeHtml(event.label || (event.flow === "cash in" ? "Cash in" : "Cash out"))}</strong>
        <span>${escapeHtml(event.date)} · ${escapeHtml(event.flow)} · ${formatCurrency(event.amount)}</span>
      </div>
      <button class="text-button" type="button" data-delete-forecast-event="${escapeHtml(event.id)}">Delete</button>
    </article>
  `).join("");
}

function renderForecastSvg(forecast) {
  const width = 960;
  const height = 380;
  const pad = { top: 28, right: 34, bottom: 48, left: 156 };
  const netBand = {
    y: height - pad.bottom - 40,
    height: 42
  };
  const plotBottom = netBand.y - 62;
  const points = [
    { label: "Start", cash: forecast.startingCash, events: [] },
    ...forecast.weeks.map((week, index) => ({
      label: `W${index + 1}`,
      cash: week.endingCash,
      net: week.expectedInflow - week.expectedOutflow + week.manualInflow - week.manualOutflow,
      events: week.events,
      weekStart: week.weekStart
    }))
  ];
  const cashValues = points.map((point) => point.cash);
  const netValues = points.slice(1).map((point) => Math.abs(point.net || 0));
  const maxNet = Math.max(1, ...netValues);
  let minCash = Math.min(0, ...cashValues);
  let maxCash = Math.max(0, ...cashValues);
  if (minCash === maxCash) {
    minCash -= 1;
    maxCash += 1;
  }
  const padding = (maxCash - minCash) * 0.16;
  minCash -= padding;
  maxCash += padding;

  const x = (index) => pad.left + (index / (points.length - 1 || 1)) * (width - pad.left - pad.right);
  const y = (value) => pad.top + ((maxCash - value) / (maxCash - minCash || 1)) * (plotBottom - pad.top);
  const zeroY = y(0);
  const path = points.map((point, index) => `${index ? "L" : "M"} ${x(index).toFixed(2)} ${y(point.cash).toFixed(2)}`).join(" ");
  const areaPath = `${path} L ${x(points.length - 1).toFixed(2)} ${zeroY.toFixed(2)} L ${x(0).toFixed(2)} ${zeroY.toFixed(2)} Z`;
  const ticks = buildTicks(minCash, maxCash, 4);

  return `
    <svg class="forecast-flightpath" viewBox="0 0 ${width} ${height}" role="img" aria-label="13 week projected cash flight path">
      <defs>
        <linearGradient id="forecastArea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="var(--accent-2)" stop-opacity="0.02"/>
        </linearGradient>
        <filter id="forecastGlow" x="-20%" y="-80%" width="140%" height="260%">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      ${ticks.map((tick) => `
        <g class="forecast-grid">
          <line x1="${pad.left}" y1="${y(tick).toFixed(2)}" x2="${width - pad.right}" y2="${y(tick).toFixed(2)}"></line>
          <text x="${pad.left - 16}" y="${y(tick).toFixed(2)}">${escapeHtml(shortCurrency(tick))}</text>
          <title>${escapeHtml(formatCurrency(tick))}</title>
        </g>
      `).join("")}
      <line class="forecast-zero" x1="${pad.left}" y1="${zeroY.toFixed(2)}" x2="${width - pad.right}" y2="${zeroY.toFixed(2)}"></line>
      <path class="forecast-area" d="${areaPath}"></path>
      <g class="forecast-net-band" aria-label="Weekly net cash bars">
        <line x1="${pad.left}" y1="${netBand.y.toFixed(2)}" x2="${width - pad.right}" y2="${netBand.y.toFixed(2)}"></line>
        <text x="${pad.left - 16}" y="${(netBand.y + 4).toFixed(2)}">weekly net</text>
        ${points.slice(1).map((point, index) => renderForecastBar(point, x(index + 1), netBand, maxNet)).join("")}
      </g>
      <path class="forecast-line-shadow" d="${path}"></path>
      <path class="forecast-line" d="${path}">
        <animate attributeName="stroke-dashoffset" from="950" to="0" dur="1.2s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1"/>
      </path>
      ${points.map((point, index) => renderPoint(point, x(index), y(point.cash))).join("")}
      ${points.map((point, index) => point.events?.length ? renderEventPin(point, x(index), y(point.cash), index) : "").join("")}
      ${points.map((point, index) => {
        if (index !== 0 && index !== points.length - 1 && index % 3 !== 0) return "";
        return `<text class="forecast-x" x="${x(index).toFixed(2)}" y="${height - 14}">${escapeHtml(point.label)}</text>`;
      }).join("")}
    </svg>
  `;
}

function renderForecastBar(point, xValue, netBand, maxNet) {
  const net = point.net || 0;
  const height = Math.max(4, Math.min(netBand.height, Math.abs(net) / maxNet * netBand.height));
  const top = net >= 0 ? netBand.y - height : netBand.y;
  const kind = net >= 0 ? "in" : "out";
  const title = `${point.weekStart || point.label}: weekly net ${formatCurrency(net)}; ending cash ${formatCurrency(point.cash)}`;
  return `<rect class="forecast-bar ${kind}" x="${(xValue - 6).toFixed(2)}" y="${top.toFixed(2)}" width="12" height="${height.toFixed(2)}" rx="3"><title>${escapeHtml(title)}</title></rect>`;
}

function renderPoint(point, xValue, yValue) {
  const kind = point.cash < 0 ? "danger" : "safe";
  const netText = Number.isFinite(point.net) ? `; weekly net ${formatCurrency(point.net)}` : "";
  const eventText = point.events?.length
    ? `; events: ${point.events.map((event) => `${event.label || event.flow} ${formatCurrency(event.amount)}`).join(", ")}`
    : "";
  return `
    <g class="forecast-point ${kind}">
      <circle cx="${xValue.toFixed(2)}" cy="${yValue.toFixed(2)}" r="4"></circle>
      <title>${escapeHtml(`${point.weekStart || point.label}: ending cash ${formatCurrency(point.cash)}${netText}${eventText}`)}</title>
    </g>
  `;
}

function renderEventPin(point, xValue, yValue, index) {
  const labels = point.events.map((event) => `${event.label || event.flow}: ${event.flow} ${formatCurrency(event.amount)}`).join(", ");
  return `
    <g class="forecast-pin" style="--motion-index:${index}">
      <line x1="${xValue.toFixed(2)}" y1="${(yValue - 30).toFixed(2)}" x2="${xValue.toFixed(2)}" y2="${(yValue - 8).toFixed(2)}"></line>
      <circle cx="${xValue.toFixed(2)}" cy="${(yValue - 34).toFixed(2)}" r="5"></circle>
      <title>${escapeHtml(labels)}</title>
    </g>
  `;
}

function buildTicks(min, max, count) {
  const step = (max - min) / count;
  return Array.from({ length: count + 1 }, (_, index) => min + step * index);
}
