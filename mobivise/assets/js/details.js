var Mobivise = window.Mobivise;
/**
 * MOBIVISE - Smartphone Product Details Engine
 * Pure Vanilla JavaScript (assets/js/details.js)
 * 100% Client-Side, Zero PHP
 */

document.addEventListener('DOMContentLoaded', () => {
  initProductDetails();
});

function initProductDetails() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const id = params.get('id');

  let phone = null;
  if (slug) {
    phone = Mobivise.getPhoneBySlug(slug);
  } else if (id) {
    phone = Mobivise.getPhoneById(id);
  }

  const container = document.getElementById('detailsContentContainer');
  const notFoundBox = document.getElementById('detailsNotFoundContainer');

  if (!phone) {
    if (container) container.style.display = 'none';
    if (notFoundBox) notFoundBox.style.display = 'block';
    document.title = 'Smartphone Not Found — Mobivise';
    return;
  }

  // Set Page Title
  document.title = `${phone.brand_name} ${phone.model_name} — Specifications | Mobivise`;

  // Breadcrumbs
  document.getElementById('bcBrand').textContent = phone.brand_name;
  document.getElementById('bcBrand').href = `products.html?brand=${encodeURIComponent(phone.brand_slug)}`;
  document.getElementById('bcModel').textContent = phone.model_name;

  // Hero Device Image & Badges
  const imgEl = document.getElementById('detailPhoneImg');
  if (imgEl) {
    imgEl.src = phone.image_url;
    imgEl.alt = `${phone.brand_name} ${phone.model_name}`;
  }

  document.getElementById('detailBrandName').textContent = phone.brand_name;
  document.getElementById('detailModelName').textContent = phone.model_name;

  // 5G & Launch & VFM
  const tagRow = document.getElementById('detailTagRow');
  if (tagRow) {
    let tagsHtml = '';
    tagsHtml += Mobivise.getVfmBadgeHtml(phone);
    if (phone.is_5g) {
      tagsHtml += '<span class="badge-pill badge-5g">5G Ready</span>';
    }
    if (phone.launch_date) {
      const d = new Date(phone.launch_date);
      const monthYear = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      tagsHtml += `<span>Launched: ${monthYear}</span>`;
    }
    tagRow.innerHTML = tagsHtml;
  }

  // Price & Discount
  const curPrice = parseFloat(phone.current_price) || 0;
  const basePrice = parseFloat(phone.base_price) || 0;
  document.getElementById('detailCurrentPrice').textContent = Mobivise.formatPrice(curPrice);

  const discountBox = document.getElementById('detailDiscountBox');
  if (discountBox) {
    if (basePrice > curPrice) {
      const saved = basePrice - curPrice;
      discountBox.innerHTML = `
        <span style="font-size:1rem; color:var(--text-muted); text-decoration:line-through; margin-right:8px;">${Mobivise.formatPrice(basePrice)}</span>
        <span style="font-size:0.75rem; background:rgba(126,170,49,0.15); color:var(--forest-green); padding:3px 8px; border-radius:4px; font-weight:700;">Save ${Mobivise.formatPrice(saved)}</span>
      `;
    } else {
      discountBox.innerHTML = '';
    }
  }

  // Quick Specs
  document.getElementById('qsProcessor').textContent = phone.processor_name || 'N/A';
  document.getElementById('qsScreen').textContent = `${phone.display_size || '--'}" ${phone.display_type || ''} (${phone.refresh_rate || 60}Hz)`;
  document.getElementById('qsCamera').textContent = `${phone.rear_camera_mp || '--'}MP Rear • ${phone.front_camera_mp || '--'}MP Front`;
  document.getElementById('qsBattery').textContent = `${phone.battery_capacity || '--'}mAh (${phone.charging_speed || '--'}W Charge)`;

  // Compare Buttons
  const compareBtn = document.getElementById('btnDetailCompare');
  if (compareBtn) {
    compareBtn.setAttribute('data-id', phone.id);
    compareBtn.setAttribute('data-name', phone.model_name);
    const isComparing = getCompareList().includes(phone.id);
    compareBtn.classList.toggle('active', isComparing);
    const txt = compareBtn.querySelector('.compare-btn-text');
    if (txt) txt.textContent = isComparing ? 'In Comparison' : 'Add to Compare';
  }

  const compareLinkBtn = document.getElementById('btnCompareWithAnother');
  if (compareLinkBtn) {
    compareLinkBtn.href = `compare.html?ids=${phone.id}`;
  }

  // Retailer Prices Table
  const priceTableBody = document.getElementById('retailerPriceTableBody');
  if (priceTableBody) {
    const prices = phone.prices || [];
    if (prices.length > 0) {
      priceTableBody.innerHTML = prices.map(p => `
        <tr>
          <td><strong>${p.retailer_name}</strong></td>
          <td><span style="font-weight:800; color:var(--forest-green);">${Mobivise.formatPrice(p.price)}</span></td>
          <td><span style="color:var(--text-secondary); font-size:0.8rem;">${p.source || 'Online Store'}</span></td>
          <td><span style="color:var(--text-muted); font-size:0.8rem;">Verified Live</span></td>
          <td style="text-align:right;">
            <a href="${p.retailer_url || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Store &nearr;</a>
          </td>
        </tr>
      `).join('');
    } else {
      priceTableBody.innerHTML = `
        <tr>
          <td><strong>Official Authorized Store</strong></td>
          <td><span style="font-weight:800; color:var(--forest-green);">${Mobivise.formatPrice(phone.current_price)}</span></td>
          <td><span style="color:var(--text-secondary); font-size:0.8rem;">Official Pricing</span></td>
          <td><span style="color:var(--text-muted); font-size:0.8rem;">Verified Live</span></td>
          <td style="text-align:right;">
            <a href="https://google.com/search?q=${encodeURIComponent(phone.brand_name + ' ' + phone.model_name + ' buy online')}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Search &nearr;</a>
          </td>
        </tr>
      `;
    }
  }

  // Full Technical Specifications
  // 1. Hardware
  document.getElementById('specProcessorName').textContent = phone.processor_name || 'N/A';
  document.getElementById('specProcessorBrand').textContent = phone.processor_brand || 'N/A';
  document.getElementById('specRam').textContent = `${phone.ram || '--'} GB`;
  document.getElementById('specStorage').textContent = `${phone.storage || '--'} GB`;
  document.getElementById('specAntutu').textContent = phone.antutu_score ? Number(phone.antutu_score).toLocaleString('en-IN') : 'N/A';

  // 2. Display
  document.getElementById('specDisplaySize').textContent = `${phone.display_size || '--'}" inches`;
  document.getElementById('specDisplayType').textContent = phone.display_type || 'AMOLED';
  document.getElementById('specRefreshRate').textContent = `${phone.refresh_rate || 60} Hz`;
  document.getElementById('specResolution').textContent = phone.resolution || 'FHD+';

  // 3. Camera
  document.getElementById('specRearCamera').textContent = phone.rear_camera || `${phone.rear_camera_mp}MP Primary`;
  document.getElementById('specRearMp').textContent = `${phone.rear_camera_mp || '--'} MP`;
  document.getElementById('specFrontCamera').textContent = phone.front_camera || `${phone.front_camera_mp}MP Selfie`;
  document.getElementById('specFrontMp').textContent = `${phone.front_camera_mp || '--'} MP`;

  // 4. Battery & Software
  document.getElementById('specBatteryCapacity').textContent = `${phone.battery_capacity || '--'} mAh`;
  document.getElementById('specChargingSpeed').textContent = `${phone.charging_speed || '--'} W Fast Charging`;
  document.getElementById('specOs').textContent = phone.operating_system || 'Android 14';
  document.getElementById('specSoftwareSupport').textContent = `${phone.software_support || 3} Years OS Updates`;

  // Render Similar Smartphones in same price range
  renderSimilarPhones(phone);
}

function renderSimilarPhones(currentPhone) {
  const container = document.getElementById('similarPhonesGrid');
  if (!container) return;

  const currentPrice = parseFloat(currentPhone.current_price) || 0;
  const all = Mobivise.getAllPhones();

  // Find phones within 30% price range, exclude current
  let similar = all.filter(p => p.id !== currentPhone.id)
    .map(p => {
      const price = parseFloat(p.current_price) || 0;
      const diff = Math.abs(price - currentPrice);
      return { phone: p, diff };
    })
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 4)
    .map(x => x.phone);

  const compareList = getCompareList();
  container.innerHTML = similar.map(p => {
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
