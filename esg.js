let sortCol = 'ESG_Score';
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

function currentRows() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();
  const sector = document.getElementById('sectorFilter').value;
  const tier = document.getElementById('tierFilter').value;

  let rows = rankSortedBy('ESG_Score').filter(d => {
    const matchQ = !q || d.Company.toLowerCase().includes(q) || d.Ticker.toLowerCase().includes(q);
    const matchSector = !sector || d.Sector === sector;
    const matchTier = !tier || tierKey(d.ESG_Score) === tier;
    return matchQ && matchSector && matchTier;
  });

  rows.sort((a, b) => {
    const av = sortCol === 'rank'
      ? a.rank
      : sortCol === 'tier'
        ? tierLabel(a.ESG_Score)
        : a[sortCol];

    const bv = sortCol === 'rank'
      ? b.rank
      : sortCol === 'tier'
        ? tierLabel(b.ESG_Score)
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
    const tier = tierKey(d.ESG_Score);
    const color = tierColor(tier);

    return `<tr>
      <td><div class="rank-badge">${d.rank}</div></td>
      <td>
  <div class="company-name">
    <a href="profile.html?ticker=${encodeURIComponent(d.Ticker)}">${d.Company}</a>
  </div>
</td>
      <td><span class="ticker-badge">${d.Ticker}</span></td>
      <td><span class="sector-name">${d.Sector}</span></td>
      <td>
        <div class="metric-cell">
          <div class="tiny-track">
            <div class="tiny-fill bad" style="width:${d.Environment_Score * 100}%"></div>
          </div>
          <div class="pct">${pct(d.Environment_Score)}</div>
        </div>
      </td>
      <td>
        <div class="metric-cell">
          <div class="tiny-track">
            <div class="tiny-fill bad" style="width:${d.Social_Score * 100}%"></div>
          </div>
          <div class="pct">${pct(d.Social_Score)}</div>
        </div>
      </td>
      <td>
        <div class="metric-cell">
          <div class="tiny-track">
            <div class="tiny-fill ${tier === 'poor' || tier === 'wasteful' ? 'bad' : ''}" style="width:${d.ESG_Score * 100}%"></div>
          </div>
          <div class="score-value" style="color:${color}">${pct(d.ESG_Score)}</div>
        </div>
      </td>
      <td><span class="tier-pill tier-${tier}">${tierLabel(d.ESG_Score)}</span></td>
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
        sortAsc = col === 'ESG_Score' || col === 'rank';
      }
      renderTable();
    });
  });

  document.getElementById('searchInput').addEventListener('input', renderTable);
  document.getElementById('sectorFilter').addEventListener('change', renderTable);
  document.getElementById('tierFilter').addEventListener('change', renderTable);
});
