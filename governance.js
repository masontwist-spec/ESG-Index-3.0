function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function fmt(num) {
  return Number(num).toFixed(3);
}

function fmtPct(num) {
  return (Number(num) * 100).toFixed(1) + '%';
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

function renderGovernanceStats(rows) {
  const grid = document.getElementById("governanceStatsGrid");
  if (!grid || !rows.length) return;

  const best = rows[0];
  const worst = rows[rows.length - 1];
  const avgGov = mean(rows.map(r => r.Governance_Reference_Score));
  const strongestReporting = rows
    .slice()
    .sort((a, b) => b.Governance_Reporting_Assurance_Score - a.Governance_Reporting_Assurance_Score)[0];

  grid.innerHTML = `
    <div class="stat">
      <div class="stat-value">${fmtPct(avgGov)}</div>
      <div class="stat-label">Average governance reference score</div>
    </div>
    <div class="stat">
      <div class="stat-value">${best.Ticker}</div>
      <div class="stat-label">Lowest governance reference score</div>
    </div>
    <div class="stat">
      <div class="stat-value">${worst.Ticker}</div>
      <div class="stat-label">Highest governance reference score</div>
    </div>
    <div class="stat">
      <div class="stat-value">${strongestReporting.Ticker}</div>
      <div class="stat-label">Strongest reporting & assurance signal</div>
    </div>
  `;
}

function renderGovernanceBarChart(rows) {
  Plotly.newPlot(
    "governanceBarChart",
    [
      {
        type: "bar",
        orientation: "h",
        x: rows.slice(0, 20).map(r => r.Governance_Reference_Score).reverse(),
        y: rows.slice(0, 20).map(r => r.Company).reverse(),
        text: rows.slice(0, 20).map(r => fmt(r.Governance_Reference_Score)).reverse(),
        textposition: "outside",
        cliponaxis: false,
        marker: { color: "#6d4cc4" },
        hovertemplate: "<b>%{y}</b><br>Governance reference score: %{x:.3f}<extra></extra>"
      }
    ],
    {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      margin: { l: 200, r: 40, t: 10, b: 30 },
      xaxis: { title: "Governance Reference Score" },
      yaxis: { automargin: true }
    },
    {
      responsive: true,
      displayModeBar: false
    }
  );
}

function renderGovernanceComponentChart(rows) {
  Plotly.newPlot(
    "governanceComponentChart",
    [
      {
        type: "bar",
        name: "Reporting & Assurance",
        x: rows.map(r => r.Company),
        y: rows.map(r => r.Governance_Reporting_Assurance_Score),
        marker: { color: "#6d4cc4" },
        hovertemplate: "<b>%{x}</b><br>Reporting & Assurance: %{y:.3f}<extra></extra>"
      },
      {
        type: "bar",
        name: "Oversight & Incentives",
        x: rows.map(r => r.Company),
        y: rows.map(r => r.Governance_Oversight_Incentives_Score),
        marker: { color: "#4867c9" },
        hovertemplate: "<b>%{x}</b><br>Oversight & Incentives: %{y:.3f}<extra></extra>"
      }
    ],
    {
      barmode: "group",
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      margin: { l: 60, r: 20, t: 10, b: 20 },
      yaxis: { title: "Reference Score" },
      xaxis: {
        showticklabels: false,
        showgrid: false,
        zeroline: false
      }
    },
    {
      responsive: true,
      displayModeBar: false
    }
  );
}

function renderGovernanceTable(rows) {
  const body = document.getElementById("governanceTableBody");
  if (!body) return;

  body.innerHTML = rows.map(r => `
    <tr>
      <td style="padding:12px;">${r.rank}</td>
      <td style="padding:12px;">${r.Company}</td>
      <td style="padding:12px;">${r.Ticker}</td>
      <td style="padding:12px;">${r.Sector}</td>
      <td style="padding:12px;">${fmt(r.Governance_Reporting_Assurance_Score)}</td>
      <td style="padding:12px;">${fmt(r.Governance_Oversight_Incentives_Score)}</td>
      <td style="padding:12px;">${fmt(r.Governance_Reference_Score)}</td>
    </tr>
  `).join("");
}

function initGovernancePage() {
  if (!Array.isArray(cappedData)) {
    console.error("cappedData is not available.");
    return;
  }

  const rows = governanceRows();

  if (!rows.length) {
    const stats = document.getElementById("governanceStatsGrid");
    if (stats) {
      stats.innerHTML = `
        <div class="stat" style="grid-column: 1 / -1;">
          <div class="stat-value">No governance data</div>
          <div class="stat-label">Check governance field names in data.js and governance.js</div>
        </div>
      `;
    }
    return;
  }

  renderGovernanceStats(rows);
  renderGovernanceBarChart(rows);
  renderGovernanceComponentChart(rows);
  renderGovernanceTable(rows);
}

document.addEventListener("DOMContentLoaded", initGovernancePage);
