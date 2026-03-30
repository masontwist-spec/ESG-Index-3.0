function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function median(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function fmt(num) {
  return Number(num).toFixed(3);
}

function fmtPct(num) {
  return (Number(num) * 100).toFixed(1) + '%';
}

function buildSectorData(data) {
  const grouped = {};

  data.forEach((row) => {
    const sector = row.Sector || "Unclassified";
    if (!grouped[sector]) grouped[sector] = [];
    grouped[sector].push(row);
  });

  const sectors = Object.entries(grouped).map(([sector, companies]) => {
    const sortedCompanies = [...companies].sort(
      (a, b) => a.ESG_Score - b.ESG_Score
    );

    const esgScores = sortedCompanies.map(c => c.ESG_Score);
    const environmentScores = sortedCompanies.map(c => c.Environment_Score);
    const socialScores = sortedCompanies.map(c => c.Social_Score);

    return {
      sector,
      count: companies.length,
      avgESG: mean(esgScores),
      avgEnvironment: mean(environmentScores),
      avgSocial: mean(socialScores),
      medianESG: median(esgScores),
      range: Math.max(...esgScores) - Math.min(...esgScores),
      bestCompany: sortedCompanies[0].Company,
      worstCompany: sortedCompanies[sortedCompanies.length - 1].Company,
      companyESGScores: esgScores
    };
  });

  return sectors.sort((a, b) => a.avgESG - b.avgESG).map((s, i) => ({
    ...s,
    rank: i + 1
  }));
}

function renderStats(sectors) {
  const grid = document.getElementById("sectorStatsGrid");
  if (!grid) return;

  const best = sectors[0];
  const worst = sectors[sectors.length - 1];
  const widest = [...sectors].sort((a, b) => b.range - a.range)[0];
  const tightest = [...sectors].sort((a, b) => a.range - b.range)[0];

  grid.innerHTML = `
    <div class="card stat-card sector-stat-card">
      <div class="stat-label">Best Sector</div>
      <div class="stat-value sector-stat-value">${best.sector}</div>
      <div class="stat-note">Avg ESG: ${fmt(best.avgESG)}</div>
    </div>
    <div class="card stat-card sector-stat-card">
      <div class="stat-label">Worst Sector</div>
      <div class="stat-value sector-stat-value">${worst.sector}</div>
      <div class="stat-note">Avg ESG: ${fmt(worst.avgESG)}</div>
    </div>
    <div class="card stat-card sector-stat-card">
      <div class="stat-label">Widest Spread</div>
      <div class="stat-value sector-stat-value">${widest.sector}</div>
      <div class="stat-note">Range: ${fmt(widest.range)}</div>
    </div>
    <div class="card stat-card sector-stat-card">
      <div class="stat-label">Most Consistent</div>
      <div class="stat-value sector-stat-value">${tightest.sector}</div>
      <div class="stat-note">Range: ${fmt(tightest.range)}</div>
    </div>
  `;
}

function renderTable(sectors) {
  const tbody = document.getElementById("sectorTableBody");
  if (!tbody) return;

  tbody.innerHTML = sectors.map(sector => `
    <tr>
      <td style="padding:12px;">${sector.rank}</td>
      <td style="padding:12px;">${sector.sector}</td>
      <td style="padding:12px;">${sector.count}</td>
      <td style="padding:12px;">${fmt(sector.avgESG)}</td>
      <td style="padding:12px;">${fmt(sector.avgEnvironment)}</td>
      <td style="padding:12px;">${fmt(sector.avgSocial)}</td>
      <td style="padding:12px;">${fmt(sector.medianESG)}</td>
      <td style="padding:12px;">${sector.bestCompany}</td>
      <td style="padding:12px;">${sector.worstCompany}</td>
      <td style="padding:12px;">${fmt(sector.range)}</td>
    </tr>
  `).join("");
}

function renderBarChart(sectors) {
  Plotly.newPlot("sectorBarChart", [
    {
      type: "bar",
      orientation: "h",
      x: sectors.map(s => s.avgESG),
      y: sectors.map(s => s.sector),
      text: sectors.map(s => fmt(s.avgESG)),
      textposition: "outside",
      cliponaxis: false,
      marker: {
        color: "#2e8b57"
      },
      hovertemplate: "<b>%{y}</b><br>Average ESG score: %{x:.3f}<extra></extra>"
    }
  ], {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { l: 180, r: 40, t: 10, b: 40 },
    xaxis: { title: "Average ESG Score" },
    yaxis: { automargin: true }
  }, {
    responsive: true,
    displayModeBar: false
  });
}

function renderBoxPlot(sectors) {
  const traces = sectors.map(s => ({
    type: "box",
    name: s.sector,
    y: s.companyESGScores,
    boxpoints: "outliers",
    hovertemplate: "<b>" + s.sector + "</b><br>ESG Score: %{y:.3f}<extra></extra>"
  }));

  Plotly.newPlot("sectorBoxPlot", traces, {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { l: 60, r: 30, t: 10, b: 110 },
    yaxis: { title: "Company ESG Score" },
    xaxis: { tickangle: -30 }
  }, {
    responsive: true,
    displayModeBar: false
  });
}

function renderGroupedChart(sectors) {
  Plotly.newPlot("sectorGroupedChart", [
    {
      type: "bar",
      name: "Environment",
      x: sectors.map(s => s.sector),
      y: sectors.map(s => s.avgEnvironment),
      marker: { color: "#2e8b57" }
    },
    {
      type: "bar",
      name: "Social",
      x: sectors.map(s => s.sector),
      y: sectors.map(s => s.avgSocial),
      marker: { color: "#4867c9" }
    }
  ], {
    barmode: "group",
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { l: 60, r: 30, t: 10, b: 110 },
    yaxis: { title: "Average Domain Score" },
    xaxis: { tickangle: -30 }
  }, {
    responsive: true,
    displayModeBar: false
  });
}

function renderHeatmap(sectors) {
  Plotly.newPlot("sectorHeatmap", [
    {
      type: "heatmap",
      x: sectors.map(s => s.sector),
      y: ["Environment", "Social"],
      z: [
        sectors.map(s => Number(s.avgEnvironment.toFixed(3))),
        sectors.map(s => Number(s.avgSocial.toFixed(3)))
      ],
      colorscale: [
        [0, "#edf7ef"],
        [0.5, "#dcecdf"],
        [1, "#2f8b57"]
      ],
      hovertemplate: "<b>%{y}</b><br>%{x}<br>Average score: %{z:.3f}<extra></extra>"
    }
  ], {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { l: 100, r: 30, t: 10, b: 110 },
    xaxis: { tickangle: -30 },
    yaxis: { automargin: true }
  }, {
    responsive: true,
    displayModeBar: false
  });
}

function initSectorsPage() {
  if (!Array.isArray(cappedData)) {
    console.error("cappedData is not available.");
    return;
  }

  const sectors = buildSectorData(cappedData);
  renderStats(sectors);
  renderTable(sectors);
  renderBarChart(sectors);
  renderBoxPlot(sectors);
  renderGroupedChart(sectors);
  renderHeatmap(sectors);
}

document.addEventListener("DOMContentLoaded", initSectorsPage);
