let sortCol = 'ESG_Score';
let sortAsc = false;

function populateSectorFilter() {
  const sel = document.getElementById('sectorFilter');
  uniqueSectors().forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    sel.appendChild(opt);
  });
}


function gradientColor(v) {
  const x = Math.max(0, Math.min(1, Number(v) || 0));

  if (x < 0.33) return '#4f9b63';   // green
  if (x < 0.66) return '#c6872f';   // yellow / amber
  return '#d95d5d';                 // red
}
function metricMarkup(v, bold = false) {
  const value = Math.max(0, Math.min(1, Number(v) || 0));
  const color = gradientColor(value);

  return `
    <div class="metric-stack">
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

    return `<tr class="ranking-row" onclick="window.location.href='profile.html?ticker=${encodeURIComponent(d.Ticker)}'">
      <td><div class="rank-cell"><div class="rank-badge">${d.rank}</div></div></td>
      <td>
        <div class="company-cell">
          <div class="company-name">
            <img src="assets/logos/${d.Ticker.toUpperCase()}.png" alt="${d.Company} logo" class="company-logo" onerror="this.style.display='none'">
            <span>${d.Company}</span>
          </div>
        </div>
      </td>
      <td><div class="ticker-cell"><span class="ticker-badge">${d.Ticker}</span></div></td>
      <td><div class="sector-cell"><span class="sector-name">${d.Sector}</span></div></td>
      <td><div class="metric-cell">${metricMarkup(d.Environment_Score)}</div></td>
      <td><div class="metric-cell">${metricMarkup(d.Social_Score)}</div></td>
      <td><div class="metric-cell">${metricMarkup(d.ESG_Score, true)}</div></td>
      <td><div class="tier-cell"><span class="tier-pill tier-${tier}">${tierLabel(d.ESG_Score)}</span></div></td>
    </tr>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  populateSectorFilter();
  renderTable();

  document.querySelectorAll('.table-header [data-sort]').forEach(th => {
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

  // Modal functionality
  const modal = document.getElementById('scoreInfoModal');
  const scoreInfoBtn = document.getElementById('scoreInfoBtn');
  const closeBtn = document.getElementById('scoreInfoClose');

  function openModal() {
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
  }

  scoreInfoBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal.querySelector('.modal-overlay')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });
});
