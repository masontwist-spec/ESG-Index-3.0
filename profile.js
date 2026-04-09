function mean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

function fmtPct(num) {
  return (Number(num) * 100).toFixed(1) + '%';
}

const PROFILE_CONTACTS = {
  "III": { irEmail: "investor.relations@3i.com" },
  "ADM": { irEmail: "investorrelationssupport@admiralgroup.co.uk" },
  "AAF": { irEmail: "Investor.relations@africa.airtel.com" },
  "ALW": { irEmail: "investor@alliancewitan.com" },
  "AAL": { irEmail: "tyler.broda@angloamerican.com" },
  "ANTO": { irEmail: "investorrelations@antofagasta.co.uk" },
  "AHT": { irEmail: "kevin.powers@sunbeltrentals.com" },
  "AV": { irEmail: "IR@aviva.com" },
  "AZN": { irEmail: "ir@astrazeneca.com" },
  "AUTO": { irEmail: "ir@autotrader.co.uk" },
  "BAB": { irEmail: "BabcockIR@babcockinternational.com" },
  "BA": { irEmail: "investors@baesystems.com" },
  "BARC": { irEmail: "marina.shchukina@barclays.com" },
  "BDEV": { irEmail: "john.messenger@barrattredrow.co.uk" },
  "BEZ": { irEmail: "sarah.booth@beazley.com" },
  "BKG": { irEmail: "shareholderenquiries@cm.mpms.mufg.com" },
  "BP": { irEmail: "ir@bp.com" },
  "BATS": { irEmail: "IR_team@bat.com" },
  "BLND": { irEmail: "investor.relations@britishland.com" },
  "BT.A": { irEmail: "ir@bt.com" },
  "BNZL": { irEmail: "investor@bunzl.com" },
  "BRBY": { irEmail: "investor.relations@burberry.com" },
  "CNA": { irEmail: "ir@centrica.com" },
  "CCH": { irEmail: "investor.relations@cchellenic.com" },
  "CPG": { irEmail: "investor.relations@compass-group.com" },
  "CTEC": { irEmail: "ir@convatec.com" },
  "CRDA": { irEmail: "investor.relations@croda.com" },
  "DCC": { irEmail: "investorrelations@dcc.ie" },
  "DGE": { irEmail: "investor.relations@diageo.com" },
  "DPLM": { irEmail: "investors@diplomaplc.com" },
  "EDV": { irEmail: "investor@endeavourmining.com" },
  "ENT": { irEmail: "investors@entaingroup.com" },
  "EZJ": { irEmail: "investor.relations@easyJet.com" },
  "EXPN": { irEmail: "investors@experian.com" },
  "FCIT": { irEmail: "campbell.hood@columbiathreadneedle.com" },
  "FRES": { irEmail: "ir@fresnilloplc.com" },
  "GAW": { irEmail: "investorrelations@gwplc.com" },
  "GLEN": { irEmail: "martin.fewings@glencore.com" },
  "GSK": { irEmail: "GSK.Investor-Relations@gsk.com" },
  "HLN": { irEmail: "investor-relations@haleon.com" },
  "HLMA": { irEmail: "investor.relations@halma.com" },
  "HSX": { irEmail: "yana.osullivan@hiscox.com" },
  "HWDN": { irEmail: "IR@howdens.com" },
  "HSBC": { irEmail: "investorrelations@hsbc.com" },
  "IMI": { irEmail: "edward.hann@imiplc.com" },
  "IMB": { irEmail: "ir@impbrands.com" },
  "INF": { irEmail: "investorrelations@informa.com" },
  "IHG": { irEmail: "investors@ihg.com" },
  "ICG": { irEmail: "shareholder.relations@icgam.com" },
  "ITRK": { irEmail: "investor@intertek.com" },
  "IAG": { irEmail: "investor.relations@iairgroup.com" },
  "JD": { irEmail: "investor.relations@jdplc.com" },
  "KGF": { irEmail: "investorenquiries@kingfisher.com" },
  "LAND": { irEmail: "ShareholderEnquiries@landsec.com" },
  "LGEN": { irEmail: "Investor.Relations@group.landg.com" },
  "LLOY": { irEmail: "investor.relations@lloydsbanking.com" },
  "LMP": { irEmail: "info@londonmetric.com" },
  "LSEG": { irEmail: "ir@lseg.com" },
  "MNG": { irEmail: "luca.gagliardi@mandg.com" },
  "MKS": { irEmail: "mandsinvestorrelations@marks-and-spencer.com" },
  "MRO": { irEmail: "ir@melroseplc.net" },
  "MNDI": { irEmail: "ir@mondigroup.com" },
  "NG": { irEmail: "investor.relations@nationalgrid.com" },
  "NWG": { irEmail: "investor.relations@natwest.com" },
  "NXT": { irEmail: "investors@next.co.uk" },
  "PSON": { irEmail: "ir@pearson.com" },
  "PHNX": { irEmail: "claire.hawkins@standardlife.com" },
  "PSN": { irEmail: "feedback@persimmonhomes.com" },
  "PRU": { irEmail: "investor.relations@prudentialplc.com" },
  "RKT": { irEmail: "IR@reckitt.com" },
  "REL": { irEmail: "investor.relations@relx.com" },
  "RTO": { irEmail: "investor@rentokil-initial.com" },
  "RMV": { irEmail: "investor.relations@rightmove.co.uk" },
  "RIO": { irEmail: "investorenquiries@riotinto.com" },
  "RR": { irEmail: "investor.relations@rolls-royce.com" },
  "SGE": { irEmail: "investor.relations@sage.com" },
  "SBRY": { irEmail: "sainsburys@cm.mpms.mufg.com" },
  "SDR": { irEmail: "investorrelations@schroders.com" },
  "SMT": { irEmail: "enquiries@bailliegifford.com" },
  "SGRO": { irEmail: "SEGRO.Investor.Relations@segro.com" },
  "SVT": { irEmail: "investorrelations@severntrent.co.uk" },
  "SHEL": { irEmail: "ir-europe@shell.com" },
  "SN": { irEmail: "InvestorRelations.Global@smith-nephew.com" },
  "SMIN": { irEmail: "investor.relations@smiths.com" },
  "SPX": { irEmail: "Mal.Patel@spiraxgroup.com" },
  "SSE": { irEmail: "ir@sse.com" },
  "STJ": { irEmail: "hugh.taylor@sjp.co.uk" },
  "STAN": { irEmail: "Investor.Relations@sc.com" },
  "TW": { irEmail: "TaylorWimpey-LON@fgsglobal.com" },
  "TSCO": { irEmail: "Investor.Relations@tesco.com" },
  "ULVR": { irEmail: "investor.relations@unilever.com" },
  "UTG": { irEmail: "ir@unitestudents.com" },
  "UU": { irEmail: "chris.laybutt@uuplc.co.uk" },
  "VOD": { irEmail: "ir@vodafone.co.uk" },
  "WEIR": { irEmail: "investor-relations@weir.co.uk" },
  "WTB": { irEmail: "investorrelations@whitbread.com" },
  "WPP": { irEmail: "irteam@wpp.com" }
};

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

function profileRankTone(rank, total = cappedData.length) {
  if (!rank || total <= 1) return "rank-medium";

  const ratio = (Number(rank) - 1) / Math.max(1, total - 1);
  if (ratio < 1 / 3) return "rank-good";
  if (ratio < 2 / 3) return "rank-medium";
  return "rank-bad";
}

function sectorRankOfTicker(scoreKey, ticker, sector) {
  const rows = getSectorRows(sector)
    .slice()
    .sort((a, b) => a[scoreKey] - b[scoreKey]);

  const idx = rows.findIndex(d => String(d.Ticker).toUpperCase() === String(ticker).toUpperCase());
  return idx >= 0 ? idx + 1 : null;
}

function getProfileContact(ticker) {
  return PROFILE_CONTACTS[String(ticker).toUpperCase()] || null;
}

function renderProfileContacts(company) {
  const contactBlock = document.getElementById("profileContactBlock");
  const irEmailLink = document.getElementById("profileIrEmail");
  const contact = getProfileContact(company.Ticker);

  if (!contactBlock || !irEmailLink) return;

  if (!contact || !contact.irEmail) {
    contactBlock.hidden = true;
    irEmailLink.textContent = "";
    irEmailLink.removeAttribute("href");
    return;
  }

  irEmailLink.textContent = contact.irEmail;
  irEmailLink.href = `mailto:${contact.irEmail}`;
  contactBlock.hidden = false;
}

function renderProfileHeader(company) {
  const logo = document.getElementById("profileLogo");
  const logoShell = document.getElementById("profileLogoShell");

  document.getElementById("profileCompanyName").textContent = company.Company;
  document.getElementById("profileTicker").textContent = company.Ticker;
  document.getElementById("profileIntro").textContent =
    `${company.Company} is classified in ${company.Sector}. The profile below shows its Environment, Social, and composite ESG exposure analytics under the current public-facing model.`;

  document.getElementById("profileMetaText").textContent =
    `${company.Company} · ${company.Ticker} · ${company.Sector}`;

  if (logo && logoShell) {
    logo.src = `assets/logos/${String(company.Ticker).toUpperCase()}.png`;
    logo.alt = `${company.Company} logo`;
    logo.onload = () => {
      logoShell.hidden = false;
    };
    logo.onerror = () => {
      logoShell.hidden = true;
    };
    logoShell.hidden = false;
  }

  renderProfileContacts(company);

  const overallRank = rankOfTicker("ESG_Score", company.Ticker);
  const envRank = rankOfTicker("Environment_Score", company.Ticker);
  const socRank = rankOfTicker("Social_Score", company.Ticker);

  document.getElementById("profileSignalList").innerHTML = `
    <div class="signal">
      <span class="name">Overall ESG rank</span>
      <span class="tag ${profileRankTone(overallRank)}">#${overallRank}</span>
    </div>
    <div class="signal">
      <span class="name">Environment rank</span>
      <span class="tag ${profileRankTone(envRank)}">#${envRank}</span>
    </div>
    <div class="signal">
      <span class="name">Social rank</span>
      <span class="tag ${profileRankTone(socRank)}">#${socRank}</span>
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
