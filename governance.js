let governanceSortCol = "Governance_Reference_Score";
let governanceSortAsc = true;

function fmt(num) {
  return Number(num).toFixed(3);
}

function governanceRows() {
  return cappedData
    .filter(d =>
      typeof d.Governance_Reference_Score !== "undefined" &&
      typeof d.Governance_Reporting_Assurance_Score !== "undefined" &&
      typeof d.Governance_Oversight_Incentives_Score !== "undefined"
    )
    .slice()
    .sort((a, b) => a.Governance_Reference_Score - b.Governance_Reference_Score)
    .map((d, i) => ({ ...d, rank: i + 1 }));
}

function governanceBand(v) {
  return tierKey(v);
}

function governanceBandLabel(v) {
  return tierLabel(v);
}

function populateGovernanceFilters(rows) {
  const sectorSel = document.getElementById("sectorFilter");
  if (!sectorSel) return;

  [...new Set(rows.map(r => r.Sector))].sort().forEach(s => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    sectorSel.appendChild(opt);
  });
}

function currentGovernanceRows(rows) {
  const q = document.getElementById("searchInput")?.value.toLowerCase().trim() || "";
  const sector = document.getElementById("sectorFilter")?.value || "";
  const band = document.getElementById("bandFilter")?.value || "";

  let filtered = rows.filter(r => {
    const matchesQuery =
      !q ||
      r.Company.toLowerCase().includes(q) ||
      r.Ticker.toLowerCase().includes(q);

    const matchesSector = !sector || r.Sector === sector;
    const matchesBand = !band || governanceBand(r.Governance_Reference_Score) === band;

    return matchesQuery && matchesSector && matchesBand;
  });

  filtered.sort((a, b) => {
    let av, bv;

    if (governanceSortCol === "band") {
      av = governanceBandLabel(a.Governance_Reference_Score);
      bv = governanceBandLabel(b.Governance_Reference_Score);
      return governanceSortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    }

    av = a[governanceSortCol];
    bv = b[governanceSortCol];

    const bothNumeric =
      !isNaN(Number(av)) &&
      !isNaN(Number(bv)) &&
      av !== "" &&
      bv !== "";

    if (bothNumeric) {
      return governanceSortAsc ? Number(av) - Number(bv) : Number(bv) - Number(av);
    }

    return governanceSortAsc
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  return filtered;
}

function renderGovernanceTable(rows) {
  const body = document.getElementById("governanceTableBody");
  if (!body) return;

  const current = currentGovernanceRows(rows);

  body.innerHTML = current.map(r => `
    <tr>
      <td><div class="rank-badge">${r.rank}</div></td>
      <td><div class="company-name">${r.Company}</div></td>
      <td><span class="ticker-badge">${r.Ticker}</span></td>
      <td><span class="sector-name">${r.Sector}</span></td>
      <td>
        <div class="metric-cell">
          <div class="tiny-track">
            <div class="tiny-fill bad" style="width:${r.Governance_Reporting_Assurance_Score * 100}%"></div>
          </div>
          <span class="pct">${pct(r.Governance_Reporting_Assurance_Score)}</span>
        </div>
      </td>
      <td>
        <div class="metric-cell">
          <div class="tiny-track">
            <div class="tiny-fill bad" style="width:${r.Governance_Oversight_Incentives_Score * 100}%"></div>
          </div>
          <span class="pct">${pct(r.Governance_Oversight_Incentives_Score)}</span>
        </div>
      </td>
      <td><span class="score-value">${fmt(r.Governance_Reference_Score)}</span></td>
      <td>
        <span class="tier-pill tier-${governanceBand(r.Governance_Reference_Score)}">
          ${governanceBandLabel(r.Governance_Reference_Score)}
        </span>
      </td>
    </tr>
  `).join("");
}

function initGovernancePage() {
  if (!Array.isArray(cappedData)) {
    console.error("cappedData is not available.");
    return;
  }

  const rows = governanceRows();
  populateGovernanceFilters(rows);
  renderGovernanceTable(rows);

  document.querySelectorAll("th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const col = th.dataset.sort;
      if (governanceSortCol === col) {
        governanceSortAsc = !governanceSortAsc;
      } else {
        governanceSortCol = col;
        governanceSortAsc = true;
      }
      renderGovernanceTable(rows);
    });
  });

  document.getElementById("searchInput")?.addEventListener("input", () => renderGovernanceTable(rows));
  document.getElementById("sectorFilter")?.addEventListener("change", () => renderGovernanceTable(rows));
  document.getElementById("bandFilter")?.addEventListener("change", () => renderGovernanceTable(rows));
}

document.addEventListener("DOMContentLoaded", initGovernancePage);
``
