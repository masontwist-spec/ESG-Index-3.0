function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function median(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function fmtPct(num) {
  return (Number(num) * 100).toFixed(1) + '%';
}

function fmtWholePct(num) {
  return Math.round(Number(num) * 100) + '%';
}

function buildDistributionBins(values, start = 0, end = 1, binCount = 10) {
  const binSize = (end - start) / binCount;
  const bins = Array.from({ length: binCount }, (_, index) => {
    const binStart = start + index * binSize;
    const binEnd = binStart + binSize;
    return {
      start: binStart,
      end: binEnd,
      center: binStart + binSize / 2,
      count: 0
    };
  });

  values.forEach((value) => {
    const clamped = Math.min(end, Math.max(start, Number(value) || 0));
    const rawIndex = Math.floor((clamped - start) / binSize);
    const index = Math.min(binCount - 1, Math.max(0, rawIndex));
    bins[index].count += 1;
  });

  return bins;
}

function buildDistributionSubtitle(bins) {
  if (!bins.length) return "";

  let bestWindow = { start: 0, total: -1 };
  for (let i = 0; i <= bins.length - 3; i += 1) {
    const total = bins[i].count + bins[i + 1].count + bins[i + 2].count;
    if (total > bestWindow.total) bestWindow = { start: i, total };
  }

  const clusterStart = bins[bestWindow.start]?.start ?? 0;
  const clusterEnd = bins[Math.min(bestWindow.start + 2, bins.length - 1)]?.end ?? 1;
  const outlierCount = bins
    .filter(bin => bin.end <= 0.2 || bin.start >= 0.8)
    .reduce((sum, bin) => sum + bin.count, 0);

  return `${fmtWholePct(clusterStart)}-${fmtWholePct(clusterEnd)} holds the main cluster.<br>Only ${outlierCount} companies sit below 20% or above 80%.`;
}

function getDistributionChartSizing() {
  const width = window.innerWidth;

  if (width <= 640) {
    return {
      height: 280,
      titleSize: 18,
      subtitleSize: 12,
      axisTitleSize: 12,
      axisTickSize: 11,
      annotationSize: 11,
      topMargin: 104
    };
  }

  if (width <= 980) {
    return {
      height: 320,
      titleSize: 21,
      subtitleSize: 13,
      axisTitleSize: 13,
      axisTickSize: 12,
      annotationSize: 11,
      topMargin: 114
    };
  }

  return {
    height: 360,
    titleSize: 24,
    subtitleSize: 14,
    axisTitleSize: 14,
    axisTickSize: 12,
    annotationSize: 12,
    topMargin: 126
  };
}

let distributionResizeBound = false;
let distributionResizeTimer = null;

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
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  const avgESG = mean(data.map(d => d.ESG_Score));

  grid.innerHTML = `
    <div class="stat">
      <div class="stat-value"><a href="companies.html" style="color: inherit; text-decoration: none;">${data.length}</a></div>
      <div class="stat-label">Companies covered</div>
    </div>
    <div class="stat">
      <div class="stat-value"><a href="sectors.html" style="color: inherit; text-decoration: none;">${sectors}</a></div>
      <div class="stat-label">Sectors covered</div>
    </div>
    <div class="stat">
      <div class="stat-value"><a href="profile.html?ticker=${encodeURIComponent(highest.Ticker)}" style="color: inherit; text-decoration: none; border-bottom: 2px solid var(--red);">${highest.Ticker}</a></div>
      <div class="stat-label">Highest ESG Score</div>
    </div>
    <div class="stat">
      <div class="stat-value"><a href="profile.html?ticker=${encodeURIComponent(lowest.Ticker)}" style="color: inherit; text-decoration: none; border-bottom: 2px solid var(--green);">${lowest.Ticker}</a></div>
      <div class="stat-label">Lowest ESG score</div>
    </div>
    <div class="stat">
      <div class="stat-value"><a href="esg.html" style="color: inherit; text-decoration: none;">${fmtPct(avgESG)}</a></div>
      <div class="stat-label">Avg. ESG Exposure</div>
    </div>
  `;
}

function renderBreakdownCards(data) {
  const envAvg = mean(data.map(d => d.Environment_Score));
  const socAvg = mean(data.map(d => d.Social_Score));
  const esgAvg = mean(data.map(d => d.ESG_Score));

  const envAvgPill = document.getElementById("envAvgPill");
  const socAvgPill = document.getElementById("socAvgPill");
  const esgAvgPill = document.getElementById("esgAvgPill");

  const envAvgBar = document.getElementById("envAvgBar");
  const socAvgBar = document.getElementById("socAvgBar");
  const esgAvgBar = document.getElementById("esgAvgBar");

  if (envAvgPill) envAvgPill.textContent = `${fmtPct(envAvg)} avg.`;
  if (socAvgPill) socAvgPill.textContent = `${fmtPct(socAvg)} avg.`;
  if (esgAvgPill) esgAvgPill.textContent = `${fmtPct(esgAvg)} avg.`;

  if (envAvgBar) envAvgBar.style.width = `${envAvg * 100}%`;
  if (socAvgBar) socAvgBar.style.width = `${socAvg * 100}%`;
  if (esgAvgBar) esgAvgBar.style.width = `${esgAvg * 100}%`;
}

function renderLeaderboard(data) {
  const wrap = document.getElementById("overviewLeaderboard");
  if (!wrap) return;

  const lowest = [...data]
    .sort((a, b) => a.ESG_Score - b.ESG_Score)
    .slice(0, 3);

  const highest = [...data]
    .sort((a, b) => b.ESG_Score - a.ESG_Score)
    .slice(0, 3);

  wrap.innerHTML = `
    <div class="leaderboard-section worst-section">
      <h3>Worst Performers</h3>
      ${highest.map((d, i) => `
        <a href="profile.html?ticker=${encodeURIComponent(d.Ticker)}" style="text-decoration: none; color: inherit;">
          <div class="lb-row" style="cursor: pointer;">
            <div class="lb-rank worst-rank">${100 - i}</div>
            <div class="lb-company">
              <img src="assets/logos/${d.Ticker.toUpperCase()}.png" alt="${d.Company} logo" class="lb-logo" onerror="this.style.display='none'">
              <div class="name">${d.Company}</div>
              <div class="meta">${d.Sector}</div>
            </div>
            <div class="lb-score">
              <div class="value worst-value">${fmtPct(d.ESG_Score)}</div>
              <div class="ticker">${d.Ticker}</div>
            </div>
          </div>
        </a>
      `).join("")}
    </div>
    <div class="leaderboard-section best-section">
      <h3>Best Performers</h3>
      ${lowest.map((d, i) => `
        <a href="profile.html?ticker=${encodeURIComponent(d.Ticker)}" style="text-decoration: none; color: inherit;">
          <div class="lb-row" style="cursor: pointer;">
            <div class="lb-rank best-rank">${i + 1}</div>
            <div class="lb-company">
              <img src="assets/logos/${d.Ticker.toUpperCase()}.png" alt="${d.Company} logo" class="lb-logo" onerror="this.style.display='none'">
              <div class="name">${d.Company}</div>
              <div class="meta">${d.Sector}</div>
            </div>
            <div class="lb-score">
              <div class="value best-value">${fmtPct(d.ESG_Score)}</div>
              <div class="ticker">${d.Ticker}</div>
            </div>
          </div>
        </a>
      `).join("")}
    </div>
  `;
}

function renderDistributionChart(data) {
  const chartEl = document.getElementById("overviewDistributionChart");
  const chartTitleEl = document.getElementById("overviewDistributionTitle");
  const chartSubtitleEl = document.getElementById("overviewDistributionSubtitle");
  if (!chartEl) return;

  const scores = data.map(d => Number(d.ESG_Score) || 0);
  const avgScore = mean(scores);
  const medianScore = median(scores);
  const bins = buildDistributionBins(scores, 0, 1, 10);
  const subtitle = buildDistributionSubtitle(bins);
  const sizing = getDistributionChartSizing();
  const maxCount = Math.max(...bins.map(bin => bin.count), 0);
  const meanAndMedianAreClose = Math.abs(avgScore - medianScore) < 0.08;
  const avgLabelY = maxCount + 0.42;
  const medianLabelY = meanAndMedianAreClose ? Math.max(maxCount - 1.2, 0.95) : Math.max(maxCount - 0.4, 1);

  if (chartTitleEl) chartTitleEl.textContent = "Distribution of ESG Exposure";
  if (chartSubtitleEl) chartSubtitleEl.innerHTML = subtitle;

  Plotly.react(
    chartEl,
    [
      {
        type: "bar",
        x: bins.map(bin => bin.center),
        y: bins.map(bin => bin.count),
        width: bins.map(() => 0.092),
        customdata: bins.map(bin => [
          fmtWholePct(bin.start),
          fmtWholePct(bin.end),
          bin.count
        ]),
        marker: {
          color: bins.map(bin => (bin.center >= avgScore ? "#246847" : "#2f8b57")),
          opacity: 0.85,
          line: {
            color: "rgba(16, 25, 43, 0.12)",
            width: 1
          }
        },
        hovertemplate: "%{customdata[0]}-%{customdata[1]} ESG exposure<br>%{customdata[2]} companies<extra></extra>"
      }
    ],
    {
      annotations: [
        {
          x: avgScore,
          y: avgLabelY,
          xanchor: meanAndMedianAreClose ? "right" : "left",
          yanchor: "bottom",
          showarrow: false,
          text: `Average: ${fmtPct(avgScore)}`,
          font: {
            size: sizing.annotationSize,
            color: "#24553a"
          },
          bgcolor: "rgba(220, 236, 223, 0.96)",
          bordercolor: "rgba(47, 139, 87, 0.22)",
          borderwidth: 1,
          borderpad: 5
        },
        {
          x: medianScore,
          y: medianLabelY,
          xanchor: "left",
          yanchor: "bottom",
          showarrow: false,
          text: `Median: ${fmtPct(medianScore)}`,
          font: {
            size: sizing.annotationSize,
            color: "#4e5b72"
          },
          bgcolor: "rgba(255, 255, 255, 0.96)",
          bordercolor: "rgba(152, 162, 179, 0.35)",
          borderwidth: 1,
          borderpad: 5
        }
      ],
      shapes: [
        {
          type: "line",
          x0: avgScore,
          x1: avgScore,
          y0: 0,
          y1: maxCount + 0.75,
          line: {
            color: "#2f8b57",
            width: 2,
            dash: "solid"
          }
        },
        {
          type: "line",
          x0: medianScore,
          x1: medianScore,
          y0: 0,
          y1: maxCount + 0.75,
          line: {
            color: "#98a2b3",
            width: 2,
            dash: "dot"
          }
        }
      ],
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      height: sizing.height,
      margin: { l: 56, r: 18, t: 28, b: 56 },
      bargap: 0.06,
      hoverlabel: {
        bgcolor: "#ffffff",
        bordercolor: "rgba(16, 25, 43, 0.08)",
        font: {
          color: "#171b24",
          size: sizing.axisTickSize
        }
      },
      xaxis: {
        title: {
          text: "ESG Exposure Score",
          font: {
            size: sizing.axisTitleSize,
            color: "#667085"
          }
        },
        range: [0, 1],
        tickvals: [0, 0.2, 0.4, 0.6, 0.8, 1],
        tickformat: ".0%",
        tickfont: {
          size: sizing.axisTickSize,
          color: "#344054"
        },
        showgrid: false,
        zeroline: false,
        showline: false,
        linecolor: "rgba(16, 25, 43, 0.12)",
        ticks: "outside"
      },
      yaxis: {
        title: {
          text: "Number of Companies",
          font: {
            size: sizing.axisTitleSize,
            color: "#667085"
          }
        },
        rangemode: "tozero",
        range: [0, maxCount + 1.2],
        tickfont: {
          size: sizing.axisTickSize,
          color: "#344054"
        },
        gridcolor: "rgba(16, 25, 43, 0.08)",
        griddash: "dot",
        zeroline: false
      }
    },
    {
      responsive: true,
      displayModeBar: false
    }
  );

  if (!distributionResizeBound) {
    window.addEventListener("resize", () => {
      window.clearTimeout(distributionResizeTimer);
      distributionResizeTimer = window.setTimeout(() => renderDistributionChart(data), 120);
    });
    distributionResizeBound = true;
  }
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
