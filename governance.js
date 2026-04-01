function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function fmtPct(num) {
  return (Number(num) * 100).toFixed(1) + '%';
}

function clampGov(v) {
  return Math.max(0, Math.min(1, Number(v) || 0));
}

function governanceValueSet(row) {
  const reporting = clampGov(
    typeof row.Governance_Reporting_Assurance_Score !== "undefined"
      ? row.Governance_Reporting_Assurance_Score
      : row.Climate_Reporting
  );

  const oversight = clampGov(
    typeof row.Governance_Oversight_Incentives_Score !== "undefined"
      ? row.Governance_Oversight_Incentives_Score
      : row.Social_Incentives
  );

  const reference = clampGov(
    typeof row.Governance_Reference_Score !== "undefined"
      ? row.Governance_Reference_Score
      : (reporting + oversight) / 2
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

function renderGovernanceSignals(rows) {
  const el = document.getElementById("governanceSignalList");
  if (!el || !rows.length) return;

  const sorted = [...rows].sort((a, b) => a.Governance_Reference_Score - b.Governance_Reference_Score);
  const lowest = sorted[0];
  const highest = sorted[sorted.length - 1];
  const strongestOversight = [...rows].sort(
    (a, b) => b.Governance_Oversight_Incentives_Score - a.Governance_Oversight_Incentives_Score
  )[0];

  el.innerHTML = `
    <div class="signal">
      <span class="name">Low reference score</span>
      <span class="tag">${fmtPct(lowest.Governance_Reference_Score)}</span>
    </div>
    <div class="signal">
      <span class="name">High reference score</span>
      <span class="tag" style="background:rgba(240,120,120,0.12);color:#f0a0a0;">${fmtPct(highest.Governance_Reference_Score)}</span>
    </div>
    <div class="signal">
      <span class="name">Strongest oversight signal</span>
      <span class="tag">${strongestOversight.Ticker}</span>
    </div>
  `;
}

function renderGovernanceStats(rows) {
  const grid = document.getElementById("governanceStatsGrid");
  if (!grid || !rows.length) return;

  const sorted = [...rows].sort((a, b) => a.Governance_Reference_Score - b.Governance_Reference_Score);
  const avgReference = mean(rows.map(r => r.Governance_Reference_Score));
  const best = sorted[0];
  const strongestReporting = [...rows].sort(
    (a, b) => b.Governance_Reporting_Assurance_Score - a.Governance_Reporting_Assurance_Score
  )[0];
  const strongestOversight = [...rows].sort(
    (a, b) => b.Governance_Oversight_Incentives_Score - a.Governance_Oversight_Incentives_Score
  )[0];

  grid.innerHTML = `
    <div class="stat">
      <div class="stat-value">${fmtPct(avgReference)}</div>
      <div class="stat-label">Avg. Governance Reference</div>
    </div>
    <div class="stat">
      <div class="stat-value">${best.Ticker}</div>
      <div class="stat-label">Lowest governance reference</div>
    </div>
    <div class="stat">
      <div class="stat-value">${strongestReporting.Ticker}</div>
      <div class="stat-label">Strongest reporting / assurance</div>
    </div>
    <div class="stat">
      <div class="stat-value">${strongestOversight.Ticker}</div>
      <div class="stat-label">Strongest oversight / incentives</div>
    </div>
  `;
}

function renderGovernanceBreakdown(rows) {
  const avgReporting = mean(rows.map(r => r.Governance_Reporting_Assurance_Score));
  const avgOversight = mean(rows.map(r => r.Governance_Oversight_Incentives_Score));
  const avgReference = mean(rows.map(r => r.Governance_Reference_Score));

  const reportingPill = document.getElementById("govReportingPill");
  const oversightPill = document.getElementById("govOversightPill");
  const referencePill = document.getElementById("govReferencePill");

  const reportingBar = document.getElementById("govReportingBar");
  const oversightBar = document.getElementById("govOversightBar");
  const referenceBar = document.getElementById("govReferenceBar");

  if (reportingPill) reportingPill.textContent = `${fmtPct(avgReporting)} avg.`;
  if (oversightPill) oversightPill.textContent = `${fmtPct(avgOversight)} avg.`;
  if (referencePill) referencePill.textContent = `${fmtPct(avgReference)} avg.`;

  if (reportingBar) reportingBar.style.width = `${avgReporting * 100}%`;
  if (oversightBar) oversightBar.style.width = `${avgOversight * 100}%`;
  if (referenceBar) referenceBar.style.width = `${avgReference * 100}%`;
}

function renderGovernanceLeaderboard(rows) {
  const wrap = document.getElementById("governanceLeaderboard");
  if (!wrap) return;

  const top = [...rows]
    .sort((a, b) => a.Governance_Reference_Score - b.Governance_Reference_Score)
    .slice(0, 8);

  wrap.innerHTML = top.map((d, i) => `
    <div class="lb-row">
      <div class="lb-rank">${i + 1}</div>
      <div class="lb-company">
        <div class="name">${d.Company}</div>
        <div class="meta">${d.Sector}</div>
      </div>
      <div class="lb-score">
        <div class="value">${fmtPct(d.Governance_Reference_Score)}</div>
        <div class="ticker">${d.Ticker}</div>
      </div>
    </div>
  `).join("");
}

function renderGovernanceDistribution(rows) {
  Plotly.newPlot(
    "governanceDistributionChart",
    [
      {
        type: "histogram",
        x: rows.map(r => r.Governance_Reference_Score),
        nbinsx: 10,
        marker: {
          color: "#6d4cc4"
        },
        hovertemplate: "Governance score bin: %{x:.3f}<br>Count: %{y}<extra></extra>"
      }
    ],
    {
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      margin: { l: 50, r: 20, t: 10, b: 40 },
      xaxis: { title: "Governance Reference Score" },
      yaxis: { title: "Number of Companies" }
    },
    {
      responsive: true,
      displayModeBar: false
    }
  );
}

function initGovernancePage() {
  if (!Array.isArray(cappedData)) {
    console.error("cappedData is not available.");
    return;
  }

  const rows = governanceRows();

  renderGovernanceSignals(rows);
  renderGovernanceStats(rows);
  renderGovernanceBreakdown(rows);
  renderGovernanceLeaderboard(rows);
  renderGovernanceDistribution(rows);
}

document.addEventListener("DOMContentLoaded", initGovernancePage);
