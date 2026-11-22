/**
 * MOBIVISE - Intelligent Smartphone Purchasing Guide
 * Client-Side Application Engine (assets/js/main.js)
 * Vanilla JavaScript (ES6+) - 100% Framework & PHP-Free
 */

var Mobivise = window.Mobivise = {
  // Access static dataset safely
  getData: function() {
    return window.MOBIVISE_DATA || { smartphones: [], brands: [] };
  },

  getAllPhones: function() {
    if (window.MOBIVISE_DATA && Array.isArray(window.MOBIVISE_DATA.smartphones)) {
      return window.MOBIVISE_DATA.smartphones;
    }
    return [];
  },

  getAllBrands: function() {
    if (window.MOBIVISE_DATA && Array.isArray(window.MOBIVISE_DATA.brands)) {
      return window.MOBIVISE_DATA.brands;
    }
    return [];
  },

  getPhoneById: function(id) {
    var numId = parseInt(id, 10);
    return this.getAllPhones().find(function(p) { return p.id === numId; }) || null;
  },

  getPhoneBySlug: function(slug) {
    if (!slug) return null;
    var clean = String(slug).toLowerCase().trim();
    return this.getAllPhones().find(function(p) { return (p.slug || '').toLowerCase() === clean; }) || null;
  },

  formatPrice: function(price) {
    var num = typeof price === 'number' ? price : parseFloat(price);
    if (isNaN(num)) return '₹0';
    return '₹' + Math.round(num).toLocaleString('en-IN');
  },

  searchPhones: function(query, limit) {
    if (!limit) limit = 8;
    if (!query || query.trim().length < 2) return [];
    var q = query.toLowerCase().trim();
    var phones = this.getAllPhones();

    var matches = phones.filter(function(p) {
      var brand = (p.brand_name || '').toLowerCase();
      var model = (p.model_name || '').toLowerCase();
      var proc = (p.processor_name || '').toLowerCase();
      var full = (brand + ' ' + model).toLowerCase();
      return full.indexOf(q) !== -1 || model.indexOf(q) !== -1 || brand.indexOf(q) !== -1 || proc.indexOf(q) !== -1;
    });

    matches.sort(function(a, b) {
      var aName = (a.brand_name + ' ' + a.model_name).toLowerCase();
      var bName = (b.brand_name + ' ' + b.model_name).toLowerCase();
      if (aName.indexOf(q) === 0 && bName.indexOf(q) !== 0) return -1;
      if (aName.indexOf(q) !== 0 && bName.indexOf(q) === 0) return 1;
      return (b.popularity || 0) - (a.popularity || 0);
    });

    return matches.slice(0, limit);
  },

  // Econometric Value-for-Money (VFM) Scoring Engine
  calculateVFM: function(p) {
    if (typeof p.vfm_score === 'number') return p.vfm_score;
    var price = parseFloat(p.current_price) || 10000;
    var antutu = parseInt(p.antutu_score, 10) || 500000;
    var battery = parseInt(p.battery_capacity, 10) || 4500;
    var ram = parseInt(p.ram, 10) || 8;
    var camera = parseInt(p.rear_camera_mp, 10) || 50;

    var normAntutu = Math.min(1, Math.max(0, (antutu - 300000) / (2200000 - 300000)));
    var normBattery = Math.min(1, Math.max(0, (battery - 3000) / (6000 - 3000)));
    var normRam = Math.min(1, Math.max(0, (ram - 4) / (16 - 4)));
    var normCamera = Math.min(1, Math.max(0, (camera - 48) / (200 - 48)));

    var hardwareScore = (0.45 * normAntutu) + (0.25 * normBattery) + (0.15 * normRam) + (0.15 * normCamera);
    var costFactor = Math.sqrt(price / 10000);
    var rawRatio = (hardwareScore / costFactor) * 100;

    var score = Math.round(50 + Math.min(1, Math.max(0, (rawRatio - 17) / (49 - 17))) * 48);
    p.vfm_score = score;
    return score;
  },

  getVfmBadgeHtml: function(p) {
    var score = this.calculateVFM(p);
    var cls = score >= 90 ? 'vfm-top' : (score >= 75 ? 'vfm-good' : 'vfm-prem');
    var label = score >= 90 ? 'Top Value-for-Money' : (score >= 75 ? 'Great Value' : 'Premium Flagship');
    return '<span class="badge-vfm ' + cls + '" title="' + label + ' (VFM Score: ' + score + '/100)">' +
      '<span>VFM ' + score + '</span>' +
    '</span>';
  }
};

/* ========================================================
   Comparison Storage Manager (localStorage)
   ======================================================== */
var COMPARE_KEY = 'mobivise_compare_list';
var MAX_COMPARE = 4;

function getCompareList() {
  try {
    var data = localStorage.getItem(COMPARE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveCompareList(list) {
  try {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(list));
    updateCompareBadge();
    updateCompareButtonsUI();
    window.dispatchEvent(new CustomEvent('mobivise:compareUpdated', { detail: { list: list } }));
  } catch (e) {
    console.error('Failed to save compare list:', e);
  }
}

function toggleCompare(phoneId, phoneName) {
  if (!phoneName) phoneName = 'Device';
  var id = parseInt(phoneId, 10);
  if (isNaN(id)) return false;

  var list = getCompareList();
  var index = list.indexOf(id);

  if (index > -1) {
    list.splice(index, 1);
    saveCompareList(list);
    showToast('Removed ' + phoneName + ' from comparison', 'info');
    return false;
  } else {
    if (list.length >= MAX_COMPARE) {
      showToast('Comparison limit reached (Max ' + MAX_COMPARE + ' smartphones)', 'warning');
      return false;
    }
    list.push(id);
    saveCompareList(list);
    showToast('Added ' + phoneName + ' to comparison (' + list.length + '/' + MAX_COMPARE + ')', 'success');
    return true;
  }
}

function updateCompareBadge() {
  var badges = document.querySelectorAll('.compare-count-badge');
  var list = getCompareList();
  badges.forEach(function(b) {
    b.textContent = list.length;
    b.style.display = list.length > 0 ? 'inline-flex' : 'none';
  });

  var compareLinks = document.querySelectorAll('.compare-nav-link');
  compareLinks.forEach(function(link) {
    link.href = list.length > 0 ? 'compare.html?ids=' + list.join(',') : 'compare.html';
  });
}

function updateCompareButtonsUI() {
  var list = getCompareList();
  document.querySelectorAll('.btn-compare-toggle').forEach(function(btn) {
    var id = parseInt(btn.getAttribute('data-id'), 10);
    var isSelected = list.indexOf(id) !== -1;
    btn.classList.toggle('active', isSelected);
    var textNode = btn.querySelector('.compare-btn-text');
    if (textNode) {
      textNode.textContent = isSelected ? 'In Compare' : 'Compare';
    }
  });
}

function initComparisonButtons() {
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.btn-compare-toggle');
    if (!btn) return;
    e.preventDefault();
    var id = btn.getAttribute('data-id');
    var name = btn.getAttribute('data-name') || 'Device';
    toggleCompare(id, name);
  });

  updateCompareButtonsUI();
}

/* ========================================================
   Mobile Navigation Toggle
   ======================================================== */
function initMobileNav() {
  var toggleBtn = document.querySelector('.btn-mobile-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', function() {
      navLinks.classList.toggle('open');
      var isOpen = navLinks.classList.contains('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    document.addEventListener('click', function(e) {
      if (!toggleBtn.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }
}

/* ========================================================
   Search Modal (In-Memory Instant Live Search)
   ======================================================== */
function initSearchModal() {
  var openBtn = document.getElementById('btnOpenSearchModal');
  var modal = document.getElementById('globalSearchModal');
  var closeBtn = document.getElementById('btnCloseSearchModal');
  var input = document.getElementById('modalSearchInput');
  var results = document.getElementById('modalSearchSuggest');

  if (!modal || !input || !results) return;

  var openSearch = function() {
    modal.style.display = 'flex';
    input.value = '';
    results.innerHTML = '<div style="padding: 24px; text-align: center; color: #6F7C78; font-size: 0.9rem;">Type smartphone model, brand, or processor to search...</div>';
    setTimeout(function() { input.focus(); }, 50);
  };

  var closeSearch = function() {
    modal.style.display = 'none';
  };

  if (openBtn) openBtn.addEventListener('click', openSearch);
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);

  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeSearch();
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeSearch();
    }
  });

  // Handle Enter key in search input
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var q = input.value.trim();
      if (q.length > 0) {
        window.location.href = 'products.html?q=' + encodeURIComponent(q);
      }
    }
  });

  // Handle Input typing for live autocomplete
  input.addEventListener('input', function(e) {
    var q = e.target.value.trim();

    if (q.length < 2) {
      results.innerHTML = '<div style="padding: 20px; text-align: center; color: #6F7C78; font-size: 0.9rem;">Type at least 2 characters...</div>';
      return;
    }

    var matches = Mobivise.searchPhones(q, 8);

    if (matches && matches.length > 0) {
      var html = '<div style="padding: 6px 0;">';
      matches.forEach(function(item) {
        html += '<a href="product-details.html?slug=' + encodeURIComponent(item.slug) + '" class="search-suggest-item" style="display:flex;align-items:center;gap:14px;padding:12px 18px;border-bottom:1px solid #F1F6F0;text-decoration:none;transition:background 0.15s ease;">' +
          '<img src="' + item.image_url + '" alt="' + item.model_name + '" style="width:38px;height:48px;object-fit:contain;flex-shrink:0;border-radius:4px;background:#FAFAFA;">' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="font-weight:800;font-size:0.92rem;color:#101413;">' + item.brand_name + ' ' + item.model_name + '</div>' +
            '<div style="font-size:0.78rem;color:#6F7C78;">' + (item.processor_name || '') + ' &bull; ' + (item.ram || '') + 'GB RAM &bull; ' + (item.storage || '') + 'GB</div>' +
          '</div>' +
          '<div style="font-weight:800;color:#53751F;font-size:0.92rem;">' + Mobivise.formatPrice(item.current_price) + '</div>' +
        '</a>';
      });
      html += '</div>';
      html += '<div style="padding:10px 18px; background:#F8FAF8; border-top:1px solid #E1E8E5; text-align:center;">' +
        '<a href="products.html?q=' + encodeURIComponent(q) + '" style="font-weight:700; color:#53751F; font-size:0.85rem; text-decoration:none;">' +
          'View all results for &ldquo;' + q + '&rdquo; in Explorer &rarr;' +
        '</a>' +
      '</div>';
      results.innerHTML = html;
    } else {
      results.innerHTML = '<div style="padding: 24px; text-align: center; color: #6F7C78; font-size: 0.9rem;">' +
        '<div style="font-size: 1.5rem; margin-bottom: 6px;">🔍</div>' +
        'No smartphones found matching &ldquo;' + q + '&rdquo;' +
        '<div style="margin-top: 10px;">' +
          '<a href="products.html" style="font-size: 0.82rem; color: #53751F; font-weight: 700; text-decoration: underline;">Browse full catalogue</a>' +
        '</div>' +
      '</div>';
    }
  });
}

/* ========================================================
   Homepage All-Smartphones Dynamic Section
   ======================================================== */
function initHomepageCatalog() {
  var grid = document.getElementById('homeSmartphonesGrid');
  var tabsContainer = document.getElementById('homeBrandTabs');
  var countEl = document.getElementById('homeTotalCount');
  var homeSearch = document.getElementById('homeSearchInput');
  if (!grid) return;

  var allPhones = Mobivise.getAllPhones();
  var allBrands = Mobivise.getAllBrands();
  var activeBrand = 'all';
  var searchQuery = '';

  if (countEl) countEl.textContent = allPhones.length;

  // Search input on homepage
  if (homeSearch) {
    var homeSearchTimer = null;
    homeSearch.addEventListener('input', function() {
      clearTimeout(homeSearchTimer);
      homeSearchTimer = setTimeout(function() {
        searchQuery = (homeSearch.value || '').trim().toLowerCase();
        renderHomeGrid();
      }, 200);
    });

    homeSearch.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var q = (homeSearch.value || '').trim();
        if (q.length > 0) {
          window.location.href = 'products.html?q=' + encodeURIComponent(q);
        }
      }
    });
  }

  // Render Brand Tabs
  if (tabsContainer) {
    var tabsHtml = '<button type="button" class="btn btn-primary btn-sm home-brand-tab active" data-brand="all" style="border-radius:999px; padding:6px 14px; font-weight:700; font-size:0.8rem; white-space:nowrap;">All (' + allPhones.length + ')</button>';
    allBrands.forEach(function(b) {
      var bCount = allPhones.filter(function(p) { return (p.brand_slug || '').toLowerCase() === b.slug.toLowerCase(); }).length;
      if (bCount > 0) {
        tabsHtml += '<button type="button" class="btn btn-secondary btn-sm home-brand-tab" data-brand="' + b.slug + '" style="border-radius:999px; padding:6px 14px; font-weight:700; font-size:0.8rem; white-space:nowrap;">' + b.brand_name + ' (' + bCount + ')</button>';
      }
    });
    tabsContainer.innerHTML = tabsHtml;

    tabsContainer.addEventListener('click', function(e) {
      var tab = e.target.closest('.home-brand-tab');
      if (!tab) return;
      activeBrand = tab.getAttribute('data-brand');
      tabsContainer.querySelectorAll('.home-brand-tab').forEach(function(t) {
        var isThis = t === tab;
        t.classList.toggle('btn-primary', isThis);
        t.classList.toggle('btn-secondary', !isThis);
      });
      renderHomeGrid();
    });
  }

  function renderHomeGrid() {
    var list = allPhones;
    if (activeBrand !== 'all') {
      list = list.filter(function(p) {
        return (p.brand_slug || '').toLowerCase() === activeBrand.toLowerCase();
      });
    }

    if (searchQuery) {
      list = list.filter(function(p) {
        var brand = (p.brand_name || '').toLowerCase();
        var model = (p.model_name || '').toLowerCase();
        var proc = (p.processor_name || '').toLowerCase();
        var full = (brand + ' ' + model).toLowerCase();
        return full.indexOf(searchQuery) !== -1 || model.indexOf(searchQuery) !== -1 || brand.indexOf(searchQuery) !== -1 || proc.indexOf(searchQuery) !== -1;
      });
    }

    if (countEl) countEl.textContent = list.length;

    var compareList = getCompareList();
    var html = '';

    if (list.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1; padding:36px; text-align:center; background:#FFF; border-radius:16px; border:1px dashed #D9E4DF; color:#6F7C78;">' +
        '<div style="font-size:2rem; margin-bottom:8px;">🔍</div>' +
        '<div style="font-weight:700; font-size:1.05rem; color:#101413;">No smartphones found matching &ldquo;' + searchQuery + '&rdquo;</div>' +
        '<div style="font-size:0.85rem; margin-top:4px;">Try searching a different model, brand, or processor.</div>' +
      '</div>';
      return;
    }
    list.forEach(function(phone) {
      var isComparing = compareList.indexOf(phone.id) !== -1;
      html += '<div class="phone-card" data-id="' + phone.id + '">' +
        '<div class="phone-card-badges">' +
          '<span class="badge-brand">' + phone.brand_name + '</span>' +
          '<div style="display:flex; gap:6px; align-items:center;">' +
            Mobivise.getVfmBadgeHtml(phone) +
            (phone.is_5g ? '<span class="badge-5g">5G</span>' : '') +
            '<span style="font-size:0.70rem; font-weight:800; color:var(--text-muted);">★ ' + (phone.popularity || 85) + '</span>' +
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
          '<div class="spec-pill" title="RAM">' +
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
    grid.innerHTML = html;
  }

  renderHomeGrid();
}

/* ========================================================
   Toast Notification System
   ======================================================== */
function showToast(message, type) {
  if (!type) type = 'info';
  var container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
  }

  var toast = document.createElement('div');
  toast.style.cssText = 'background:#101413;color:#FFFFFF;padding:10px 18px;border-radius:9999px;font-size:0.84rem;font-weight:600;display:inline-flex;align-items:center;gap:8px;box-shadow:0 8px 24px rgba(0,0,0,0.15);';
  
  var dotColor = '#7EAA31';
  if (type === 'warning') dotColor = '#f59e0b';
  if (type === 'error') dotColor = '#ef4444';

  toast.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:' + dotColor + ';"></span><span>' + message + '</span>';
  container.appendChild(toast);

  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(function() { toast.remove(); }, 300);
  }, 2800);
}

// Global initialization
document.addEventListener('DOMContentLoaded', function() {
  initMobileNav();
  initSearchModal();
  initComparisonButtons();
  updateCompareBadge();
  initHomepageCatalog();
});
