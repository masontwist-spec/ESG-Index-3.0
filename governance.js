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
      typeof d.Governance_Score !== "undefined" &&
      typeof d.Governance_Strategy_Integration !== "undefined" &&
      typeof d.Governance_Board_Oversight !== "undefined" &&
      typeof d.Governance_Transparency_Assurance !== "undefined"
    )
    .slice()
    .sort((a, b) => a.Governance_Score - b.Governance_Score)
    .map((d, i) => ({ ...d, rank: i + 1 }));
}

function renderGovernanceStats(rows) {
  const grid = document.getElementById("governanceStatsGrid");
  if (!grid || !rows.length) return;

  const best = rows[0];
  const worst = rows[rows.length - 1];
  const avgGov = mean(rows.map(r => r.Governance_Score));
  const strongestTransparency = rows
    .slice()
    .sort((a, b) => b.Governance_Transparency_Assurance - a.Governance_Transparency_Assurance)[0];

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
      <div class="stat-value">${strongestTransparency.Ticker}</div>
      <div class="stat-label">Strongest transparency & assurance signal</div>
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
        x: rows.slice(0, 20).map(r => r.Governance_Score).reverse(),
        y: rows.slice(0, 20).map(r => r.Company).reverse(),
        text: rows.slice(0, 20).map(r => fmt(r.Governance_Score)).reverse(),
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
        name: "Strategy Integration",
        x: rows.map(r => r.Company),
        y: rows.map(r => r.Governance_Strategy_Integration),
        marker: { color: "#6d4cc4" },
        hovertemplate: "<b>%{x}</b><br>Strategy Integration: %{y:.3f}<extra></extra>"
      },
      {
        type: "bar",
        name: "Board Oversight",
        x: rows.map(r => r.Company),
        y: rows.map(r => r.Governance_Board_Oversight),
        marker: { color: "#4867c9" },
        hovertemplate: "<b>%{x}</b><br>Board Oversight: %{y:.3f}<extra></extra>"
      },
      {
        type: "bar",
        name: "Transparency & Assurance",
        x: rows.map(r => r.Company),
        y: rows.map(r => r.Governance_Transparency_Assurance),
        marker: { color: "#c6872f" },
        hovertemplate: "<b>%{x}</b><br>Transparency & Assurance: %{y:.3f}<extra></extra>"
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
      <td style="padding:12px;">${fmt(r.Governance_Strategy_Integration)}</td>
      <td style="padding:12px;">${fmt(r.Governance_Board_Oversight)}</td>
      <td style="padding:12px;">${fmt(r.Governance_Transparency_Assurance)}</td>
      <td style="padding:12px;">${fmt(r.Governance_Score)}</td>
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
          <div class="stat-label">Add governance columns into data.js to populate this page</div>
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
