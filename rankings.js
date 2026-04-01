let sortCol = 'Environment_Score';
let sortAsc = true;

function populateSectorFilter() {
  const sel = document.getElementById('sectorFilter');
  uniqueSectors().forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    sel.appendChild(opt);
  });
}

/* Continuous colour scale:
   0.0 = green
   0.5 = amber
   1.0 = red
*/
function gradientColor(v) {
  const x = Math.max(0, Math.min(1, Number(v) || 0));

  if (x <= 0.5) {
    const t = x / 0.5;
    const r = Math.round(47 + (198 - 47) * t);   // green -> amber
    const g = Math.round(139 + (135 - 139) * t);
    const b = Math.round(87 + (47 - 87) * t);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const t = (x - 0.5) / 0.5;
    const r = Math.round(198 + (217 - 198) * t); // amber -> red
    const g = Math.round(135 + (93 - 135) * t);
    const b = Math.round(47 + (93 - 47) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

function metricMarkup(v, bold = false) {
  const value = Math.max(0, Math.min(1, Number(v) || 0));
  const color = gradientColor(value);

  return `
    <div class="metric-cell">
      <div class="tiny-track">
        <div class="tiny-fill" style="width:${value * 100}%; background:${color};"></div>
      </div>
      <div class="${bold ? 'score-value' : 'pct'}" style="color:${color}">
        ${pct(value)}
      </div>
    </div>
  `;
}

function currentRows() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  const sector = document.getElementById('sectorFilter').value;
  const tier = document.getElementById('tierFilter').value;

  let rows = rankSortedBy('Environment_Score').filter(d => {
    const matchQ = !q || d.Company.toLowerCase().includes(q) || d.Ticker.toLowerCase().includes(q);
    const matchSector = !sector || d.Sector === sector;
    const matchTier = !tier || tierKey(d.Environment_Score) === tier;
    return matchQ && matchSector && matchTier;
  });

  rows.sort((a, b) => {
    const av = sortCol === 'rank'
      ? a.rank
      : sortCol === 'tier'
        ? tierLabel(a.Environment_Score)
        : a[sortCol];

    const bv = sortCol === 'rank'
      ? b.rank
      : sortCol === 'tier'
        ? tierLabel(b.Environment_Score)
        : b[sortCol];

    if (typeof av === 'string') {
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return sortAsc ? av - bv : bv - av;
  });

  return rows;
}

function renderTable() {
  const rows = currentRows();

  document.getElementById('tableBody').innerHTML = rows.map(d => {
    const tier = tierKey(d.Environment_Score);

    return `<tr>
      <td><div class="rank-badge">${d.rank}</div></td>
      <td>
        <div class="company-name">
          <a href="profile.html?ticker=${encodeURIComponent(d.Ticker)}">${d.Company}</a>
        </div>
      </td>
      <td><span class="ticker-badge">${d.Ticker}</span></td>
      <td><span class="sector-name">${d.Sector}</span></td>

      <td>${metricMarkup(d.Climate_Targets)}</td>
      <td>${metricMarkup(d.Investment_Transition)}</td>
      <td>${metricMarkup(d.Climate_Reporting)}</td>
      <td>${metricMarkup(d.Environment_Score, true)}</td>

      <td><span class="tier-pill tier-${tier}">${tierLabel(d.Environment_Score)}</span></td>
    </tr>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  populateSectorFilter();
  renderTable();

  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (sortCol === col) {
        sortAsc = !sortAsc;
      } else {
        sortCol = col;
        sortAsc = col === 'Environment_Score' || col === 'rank';
      }
      renderTable();
    });
  });

  document.getElementById('searchInput').addEventListener('input', renderTable);
  document.getElementById('sectorFilter').addEventListener('change', renderTable);
  document.getElementById('tierFilter').addEventListener('change', renderTable);
});
