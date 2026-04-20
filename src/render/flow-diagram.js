import { escapeHtml } from "../core/escape.js";
import { formatCurrency, shortCurrency } from "../config/currency.js";
import { state } from "../store/state.js";
import { render } from "../store/renderer.js";

const MAX_VISIBLE_HEADS = 5;

export function renderFlowDiagram(headSummary = [], target) {
  if (!target) return;

  const revenue = topByValue(headSummary, "revenue");
  const outflow = topByValue(headSummary, "outflow");
  const revenueTotal = revenue.reduce((sum, item) => sum + item.revenue, 0);
  const outflowTotal = outflow.reduce((sum, item) => sum + item.outflow, 0);
  const net = revenueTotal - outflowTotal;

  if (!revenue.length && !outflow.length) {
    target.innerHTML = `<div class="chart-empty">No cashflow heads to show.</div>`;
    return;
  }

  target.innerHTML = `
    <div class="cashflow-bridge" role="group" aria-label="Ranked cashflow bridge">
      <section class="cashflow-bridge-side cashflow-bridge-in" aria-label="Cash in">
        <div class="cashflow-bridge-side-title">
          <span>Cash In</span>
          <strong>${escapeHtml(formatCurrency(revenueTotal))}</strong>
        </div>
        <div class="cashflow-bridge-stack">
          ${revenue.map((item, index) => renderBridgeBar(item, index, revenueTotal, "cash in")).join("")}
        </div>
      </section>

      <div class="cashflow-net-core" aria-label="Net cash through top heads">
        <span>NET</span>
        <strong class="cashflow-net-total" title="${escapeHtml(formatCurrency(net))}">${escapeHtml(shortCurrency(net))}</strong>
        <em>Visible slice</em>
      </div>

      <section class="cashflow-bridge-side cashflow-bridge-out" aria-label="Cash out">
        <div class="cashflow-bridge-side-title">
          <span>Cash Out</span>
          <strong>${escapeHtml(formatCurrency(outflowTotal))}</strong>
        </div>
        <div class="cashflow-bridge-stack">
          ${outflow.map((item, index) => renderBridgeBar(item, index, outflowTotal, "cash out")).join("")}
        </div>
      </section>
    </div>
    <p class="cashflow-bridge-note">Hover any bar for the full head, exact amount, share, and direction. Click a bar to drill the dashboard.</p>
  `;

  target.querySelectorAll(".cashflow-bridge-bar").forEach((bar) => {
    bar.addEventListener("click", () => toggleHeadDrill(bar.dataset.head));
    bar.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      toggleHeadDrill(bar.dataset.head);
    });
  });
}

function topByValue(headSummary, key) {
  return headSummary
    .filter((item) => item[key] > 0)
    .sort((a, b) => b[key] - a[key])
    .slice(0, MAX_VISIBLE_HEADS);
}

function renderBridgeBar(item, index, total, flow) {
  const isInflow = flow === "cash in";
  const value = isInflow ? item.revenue : item.outflow;
  const share = value / Math.max(total, 1);
  const shareLabel = `${(share * 100).toFixed(1)}%`;
  const width = Math.max(0.2, Math.min(1, share));
  const signedAmount = `${isInflow ? "+" : "-"}${formatCurrency(value)}`;
  const title = `${item.head}: ${flow} ${formatCurrency(value)} (${shareLabel} of visible ${isInflow ? "revenue" : "outflow"})`;
  const riskClass = !isInflow && share > 0.28 ? "is-risk" : "";
  const activeClass = state.filters.focusedHead === item.head ? "is-active" : "";

  return `
    <button
      class="cashflow-bridge-bar ${isInflow ? "is-inflow" : "is-outflow"} ${riskClass} ${activeClass}"
      type="button"
      title="${escapeHtml(title)}"
      aria-label="${escapeHtml(title)}"
      data-head="${escapeHtml(item.head)}"
      data-flow="${flow}"
      style="--bar-size:${width.toFixed(3)}; --motion-index:${index};"
    >
      <span class="cashflow-bridge-bar-fill" aria-hidden="true"></span>
      <span class="cashflow-bridge-bar-content">
        <span class="cashflow-bridge-bar-label">${escapeHtml(item.head)}</span>
        <span class="cashflow-bridge-bar-share">${shareLabel}</span>
        <strong class="cashflow-bridge-bar-amount">${escapeHtml(signedAmount)}</strong>
      </span>
    </button>
  `;
}

function toggleHeadDrill(head) {
  if (!head) return;
  state.filters.focusedHead = state.filters.focusedHead === head ? "" : head;
  render();
}
