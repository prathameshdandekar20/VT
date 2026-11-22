/**
 * MOBIVISE - Smartphone Explorer Dynamic Filter & Catalog Engine
 * Pure Vanilla JavaScript (assets/js/products.js)
 * 100% Client-Side, Zero PHP, Instant Real-Time Filtering
 */

var Mobivise = window.Mobivise || {
  getAllPhones: function() { return (window.MOBIVISE_DATA && window.MOBIVISE_DATA.smartphones) || []; },
  getAllBrands: function() { return (window.MOBIVISE_DATA && window.MOBIVISE_DATA.brands) || []; },
  formatPrice: function(p) { return '₹' + Math.round(Number(p) || 0).toLocaleString('en-IN'); }
};

document.addEventListener('DOMContentLoaded', function() {
  initProductsExplorer();
});

function initProductsExplorer() {
  var allPhones = (window.Mobivise && window.Mobivise.getAllPhones()) || (window.MOBIVISE_DATA && window.MOBIVISE_DATA.smartphones) || [];
  var allBrands = (window.Mobivise && window.Mobivise.getAllBrands()) || (window.MOBIVISE_DATA && window.MOBIVISE_DATA.brands) || [];

  // DOM Elements
  var searchInput = document.getElementById('filterSearch');
  var brandListContainer = document.getElementById('filterBrandsList');
  var minPriceInput = document.getElementById('filterMinPrice');
  var maxPriceInput = document.getElementById('filterMaxPrice');
  var ramContainer = document.getElementById('filterRamContainer');
  var is5gCheckbox = document.getElementById('filter5gOnly');
  var sortSelect = document.getElementById('sortSelect');
  var activeChipsContainer = document.getElementById('activeFilterChips');
  var resultsGrid = document.getElementById('smartphonesGrid');
  var resultsCountEl = document.getElementById('resultsCount');
  var paginationContainer = document.getElementById('paginationControls');
  var btnResetFilters = document.getElementById('btnResetFilters');

  // State from URL or defaults
  var params = new URLSearchParams(window.location.search);
  var state = {
    q: params.get('q') || '',
    brands: params.get('brand') ? params.get('brand').split(',').map(function(s) { return s.trim().toLowerCase(); }) : [],
    minPrice: params.get('min_price') ? parseFloat(params.get('min_price')) : null,
    maxPrice: params.get('max_price') ? parseFloat(params.get('max_price')) : null,
    ram: params.get('ram') ? params.get('ram').split(',').map(function(n) { return parseInt(n.trim(), 10); }) : [],
    is5g: params.get('is_5g') === '1',
    sort: params.get('sort') || 'popularity_desc',
    page: parseInt(params.get('page') || '1', 10),
    view: params.get('view') || 'grid',
    perPage: 12
  };

  // Populate brand checkboxes with live counts
  function renderBrandFilters() {
    if (!brandListContainer) return;
    var brandCounts = {};
    allPhones.forEach(function(p) {
      var bSlug = (p.brand_slug || '').toLowerCase();
      brandCounts[bSlug] = (brandCounts[bSlug] || 0) + 1;
    });

    var html = '';
    allBrands.forEach(function(b) {
      var slug = b.slug.toLowerCase();
      var count = brandCounts[slug] || 0;
      var isChecked = state.brands.indexOf(slug) !== -1;
      html += '<label class="custom-control">' +
        '<input type="checkbox" name="brand" value="' + slug + '" ' + (isChecked ? 'checked' : '') + '>' +
        '<span>' + b.brand_name + '</span>' +
        '<span style="font-size:0.75rem; color:var(--text-muted); margin-left:auto;">(' + count + ')</span>' +
      '</label>';
    });
    brandListContainer.innerHTML = html;
  }

  // Populate RAM filters
  function renderRamFilters() {
    if (!ramContainer) return;
    var rams = [4, 6, 8, 12, 16];
    var html = '';
    rams.forEach(function(r) {
      var isChecked = state.ram.indexOf(r) !== -1;
      html += '<button type="button" class="btn btn-outline btn-sm pill-select-btn ' + (isChecked ? 'active' : '') + '" data-ram="' + r + '" style="padding:4px 8px; font-size:0.78rem; ' + (isChecked ? 'background:var(--brand-green);color:#fff;border-color:var(--brand-green);' : '') + '">' +
        r + 'GB' +
      '</button>';
    });
    ramContainer.innerHTML = html;
  }

  // Sync inputs with current state
  function syncInputsWithState() {
    if (searchInput) searchInput.value = state.q;
    if (minPriceInput) minPriceInput.value = state.minPrice !== null ? state.minPrice : '';
    if (maxPriceInput) maxPriceInput.value = state.maxPrice !== null ? state.maxPrice : '';
    if (is5gCheckbox) is5gCheckbox.checked = state.is5g;
    if (sortSelect) sortSelect.value = state.sort;

    document.querySelectorAll('#filterBrandsList input[type="checkbox"]').forEach(function(cb) {
      cb.checked = state.brands.indexOf(cb.value.toLowerCase()) !== -1;
    });

    document.querySelectorAll('#filterRamContainer .pill-select-btn').forEach(function(btn) {
      var r = parseInt(btn.getAttribute('data-ram'), 10);
      var isAct = state.ram.indexOf(r) !== -1;
      btn.classList.toggle('active', isAct);
      btn.style.background = isAct ? 'var(--brand-green)' : '';
      btn.style.color = isAct ? '#fff' : '';
      btn.style.borderColor = isAct ? 'var(--brand-green)' : '';
    });
  }

  // Filter & Sort Logic
  function getFilteredPhones() {
    var list = allPhones.filter(function(p) {
      // 1. Text Search
      if (state.q.trim()) {
        var query = state.q.toLowerCase().trim();
        var brand = (p.brand_name || '').toLowerCase();
        var model = (p.model_name || '').toLowerCase();
        var proc = (p.processor_name || '').toLowerCase();
        var full = (brand + ' ' + model).toLowerCase();
        if (full.indexOf(query) === -1 && proc.indexOf(query) === -1) return false;
      }

      // 2. Brand
      if (state.brands.length > 0) {
        var bSlug = (p.brand_slug || '').toLowerCase();
        if (state.brands.indexOf(bSlug) === -1) return false;
      }

      // 3. Price
      var price = parseFloat(p.current_price) || 0;
      if (state.minPrice !== null && price < state.minPrice) return false;
      if (state.maxPrice !== null && price > state.maxPrice) return false;

      // 4. RAM
      if (state.ram.length > 0) {
        var pRam = parseInt(p.ram, 10);
        if (state.ram.indexOf(pRam) === -1) return false;
      }

      // 5. 5G Only
      if (state.is5g && !p.is_5g) return false;

      return true;
    });

    // Sorting
    list.sort(function(a, b) {
      var priceA = parseFloat(a.current_price) || 0;
      var priceB = parseFloat(b.current_price) || 0;
      var popA = parseInt(a.popularity, 10) || 0;
      var popB = parseInt(b.popularity, 10) || 0;
      var dateA = new Date(a.launch_date || '2020-01-01');
      var dateB = new Date(b.launch_date || '2020-01-01');

      switch (state.sort) {
        case 'vfm_desc':
          return Mobivise.calculateVFM(b) - Mobivise.calculateVFM(a);
        case 'price_asc':
          return priceA - priceB;
        case 'price_desc':
          return priceB - priceA;
        case 'launch_desc':
          return dateB - dateA;
        case 'name_asc':
          return (a.model_name || '').localeCompare(b.model_name || '');
        case 'popularity_desc':
        default:
          return popB - popA;
      }
    });

    return list;
  }

  // Render Active Filter Chips
  function renderActiveChips() {
    if (!activeChipsContainer) return;
    var chips = [];

    if (state.q.trim()) {
      chips.push({ label: '"' + state.q + '"', clear: function() { state.q = ''; } });
    }
    state.brands.forEach(function(bSlug) {
      var bObj = allBrands.find(function(b) { return b.slug.toLowerCase() === bSlug; });
      var name = bObj ? bObj.brand_name : bSlug;
      chips.push({
        label: name,
        clear: function() { state.brands = state.brands.filter(function(b) { return b !== bSlug; }); }
      });
    });
    if (state.minPrice !== null || state.maxPrice !== null) {
      var priceLabel = '';
      if (state.minPrice !== null && state.maxPrice !== null) {
        priceLabel = '₹' + (state.minPrice/1000).toFixed(0) + 'k – ₹' + (state.maxPrice/1000).toFixed(0) + 'k';
      } else if (state.minPrice !== null) {
        priceLabel = '> ₹' + (state.minPrice/1000).toFixed(0) + 'k';
      } else {
        priceLabel = '< ₹' + (state.maxPrice/1000).toFixed(0) + 'k';
      }
      chips.push({
        label: priceLabel,
        clear: function() { state.minPrice = null; state.maxPrice = null; }
      });
    }
    state.ram.forEach(function(r) {
      chips.push({
        label: r + 'GB RAM',
        clear: function() { state.ram = state.ram.filter(function(x) { return x !== r; }); }
      });
    });
    if (state.is5g) {
      chips.push({
        label: '5G Only',
        clear: function() { state.is5g = false; }
      });
    }

    if (chips.length === 0) {
      activeChipsContainer.innerHTML = '';
      activeChipsContainer.style.display = 'none';
      return;
    }

    activeChipsContainer.style.display = 'flex';
    var html = '';
    chips.forEach(function(c, idx) {
      html += '<span class="badge-brand" style="display:inline-flex; align-items:center; gap:6px; padding:4px 10px; font-size:0.78rem;">' +
        '<span>' + c.label + '</span>' +
        '<button type="button" class="btn-chip-remove" data-chip-idx="' + idx + '" style="background:none; border:none; color:inherit; font-weight:800; cursor:pointer; font-size:0.95rem; line-height:1;">&times;</button>' +
      '</span>';
    });
    html += '<button type="button" class="btn btn-outline btn-sm" id="btnClearAllChips" style="padding:2px 8px; font-size:0.75rem;">Clear all</button>';
    activeChipsContainer.innerHTML = html;

    activeChipsContainer.querySelectorAll('.btn-chip-remove').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(btn.getAttribute('data-chip-idx'), 10);
        if (chips[idx]) {
          chips[idx].clear();
          state.page = 1;
          applyFiltersAndUpdateUI();
        }
      });
    });

    var clearAllBtn = document.getElementById('btnClearAllChips');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', resetAllFilters);
    }
  }

  // Render Catalog & Pagination
  function renderCatalog(filteredPhones) {
    if (resultsCountEl) {
      resultsCountEl.textContent = 'Showing ' + filteredPhones.length + ' of ' + allPhones.length + ' smartphones';
    }

    if (!resultsGrid) return;

    if (filteredPhones.length === 0) {
      resultsGrid.innerHTML = '<div style="grid-column: 1 / -1; padding: 48px 24px; text-align: center; background: #FFFFFF; border-radius: 16px; border: 1px dashed var(--border-light); margin: 20px 0;">' +
        '<div style="font-size: 2.4rem; margin-bottom: 12px;">🔍</div>' +
        '<h3 style="font-size: 1.15rem; font-weight: 800; color: #101413; margin-bottom: 6px;">No Smartphones Found</h3>' +
        '<p style="font-size: 0.88rem; color: #6F7C78; max-width: 400px; margin: 0 auto 18px;">' +
          'We couldn\'t find any smartphones matching your selected combination of filters. Try broadening your budget or clearing brand selections.' +
        '</p>' +
        '<button type="button" class="btn btn-secondary btn-sm" id="btnEmptyReset">Reset All Filters</button>' +
      '</div>';
      var emptyBtn = document.getElementById('btnEmptyReset');
      if (emptyBtn) emptyBtn.addEventListener('click', resetAllFilters);
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    // Pagination slice
    var totalPages = Math.ceil(filteredPhones.length / state.perPage);
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;

    var startIdx = (state.page - 1) * state.perPage;
    var pagePhones = filteredPhones.slice(startIdx, startIdx + state.perPage);

    // Render Cards
    var compareList = getCompareList();
    var cardsHtml = '';
    pagePhones.forEach(function(phone) {
      var isComparing = compareList.indexOf(phone.id) !== -1;
      cardsHtml += '<div class="phone-card" data-id="' + phone.id + '">' +
        '<div class="phone-card-badges">' +
          '<span class="badge-brand">' + phone.brand_name + '</span>' +
          '<div style="display:flex; gap:6px; align-items:center;">' +
            Mobivise.getVfmBadgeHtml(phone) +
            (phone.is_5g ? '<span class="badge-5g">5G</span>' : '') +
            '<span style="font-size:0.70rem; font-weight:800; color:var(--text-muted);" title="Popularity Rating">★ ' + (phone.popularity || 85) + '</span>' +
          '</div>' +
        '</div>' +

        '<a href="product-details.html?slug=' + encodeURIComponent(phone.slug) + '" class="phone-card-thumb-wrap">' +
          '<img src="' + phone.image_url + '" alt="' + phone.brand_name + ' ' + phone.model_name + '" class="phone-card-thumb" loading="lazy">' +
        '</a>' +

        '<h3 class="phone-card-name">' +
          '<a href="product-details.html?slug=' + encodeURIComponent(phone.slug) + '">' + phone.model_name + '</a>' +
        '</h3>' +

        '<div class="phone-card-price-row">' +
          '<span class="phone-card-price">' + Mobivise.formatPrice(phone.current_price) + '</span>' +
          (parseFloat(phone.base_price) > parseFloat(phone.current_price) 
            ? '<span class="phone-card-base-price">' + Mobivise.formatPrice(phone.base_price) + '</span>' 
            : '') +
        '</div>' +

        '<div class="phone-specs-list">' +
          '<div class="spec-pill" title="Processor">' +
            '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>' +
            '<span>' + phone.ram + 'GB RAM</span>' +
          '</div>' +
          '<div class="spec-pill" title="Storage">' +
            '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8z"/></svg>' +
            '<span>' + phone.storage + 'GB ROM</span>' +
          '</div>' +
          '<div class="spec-pill" title="Camera">' +
            '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="13" r="4"/><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/></svg>' +
            '<span>' + (phone.rear_camera_mp || 50) + 'MP</span>' +
          '</div>' +
          '<div class="spec-pill" title="Battery">' +
            '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="6" width="18" height="12" rx="2"/><line x1="23" y1="11" x2="23" y2="13"/></svg>' +
            '<span>' + (phone.battery_capacity || 5000) + 'mAh</span>' +
          '</div>' +
        '</div>' +

        '<div class="phone-card-actions">' +
          '<a href="product-details.html?slug=' + encodeURIComponent(phone.slug) + '" class="btn btn-secondary btn-sm" style="flex:1; text-align:center;">' +
            'Details' +
          '</a>' +
          '<button type="button" class="btn-compare-toggle ' + (isComparing ? 'active' : '') + '" data-id="' + phone.id + '" data-name="' + phone.model_name + '">' +
            '<span class="compare-btn-text">' + (isComparing ? 'In Compare' : 'Compare') + '</span>' +
          '</button>' +
        '</div>' +
      '</div>';
    });
    resultsGrid.innerHTML = cardsHtml;

    // Render Pagination Controls
    if (paginationContainer) {
      if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
      } else {
        var pagHtml = '<div class="pagination">';
        pagHtml += '<button type="button" class="pagination-item" ' + (state.page === 1 ? 'disabled' : '') + ' data-page="' + (state.page - 1) + '" style="' + (state.page === 1 ? 'opacity:0.4;pointer-events:none;' : '') + '">' +
          '&larr;' +
        '</button>';

        for (var p = 1; p <= totalPages; p++) {
          pagHtml += '<button type="button" class="pagination-item ' + (p === state.page ? 'active' : '') + '" data-page="' + p + '">' +
            p +
          '</button>';
        }

        pagHtml += '<button type="button" class="pagination-item" ' + (state.page === totalPages ? 'disabled' : '') + ' data-page="' + (state.page + 1) + '" style="' + (state.page === totalPages ? 'opacity:0.4;pointer-events:none;' : '') + '">' +
          '&rarr;' +
        '</button>';
        pagHtml += '</div>';
        paginationContainer.innerHTML = pagHtml;

        paginationContainer.querySelectorAll('.pagination-item').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var pageNum = parseInt(btn.getAttribute('data-page'), 10);
            if (!isNaN(pageNum) && pageNum !== state.page) {
              state.page = pageNum;
              applyFiltersAndUpdateUI();
              var el = document.querySelector('.explorer-layout');
              if (el) window.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' });
            }
          });
        });
      }
    }
  }

  // Update URL parameters without reloading page
  function updateUrlParams() {
    var qp = new URLSearchParams();
    if (state.q.trim()) qp.set('q', state.q.trim());
    if (state.brands.length) qp.set('brand', state.brands.join(','));
    if (state.minPrice !== null) qp.set('min_price', state.minPrice);
    if (state.maxPrice !== null) qp.set('max_price', state.maxPrice);
    if (state.ram.length) qp.set('ram', state.ram.join(','));
    if (state.is5g) qp.set('is_5g', '1');
    if (state.sort !== 'popularity_desc') qp.set('sort', state.sort);
    if (state.page > 1) qp.set('page', state.page);

    var newQuery = qp.toString();
    var newUrl = window.location.pathname + (newQuery ? '?' + newQuery : '');
    window.history.replaceState({}, '', newUrl);
  }

  // View Switcher & Analytics Matrix
  var currentView = 'grid';
  var pricePerfChartInstance = null;
  var btnViewGrid = document.getElementById('btnViewGrid');
  var btnViewMatrix = document.getElementById('btnViewMatrix');
  var matrixContainer = document.getElementById('analyticsMatrixContainer');

  function updateViewMode(mode) {
    currentView = mode;
    if (btnViewGrid) btnViewGrid.classList.toggle('active', mode === 'grid');
    if (btnViewMatrix) btnViewMatrix.classList.toggle('active', mode === 'matrix');

    if (mode === 'grid') {
      if (resultsGrid) resultsGrid.style.display = 'grid';
      if (paginationContainer) paginationContainer.style.display = 'block';
      if (matrixContainer) matrixContainer.style.display = 'none';
    } else {
      if (resultsGrid) resultsGrid.style.display = 'none';
      if (paginationContainer) paginationContainer.style.display = 'none';
      if (matrixContainer) matrixContainer.style.display = 'block';
      renderPricePerfChart(getFilteredPhones());
    }
  }

  if (btnViewGrid) {
    btnViewGrid.addEventListener('click', function() { updateViewMode('grid'); });
  }
  if (btnViewMatrix) {
    btnViewMatrix.addEventListener('click', function() { updateViewMode('matrix'); });
  }

  function renderPricePerfChart(phones) {
    var canvas = document.getElementById('pricePerfChart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (pricePerfChartInstance) {
      pricePerfChartInstance.destroy();
      pricePerfChartInstance = null;
    }

    var dataPoints = phones.map(function(p) {
      var price = parseFloat(p.current_price) || 0;
      var antutu = parseInt(p.antutu_score, 10) || 500000;
      var battery = parseInt(p.battery_capacity, 10) || 5000;
      var vfm = Mobivise.calculateVFM(p);

      var radius = Math.round(7 + ((battery - 3500) / 2500) * 7);
      if (radius < 7) radius = 7;
      if (radius > 16) radius = 16;

      var color = vfm >= 90 ? 'rgba(26, 127, 55, 0.75)' : (vfm >= 75 ? 'rgba(126, 170, 49, 0.75)' : 'rgba(74, 107, 130, 0.65)');
      var border = vfm >= 90 ? '#1A7F37' : (vfm >= 75 ? '#53751F' : '#334155');

      return {
        x: price,
        y: antutu,
        r: radius,
        phone: p,
        vfm: vfm,
        backgroundColor: color,
        borderColor: border
      };
    });

    var ctx = canvas.getContext('2d');
    pricePerfChartInstance = new Chart(ctx, {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'Smartphones',
          data: dataPoints,
          backgroundColor: dataPoints.map(function(d) { return d.backgroundColor; }),
          borderColor: dataPoints.map(function(d) { return d.borderColor; }),
          borderWidth: 1.5,
          hoverBorderWidth: 2.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(16, 20, 19, 0.92)',
            titleFont: { size: 13, weight: 'bold' },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              title: function(items) {
                var raw = items[0].raw;
                return raw.phone.brand_name + ' ' + raw.phone.model_name;
              },
              label: function(item) {
                var raw = item.raw;
                var p = raw.phone;
                return [
                  'Price: ' + Mobivise.formatPrice(p.current_price),
                  'AnTuTu v10: ' + (p.antutu_score || 0).toLocaleString('en-IN') + ' pts',
                  'Battery: ' + (p.battery_capacity || 0) + ' mAh',
                  'VFM Index: ' + raw.vfm + ' / 100 (' + (raw.vfm >= 90 ? 'Top Value' : (raw.vfm >= 75 ? 'Great Value' : 'Flagship Tier')) + ')'
                ];
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Current Retail Price (₹ INR)',
              font: { weight: 'bold', size: 12 },
              color: '#556560'
            },
            ticks: {
              callback: function(val) {
                return '₹' + (val / 1000) + 'k';
              },
              color: '#6F7C78'
            },
            grid: { color: 'rgba(0,0,0,0.05)' }
          },
          y: {
            title: {
              display: true,
              text: 'AnTuTu Benchmark Score (Performance)',
              font: { weight: 'bold', size: 12 },
              color: '#556560'
            },
            ticks: {
              callback: function(val) {
                return (val / 1000) + 'k';
              },
              color: '#6F7C78'
            },
            grid: { color: 'rgba(0,0,0,0.05)' }
          }
        },
        onClick: function(evt, elements) {
          if (elements.length > 0) {
            var idx = elements[0].index;
            var pt = dataPoints[idx];
            if (pt && pt.phone && pt.phone.slug) {
              window.location.href = 'product-details.html?slug=' + encodeURIComponent(pt.phone.slug);
            }
          }
        }
      }
    });
  }

  function applyFiltersAndUpdateUI() {
    updateUrlParams();
    renderActiveChips();
    var filtered = getFilteredPhones();
    renderCatalog(filtered);
    if (currentView === 'matrix') {
      renderPricePerfChart(filtered);
    }
  }

  function resetAllFilters() {
    state.q = '';
    state.brands = [];
    state.minPrice = null;
    state.maxPrice = null;
    state.ram = [];
    state.is5g = false;
    state.sort = 'popularity_desc';
    state.page = 1;

    syncInputsWithState();
    applyFiltersAndUpdateUI();
  }

  // Event Listeners for Sidebar Controls
  var searchTimer = null;
  if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        clearTimeout(searchTimer);
        state.q = searchInput.value;
        state.page = 1;
        applyFiltersAndUpdateUI();
      }
    });

    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function() {
        state.q = searchInput.value;
        state.page = 1;
        applyFiltersAndUpdateUI();
      }, 200);
    });
  }

  if (brandListContainer) {
    brandListContainer.addEventListener('change', function() {
      var checkboxes = brandListContainer.querySelectorAll('input[type="checkbox"]:checked');
      state.brands = Array.from(checkboxes).map(function(cb) { return cb.value.toLowerCase(); });
      state.page = 1;
      applyFiltersAndUpdateUI();
    });
  }

  if (minPriceInput) {
    minPriceInput.addEventListener('change', function() {
      var val = parseFloat(minPriceInput.value);
      state.minPrice = !isNaN(val) ? val : null;
      state.page = 1;
      applyFiltersAndUpdateUI();
    });
  }

  if (maxPriceInput) {
    maxPriceInput.addEventListener('change', function() {
      var val = parseFloat(maxPriceInput.value);
      state.maxPrice = !isNaN(val) ? val : null;
      state.page = 1;
      applyFiltersAndUpdateUI();
    });
  }

  if (ramContainer) {
    ramContainer.addEventListener('click', function(e) {
      var btn = e.target.closest('.pill-select-btn');
      if (!btn) return;
      var r = parseInt(btn.getAttribute('data-ram'), 10);
      var idx = state.ram.indexOf(r);
      if (idx !== -1) {
        state.ram.splice(idx, 1);
      } else {
        state.ram.push(r);
      }
      state.page = 1;
      applyFiltersAndUpdateUI();
    });
  }

  if (is5gCheckbox) {
    is5gCheckbox.addEventListener('change', function() {
      state.is5g = is5gCheckbox.checked;
      state.page = 1;
      applyFiltersAndUpdateUI();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', function() {
      state.sort = sortSelect.value;
      state.page = 1;
      applyFiltersAndUpdateUI();
    });
  }

  if (btnResetFilters) {
    btnResetFilters.addEventListener('click', function(e) {
      e.preventDefault();
      resetAllFilters();
    });
  }

  document.querySelectorAll('.filter-budget-quick-pill').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var min = btn.getAttribute('data-min');
      var max = btn.getAttribute('data-max');
      state.minPrice = min ? parseFloat(min) : null;
      state.maxPrice = max ? parseFloat(max) : null;
      syncInputsWithState();
      state.page = 1;
      applyFiltersAndUpdateUI();
    });
  });

  window.addEventListener('mobivise:compareUpdated', function() {
    updateCompareButtonsUI();
  });

  // Initial Boot
  renderBrandFilters();
  renderRamFilters();
  syncInputsWithState();
  applyFiltersAndUpdateUI();
  if (state.view === 'matrix') {
    updateViewMode('matrix');
  }
}
