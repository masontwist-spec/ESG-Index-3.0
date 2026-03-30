function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function fmtPct(num) {
  return (Number(num) * 100).toFixed(1) + '%';
}

function getProfileTicker() {
  const params = new URLSearchParams(window.location.search);
  return params.get("ticker");
}

function getCompanyByTicker(ticker) {
  return cappedData.find(d => String(d.Ticker).toUpperCase() === String(ticker).toUpperCase());
}

function getSectorRows(sector) {
  return cappedData.filter(d => d.Sector === sector);
}

function rankOfTicker(scoreKey, ticker) {
  const ranked = rankSortedBy(scoreKey);
  const row = ranked.find(d => String(d.Ticker).toUpperCase() === String(ticker).toUpperCase());
  return row ? row.rank : null;
}

function sectorRankOfTicker(scoreKey, ticker, sector) {
  const rows = getSectorRows(sector)
    .slice()
    .sort((a, b) => a[scoreKey] - b[scoreKey]);

  const idx = rows.findIndex(d => String(d.Ticker).toUpperCase() === String(ticker).toUpperCase());
  return idx >= 0 ? idx + 1 : null;
}

function renderProfileHeader(company) {
  document.getElementById("profileCompanyName").textContent = company.Company;
  document.getElementById("profileTicker").textContent = company.Ticker;
  document.getElementById("profileIntro").textContent =
    `${company.Company} is classified in ${company.Sector}. The profile below shows its Environment, Social, and composite ESG exposure analytics under the current public-facing model.`;

  document.getElementById("profileMetaText").textContent =
    `${company.Company} · ${company.Ticker} · ${company.Sector}`;

  const overallRank = rankOfTicker("ESG_Score", company.Ticker);
  const envRank = rankOfTicker("Environment_Score", company.Ticker);
  const socRank = rankOfTicker("Social_Score", company.Ticker);

  document.getElementById("profileSignalList").innerHTML = `
    <div class="signal">
      <span class="name">Overall ESG rank</span>
      <span class="tag">#${overallRank}</span>
    </div>
    <div class="signal">
      <span class="name">Environment rank</span>
      <span class="tag">#${envRank}</span>
    </div>
    <div class="signal">
      <span class="name">Social rank</span>
      <span class="tag">#${socRank}</span>
    </div>
  `;
}

function renderStats(company) {
  const grid = document.getElementById("profileStatsGrid");
  if (!grid) return;

  grid.innerHTML = `
    <div class="stat">
      <div class="stat-value">${fmtPct(company.Environment_Score)}</div>
      <div class="stat-label">Environment</div>
    </div>
    <div class="stat">
      <div class="stat-value">${fmtPct(company.Social_Score)}</div>
      <div class="stat-label">Social</div>
    </div>
    <div class="stat">
      <div class="stat-value">${fmtPct(company.ESG_Score)}</div>
      <div class="stat-label">Composite ESG</div>
    </div>
    <div class="stat">
      <div class="stat-value">${company.Sector}</div>
      <div class="stat-label">Sector</div>
    </div>
  `;
}

function renderBars(company) {
  const mapping = [
    ["e1Pill", "e1Bar", company.Climate_Targets],
    ["e2Pill", "e2Bar", company.Investment_Transition],
    ["e3Pill", "e3Bar", company.Climate_Reporting],
    ["s1Pill", "s1Bar", company.DEI_Targets_Representation],
    ["s2Pill", "s2Bar", company.DEI_Programmes_Memberships],
    ["s3Pill", "s3Bar", company.Social_Incentives]
  ];

  mapping.forEach(([pillId, barId, value]) => {
    const pill = document.getElementById(pillId);
    const bar = document.getElementById(barId);
    if (pill) pill.textContent = fmtPct(value);
    if (bar) bar.style.width = `${value * 100}%`;
  });
}

function renderComparisonChart(company) {
  const sectorRows = getSectorRows(company.Sector);
  const sectorAvgEnv = mean(sectorRows.map(d => d.Environment_Score));
  const sectorAvgSoc = mean(sectorRows.map(d => d.Social_Score));
  const sectorAvgESG = mean(sectorRows.map(d => d.ESG_Score));

  const overallAvgEnv = mean(cappedData.map(d => d.Environment_Score));
  const overallAvgSoc = mean(cappedData.map(d => d.Social_Score));
  const overallAvgESG = mean(cappedData.map(d => d.ESG_Score));

  Plotly.newPlot(
    "profileComparisonChart",
    [
      {
        type: "bar",
        name: company.Company,
        x: ["Environment", "Social", "ESG"],
        y: [company.Environment_Score, company.Social_Score, company.ESG_Score],
        marker: { color: "#2f8b57" }
      },
      {
        type: "bar",
        name: "Sector Avg",
        x: ["Environment", "Social", "ESG"],
        y: [sectorAvgEnv, sectorAvgSoc, sectorAvgESG],
        marker: { color: "#4867c9" }
      },
      {
        type: "bar",
        name: "Index Avg",
        x: ["Environment", "Social", "ESG"],
        y: [overallAvgEnv, overallAvgSoc, overallAvgESG],
        marker: { color: "#c6872f" }
      }
    ],
    {
      barmode: "group",
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      margin: { l: 50, r: 20, t: 10, b: 40 },
      yaxis: { title: "Score" }
    },
    {
      responsive: true,
      displayModeBar: false
    }
  );
}

function renderRelativeChart(company) {
  const overallESGRank = rankOfTicker("ESG_Score", company.Ticker);
  const overallEnvRank = rankOfTicker("Environment_Score", company.Ticker);
  const overallSocRank = rankOfTicker("Social_Score", company.Ticker);

  const sectorESGRank = sectorRankOfTicker("ESG_Score", company.Ticker, company.Sector);
  const sectorEnvRank = sectorRankOfTicker("Environment_Score", company.Ticker, company.Sector);
  const sectorSocRank = sectorRankOfTicker("Social_Score", company.Ticker, company.Sector);

  Plotly.newPlot(
    "profileRelativeChart",
    [
      {
        type: "bar",
        name: "Overall Rank",
        x: ["ESG", "Environment", "Social"],
        y: [overallESGRank, overallEnvRank, overallSocRank],
        marker: { color: "#6d4cc4" }
      },
      {
        type: "bar",
        name: "Sector Rank",
        x: ["ESG", "Environment", "Social"],
        y: [sectorESGRank, sectorEnvRank, sectorSocRank],
        marker: { color: "#d95d5d" }
      }
    ],
    {
      barmode: "group",
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      margin: { l: 50, r: 20, t: 10, b: 40 },
      yaxis: {
        title: "Rank",
        autorange: "reversed"
      }
    },
    {
      responsive: true,
      displayModeBar: false
    }
  );
}

function initProfilePage() {
  if (!Array.isArray(cappedData)) {
    console.error("cappedData is not available.");
    return;
  }

  const ticker = getProfileTicker();
  if (!ticker) {
    document.getElementById("profileCompanyName").textContent = "Profile Not Found";
    document.getElementById("profileTicker").textContent = "";
    document.getElementById("profileIntro").textContent =
      "No company ticker was provided in the URL.";
    return;
  }

  const company = getCompanyByTicker(ticker);
  if (!company) {
    document.getElementById("profileCompanyName").textContent = "Profile Not Found";
    document.getElementById("profileTicker").textContent = ticker;
    document.getElementById("profileIntro").textContent =
      "The selected company could not be found in the current data set.";
    return;
  }

  renderProfileHeader(company);
  renderStats(company);
  renderBars(company);
  renderComparisonChart(company);
  renderRelativeChart(company);
}

document.addEventListener("DOMContentLoaded", initProfilePage);
