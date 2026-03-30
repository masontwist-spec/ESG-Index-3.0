function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function fmt(num) {
  return Number(num).toFixed(3);
}

function buildSectorAverages(data) {
  const grouped = {};

  data.forEach((row) => {
    const sector = row.Sector || "Unclassified";
    if (!grouped[sector]) grouped[sector] = [];
    grouped[sector].push(row);
  });

  return Object.entries(grouped)
    .map(([sector, rows]) => ({
      sector,
      avgESG: mean(rows.map(r => r.ESG_Score))
    }))
    .sort((a, b) => a.avgESG - b.avgESG);
}

function renderOverviewStats(data) {
  const grid = document.getElementById("overviewStatsGrid");
  if (!grid) return;

  const sorted = [...data].sort((a, b) => a.ESG_Score - b.ESG_Score);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const avgESG = mean(data.map(d => d.ESG_Score));
  const bestSector = buildSectorAverages(data)[0];

  grid.innerHTML = `
    <div class="stat">
      <div class="stat-value">${fmt(avgESG)}</div>
      <div class="stat-label">Average ESG score</div>
    </div>
    <div class="stat">
      <div class="stat-value">${best.Ticker}</div>
      <div class="stat-label">Lowest ESG score company</div>
    </div>
    <div class="stat">
      <div class="stat-value">${worst.Ticker}</div>
      <div class="stat-label">Highest ESG score company</div>
    </div>
    <div class="stat">
      <div class="stat-value">${bestSector.sector}</div>
      <div class="stat-label">Lowest average sector</div>
    </div>
  `;
}

function renderTopChart(data) {
  const top = [...data]
    .sort((a, b) => a.ESG_Score - b.ESG_Score)
    .slice(0, 10);

  Plotly.newPlot("overviewTopChart", [
    {
      type: "bar",
      orientation: "h",
      x: top.map(d => d.ESG_Score).reverse(),
      y: top.map(d => d.Company).reverse(),
      text: top.map(d => fmt(d.ESG_Score)).reverse(),
      textposition: "outside",
      cliponaxis: false,
      marker: { color: "#2e8b57" },
      hovertemplate: "<b>%{y}</b><br>ESG score: %{x:.3f}<extra></extra>"
    }
  ], {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { l: 180, r: 40, t: 10, b: 30 },
    xaxis: { title: "Composite ESG Score" },
    yaxis: { automargin: true }
  }, {
    responsive: true,
    displayModeBar: false
  });
}

function renderSectorChart(data) {
  const sectors = buildSectorAverages(data);

  Plotly.newPlot("overviewSectorChart", [
    {
      type: "bar",
      x: sectors.map(s => s.sector),
      y: sectors.map(s => s.avgESG),
      text: sectors.map(s => fmt(s.avgESG)),
      textposition: "outside",
      cliponaxis: false,
      marker: { color: "#6d4cc4" },
      hovertemplate: "<b>%{x}</b><br>Average ESG score: %{y:.3f}<extra></extra>"
    }
  ], {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { l: 50, r: 20, t: 10, b: 110 },
    yaxis: { title: "Average ESG Score" },
    xaxis: { tickangle: -30 }
  }, {
    responsive: true,
    displayModeBar: false
  });
}

function renderScatterChart(data) {
  Plotly.newPlot("overviewScatterChart", [
    {
      type: "scatter",
      mode: "markers",
      x: data.map(d => d.Environment_Score),
      y: data.map(d => d.Social_Score),
      text: data.map(d => `${d.Company}<br>${d.Sector}`),
      marker: {
        size: 11,
        color: data.map(d => d.ESG_Score),
        colorscale: [
          [0, "#dcecdf"],
          [0.5, "#9fd0b0"],
          [1, "#2e8b57"]
        ],
        line: {
          color: "rgba(23,27,36,0.18)",
          width: 1
        },
        showscale: false
      },
      hovertemplate: "<b>%{text}</b><br>Environment: %{x:.3f}<br>Social: %{y:.3f}<extra></extra>"
    }
  ], {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { l: 50, r: 20, t: 10, b: 40 },
    xaxis: { title: "Environment Score" },
    yaxis: { title: "Social Score" }
  }, {
    responsive: true,
    displayModeBar: false
  });
}

function initOverviewPage() {
  if (!Array.isArray(cappedData)) {
    console.error("cappedData is not available.");
    return;
  }

  renderOverviewStats(cappedData);
  renderTopChart(cappedData);
  renderSectorChart(cappedData);
  renderScatterChart(cappedData);
}

document.addEventListener("DOMContentLoaded", initOverviewPage);
