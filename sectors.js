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
    <div class="stat">
      <div class="stat-value">${best.sector}</div>
      <div class="stat-label">Best sector</div>
    </div>
    <div class="stat">
      <div class="stat-value">${worst.sector}</div>
      <div class="stat-label">Worst sector</div>
    </div>
    <div class="stat">
      <div class="stat-value">${widest.sector}</div>
      <div class="stat-label">Widest spread</div>
    </div>
    <div class="stat">
      <div class="stat-value">${tightest.sector}</div>
      <div class="stat-label">Most consistent</div>
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
      x: sectors.map(s => s.sector),
      y: sectors.map(s => s.avgESG),
      text: sectors.map(s => fmt(s.avgESG)),
      textposition: "outside",
      cliponaxis: false,
      marker: {
        color: "#2e8b57"
      },
      hovertemplate: "<b>%{x}</b><br>Average ESG score: %{y:.3f}<extra></extra>"
    }
  ], {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { l: 60, r: 24, t: 10, b: 20 },
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
    margin: { l: 60, r: 30, t: 10, b: 20 },
    yaxis: { title: "Company ESG Score" },
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

function renderGroupedChart(sectors) {
  Plotly.newPlot("sectorGroupedChart", [
    {
      type: "bar",
      name: "Environment",
      x: sectors.map(s => s.sector),
      y: sectors.map(s => s.avgEnvironment),
      marker: { color: "#2e8b57" },
      hovertemplate: "<b>%{x}</b><br>Environment: %{y:.3f}<extra></extra>"
    },
    {
      type: "bar",
      name: "Social",
      x: sectors.map(s => s.sector),
      y: sectors.map(s => s.avgSocial),
      marker: { color: "#4867c9" },
      hovertemplate: "<b>%{x}</b><br>Social: %{y:.3f}<extra></extra>"
    }
  ], {
    barmode: "group",
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
