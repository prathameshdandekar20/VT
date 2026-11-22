var Mobivise = window.Mobivise;
/**
 * MOBIVISE - Brands Explorer Engine
 * Pure Vanilla JavaScript (assets/js/brands.js)
 * 100% Client-Side, Zero PHP
 */

document.addEventListener('DOMContentLoaded', () => {
  initBrandsExplorer();
});

function initBrandsExplorer() {
  const urlParams = new URLSearchParams(window.location.search);
  const brandSlug = urlParams.get('brand');

  const allBrands = Mobivise.getAllBrands();
  const allPhones = Mobivise.getAllPhones();

  const headerContainer = document.getElementById('brandsHeaderContainer');
  const allBrandsGrid = document.getElementById('allBrandsGrid');
  const brandPhonesSection = document.getElementById('brandPhonesSection');
  const brandPhonesGrid = document.getElementById('brandPhonesGrid');

  if (brandSlug) {
    // Show single brand catalog
    const brand = allBrands.find(b => b.slug.toLowerCase() === brandSlug.toLowerCase());

    if (!brand) {
      window.location.replace('brands.html');
      return;
    }

    document.title = `${brand.brand_name} Smartphones — Mobivise`;

    // Filter phones for this brand
    const phones = allPhones.filter(p => (p.brand_slug || '').toLowerCase() === brand.slug.toLowerCase());
    phones.sort((a, b) => (parseFloat(b.current_price) || 0) - (parseFloat(a.current_price) || 0));

    // Render Brand Header
    if (headerContainer) {
      headerContainer.innerHTML = `
        <div style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:8px;">
          <a href="brands.html" style="color:var(--forest-green); font-weight:700;">&larr; All Brands</a>
        </div>
        <h1 class="page-header-title" style="font-size:2rem; margin-bottom:6px;">${brand.brand_name} Smartphones</h1>
        <p class="page-header-desc" style="margin:0 0 12px; font-size:0.95rem;">${brand.description}</p>
        ${brand.website ? `<a href="${brand.website}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Official Website &nearr;</a>` : ''}
      `;
    }

    if (allBrandsGrid) allBrandsGrid.style.display = 'none';
    if (brandPhonesSection) brandPhonesSection.style.display = 'block';

    const compareList = getCompareList();
    if (brandPhonesGrid) {
      if (phones.length === 0) {
        brandPhonesGrid.innerHTML = `
          <div style="grid-column:1/-1; background:#FFFFFF; border:1px solid var(--border-light); border-radius:16px; padding:40px 20px; text-align:center;">
            <p style="color:var(--text-secondary);">No smartphones currently found for this brand.</p>
            <a href="brands.html" class="btn btn-outline btn-sm" style="margin-top:10px;">Back to Brands</a>
          </div>
        `;
      } else {
        brandPhonesGrid.innerHTML = phones.map(p => {
          const isComparing = compareList.includes(p.id);
          return `
            <div class="product-card" data-id="${p.id}">
              <div class="product-card-top">
                <span class="product-brand-tag">${p.brand_name}</span>
                ${p.is_5g ? '<span class="badge-pill badge-5g">5G</span>' : ''}
              </div>
              <a href="product-details.html?slug=${encodeURIComponent(p.slug)}" class="product-img-wrap">
                <img src="${p.image_url}" alt="${p.brand_name} ${p.model_name}" class="product-img" loading="lazy">
              </a>
              <div class="product-details">
                <h3 class="product-title">
                  <a href="product-details.html?slug=${encodeURIComponent(p.slug)}">${p.model_name}</a>
                </h3>
                <div class="product-price-row">
                  <span class="product-price">${Mobivise.formatPrice(p.current_price)}</span>
                </div>
                <div class="product-specs-compact">
                  <div class="spec-pill" title="Processor">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg>
                    <span>${(p.processor_name || '').split(' ')[0]} ${p.ram}GB</span>
                  </div>
                  <div class="spec-pill" title="Battery">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="16" height="10" rx="2"/><line x1="20" y1="11" x2="20" y2="13"/></svg>
                    <span>${p.battery_capacity || 5000}mAh</span>
                  </div>
                </div>
                <div class="product-card-actions">
                  <a href="product-details.html?slug=${encodeURIComponent(p.slug)}" class="btn-card-details">Details</a>
                  <button type="button" class="btn-compare-toggle ${isComparing ? 'active' : ''}" data-id="${p.id}" data-name="${p.model_name}">
                    <span class="compare-btn-text">${isComparing ? 'In Compare' : 'Compare'}</span>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  } else {
    // Show all brands directory
    document.title = 'Smartphone Brands — Mobivise';

    if (headerContainer) {
      headerContainer.innerHTML = `
        <h1 class="page-header-title" style="font-size:2rem; margin-bottom:6px;">Smartphone Brands</h1>
        <p class="page-header-desc" style="margin:0; font-size:0.95rem;">Browse leading global smartphone manufacturers and inspect verified models.</p>
      `;
    }

    if (brandPhonesSection) brandPhonesSection.style.display = 'none';
    if (allBrandsGrid) {
      allBrandsGrid.style.display = 'grid';

      // Count phones per brand
      const counts = {};
      allPhones.forEach(p => {
        const slug = (p.brand_slug || '').toLowerCase();
        counts[slug] = (counts[slug] || 0) + 1;
      });

      allBrandsGrid.innerHTML = allBrands.map(b => {
        const count = counts[b.slug.toLowerCase()] || 0;
        const initial = b.brand_name.charAt(0).toUpperCase();
        return `
          <a href="brands.html?brand=${encodeURIComponent(b.slug)}" class="brand-card">
            <div class="brand-icon-box">${initial}</div>
            <div class="brand-card-name">${b.brand_name}</div>
            <div class="brand-card-count" style="margin-bottom:8px;">
              <strong style="color:var(--forest-green);">${count}</strong> models
            </div>
            <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.4; margin-bottom:12px;">
              ${b.description}
            </p>
            <span style="font-size:0.78rem; font-weight:700; color:var(--forest-green);">View Models &rarr;</span>
          </a>
        `;
      }).join('');
    }
  }
}
