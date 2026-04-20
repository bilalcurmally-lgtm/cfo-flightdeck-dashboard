import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadState, saveState, STORAGE_VERSION } from "../store/local-storage.js";

function installLocalStorage() {
  const values = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear()
  });
}

describe("local storage state", () => {
  beforeEach(() => {
    installLocalStorage();
  });

  it("persists AI brief settings under the current schema version", () => {
    saveState({
      grain: "daily",
      currency: "USD",
      dateFormat: "auto",
      currentBankBalance: 0,
      balanceAsOf: "",
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
      mapping: {},
      cashForecast: {
        manualEvents: [
          { id: "evt-1", date: "2026-02-01", flow: "cash out", amount: 1200, label: "VAT" }
        ],
        baselineWeeks: 8
      },
      aiBrief: {
        enabled: true,
        endpointUrl: "https://example.test/chat",
        model: "brief-model",
        apiKey: "local-key"
      }
    });

    const loaded = loadState();
    expect(STORAGE_VERSION).toBe(4);
    expect(loaded.aiBrief).toEqual({
      enabled: true,
      endpointUrl: "https://example.test/chat",
      model: "brief-model",
      apiKey: "local-key"
    });
    expect(loaded.cashForecast.manualEvents).toEqual([
      { id: "evt-1", date: "2026-02-01", flow: "cash out", amount: 1200, label: "VAT" }
    ]);
  });

  it("migrates version 2 saved state to disabled AI brief settings", () => {
    localStorage.setItem("cfo-flight-deck-state", JSON.stringify({
      version: 2,
      grain: "monthly",
      filters: {
        flows: ["revenue"],
        selectedHeads: []
      }
    }));

    const loaded = loadState();
    expect(loaded.version).toBe(4);
    expect(loaded.aiBrief.enabled).toBe(false);
    expect(loaded.cashForecast.manualEvents).toEqual([]);
    expect(loaded.filters.flows).toBeInstanceOf(Set);
  });

  it("migrates version 3 saved state to empty cash forecast settings", () => {
    localStorage.setItem("cfo-flight-deck-state", JSON.stringify({
      version: 3,
      grain: "monthly",
      aiBrief: {
        enabled: false,
        endpointUrl: "",
        model: "",
        apiKey: ""
      },
      filters: {
        flows: ["revenue", "outflow"],
        selectedHeads: []
      }
    }));

    const loaded = loadState();
    expect(loaded.version).toBe(4);
    expect(loaded.cashForecast).toEqual({
      manualEvents: [],
      baselineWeeks: 8
    });
  });
});
