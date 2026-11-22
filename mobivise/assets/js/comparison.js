var Mobivise = window.Mobivise;
/**
 * MOBIVISE — Client-Side Smartphone Comparison & Chart.js Engine
 * Pure Vanilla JavaScript (assets/js/comparison.js)
 * 100% Client-Side, Zero PHP, Dynamic Spec Highlighting
 */

let activeRadarChart = null;
let activeBarChart = null;

document.addEventListener('DOMContentLoaded', () => {
  initComparisonPage();
});

function initComparisonPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const idsParam = urlParams.get('ids');

  let list = [];
  if (idsParam) {
    list = idsParam.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
    if (list.length > 0) {
      localStorage.setItem('mobivise_compare_list', JSON.stringify(list));
      updateCompareBadge();
    }
  } else {
    list = getCompareList();
  }

  renderComparisonView(list);
  initAddPhoneModal();
}

function renderComparisonView(idsList) {
  const phones = idsList.map(id => Mobivise.getPhoneById(id)).filter(Boolean).slice(0, 4);

  // Update URL without reload
  const newQuery = phones.length > 0 ? `?ids=${phones.map(p => p.id).join(',')}` : '';
  window.history.replaceState({}, '', window.location.pathname + newQuery);

  const emptyState = document.getElementById('compareEmptyState');
  const contentArea = document.getElementById('compareContentArea');
  const slotsBar = document.getElementById('compareSlotsBar');
  const chartsBox = document.getElementById('compareChartsBox');
  const tableWrap = document.getElementById('compareTableWrap');
  const highlightToggle = document.getElementById('toggleHighlightBest');

  if (phones.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    if (contentArea) contentArea.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (contentArea) contentArea.style.display = 'block';

  // 1. Render Top Slots Bar (up to 4 slots)
  let slotsHtml = '';
  for (let slot = 0; slot < 4; slot++) {
    if (phones[slot]) {
      const p = phones[slot];
      slotsHtml += `
        <div class="compare-card-slot filled">
          <button type="button" class="btn-remove-slot" data-id="${p.id}" title="Remove device">&times;</button>
          <img src="${p.image_url}" alt="${p.model_name}" style="height:90px; width:auto; object-fit:contain; margin-bottom:8px; border-radius:4px;">
          <div style="font-size:0.72rem; text-transform:uppercase; color:var(--forest-green); font-weight:700;">${p.brand_name}</div>
          <div style="font-weight:800; font-size:0.95rem; color:var(--text-primary); margin-bottom:4px;">${p.model_name}</div>
          <div style="font-weight:900; color:var(--forest-green); font-size:1.1rem;">${Mobivise.formatPrice(p.current_price)}</div>
        </div>
      `;
    } else {
      slotsHtml += `
        <div class="compare-card-slot">
          <button type="button" class="btn btn-outline btn-sm btn-open-add-slot" style="border-radius:50%; width:38px; height:38px; padding:0; font-size:1.2rem; margin-bottom:6px;">+</button>
          <div style="font-weight:700; font-size:0.85rem; color:var(--text-secondary);">Add Phone</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Slot ${slot + 1} of 4</div>
        </div>
      `;
    }
  }
  if (slotsBar) slotsBar.innerHTML = slotsHtml;

  // Attach slot remove listeners
  document.querySelectorAll('.btn-remove-slot').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'), 10);
      let updated = getCompareList().filter(x => x !== id);
      localStorage.setItem('mobivise_compare_list', JSON.stringify(updated));
      updateCompareBadge();
      renderComparisonView(updated);
    });
  });

  // Attach open modal listener on empty slots
  document.querySelectorAll('.btn-open-add-slot').forEach(btn => {
    btn.addEventListener('click', () => {
      openAddPhoneModal();
    });
  });

  // 2. Charts (only if >= 2 phones)
  if (phones.length >= 2) {
    if (chartsBox) chartsBox.style.display = 'block';
    renderComparisonCharts(phones);
  } else {
    if (chartsBox) chartsBox.style.display = 'none';
  }

  // 3. Compute Best Values
  const best = {};
  if (phones.length > 1) {
    best.price = Math.min(...phones.map(p => parseFloat(p.current_price) || 999999));
    best.ram = Math.max(...phones.map(p => parseInt(p.ram, 10) || 0));
    best.storage = Math.max(...phones.map(p => parseInt(p.storage, 10) || 0));
    best.refresh_rate = Math.max(...phones.map(p => parseInt(p.refresh_rate, 10) || 0));
    best.battery = Math.max(...phones.map(p => parseInt(p.battery_capacity, 10) || 0));
    best.charging_speed = Math.max(...phones.map(p => parseInt(p.charging_speed, 10) || 0));
    best.weight = Math.min(...phones.map(p => parseFloat(p.weight) || 999));
    best.antutu = Math.max(...phones.map(p => parseInt(p.antutu_score, 10) || 0));
    best.support = Math.max(...phones.map(p => parseInt(p.software_support, 10) || 0));
    best.vfm = Math.max(...phones.map(p => Mobivise.calculateVFM(p)));
  }

  // Helper for cell highlight class
  const isBest = (metric, val) => {
    if (phones.length < 2 || !best[metric]) return '';
    return best[metric] === val ? 'is-best compare-best-spec' : '';
  };

  // 4. Render Table
  let tableHtml = `
    <div style="overflow-x:auto;">
      <table class="compare-table">
        <thead>
          <tr>
            <th style="width:200px; background:var(--bg-subtle); color:var(--text-secondary); font-size:0.82rem; text-transform:uppercase;">Feature</th>
            ${phones.map(p => `
              <th style="text-align:center; min-width:180px; background:#FFFFFF;">
                <div style="font-size:0.95rem; font-weight:800; color:var(--text-primary);">${p.model_name}</div>
                <div style="color:var(--forest-green); font-weight:900; font-size:1.05rem; margin-top:2px;">${Mobivise.formatPrice(p.current_price)}</div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          <!-- General -->
          <tr class="spec-section-header"><td colspan="${phones.length + 1}">General</td></tr>
          <tr>
            <td class="spec-name-cell">Current Price</td>
            ${phones.map(p => `<td class="spec-val-cell ${isBest('price', parseFloat(p.current_price))}">${Mobivise.formatPrice(p.current_price)}</td>`).join('')}
          </tr>
          <tr>
            <td class="spec-name-cell">Value-for-Money (VFM)</td>
            ${phones.map(p => `<td class="spec-val-cell ${isBest('vfm', Mobivise.calculateVFM(p))}">${Mobivise.getVfmBadgeHtml(p)}</td>`).join('')}
          </tr>
          <tr>
            <td class="spec-name-cell">Base / MRP</td>
            ${phones.map(p => `<td class="spec-val-cell">${Mobivise.formatPrice(p.base_price)}</td>`).join('')}
          </tr>
          <tr>
            <td class="spec-name-cell">5G Ready</td>
            ${phones.map(p => `<td class="spec-val-cell">${p.is_5g ? '<span class="badge-pill badge-5g">5G Ready</span>' : '4G Only'}</td>`).join('')}
          </tr>
          <tr>
            <td class="spec-name-cell">Operating System</td>
            ${phones.map(p => `<td class="spec-val-cell">${p.operating_system || 'Android 14'}</td>`).join('')}
          </tr>

          <!-- Performance -->
          <tr class="spec-section-header"><td colspan="${phones.length + 1}">Performance &amp; Memory</td></tr>
          <tr>
            <td class="spec-name-cell">Processor</td>
            ${phones.map(p => `<td class="spec-val-cell">${p.processor_name || 'N/A'}</td>`).join('')}
          </tr>
          <tr>
            <td class="spec-name-cell">RAM Capacity</td>
            ${phones.map(p => `<td class="spec-val-cell ${isBest('ram', parseInt(p.ram, 10))}">${p.ram} GB</td>`).join('')}
          </tr>
          <tr>
            <td class="spec-name-cell">Storage</td>
            ${phones.map(p => `<td class="spec-val-cell ${isBest('storage', parseInt(p.storage, 10))}">${p.storage} GB</td>`).join('')}
          </tr>
          <tr>
            <td class="spec-name-cell">AnTuTu v10 Benchmark</td>
            ${phones.map(p => `<td class="spec-val-cell ${isBest('antutu', parseInt(p.antutu_score, 10))}">${p.antutu_score ? Number(p.antutu_score).toLocaleString('en-IN') : 'N/A'}</td>`).join('')}
          </tr>

          <!-- Display -->
          <tr class="spec-section-header"><td colspan="${phones.length + 1}">Display</td></tr>
          <tr>
            <td class="spec-name-cell">Display Size</td>
            ${phones.map(p => `<td class="spec-val-cell">${p.display_size}"</td>`).join('')}
          </tr>
          <tr>
            <td class="spec-name-cell">Panel Type</td>
            ${phones.map(p => `<td class="spec-val-cell">${p.display_type}</td>`).join('')}
          </tr>
          <tr>
            <td class="spec-name-cell">Refresh Rate</td>
            ${phones.map(p => `<td class="spec-val-cell ${isBest('refresh_rate', parseInt(p.refresh_rate, 10))}">${p.refresh_rate} Hz</td>`).join('')}
          </tr>
          <tr>
            <td class="spec-name-cell">Resolution</td>
            ${phones.map(p => `<td class="spec-val-cell">${p.resolution}</td>`).join('')}
          </tr>

          <!-- Camera -->
          <tr class="spec-section-header"><td colspan="${phones.length + 1}">Cameras</td></tr>
          <tr>
            <td class="spec-name-cell">Rear Camera System</td>
            ${phones.map(p => `<td class="spec-val-cell">${p.rear_camera}</td>`).join('')}
          </tr>
          <tr>
            <td class="spec-name-cell">Front Camera</td>
            ${phones.map(p => `<td class="spec-val-cell">${p.front_camera}</td>`).join('')}
          </tr>

          <!-- Battery & Build -->
          <tr class="spec-section-header"><td colspan="${phones.length + 1}">Battery &amp; Hardware</td></tr>
          <tr>
            <td class="spec-name-cell">Battery Capacity</td>
            ${phones.map(p => `<td class="spec-val-cell ${isBest('battery', parseInt(p.battery_capacity, 10))}">${p.battery_capacity} mAh</td>`).join('')}
          </tr>
          <tr>
            <td class="spec-name-cell">Charging Speed</td>
            ${phones.map(p => `<td class="spec-val-cell ${isBest('charging_speed', parseInt(p.charging_speed, 10))}">${p.charging_speed} W</td>`).join('')}
          </tr>
          <tr>
            <td class="spec-name-cell">Weight</td>
            ${phones.map(p => `<td class="spec-val-cell ${isBest('weight', parseFloat(p.weight))}">${p.weight} g</td>`).join('')}
          </tr>
          <tr>
            <td class="spec-name-cell">Guaranteed OS Upgrades</td>
            ${phones.map(p => `<td class="spec-val-cell ${isBest('support', parseInt(p.software_support, 10))}">${p.software_support} Years</td>`).join('')}
          </tr>

          <!-- Actions -->
          <tr>
            <td class="spec-name-cell">Specifications Page</td>
            ${phones.map(p => `
              <td class="spec-val-cell" style="text-align:center;">
                <a href="product-details.html?slug=${encodeURIComponent(p.slug)}" class="btn btn-secondary btn-sm">View Full Specs &rarr;</a>
              </td>
            `).join('')}
          </tr>
        </tbody>
      </table>
    </div>
  `;
  if (tableWrap) tableWrap.innerHTML = tableHtml;

  // Toggle Highlight Best
  if (highlightToggle) {
    const updateHighlights = () => {
      document.querySelectorAll('.spec-val-cell.is-best').forEach(cell => {
        cell.classList.toggle('compare-best-spec', highlightToggle.checked);
      });
    };
    highlightToggle.onchange = updateHighlights;
    updateHighlights();
  }

  // Initialize PDF and CSV Exports
  initExportFeatures(phones);
}

function initExportFeatures(phones) {
  const pdfBtn = document.getElementById('btnExportPdf');
  const csvBtn = document.getElementById('btnExportCsv');

  if (pdfBtn) {
    pdfBtn.onclick = () => {
      window.print();
    };
  }

  if (csvBtn) {
    csvBtn.onclick = () => {
      if (!phones || phones.length === 0) return;
      let csv = 'Specification,' + phones.map(p => `"${p.brand_name} ${p.model_name}"`).join(',') + '\n';
      const rows = [
        ['Price', p => '₹' + Math.round(p.current_price)],
        ['Value-for-Money (VFM)', p => Mobivise.calculateVFM(p) + ' / 100'],
        ['Popularity', p => '★ ' + (p.popularity || 85)],
        ['Processor', p => `"${p.processor_name || ''}"`],
        ['RAM Capacity', p => p.ram + ' GB'],
        ['Storage', p => p.storage + ' GB'],
        ['AnTuTu v10 Score', p => p.antutu_score || 0],
        ['Display Size', p => p.display_size + ' inches'],
        ['Panel Type', p => `"${p.display_type || ''}"`],
        ['Refresh Rate', p => p.refresh_rate + ' Hz'],
        ['Rear Camera', p => `"${p.rear_camera || ''}"`],
        ['Front Camera', p => `"${p.front_camera || ''}"`],
        ['Battery Capacity', p => p.battery_capacity + ' mAh'],
        ['Charging Speed', p => p.charging_speed + ' W'],
        ['5G Support', p => p.is_5g ? 'Yes' : 'No'],
        ['Weight', p => p.weight + ' g']
      ];

      rows.forEach(([label, fn]) => {
        csv += `"${label}",` + phones.map(fn).join(',') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mobivise-comparison-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (typeof showToast === 'function') {
        showToast('Comparison CSV downloaded successfully', 'success');
      }
    };
  }
}

function renderComparisonCharts(phones) {
  if (typeof Chart === 'undefined') return;

  const palette = [
    { border: '#7EAA31', bg: 'rgba(126, 170, 49, 0.2)' },
    { border: '#58AFCB', bg: 'rgba(88, 175, 203, 0.2)' },
    { border: '#53751F', bg: 'rgba(83, 117, 31, 0.2)' },
    { border: '#A9C34A', bg: 'rgba(169, 195, 74, 0.2)' }
  ];

  // 1. Radar Chart
  const radarCanvas = document.getElementById('specsRadarChart');
  if (radarCanvas) {
    if (activeRadarChart) activeRadarChart.destroy();
    activeRadarChart = new Chart(radarCanvas, {
      type: 'radar',
      data: {
        labels: ['Performance', 'Battery Capacity', 'Fast Charging', 'Refresh Rate', 'RAM'],
        datasets: phones.map((p, i) => ({
          label: p.model_name,
          data: [
            Math.min(100, Math.round(((p.antutu_score || 400000) / 2200000) * 100)),
            Math.min(100, Math.round(((p.battery_capacity || 4000) / 6000) * 100)),
            Math.min(100, Math.round(((p.charging_speed || 25) / 125) * 100)),
            Math.min(100, Math.round(((p.refresh_rate || 60) / 144) * 100)),
            Math.min(100, Math.round(((p.ram || 4) / 16) * 100))
          ],
          borderColor: palette[i % palette.length].border,
          backgroundColor: palette[i % palette.length].bg,
          borderWidth: 2,
          pointRadius: 3
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#101413', font: { size: 11, family: 'inherit' } } }
        },
        scales: {
          r: {
            grid: { color: 'rgba(16, 20, 19, 0.08)' },
            pointLabels: { color: '#6F7C78', font: { size: 10, weight: '600' } },
            ticks: { display: false, min: 0, max: 100 }
          }
        }
      }
    });
  }

  // 2. Bar Chart
  const barCanvas = document.getElementById('benchmarkBarChart');
  if (barCanvas) {
    if (activeBarChart) activeBarChart.destroy();
    activeBarChart = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: phones.map(p => p.model_name),
        datasets: [
          {
            label: 'AnTuTu Benchmark (k pts)',
            data: phones.map(p => Math.round((p.antutu_score || 300000) / 1000)),
            backgroundColor: '#7EAA31',
            borderRadius: 6
          },
          {
            label: 'Battery (mAh)',
            data: phones.map(p => p.battery_capacity || 4000),
            backgroundColor: '#58AFCB',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#101413' } } },
        scales: {
          x: { ticks: { color: '#6F7C78' }, grid: { display: false } },
          y: { ticks: { color: '#6F7C78' }, grid: { color: 'rgba(16, 20, 19, 0.06)' } }
        }
      }
    });
  }
}

function initAddPhoneModal() {
  const modal = document.getElementById('addPhoneModal');
  const searchInput = document.getElementById('compareModalSearch');
  const resultsBox = document.getElementById('compareModalResults');
  const closeBtn = document.getElementById('btnCloseAddModal');

  if (!modal || !searchInput || !resultsBox) return;

  window.openAddPhoneModal = () => {
    modal.style.display = 'flex';
    searchInput.value = '';
    renderModalList('');
    searchInput.focus();
  };

  const closeModal = () => {
    modal.style.display = 'none';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  searchInput.addEventListener('input', (e) => {
    renderModalList(e.target.value.trim());
  });

  function renderModalList(query) {
    const list = getCompareList();
    const all = Mobivise.getAllPhones();

    let matches = [];
    if (query.length >= 1) {
      matches = Mobivise.searchPhones(query, 12);
    } else {
      matches = all.slice(0, 8);
    }

    if (matches.length === 0) {
      resultsBox.innerHTML = '<div style="padding:20px;text-align:center;color:#6F7C78;">No matching phones found.</div>';
      return;
    }

    resultsBox.innerHTML = matches.map(p => {
      const isAlready = list.includes(p.id);
      return `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:1px solid #F1F6F0;gap:12px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <img src="${p.image_url}" alt="${p.model_name}" style="width:34px;height:42px;object-fit:contain;border-radius:4px;">
            <div>
              <div style="font-size:0.9rem;font-weight:800;color:#101413;">${p.brand_name} ${p.model_name}</div>
              <div style="font-size:0.75rem;color:#6F7C78;">${Mobivise.formatPrice(p.current_price)} &bull; ${p.processor_name || ''}</div>
            </div>
          </div>
          ${isAlready 
            ? '<span style="font-size:0.75rem;color:#7EAA31;font-weight:700;">Added</span>'
            : `<button type="button" class="btn btn-primary btn-sm btn-select-compare-slot" data-id="${p.id}">Select</button>`}
        </div>
      `;
    }).join('');

    resultsBox.querySelectorAll('.btn-select-compare-slot').forEach(b => {
      b.addEventListener('click', () => {
        const id = parseInt(b.getAttribute('data-id'), 10);
        let cur = getCompareList();
        if (cur.length < 4 && !cur.includes(id)) {
          cur.push(id);
          localStorage.setItem('mobivise_compare_list', JSON.stringify(cur));
          updateCompareBadge();
          closeModal();
          renderComparisonView(cur);
        }
      });
    });
  }
}
