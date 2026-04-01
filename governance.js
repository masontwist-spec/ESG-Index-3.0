let sortCol = "Governance_Reference_Score";
let sortAsc = true;

function governanceValueSet(row) {
  const reporting = Math.max(
    0,
    Math.min(
      1,
      Number(
        typeof row.Governance_Reporting_Assurance_Score !== "undefined"
          ? row.Governance_Reporting_Assurance_Score
          : row.Climate_Reporting
      ) || 0
    )
  );

  const oversight = Math.max(
    0,
    Math.min(
      1,
      Number(
        typeof row.Governance_Oversight_Incentives_Score !== "undefined"
          ? row.Governance_Oversight_Incentives_Score
          : row.Social_Incentives
      ) || 0
    )
  );

  const reference = Math.max(
    0,
    Math.min(
      1,
      Number(
        typeof row.Governance_Reference_Score !== "undefined"
          ? row.Governance_Reference_Score
          : (reporting + oversight) / 2
      ) || 0
    )
  );

  return { reporting, oversight, reference };
}

function governanceRows() {
  return cappedData.map(row => {
    const gov = governanceValueSet(row);
    return {
      ...row,
      Governance_Reporting_Assurance_Score: gov.reporting,
      Governance_Oversight_Incentives_Score: gov.oversight,
      Governance_Reference_Score: gov.reference
    };
  });
}

function metricColor(v) {
  if (typeof scoreGradientColor === "function") {
    return scoreGradientColor(v);
  }
  return tierColor(tierKey(v));
}

function metricMarkup(v, bold = false) {
  const value = Math.max(0, Math.min(1, Number(v) || 0));
  const color = metricColor(value);

  return `
    <div class="metric-cell">
      <div class="tiny-track">
        <div class="tiny-fill" style="width:${value * 100}%; background:${color};"></div>
      </div>
      <span class="${bold ? "score-value" : "pct"}" style="color:${color};">
        ${pct(value)}
      </span>
    </div>
  `;
}

function populateFilters(rows) {
  const sectorFilter = document.getElementById("sectorFilter");
  if (!sectorFilter) return;

  [...new Set(rows.map(r => r.Sector))]
    .sort()
    .forEach(sector => {
      const opt = document.createElement("option");
      opt.value = sector;
      opt.textContent = sector;
      sectorFilter.appendChild(opt);
    });
}

function sortRows(rows) {
  return [...rows].sort((a, b) => {
    let av, bv;

    if (sortCol === "rank") {
      av = a.Governance_Reference_Score;
      bv = b.Governance_Reference_Score;
      return sortAsc ? av - bv : bv - av;
    }

    if (sortCol === "tier") {
      av = tierLabel(a.Governance_Reference_Score);
      bv = tierLabel(b.Governance_Reference_Score);
      return sortAsc
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    }

    av = a[sortCol];
    bv = b[sortCol];

    const bothNumeric =
      !isNaN(Number(av)) &&
      !isNaN(Number(bv)) &&
      av !== "" &&
      bv !== "";

    if (bothNumeric) {
      return sortAsc ? Number(av) - Number(bv) : Number(bv) - Number(av);
    }

    return sortAsc
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });
}

function filteredRows(rows) {
  const q = document.getElementById("searchInput")?.value.toLowerCase().trim() || "";
  const sector = document.getElementById("sectorFilter")?.value || "";
  const tier = document.getElementById("tierFilter")?.value || "";

  const filtered = rows.filter(r => {
    const matchesQuery =
      !q ||
      r.Company.toLowerCase().includes(q) ||
      r.Ticker.toLowerCase().includes(q);

    const matchesSector = !sector || r.Sector === sector;
    const matchesTier = !tier || tierKey(r.Governance_Reference_Score) === tier;

    return matchesQuery && matchesSector && matchesTier;
  });

  return sortRows(filtered).map((r, i) => ({ ...r, rank: i + 1 }));
}

function renderTable(rows) {
  const body = document.getElementById("tableBody");
  if (!body) return;

  const current = filteredRows(rows);

  body.innerHTML = current.map(r => `
    <tr>
      <td><div class="rank-badge">${r.rank}</div></td>
      <td>
  <div class="company-name">
    <a href="profile.html?ticker=${encodeURIComponent(r.Ticker)}">${r.Company}</a>
  </div>
</td>
      <td><span class="ticker-badge">${r.Ticker}</span></td>
      <td><span class="sector-name">${r.Sector}</span></td>
      <td>${metricMarkup(r.Governance_Reporting_Assurance_Score)}</td>
      <td>${metricMarkup(r.Governance_Oversight_Incentives_Score)}</td>
      <td>${metricMarkup(r.Governance_Reference_Score, true)}</td>
      <td>
        <span class="tier-pill tier-${tierKey(r.Governance_Reference_Score)}">
          ${tierLabel(r.Governance_Reference_Score)}
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
  populateFilters(rows);
  renderTable(rows);

  document.querySelectorAll("th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
      const col = th.dataset.sort;
      if (sortCol === col) {
        sortAsc = !sortAsc;
      } else {
        sortCol = col;
        sortAsc = true;
      }
      renderTable(rows);
    });
  });

  document.getElementById("searchInput")?.addEventListener("input", () => renderTable(rows));
  document.getElementById("sectorFilter")?.addEventListener("change", () => renderTable(rows));
  document.getElementById("tierFilter")?.addEventListener("change", () => renderTable(rows));
}

document.addEventListener("DOMContentLoaded", initGovernancePage);
