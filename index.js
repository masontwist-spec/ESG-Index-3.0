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

function renderHeroSignals(data) {
  const el = document.getElementById("heroSignalList");
  if (!el) return;

  const sorted = [...data].sort((a, b) => a.ESG_Score - b.ESG_Score);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  const bestSector = buildSectorAverages(data)[0];

  el.innerHTML = `
    <div class="signal">
      <span class="name">Low score</span>
      <span class="tag">${fmtPct(lowest.ESG_Score)}</span>
    </div>
    <div class="signal">
      <span class="name">High score</span>
      <span class="tag" style="background:rgba(240,120,120,0.12);color:#f0a0a0;">${fmtPct(highest.ESG_Score)}</span>
    </div>
    <div class="signal">
      <span class="name">Best avg sector</span>
      <span class="tag">${bestSector.sector}</span>
    </div>
  `;
}

function renderOverviewStats(data) {
  const grid = document.getElementById("overviewStatsGrid");
  if (!grid) return;

  const sorted = [...data].sort((a, b) => a.ESG_Score - b.ESG_Score);
  const sectors = [...new Set(data.map(d => d.Sector))].length;
  const best = sorted[0];
  const avgESG = mean(data.map(d => d.ESG_Score));

  grid.innerHTML = `
    <div class="stat">
      <div class="stat-value">${data.length}</div>
      <div class="stat-label">Companies covered</div>
    </div>
    <div class="stat">
      <div class="stat-value">${sectors}</div>
      <div class="stat-label">Sectors covered</div>
    </div>
    <div class="stat">
      <div class="stat-value">${best.Ticker}</div>
      <div class="stat-label">Lowest ESG score</div>
    </div>
    <div class="stat">
      <div class="stat-value">${fmtPct(avgESG)}</div>
      <div class="stat-label">Avg. ESG Exposure</div>
    </div>
  `;
}

function renderBreakdownStack(data) {
  const stack = document.getElementById("breakdownStack");
  if (!stack) return;

  const envAvg = mean(data.map(d => d.Environment_Score));
  const socAvg = mean(data.map(d => d.Social_Score));
  const esgAvg = mean(data.map(d => d.ESG_Score));

  stack.innerHTML = `
    <div class="breakdown-row">
      <div class="breakdown-main">
        <div class="breakdown-title">Environment</div>
        <div class="breakdown-note">Climate Targets, Investment & Transition, and Climate Reporting.</div>
      </div>
      <div class="breakdown-metric">${fmtPct(envAvg)}</div>
    </div>

    <div class="breakdown-row">
      <div class="breakdown-main">
        <div class="breakdown-title">Social</div>
        <div class="breakdown-note">DEI Targets & Representation, Programmes & Memberships, and Social Incentives.</div>
      </div>
      <div class="breakdown-metric">${fmtPct(socAvg)}</div>
    </div>

    <div class="breakdown-row">
      <div class="breakdown-main">
        <div class="breakdown-title">Composite ESG</div>
        <div class="breakdown-note">Public-facing composite built from the two live domains.</div>
      </div>
      <div class="breakdown-metric">${fmtPct(esgAvg)}</div>
    </div>
  `;
}

function renderLeaderboard(data) {
  const wrap = document.getElementById("overviewLeaderboard");
  if (!wrap) return;

  const top = [...data]
    .sort((a, b) => a.ESG_Score - b.ESG_Score)
    .slice(0, 5);

  wrap.innerHTML = top.map((d, i) => `
    <div class="lb-row">
      <div class="lb-rank">${i + 1}</div>
      <div class="lb-company">
        <div class="name">${d.Company}</div>
        <div class="meta">${d.Sector} · ${d.Ticker}</div>
      </div>
      <div class="lb-score">
        <div class="value">${fmtPct(d.ESG_Score)}</div>
        <div class="ticker">${d.Ticker}</div>
      </div>
    </div>
  `).join("");
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
      marker: { color: "#2e8b57" },
      hovertemplate: "<b>%{x}</b><br>Average ESG score: %{y:.3f}<extra></extra>"
    }
  ], {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { l: 50, r: 20, t: 10, b: 20 },
    yaxis: { title: "Average ESG Score" },
    xaxis: {
      showticklabels: false,
      showgrid: false,
      zeroline: false
    }
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

  renderHeroSignals(cappedData);
  renderOverviewStats(cappedData);
  renderBreakdownStack(cappedData);
  renderLeaderboard(cappedData);
  renderSectorChart(cappedData);
  renderScatterChart(cappedData);
}

document.addEventListener("DOMContentLoaded", initOverviewPage);
