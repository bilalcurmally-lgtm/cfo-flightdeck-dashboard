const STORAGE_KEY = "cfoFlightDeckReviewUnlocked";

export function initAppGate() {
  const required = import.meta.env.VITE_REVIEW_GATE_REQUIRED === "true";
  const gate = document.getElementById("appGate");
  const form = document.getElementById("appGateForm");
  const input = document.getElementById("appGatePassword");
  const status = document.getElementById("appGateStatus");

  if (!gate || !form || !input || !status) return;
  if (!required || sessionStorage.getItem(STORAGE_KEY) === "true") {
    unlock(gate);
    return;
  }

  document.body.classList.add("is-gated");
  gate.hidden = false;
  input.focus();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "Checking password...";
    form.querySelector("button").disabled = true;

    try {
      const response = await fetch("/api/unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: input.value })
      });
      if (!response.ok) throw new Error("Password was not accepted.");
      sessionStorage.setItem(STORAGE_KEY, "true");
      unlock(gate);
    } catch (error) {
      status.textContent = error?.message || "Could not unlock the dashboard.";
      input.select();
    } finally {
      form.querySelector("button").disabled = false;
    }
  });
}

function unlock(gate) {
  document.body.classList.remove("is-gated");
  gate.hidden = true;
}
