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

function renderBreakdownCards(data) {
  const wrap = document.getElementById("breakdownCardList");
  if (!wrap) return;

  const envAvg = mean(data.map(d => d.Environment_Score));
  const socAvg = mean(data.map(d => d.Social_Score));
  const esgAvg = mean(data.map(d => d.ESG_Score));

  const cards = [
    {
      title: "Environment",
      tag: "E",
      value: envAvg,
      note: "Climate Targets, Investment & Transition, and Climate Reporting."
    },
    {
      title: "Social",
      tag: "S",
      value: socAvg,
      note: "DEI Targets & Representation, Programmes & Memberships, and Social Incentives."
    },
    {
      title: "Composite ESG",
      tag: "ES",
      value: esgAvg,
      note: "Public-facing composite built from the two live domains."
    }
  ];

  wrap.innerHTML = cards.map(card => `
    <div class="breakdown-card-item">
      <div class="breakdown-card-top">
        <div class="breakdown-card-title-wrap">
          <div class="breakdown-card-title">${card.title}</div>
          <div class="breakdown-card-tag">${card.tag}</div>
        </div>
        <div class="breakdown-card-value">${fmtPct(card.value)} <span>avg.</span></div>
      </div>

      <div class="breakdown-bar-track">
        <div class="breakdown-bar-fill" style="width:${card.value * 100}%"></div>
      </div>

      <div class="breakdown-card-note">${card.note}</div>
    </div>
  `).join("");
}

function renderLeaderboard(data) {
  const wrap = document.getElementById("overviewLeaderboard");
  if (!wrap) return;

  const top = [...data]
    .sort((a, b) => a.ESG_Score - b.ESG_Score)
    .slice(0, 8);

  wrap.innerHTML = top.map((d, i) => `
    <div class="lb-row">
      <div class="lb-rank">${i + 1}</div>
      <div class="lb-company">
        <div class="name">${d.Company}</div>
        <div class="meta">${d.Sector}</div>
      </div>
      <div class="lb-score">
        <div class="value">${fmtPct(d.ESG_Score)}</div>
        <div class="ticker">${d.Ticker}</div>
      </div>
    </div>
  `).join("");
}

function renderDistributionChart(data) {
  Plotly.newPlot("overviewDistributionChart", [
    {
      type: "histogram",
      x: data.map(d => d.ESG_Score),
      nbinsx: 10,
      marker: {
        color: "#2e8b57"
      },
      hovertemplate: "ESG score bin: %{x:.3f}<br>Count: %{y}<extra></extra>"
    }
  ], {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { l: 50, r: 20, t: 10, b: 40 },
    xaxis: { title: "Composite ESG Score" },
    yaxis: { title: "Number of Companies" }
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
  renderBreakdownCards(cappedData);
  renderLeaderboard(cappedData);
  renderDistributionChart(cappedData);
}

document.addEventListener("DOMContentLoaded", initOverviewPage);
