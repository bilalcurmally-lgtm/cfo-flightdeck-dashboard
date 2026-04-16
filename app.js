(function () {
  const state = {
    rawRows: [],
    records: [],
    visibleRows: [],
    columns: [],
    grain: "daily",
    dateFormat: "auto",
    filters: {
      startDate: "",
      endDate: "",
      search: "",
      flows: new Set(["revenue", "outflow"]),
      selectedHeads: new Set(),
      headSearch: "",
      focusedPeriod: "",
      focusedHead: ""
    },
    mapping: {
      date: "",
      amount: "",
      type: "",
      head: "",
      parent: "",
      description: ""
    }
  };

  const els = {
    csvFile: document.getElementById("csvFile"),
    loadSampleBtn: document.getElementById("loadSampleBtn"),
    fileStatus: document.getElementById("fileStatus"),
    applyMappingBtn: document.getElementById("applyMappingBtn"),
    exportVisibleBtn: document.getElementById("exportVisibleBtn"),
    resetFiltersBtn: document.getElementById("resetFiltersBtn"),
    clearHeadFilterBtn: document.getElementById("clearHeadFilterBtn"),
    startDate: document.getElementById("startDate"),
    endDate: document.getElementById("endDate"),
    dateRangeWarn: document.getElementById("dateRangeWarn"),
    searchInput: document.getElementById("searchInput"),
    headSearch: document.getElementById("headSearch"),
    headChecklist: document.getElementById("headChecklist"),
    breadcrumbs: document.getElementById("breadcrumbs"),
    totalRevenue: document.getElementById("totalRevenue"),
    totalOutflow: document.getElementById("totalOutflow"),
    netCash: document.getElementById("netCash"),
    efficiencyRatio: document.getElementById("efficiencyRatio"),
    revenueDelta: document.getElementById("revenueDelta"),
    outflowDelta: document.getElementById("outflowDelta"),
    netDelta: document.getElementById("netDelta"),
    efficiencyNote: document.getElementById("efficiencyNote"),
    insightList: document.getElementById("insightList"),
    focusStats: document.getElementById("focusStats"),
    trendChart: document.getElementById("trendChart"),
    headChart: document.getElementById("headChart"),
    periodMatrix: document.getElementById("periodMatrix"),
    pressureList: document.getElementById("pressureList"),
    detailBody: document.getElementById("detailBody"),
    detailFooter: document.getElementById("detailFooter")
  };

  const mappingSelects = {
    date: document.getElementById("dateColumn"),
    amount: document.getElementById("amountColumn"),
    type: document.getElementById("typeColumn"),
    head: document.getElementById("headColumn"),
    parent: document.getElementById("parentColumn"),
    description: document.getElementById("descriptionColumn")
  };

  const dateFormatSelect = document.getElementById("dateFormatSelect");

  const aliasInputs = {
    revenue: document.getElementById("revenueAliases"),
    outflow: document.getElementById("outflowAliases")
  };

  const grainButtons = Array.from(document.querySelectorAll("[data-grain]"));
  const flowButtons = Array.from(document.querySelectorAll("[data-flow-filter]"));

  function init() {
    wireEvents();
    renderEmptyState();
  }

  function wireEvents() {
    els.csvFile.addEventListener("change", onFileSelected);
    els.loadSampleBtn.addEventListener("click", loadSampleData);
    els.applyMappingBtn.addEventListener("click", applyCurrentMapping);
    els.exportVisibleBtn.addEventListener("click", exportVisibleRows);
    els.resetFiltersBtn.addEventListener("click", resetAllFilters);
    els.clearHeadFilterBtn.addEventListener("click", () => {
      state.filters.selectedHeads.clear();
        render();
      });
    });

    dateFormatSelect.addEventListener("change", () => {
      state.dateFormat = dateFormatSelect.value;
      if (state.rawRows.length) applyCurrentMapping();
    });


    document.addEventListener("keydown", (event) => {
      if (event.target.tagName === "INPUT" || event.target.tagName === "SELECT" || event.target.tagName === "TEXTAREA") return;
      const grainMap = { "1": "daily", "2": "weekly", "3": "monthly" };
      const grain = grainMap[event.key];
      if (grain) {
        state.grain = grain;
        state.filters.focusedPeriod = "";
        state.filters.focusedHead = "";
        grainButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.grain === grain));
        render();
      }
    });

    grainButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.grain = button.dataset.grain;
        state.filters.focusedPeriod = "";
        state.filters.focusedHead = "";
        grainButtons.forEach((item) => item.classList.toggle("is-active", item === button));
        render();
      });
    });

    document.body.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.stopPropagation();
    });

    document.body.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const file = event.dataTransfer.files[0];
      if (!file) return;
      if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
        els.fileStatus.textContent = "Please drop a CSV file.";
        return;
      }
      file.text().then((text) => {
        ingestCsvText(text, file.name);
      }).catch(() => {
        els.fileStatus.textContent = "Could not read the dropped file.";
      });
    });
  }
        syncFlowButtons();
        render();
      });
    });

    [els.startDate, els.endDate, els.searchInput, els.headSearch].forEach((input) => {
      input.addEventListener("input", () => {
        state.filters.startDate = els.startDate.value;
        state.filters.endDate = els.endDate.value;
        state.filters.search = els.searchInput.value.trim().toLowerCase();
        state.filters.headSearch = els.headSearch.value.trim().toLowerCase();
        const inverted = state.filters.startDate && state.filters.endDate && state.filters.startDate > state.filters.endDate;
        els.dateRangeWarn.hidden = !inverted;
        if (inverted) {
          els.startDate.style.borderColor = "var(--danger)";
          els.endDate.style.borderColor = "var(--danger)";
        } else {
          els.startDate.style.borderColor = "";
          els.endDate.style.borderColor = "";
        }
        render();
      });
    });
  }

  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  const VALID_EXTENSIONS = [".csv"];
  const VALID_TYPES = ["text/csv", "text/plain", "application/vnd.ms-excel"];

  async function onFileSelected(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      els.fileStatus.textContent = `File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 50MB.`;
      return;
    }
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!VALID_EXTENSIONS.includes(ext) && !VALID_TYPES.includes(file.type)) {
      els.fileStatus.textContent = "Please upload a CSV file.";
      return;
    }
    try {
      const text = await file.text();
      ingestCsvText(text, file.name);
    } catch (error) {
      els.fileStatus.textContent = `Could not read file: ${error.message}`;
    }
  }

  async function loadSampleData() {
    try {
      const response = await fetch("./sample-finance.csv");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      ingestCsvText(text, "sample-finance.csv");
    } catch (error) {
      els.fileStatus.textContent = `Could not load sample data: ${error.message}`;
    }
  }

  function ingestCsvText(text, fileName) {
    const rows = parseCsv(text);
    if (!rows.length) {
      state.rawRows = [];
      state.records = [];
      state.columns = [];
      renderEmptyState("The CSV is empty or could not be parsed.");
      return;
    }

    state.rawRows = rows;
    state.columns = Object.keys(rows[0]);
    state.dateFormat = "auto";
    dateFormatSelect.value = "auto";
    setMappingDefaults();
    populateMappingControls();
    els.fileStatus.textContent = `Loaded ${fileName} with ${rows.length.toLocaleString()} rows. Review the mapping and click Apply Mapping.`;
    applyCurrentMapping();
  }

  function applyCurrentMapping() {
    state.mapping = Object.fromEntries(
      Object.entries(mappingSelects).map(([key, select]) => [key, select.value])
    );

    const required = ["date", "amount", "head"];
    const missing = required.filter((key) => !state.mapping[key]);
    if (missing.length) {
      renderEmptyState(`Map the required columns first: ${missing.join(", ")}.`);
      return;
    }

    if (state.dateFormat === "auto") {
      const detected = detectDateFormat(state.rawRows, state.mapping.date);
      dateFormatSelect.value = detected;
      state.dateFormat = detected;
    }

    let skipped = 0;
    const records = state.rawRows.map((row, index) => {
      const record = mapRowToRecord(row, index);
      if (!record) skipped += 1;
      return record;
    }).filter(Boolean);
    state.records = records.sort((a, b) => a.date - b.date);

    if (!state.records.length) {
      renderEmptyState("No valid records were produced from the selected mapping.");
      return;
    }

    if (skipped) {
      els.fileStatus.textContent = `Mapped ${records.length.toLocaleString()} rows. ${skipped.toLocaleString()} rows skipped (bad date or amount).`;
    }

    state.rawRows = rows;
    state.columns = Object.keys(rows[0]);
    setMappingDefaults();
    populateMappingControls();
    els.fileStatus.textContent = `Loaded ${fileName} with ${rows.length.toLocaleString()} rows. Review the mapping and click Apply Mapping.`;
    applyCurrentMapping();
  }

  function setMappingDefaults() {
    const columns = state.columns;
    const lower = columns.map((name) => name.toLowerCase());
    state.mapping = {
      date: matchColumn(columns, lower, ["date", "posting date", "transaction date", "entry date"]),
      amount: matchColumn(columns, lower, ["amount", "value", "total", "net amount", "signed amount"]),
      type: matchColumn(columns, lower, ["type", "flow", "flow type", "direction", "transaction type"]),
      head: matchColumn(columns, lower, ["account head", "head", "account", "gl account", "category", "account name"]),
      parent: matchColumn(columns, lower, ["parent", "parent head", "group", "major head", "class", "department"]),
      description: matchColumn(columns, lower, ["description", "memo", "narration", "details", "notes"])
    };
  }

  function populateMappingControls() {
    const options = ['<option value="">None</option>'].concat(
      state.columns.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    ).join("");

    Object.entries(mappingSelects).forEach(([key, select]) => {
      select.innerHTML = options;
      select.value = state.mapping[key] || "";
    });
  }

  function applyCurrentMapping() {
    state.mapping = Object.fromEntries(
      Object.entries(mappingSelects).map(([key, select]) => [key, select.value])
    );

    const required = ["date", "amount", "head"];
    const missing = required.filter((key) => !state.mapping[key]);
    if (missing.length) {
      renderEmptyState(`Map the required columns first: ${missing.join(", ")}.`);
      return;
    }

    const records = state.rawRows.map((row, index) => mapRowToRecord(row, index)).filter(Boolean);
    state.records = records.sort((a, b) => a.date - b.date);

    if (!state.records.length) {
      renderEmptyState("No valid records were produced from the selected mapping.");
      return;
    }

    const [firstDate, lastDate] = [state.records[0].dateISO, state.records[state.records.length - 1].dateISO];
    if (!els.startDate.value) els.startDate.value = firstDate;
    if (!els.endDate.value) els.endDate.value = lastDate;
    state.filters.startDate = els.startDate.value;
    state.filters.endDate = els.endDate.value;
    state.filters.focusedPeriod = "";
    state.filters.focusedHead = "";
    render();
  }

  function mapRowToRecord(row, index) {
    const date = parseDate(row[state.mapping.date]);
    const amountRaw = parseAmount(row[state.mapping.amount]);
    if (!date || amountRaw === null) return null;

    const typeValue = state.mapping.type ? String(row[state.mapping.type] || "").trim().toLowerCase() : "";
    const flow = classifyFlow(typeValue, amountRaw);
    const amount = Math.abs(amountRaw);
    const head = tidyValue(row[state.mapping.head], "Unassigned Head");
    const parent = tidyValue(state.mapping.parent ? row[state.mapping.parent] : "", "Unassigned Group");
    const description = tidyValue(state.mapping.description ? row[state.mapping.description] : "", "—");
    const signedNet = flow === "revenue" ? amount : -amount;

    return {
      id: `${date.toISOString()}-${index}`,
      date,
      dateISO: toIsoDate(date),
      periodDaily: toIsoDate(date),
      periodWeekly: toIsoDate(startOfWeek(date)),
      periodMonthly: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      head,
      parent,
      description,
      flow,
      amount,
      signedNet
    };
  }

  function classifyFlow(typeValue, amountRaw) {
    const revenueTokens = aliasInputs.revenue.value.toLowerCase().split(",").map((item) => item.trim()).filter(Boolean);
    const outflowTokens = aliasInputs.outflow.value.toLowerCase().split(",").map((item) => item.trim()).filter(Boolean);
    if (typeValue) {
      if (revenueTokens.some((token) => typeValue.includes(token))) return "revenue";
      if (outflowTokens.some((token) => typeValue.includes(token))) return "outflow";
    }
    return amountRaw >= 0 ? "revenue" : "outflow";
  }

  function render() {
    detailRowCap = 250;
    if (!state.records.length) {
      renderEmptyState();
      return;
    }

    syncFlowButtons();
    renderHeadChecklist();

    const filtered = filterRecords(state.records);
    state.visibleRows = filtered;
    renderBreadcrumbs();

    if (!filtered.length) {
      renderEmptyState("No rows match the current filters.");
      return;
    }

    const periodSummary = buildPeriodSummary(filtered, state.grain);
    const headSummary = buildHeadSummary(filtered);

    const safeRender = (name, fn) => {
      try { fn(); } catch (error) { console.error(`[CFO Flight Deck] ${name} failed:`, error); }
    };

    safeRender("kpis", () => renderKpis(periodSummary));
    safeRender("insights", () => renderInsights(periodSummary, headSummary, filtered));
    safeRender("focus", () => renderFocus(filtered, headSummary));
    safeRender("trendChart", () => renderTrendChart(periodSummary));
    safeRender("headChart", () => renderHeadChart(headSummary));
    safeRender("periodMatrix", () => renderPeriodMatrix(periodSummary));
    safeRender("pressureList", () => renderPressureList(headSummary));
    safeRender("detailTable", () => renderDetailTable(filtered));
  }

  function filterRecords(records) {
    return records.filter((record) => {
      const withinStart = !state.filters.startDate || record.dateISO >= state.filters.startDate;
      const withinEnd = !state.filters.endDate || record.dateISO <= state.filters.endDate;
      const matchesSearch = !state.filters.search || [
        record.head,
        record.parent,
        record.description,
        record.flow
      ].join(" ").toLowerCase().includes(state.filters.search);
      const matchesFlow = state.filters.flows.has(record.flow);
      const matchesHeads = !state.filters.selectedHeads.size || state.filters.selectedHeads.has(record.head);
      const periodKey = grainKey(record, state.grain);
      const matchesPeriod = !state.filters.focusedPeriod || periodKey === state.filters.focusedPeriod;
      const matchesFocusedHead = !state.filters.focusedHead || record.head === state.filters.focusedHead;
      return withinStart && withinEnd && matchesSearch && matchesFlow && matchesHeads && matchesPeriod && matchesFocusedHead;
    });
  }

  function renderHeadChecklist() {
    const counts = new Map();
    state.records.forEach((record) => {
      counts.set(record.head, (counts.get(record.head) || 0) + 1);
    });

    const allHeads = Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .filter(([head]) => !state.filters.headSearch || head.toLowerCase().includes(state.filters.headSearch));

    els.headChecklist.innerHTML = allHeads.map(([head, count]) => {
      const checked = !state.filters.selectedHeads.size || state.filters.selectedHeads.has(head);
      return `
        <label class="head-option">
          <input data-head-option="${escapeHtml(head)}" type="checkbox" ${checked ? "checked" : ""}>
          <span>${escapeHtml(head)}</span>
          <small>${count.toLocaleString()}</small>
        </label>
      `;
    }).join("") || `<div class="chip-note">No heads match that search.</div>`;

    Array.from(els.headChecklist.querySelectorAll("[data-head-option]")).forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const head = checkbox.dataset.headOption;
        const allHeadValues = Array.from(els.headChecklist.querySelectorAll("[data-head-option]")).map((item) => item.dataset.headOption);
        if (state.filters.selectedHeads.size === 0) {
          allHeadValues.forEach((value) => state.filters.selectedHeads.add(value));
        }
        if (checkbox.checked) {
          state.filters.selectedHeads.add(head);
        } else {
          state.filters.selectedHeads.delete(head);
        }
        if (state.filters.selectedHeads.size === allHeadValues.length) {
          state.filters.selectedHeads.clear();
        }
        render();
      });
    });
  }

  function renderBreadcrumbs() {
    const crumbs = [`<span class="crumb">Grain: ${escapeHtml(capitalize(state.grain))}</span>`];
    if (state.filters.focusedPeriod) crumbs.push(renderCrumb("Period", humanPeriodLabel(state.filters.focusedPeriod, state.grain), "period"));
    if (state.filters.focusedHead) crumbs.push(renderCrumb("Head", state.filters.focusedHead, "head"));
    if (state.filters.selectedHeads.size) crumbs.push(renderCrumb("Selected heads", `${state.filters.selectedHeads.size} heads`, "selectedHeads"));
    if (state.filters.search) crumbs.push(renderCrumb("Search", state.filters.search, "search"));
    if (state.filters.startDate || state.filters.endDate) {
      const range = `${state.filters.startDate || "start"} to ${state.filters.endDate || "end"}`;
      crumbs.push(`<span class="crumb">Range: ${escapeHtml(range)}</span>`);
    }

    els.breadcrumbs.innerHTML = crumbs.join("");
    Array.from(els.breadcrumbs.querySelectorAll("[data-clear-crumb]")).forEach((button) => {
      button.addEventListener("click", () => clearCrumb(button.dataset.clearCrumb));
    });
  }

  function renderCrumb(label, value, key) {
    return `<span class="crumb">${escapeHtml(label)}: ${escapeHtml(value)} <button data-clear-crumb="${escapeHtml(key)}" type="button">x</button></span>`;
  }

  function clearCrumb(key) {
    if (key === "period") state.filters.focusedPeriod = "";
    if (key === "head") state.filters.focusedHead = "";
    if (key === "selectedHeads") state.filters.selectedHeads.clear();
    if (key === "search") {
      state.filters.search = "";
      els.searchInput.value = "";
    }
    render();
  }

  function renderKpis(periodSummary) {
    const totals = periodSummary.reduce((acc, item) => {
      acc.revenue += item.revenue;
      acc.outflow += item.outflow;
      acc.net += item.net;
      return acc;
    }, { revenue: 0, outflow: 0, net: 0 });

    els.totalRevenue.textContent = formatCurrency(totals.revenue);
    els.totalOutflow.textContent = formatCurrency(totals.outflow);
    els.netCash.textContent = formatCurrency(totals.net);
    els.netCash.className = totals.net >= 0 ? "metric-positive" : "metric-negative";
    els.efficiencyRatio.textContent = totals.outflow ? `${(totals.revenue / totals.outflow).toFixed(2)}x` : "∞";

    const comparison = compareLatestPeriods(periodSummary);
    els.revenueDelta.textContent = comparison ? `${signedPercent(comparison.revenueChange)} vs previous ${state.grain} period` : "Need at least two periods for comparison.";
    els.outflowDelta.textContent = comparison ? `${signedPercent(comparison.outflowChange)} vs previous ${state.grain} period` : "Need at least two periods for comparison.";
    els.netDelta.textContent = comparison ? `${signedPercent(comparison.netChange)} vs previous ${state.grain} period` : "Need at least two periods for comparison.";
    els.efficiencyNote.textContent = totals.outflow ? `${((totals.net / totals.outflow) * 100).toFixed(1)}% net per outflow dollar` : "No outflow in the selected slice.";
  }

  function renderInsights(periodSummary, headSummary, filtered) {
    const items = [];
    const topRevenueHead = [...headSummary].sort((a, b) => b.revenue - a.revenue)[0];
    const topOutflowHead = [...headSummary].sort((a, b) => b.outflow - a.outflow)[0];
    const worstPeriod = [...periodSummary].sort((a, b) => a.net - b.net)[0];
    const bestPeriod = [...periodSummary].sort((a, b) => b.net - a.net)[0];
    const outflowTotal = headSummary.reduce((sum, item) => sum + item.outflow, 0);
    const topThreeOutflows = [...headSummary].sort((a, b) => b.outflow - a.outflow).slice(0, 3).reduce((sum, item) => sum + item.outflow, 0);
    const concentration = outflowTotal ? (topThreeOutflows / outflowTotal) * 100 : 0;
    const anomaly = detectOutflowAnomaly(periodSummary);

    if (topRevenueHead && topRevenueHead.revenue > 0) {
      items.push({
        level: "normal",
        title: `Revenue is led by ${topRevenueHead.head}`,
        body: `${formatCurrency(topRevenueHead.revenue)} contributed from this head, ${shareOf(topRevenueHead.revenue, headSummary.reduce((sum, item) => sum + item.revenue, 0))} of selected revenue.`
      });
    }
    if (topOutflowHead && topOutflowHead.outflow > 0) {
      items.push({
        level: topOutflowHead.outflow > outflowTotal * 0.35 ? "warning" : "normal",
        title: `${topOutflowHead.head} is your biggest cash pull`,
        body: `${formatCurrency(topOutflowHead.outflow)} left through this head, ${shareOf(topOutflowHead.outflow, outflowTotal)} of total outflows.`
      });
    }
    if (bestPeriod) {
      items.push({
        level: bestPeriod.net >= 0 ? "normal" : "warning",
        title: `Best ${state.grain} period: ${humanPeriodLabel(bestPeriod.period, state.grain)}`,
        body: `Net cash reached ${formatCurrency(bestPeriod.net)} on revenue of ${formatCurrency(bestPeriod.revenue)}.`
      });
    }
    if (worstPeriod) {
      items.push({
        level: worstPeriod.net < 0 ? "critical" : "normal",
        title: `Weakest ${state.grain} period: ${humanPeriodLabel(worstPeriod.period, state.grain)}`,
        body: `Net cash landed at ${formatCurrency(worstPeriod.net)} with outflows of ${formatCurrency(worstPeriod.outflow)}.`
      });
    }
    if (anomaly) {
      items.push({
        level: anomaly.severity,
        title: `Outflow spike detected in ${humanPeriodLabel(anomaly.period, state.grain)}`,
        body: `${formatCurrency(anomaly.outflow)} of outflows, ${anomaly.multiple.toFixed(1)}x the average selected period. Click the trend chart to inspect it.`
      });
    }
    if (concentration) {
      items.push({
        level: concentration > 65 ? "warning" : "normal",
        title: "Outflows are concentrated",
        body: `Top three heads account for ${concentration.toFixed(1)}% of cash outflows in the current slice.`
      });
    }
    if (!items.length && filtered.length) {
      items.push({
        level: "normal",
        title: "Slice is loaded",
        body: `${filtered.length.toLocaleString()} rows are visible. Start drilling into a period or head for deeper insight.`
      });
    }

    els.insightList.innerHTML = items.map((item) => `
      <article class="insight-item ${item.level}">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.body)}</span>
      </article>
    `).join("");
  }

  function renderFocus(filtered, headSummary) {
    const parentSummary = Array.from(groupBy(filtered, (record) => record.parent), ([parent, rows]) => ({
      parent,
      revenue: rows.filter((row) => row.flow === "revenue").reduce((sum, row) => sum + row.amount, 0),
      outflow: rows.filter((row) => row.flow === "outflow").reduce((sum, row) => sum + row.amount, 0)
    })).sort((a, b) => (b.revenue + b.outflow) - (a.revenue + a.outflow)).slice(0, 4);

    const headCount = new Set(filtered.map((row) => row.head)).size;
    const parentCount = new Set(filtered.map((row) => row.parent)).size;
    const largestParent = parentSummary[0];
    const largestHead = headSummary[0];
    const items = [
      { title: "Visible rows", body: `${filtered.length.toLocaleString()} transactions in play.` },
      { title: "Heads in slice", body: `${headCount.toLocaleString()} account heads across ${parentCount.toLocaleString()} parent groups.` }
    ];
    if (largestParent) items.push({ title: `Largest parent group: ${largestParent.parent}`, body: `Revenue ${formatCurrency(largestParent.revenue)}, outflow ${formatCurrency(largestParent.outflow)}.` });
    if (largestHead) items.push({ title: `Most active head: ${largestHead.head}`, body: `Revenue ${formatCurrency(largestHead.revenue)}, outflow ${formatCurrency(largestHead.outflow)}.` });

    els.focusStats.innerHTML = items.map((item) => `
      <article class="focus-item">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.body)}</span>
      </article>
    `).join("");
  }

  function renderTrendChart(periodSummary) {
    if (!periodSummary.length) {
      els.trendChart.innerHTML = `<div class="chart-empty">No period data to plot.</div>`;
      return;
    }

    const width = 920;
    const height = 320;
    const margin = { top: 16, right: 16, bottom: 70, left: 70 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const barSlot = innerWidth / periodSummary.length;
    const barWidth = Math.max(12, Math.min(34, barSlot * 0.32));
    const maxValue = Math.max(...periodSummary.flatMap((item) => [item.revenue, item.outflow, Math.abs(item.net)]), 1);

    const bars = periodSummary.map((item, index) => {
      const xCenter = margin.left + index * barSlot + barSlot / 2;
      const revenueHeight = (item.revenue / maxValue) * innerHeight;
      const outflowHeight = (item.outflow / maxValue) * innerHeight;
      const revenueY = margin.top + innerHeight - revenueHeight;
      const outflowY = margin.top + innerHeight - outflowHeight;
      const label = truncate(humanPeriodLabel(item.period, state.grain), 12);
      return `
        <g class="period-group" data-period-drill="${escapeHtml(item.period)}">
          <rect x="${xCenter - barWidth - 3}" y="${revenueY}" width="${barWidth}" height="${Math.max(revenueHeight, 2)}" rx="8" fill="rgba(16, 99, 77, 0.82)"></rect>
          <rect x="${xCenter + 3}" y="${outflowY}" width="${barWidth}" height="${Math.max(outflowHeight, 2)}" rx="8" fill="rgba(180, 79, 29, 0.78)"></rect>
          <text x="${xCenter}" y="${height - 28}" text-anchor="middle" font-size="11" fill="#64717b">${escapeHtml(label)}</text>
          <text x="${xCenter - barWidth - 3 + barWidth / 2}" y="${revenueY - 6}" text-anchor="middle" font-size="10" fill="#10634d">${shortCurrency(item.revenue)}</text>
          <text x="${xCenter + 3 + barWidth / 2}" y="${outflowY - 6}" text-anchor="middle" font-size="10" fill="#b44f1d">${shortCurrency(item.outflow)}</text>
        </g>
      `;
    }).join("");

    const netPoints = periodSummary.map((item, index) => {
      const xCenter = margin.left + index * barSlot + barSlot / 2;
      const y = margin.top + innerHeight - ((item.net + maxValue) / (maxValue * 2)) * innerHeight;
      return `${xCenter},${y}`;
    }).join(" ");

    els.trendChart.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Revenue and outflow trend chart">
        <line x1="${margin.left}" y1="${margin.top + innerHeight}" x2="${width - margin.right}" y2="${margin.top + innerHeight}" stroke="rgba(16,33,44,0.18)"></line>
        <line x1="${margin.left}" y1="${margin.top + innerHeight / 2}" x2="${width - margin.right}" y2="${margin.top + innerHeight / 2}" stroke="rgba(16,33,44,0.08)" stroke-dasharray="6 6"></line>
        <polyline fill="none" stroke="#10212c" stroke-width="3" points="${netPoints}"></polyline>
        ${bars}
      </svg>
    `;

    Array.from(els.trendChart.querySelectorAll("[data-period-drill]")).forEach((node) => {
      node.style.cursor = "pointer";
      node.addEventListener("click", () => {
        state.filters.focusedPeriod = state.filters.focusedPeriod === node.dataset.periodDrill ? "" : node.dataset.periodDrill;
        render();
      });
    });
  }

  function renderHeadChart(headSummary) {
    if (!headSummary.length) {
      els.headChart.innerHTML = `<div class="chart-empty">No head data to plot.</div>`;
      return;
    }

    const topHeads = [...headSummary].sort((a, b) => (b.revenue + b.outflow) - (a.revenue + a.outflow)).slice(0, 10);
    const width = 920;
    const rowHeight = 28;
    const height = topHeads.length * rowHeight + 56;
    const middle = width / 2;
    const maxValue = Math.max(...topHeads.flatMap((item) => [item.revenue, item.outflow]), 1);

    const rows = topHeads.map((item, index) => {
      const y = 24 + index * rowHeight;
      const revenueWidth = (item.revenue / maxValue) * (middle - 180);
      const outflowWidth = (item.outflow / maxValue) * (middle - 180);
      return `
        <g data-head-drill="${escapeHtml(item.head)}">
          <text x="${middle}" y="${y + 14}" text-anchor="middle" font-size="12" fill="#10212c">${escapeHtml(truncate(item.head, 28))}</text>
          <rect x="${middle - outflowWidth}" y="${y + 18}" width="${Math.max(outflowWidth, 2)}" height="12" rx="6" fill="rgba(180,79,29,0.78)"></rect>
          <rect x="${middle}" y="${y + 18}" width="${Math.max(revenueWidth, 2)}" height="12" rx="6" fill="rgba(16,99,77,0.82)"></rect>
          <text x="${middle - outflowWidth - 8}" y="${y + 28}" text-anchor="end" font-size="11" fill="#b44f1d">${shortCurrency(item.outflow)}</text>
          <text x="${middle + revenueWidth + 8}" y="${y + 28}" text-anchor="start" font-size="11" fill="#10634d">${shortCurrency(item.revenue)}</text>
        </g>
      `;
    }).join("");

    els.headChart.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Top account heads chart">
        <line x1="${middle}" y1="18" x2="${middle}" y2="${height - 16}" stroke="rgba(16,33,44,0.2)"></line>
        ${rows}
      </svg>
    `;

    Array.from(els.headChart.querySelectorAll("[data-head-drill]")).forEach((node) => {
      node.style.cursor = "pointer";
      node.addEventListener("click", () => {
        state.filters.focusedHead = state.filters.focusedHead === node.dataset.headDrill ? "" : node.dataset.headDrill;
        render();
      });
    });
  }

  function renderPeriodMatrix(periodSummary) {
    if (!periodSummary.length) {
      els.periodMatrix.innerHTML = `<div class="chart-empty">No periods match the current filters.</div>`;
      return;
    }

    els.periodMatrix.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Period</th>
            <th>Revenue</th>
            <th>Outflow</th>
            <th>Net Cash</th>
            <th>Efficiency</th>
          </tr>
        </thead>
        <tbody>
          ${periodSummary.map((item) => `
            <tr class="period-row ${state.filters.focusedPeriod === item.period ? "table-row-highlight" : ""}" data-period-row="${escapeHtml(item.period)}">
              <td>${escapeHtml(humanPeriodLabel(item.period, state.grain))}</td>
              <td>${formatCurrency(item.revenue)}</td>
              <td>${formatCurrency(item.outflow)}</td>
              <td class="${item.net >= 0 ? "metric-positive" : "metric-negative"}">${formatCurrency(item.net)}</td>
              <td>${item.outflow ? `${(item.revenue / item.outflow).toFixed(2)}x` : "∞"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    Array.from(els.periodMatrix.querySelectorAll("[data-period-row]")).forEach((row) => {
      row.addEventListener("click", () => {
        state.filters.focusedPeriod = state.filters.focusedPeriod === row.dataset.periodRow ? "" : row.dataset.periodRow;
        render();
      });
    });
  }

  function renderPressureList(headSummary) {
    const topPressure = [...headSummary].filter((item) => item.outflow > 0).sort((a, b) => b.outflow - a.outflow).slice(0, 6);
    if (!topPressure.length) {
      els.pressureList.innerHTML = `<div class="chart-empty">No outflows in this slice.</div>`;
      return;
    }

    const totalOutflow = topPressure.reduce((sum, item) => sum + item.outflow, 0);
    els.pressureList.innerHTML = topPressure.map((item) => `
      <article class="pressure-item ${item.outflow > totalOutflow * 0.3 ? "warning" : ""}">
        <strong>${escapeHtml(item.head)}</strong>
        <div>${formatCurrency(item.outflow)} outflow, ${shareOf(item.outflow, totalOutflow)} of the top pressure stack.</div>
      </article>
    `).join("");
  }

  let detailRowCap = 250;

  function renderDetailTable(filtered) {
    const sorted = filtered.slice().sort((a, b) => b.date - a.date);
    const capped = detailRowCap ? sorted.slice(0, detailRowCap) : sorted;
    els.detailBody.innerHTML = capped.map((record) => `
      <tr>
        <td>${escapeHtml(record.dateISO)}</td>
        <td>${escapeHtml(capitalize(record.flow))}</td>
        <td>${escapeHtml(record.head)}</td>
        <td>${escapeHtml(record.parent)}</td>
        <td>${escapeHtml(record.description)}</td>
        <td class="${record.flow === "revenue" ? "metric-positive" : "metric-negative"}">${formatCurrency(record.flow === "revenue" ? record.amount : -record.amount)}</td>
      </tr>
    `).join("") || `<tr><td colspan="6" class="table-empty">No visible transactions.</td></tr>`;

    if (sorted.length > capped.length) {
      els.detailFooter.innerHTML = `<span class="chip-note">Showing ${capped.length.toLocaleString()} of ${sorted.length.toLocaleString()} rows <button id="showAllRowsBtn" class="text-button" type="button">Show all</button></span>`;
      document.getElementById("showAllRowsBtn").addEventListener("click", () => {
        detailRowCap = 0;
        render();
      });
    } else if (sorted.length > 0) {
      els.detailFooter.innerHTML = `<span class="chip-note">${sorted.length.toLocaleString()} transactions</span>`;
    } else {
      els.detailFooter.innerHTML = "";
    }
  }

  function resetAllFilters() {
    state.filters = {
      startDate: state.records[0] ? state.records[0].dateISO : "",
      endDate: state.records[state.records.length - 1] ? state.records[state.records.length - 1].dateISO : "",
      search: "",
      flows: new Set(["revenue", "outflow"]),
      selectedHeads: new Set(),
      headSearch: "",
      focusedPeriod: "",
      focusedHead: ""
    };
    els.startDate.value = state.filters.startDate;
    els.endDate.value = state.filters.endDate;
    els.searchInput.value = "";
    els.headSearch.value = "";
    render();
  }

  function exportVisibleRows() {
    if (!state.visibleRows.length) return;
    const header = ["date", "flow", "head", "parent", "description", "amount"];
    const lines = [header.join(",")].concat(
      state.visibleRows.map((row) => [
        row.dateISO,
        row.flow,
        csvEscape(row.head),
        csvEscape(row.parent),
        csvEscape(row.description),
        row.flow === "revenue" ? row.amount : -row.amount
      ].join(","))
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `visible-finance-slice-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function renderEmptyState(message) {
    const text = message || "Load a CSV to populate the dashboard.";
    els.totalRevenue.textContent = "-";
    els.totalOutflow.textContent = "-";
    els.netCash.textContent = "-";
    els.efficiencyRatio.textContent = "-";
    els.revenueDelta.textContent = text;
    els.outflowDelta.textContent = text;
    els.netDelta.textContent = text;
    els.efficiencyNote.textContent = text;
    els.insightList.innerHTML = `<div class="chart-empty">${escapeHtml(text)}</div>`;
    els.focusStats.innerHTML = `<div class="chart-empty">${escapeHtml(text)}</div>`;
    els.trendChart.innerHTML = `<div class="chart-empty">${escapeHtml(text)}</div>`;
    els.headChart.innerHTML = `<div class="chart-empty">${escapeHtml(text)}</div>`;
    els.periodMatrix.innerHTML = `<div class="chart-empty">${escapeHtml(text)}</div>`;
    els.pressureList.innerHTML = `<div class="chart-empty">${escapeHtml(text)}</div>`;
    els.detailBody.innerHTML = `<tr><td colspan="6" class="table-empty">${escapeHtml(text)}</td></tr>`;
    renderBreadcrumbs();
  }

  function buildPeriodSummary(records, grain) {
    return Array.from(groupBy(records, (record) => grainKey(record, grain)), ([period, rows]) => ({
      period,
      revenue: rows.filter((row) => row.flow === "revenue").reduce((sum, row) => sum + row.amount, 0),
      outflow: rows.filter((row) => row.flow === "outflow").reduce((sum, row) => sum + row.amount, 0),
      net: rows.reduce((sum, row) => sum + row.signedNet, 0)
    })).sort((a, b) => a.period.localeCompare(b.period));
  }

  function buildHeadSummary(records) {
    return Array.from(groupBy(records, (record) => record.head), ([head, rows]) => ({
      head,
      revenue: rows.filter((row) => row.flow === "revenue").reduce((sum, row) => sum + row.amount, 0),
      outflow: rows.filter((row) => row.flow === "outflow").reduce((sum, row) => sum + row.amount, 0),
      parent: rows[0].parent
    })).sort((a, b) => (b.revenue + b.outflow) - (a.revenue + a.outflow));
  }

  function compareLatestPeriods(periodSummary) {
    if (periodSummary.length < 2) return null;
    const current = periodSummary[periodSummary.length - 1];
    const previous = periodSummary[periodSummary.length - 2];
    return {
      revenueChange: percentChange(current.revenue, previous.revenue),
      outflowChange: percentChange(current.outflow, previous.outflow),
      netChange: percentChange(current.net, previous.net)
    };
  }

  function detectOutflowAnomaly(periodSummary) {
    if (periodSummary.length < 3) return null;
    const avgOutflow = periodSummary.reduce((sum, item) => sum + item.outflow, 0) / periodSummary.length;
    const biggest = [...periodSummary].sort((a, b) => b.outflow - a.outflow)[0];
    if (!avgOutflow || biggest.outflow < avgOutflow * 1.5) return null;
    return {
      period: biggest.period,
      outflow: biggest.outflow,
      multiple: biggest.outflow / avgOutflow,
      severity: biggest.outflow > avgOutflow * 2 ? "critical" : "warning"
    };
  }

  function parseCsv(text) {
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    const rows = [];
    let current = [];
    let cell = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];
      if (char === '"') {
        if (inQuotes && next === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        current.push(cell);
        cell = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") i += 1;
        current.push(cell);
        if (current.some((value) => value !== "")) rows.push(current);
        current = [];
        cell = "";
      } else {
        cell += char;
      }
    }
    if (inQuotes) {
      current.push(cell);
      if (current.some((value) => value !== "")) rows.push(current);
    } else if (cell.length || current.length) {
      current.push(cell);
      rows.push(current);
    }
    if (!rows.length) return [];
    const headers = rows[0].map((header, index) => header.trim() || `column_${index + 1}`);
    return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, (values[index] || "").trim()])));
  }

  function detectDateFormat(rawRows, dateColumnName) {
    if (!dateColumnName) return "ymd";
    let dmyScore = 0;
    let mdyScore = 0;
    const sample = rawRows.slice(0, 50);
    for (const row of sample) {
      const value = String(row[dateColumnName] || "").trim();
      const match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
      if (!match) continue;
      const [, part1, part2] = match;
      const p1 = Number(part1);
      const p2 = Number(part2);
      if (p1 > 12 && p2 <= 12) dmyScore += 1;
      else if (p2 > 12 && p1 <= 12) mdyScore += 1;
    }
    if (dmyScore > mdyScore) return "dmy";
    if (mdyScore > dmyScore) return "mdy";
    return "dmy";
  }

  function parseDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const match = String(value).match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
    if (!match) return null;
    const [, part1, part2, part3] = match;
    const year = part3.length === 2 ? Number(`20${part3}`) : Number(part3);
    const fmt = state.dateFormat === "auto" ? "dmy" : state.dateFormat;
    if (fmt === "mdy") return new Date(year, Number(part1) - 1, Number(part2));
    return new Date(year, Number(part2) - 1, Number(part1));
  }

  function parseAmount(value) {
    if (value === null || value === undefined || value === "") return null;
    const normalized = String(value)
      .replace(/[$£€,]/g, "")
      .replace(/\(([^)]+)\)/, "-$1")
      .trim();
    const number = Number(normalized);
    return Number.isFinite(number) ? number : null;
  }

  function matchColumn(columns, lowerColumns, candidates) {
    const exactIndex = lowerColumns.findIndex((column) => candidates.includes(column));
    if (exactIndex >= 0) return columns[exactIndex];
    const containsIndex = lowerColumns.findIndex((column) => candidates.some((candidate) => column.includes(candidate)));
    return containsIndex >= 0 ? columns[containsIndex] : "";
  }

  function grainKey(record, grain) {
    if (grain === "weekly") return record.periodWeekly;
    if (grain === "monthly") return record.periodMonthly;
    return record.periodDaily;
  }

  function startOfWeek(date) {
    const copy = new Date(date);
    const day = copy.getDay();
    const offset = day === 0 ? -6 : 1 - day;
    copy.setDate(copy.getDate() + offset);
    return copy;
  }

  function toIsoDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function humanPeriodLabel(period, grain) {
    if (grain === "monthly") {
      const [year, month] = period.split("-");
      const date = new Date(Number(year), Number(month) - 1, 1);
      return Number.isNaN(date.getTime()) ? period : date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
    }
    const date = new Date(`${period}T00:00:00`);
    if (Number.isNaN(date.getTime())) return period;
    if (grain === "weekly") {
      const end = new Date(date);
      end.setDate(end.getDate() + 6);
      return `${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    }
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  }

  function percentChange(current, previous) {
    if (!previous) return current ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  }

  function signedPercent(value) {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  }

  function formatCurrency(value) {
    if (!Number.isFinite(value)) return "—";
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);
  }

  function shortCurrency(value) {
    if (!Number.isFinite(value)) return "—";
    const abs = Math.abs(value);
    if (abs >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (abs >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return `${Math.round(value)}`;
  }

  function tidyValue(value, fallback) {
    const text = String(value || "").trim();
    return text || fallback;
  }

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function truncate(text, length) {
    return text.length > length ? `${text.slice(0, length - 1)}...` : text;
  }

  function groupBy(items, keyFn) {
    return items.reduce((map, item) => {
      const key = keyFn(item);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
      return map;
    }, new Map());
  }

  function shareOf(value, total) {
    if (!total) return "0.0%";
    return `${((value / total) * 100).toFixed(1)}%`;
  }

  function syncFlowButtons() {
    flowButtons.forEach((button) => {
      button.classList.toggle("is-active", state.filters.flows.has(button.dataset.flowFilter));
    });
  }

  function csvEscape(value) {
    const text = String(value ?? "");
    if (!/[",\n]/.test(text)) return text;
    return `"${text.replace(/"/g, '""')}"`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  init();
})();
