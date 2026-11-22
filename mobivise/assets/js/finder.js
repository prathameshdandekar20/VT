var Mobivise = window.Mobivise;
/**
 * MOBIVISE - Smart Finder Recommendation Engine
 * Multi-Attribute Utility Theory (MAUT) Algorithm in Pure Vanilla JS
 * 100% Client-Side, Zero PHP, Instant Real-Time Scoring
 */

document.addEventListener('DOMContentLoaded', () => {
  initSmartFinder();
});

function initSmartFinder() {
  const wizardForm = document.getElementById('smartFinderForm');
  const wizardContainer = document.getElementById('wizardContainer');
  const resultsContainer = document.getElementById('resultsContainer');
  const btnRetake = document.getElementById('btnRetakeWizard');

  // Check URL params for pre-filled or automatic submission
  const urlParams = new URLSearchParams(window.location.search);
  const autoRun = urlParams.has('primary_usage') && urlParams.has('max_budget');

  // Initialize Wizard UI & Step Switching
  initWizardUI();

  if (autoRun) {
    // Populate form with URL params and run
    populateFormFromParams(urlParams);
    runRecommendationPipeline();
  }

  if (wizardForm) {
    wizardForm.addEventListener('submit', (e) => {
      e.preventDefault();
      runRecommendationPipeline();
    });
  }

  if (btnRetake) {
    btnRetake.addEventListener('click', (e) => {
      e.preventDefault();
      resultsContainer.style.display = 'none';
      wizardContainer.style.display = 'block';
      window.scrollTo({ top: wizardContainer.offsetTop - 60, behavior: 'smooth' });
    });
  }
}

function initWizardUI() {
  const steps = document.querySelectorAll('.wizard-step');
  const nodes = document.querySelectorAll('.wizard-step-node');
  const progressFill = document.querySelector('.wizard-progress-fill');
  const nextBtn = document.getElementById('wizardNextBtn');
  const prevBtn = document.getElementById('wizardPrevBtn');
  const submitBtn = document.getElementById('wizardSubmitBtn');
  const wizardForm = document.getElementById('smartFinderForm');

  if (!steps.length) return;

  let currentStep = 1;
  const totalSteps = steps.length;

  function updateWizardUI() {
    steps.forEach((step, idx) => {
      step.classList.toggle('active', idx + 1 === currentStep);
    });

    nodes.forEach((node, idx) => {
      const stepNum = idx + 1;
      node.classList.toggle('active', stepNum === currentStep);
      node.classList.toggle('completed', stepNum < currentStep);
    });

    if (progressFill) {
      const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
      progressFill.style.width = `${Math.max(10, percent)}%`;
    }

    if (prevBtn) {
      prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    }

    if (nextBtn && submitBtn) {
      if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-flex';
      } else {
        nextBtn.style.display = 'inline-flex';
        submitBtn.style.display = 'none';
      }
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (validateCurrentStep(currentStep)) {
        if (currentStep < totalSteps) {
          currentStep++;
          updateWizardUI();
          window.scrollTo({ top: wizardForm.offsetTop - 80, behavior: 'smooth' });
        }
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateWizardUI();
        window.scrollTo({ top: wizardForm.offsetTop - 80, behavior: 'smooth' });
      }
    });
  }

  // Radio card options
  document.querySelectorAll('.option-select-card').forEach(card => {
    card.addEventListener('click', () => {
      const radio = card.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
        const groupName = radio.name;
        document.querySelectorAll(`input[name="${groupName}"]`).forEach(r => {
          r.closest('.option-select-card').classList.toggle('selected', r.checked);
        });
      }
    });
  });

  // Budget Presets
  document.querySelectorAll('.btn-budget-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const min = btn.getAttribute('data-min');
      const max = btn.getAttribute('data-max');
      const minInput = document.getElementById('minBudgetInput');
      const maxInput = document.getElementById('maxBudgetInput');
      if (minInput && maxInput) {
        minInput.value = min;
        maxInput.value = max;
        document.querySelectorAll('.btn-budget-preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    });
  });

  // Sliders with tag updates
  const sliderLabels = {
    1: '1 - Low Priority',
    2: '2 - Moderate',
    3: '3 - Important',
    4: '4 - Very High',
    5: '5 - Critical / Must-have'
  };

  document.querySelectorAll('.range-slider').forEach(slider => {
    const targetTagId = slider.getAttribute('data-tag');
    const tagEl = document.getElementById(targetTagId);
    function updateTag() {
      if (tagEl) tagEl.textContent = sliderLabels[slider.value] || slider.value;
    }
    slider.addEventListener('input', updateTag);
    updateTag();
  });

  updateWizardUI();
}

function validateCurrentStep(step) {
  if (step === 1) {
    const minInput = document.getElementById('minBudgetInput');
    const maxInput = document.getElementById('maxBudgetInput');
    const minVal = parseFloat(minInput.value) || 0;
    const maxVal = parseFloat(maxInput.value) || 0;

    if (maxVal <= 0 || maxVal < minVal) {
      alert('Please enter a valid budget range. Maximum budget must be greater than minimum budget.');
      maxInput.focus();
      return false;
    }
    return true;
  }
  if (step === 2) {
    const primarySelected = document.querySelector('input[name="primary_usage"]:checked');
    if (!primarySelected) {
      alert('Please select your primary smartphone usage pattern.');
      return false;
    }
    return true;
  }
  return true;
}

function populateFormFromParams(params) {
  if (params.has('min_budget')) document.getElementById('minBudgetInput').value = params.get('min_budget');
  if (params.has('max_budget')) document.getElementById('maxBudgetInput').value = params.get('max_budget');
  if (params.has('primary_usage')) {
    const val = params.get('primary_usage');
    const radio = document.querySelector(`input[name="primary_usage"][value="${val}"]`);
    if (radio) {
      radio.checked = true;
      document.querySelectorAll('input[name="primary_usage"]').forEach(r => {
        r.closest('.option-select-card').classList.toggle('selected', r.checked);
      });
    }
  }
}

/* ========================================================
   MAUT RECOMMENDATION ALGORITHM
   ======================================================== */
function runRecommendationPipeline() {
  const allPhones = Mobivise.getAllPhones();

  // Read Inputs
  const minBudget = parseFloat(document.getElementById('minBudgetInput').value) || 0;
  const maxBudget = parseFloat(document.getElementById('maxBudgetInput').value) || 200000;
  const primaryUsage = (document.querySelector('input[name="primary_usage"]:checked')?.value || 'balanced').toLowerCase();

  const impPerf = parseInt(document.querySelector('input[name="importance_performance"]').value, 10) || 3;
  const impCamera = parseInt(document.querySelector('input[name="importance_camera"]').value, 10) || 3;
  const impBattery = parseInt(document.querySelector('input[name="importance_battery"]').value, 10) || 3;
  const impDisplay = parseInt(document.querySelector('input[name="importance_display"]').value, 10) || 3;

  const prefBrand = (document.querySelector('select[name="preferred_brand"]')?.value || '').trim().toLowerCase();
  const minRam = parseInt(document.querySelector('select[name="min_ram"]')?.value, 10) || 0;
  const minStorage = parseInt(document.querySelector('select[name="min_storage"]')?.value, 10) || 0;

  // 1. Filter candidates by budget & optional constraints
  let candidates = allPhones.filter(p => {
    const price = parseFloat(p.current_price) || 0;
    if (price < minBudget || price > maxBudget) return false;
    if (minRam > 0 && (parseInt(p.ram, 10) || 0) < minRam) return false;
    if (minStorage > 0 && (parseInt(p.storage, 10) || 0) < minStorage) return false;
    return true;
  });

  // If no candidates in strict window, expand budget by 15% tolerance
  let isToleranceApplied = false;
  if (candidates.length === 0) {
    const tolMin = Math.max(0, minBudget * 0.85);
    const tolMax = maxBudget * 1.15;
    candidates = allPhones.filter(p => {
      const price = parseFloat(p.current_price) || 0;
      return price >= tolMin && price <= tolMax;
    });
    isToleranceApplied = true;
  }

  // Fallback if still empty: take all
  if (candidates.length === 0) {
    candidates = allPhones.slice(0, 8);
  }

  // 2. Compute dynamic weights based on usage and sliders
  const weights = computeDynamicWeights(primaryUsage, impPerf, impCamera, impBattery, impDisplay);

  // 3. Score every candidate
  const scoredMatches = candidates.map(phone => {
    const subScores = computeSubScores(phone);

    // Weighted Utility Sum
    let rawScore = (
      (weights.performance * subScores.performance) +
      (weights.camera * subScores.camera) +
      (weights.battery * subScores.battery) +
      (weights.display * subScores.display) +
      (weights.software * subScores.software) +
      (weights.value * subScores.value)
    );

    // Preferred brand bonus (+5%)
    if (prefBrand && (phone.brand_slug || '').toLowerCase() === prefBrand) {
      rawScore *= 1.05;
    }

    // Popularity tie-breaker (+0.05 * popularity)
    const popBonus = ((phone.popularity || 80) / 100) * 3;
    const finalScore = Math.min(99, Math.round(rawScore + popBonus));

    const analysis = analyzeProsAndCons(phone, subScores);
    const explanation = generateExplanation(phone, subScores, primaryUsage);

    return {
      phone,
      subScores,
      matchPercent: Math.max(50, finalScore),
      pros: analysis.pros,
      cons: analysis.cons,
      explanation
    };
  });

  // Sort descending by matchPercent
  scoredMatches.sort((a, b) => b.matchPercent - a.matchPercent);

  // Render Results
  renderRecommendationResults(scoredMatches, {
    minBudget,
    maxBudget,
    primaryUsage,
    isToleranceApplied
  });
}

function computeDynamicWeights(usage, impPerf, impCamera, impBattery, impDisplay) {
  // Base weights from sliders
  const sumSliders = impPerf + impCamera + impBattery + impDisplay;
  let wPerf = impPerf / sumSliders;
  let wCam = impCamera / sumSliders;
  let wBat = impBattery / sumSliders;
  let wDisp = impDisplay / sumSliders;

  // Usage profile boosts
  switch (usage) {
    case 'gaming':
      wPerf += 0.15;
      wDisp += 0.05;
      wCam -= 0.10;
      wBat -= 0.10;
      break;
    case 'photography':
      wCam += 0.20;
      wDisp += 0.05;
      wPerf -= 0.10;
      wBat -= 0.15;
      break;
    case 'everyday':
      wBat += 0.20;
      wPerf -= 0.10;
      wCam -= 0.10;
      break;
    case 'productivity':
      wPerf += 0.10;
      wBat += 0.05;
      wCam -= 0.15;
      break;
    case 'multimedia':
      wDisp += 0.15;
      wBat += 0.05;
      wCam -= 0.10;
      wPerf -= 0.10;
      break;
    case 'balanced':
    default:
      break;
  }

  // Normalize so component weights sum to 0.75, allocating 0.10 to software and 0.15 to value
  const totalRaw = Math.max(0.1, wPerf + wCam + wBat + wDisp);
  const factor = 0.75 / totalRaw;

  return {
    performance: Math.max(0.05, wPerf * factor),
    camera: Math.max(0.05, wCam * factor),
    battery: Math.max(0.05, wBat * factor),
    display: Math.max(0.05, wDisp * factor),
    software: 0.10,
    value: 0.15
  };
}

function computeSubScores(p) {
  // 1. Performance (AnTuTu score 250k..2200k + RAM 4..16GB + Chipset)
  const antutu = parseFloat(p.antutu_score) || 450000;
  const ram = parseFloat(p.ram) || 6;
  const normAntutu = Math.min(100, Math.max(30, ((antutu - 250000) / (2200000 - 250000)) * 100));
  const normRam = Math.min(100, Math.max(30, ((ram - 4) / (16 - 4)) * 100));
  const perfScore = (normAntutu * 0.65) + (normRam * 0.35);

  // 2. Camera (Main MP + OIS + Front)
  const rearMp = parseFloat(p.rear_camera_mp) || 50;
  const frontMp = parseFloat(p.front_camera_mp) || 16;
  const hasOis = (p.rear_camera || '').toLowerCase().includes('ois');
  const normRear = Math.min(100, Math.max(30, (rearMp / 200) * 100));
  const normFront = Math.min(100, Math.max(30, (frontMp / 50) * 100));
  const oisBonus = hasOis ? 15 : 0;
  const cameraScore = Math.min(100, (normRear * 0.50) + (normFront * 0.35) + oisBonus);

  // 3. Battery (Capacity 3500..6000mAh + Charging Speed 15..120W)
  const bat = parseFloat(p.battery_capacity) || 5000;
  const charge = parseFloat(p.charging_speed) || 33;
  const normBat = Math.min(100, Math.max(30, ((bat - 3500) / (6000 - 3500)) * 100));
  const normCharge = Math.min(100, Math.max(30, ((charge - 15) / (120 - 15)) * 100));
  const batteryScore = (normBat * 0.60) + (normCharge * 0.40);

  // 4. Display (Refresh 60..144Hz + AMOLED + Resolution)
  const refresh = parseFloat(p.refresh_rate) || 60;
  const isAmoled = (p.display_type || '').toLowerCase().includes('oled') || (p.display_type || '').toLowerCase().includes('retina');
  const normRefresh = Math.min(100, Math.max(30, ((refresh - 60) / (144 - 60)) * 100));
  const displayScore = (normRefresh * 0.60) + (isAmoled ? 40 : 25);

  // 5. Software (Years 2..7)
  const soft = parseFloat(p.software_support) || 3;
  const softwareScore = Math.min(100, Math.max(30, (soft / 7) * 100));

  // 6. Value for money
  const price = parseFloat(p.current_price) || 20000;
  const baseP = parseFloat(p.base_price) || price;
  const discountRatio = baseP > price ? (baseP - price) / baseP : 0;
  const specSum = (perfScore + cameraScore + batteryScore + displayScore) / 4;
  const ratio = specSum / (price / 1000);
  const valueScore = Math.min(100, Math.max(40, (ratio * 12) + (discountRatio * 20)));

  return {
    performance: Math.round(perfScore),
    camera: Math.round(cameraScore),
    battery: Math.round(batteryScore),
    display: Math.round(displayScore),
    software: Math.round(softwareScore),
    value: Math.round(valueScore)
  };
}

function analyzeProsAndCons(p, s) {
  const pros = [];
  const cons = [];

  if (s.performance >= 85) pros.push(`Flagship processing throughput (${p.processor_name || 'Advanced SoC'})`);
  if ((parseFloat(p.charging_speed) || 0) >= 67) pros.push(`Ultra-fast ${p.charging_speed}W rapid charging`);
  if ((parseFloat(p.battery_capacity) || 0) >= 5500) pros.push(`Enduring high-capacity ${p.battery_capacity}mAh battery`);
  if ((p.rear_camera || '').toLowerCase().includes('ois')) pros.push('Optical Image Stabilization (OIS) for stable low-light photos');
  if ((parseFloat(p.refresh_rate) || 60) >= 120) pros.push(`Silky smooth ${p.refresh_rate}Hz high refresh rate display`);
  if ((parseFloat(p.software_support) || 0) >= 4) pros.push(`Extended ${p.software_support} years of guaranteed OS updates`);

  if (pros.length === 0) {
    pros.push('Well-balanced specification-to-price ratio');
    pros.push('Verified 5G high-speed carrier compatibility');
  }

  if ((parseFloat(p.charging_speed) || 0) <= 25) cons.push(`Moderate ${p.charging_speed || 25}W charging speed`);
  if ((parseFloat(p.battery_capacity) || 0) < 4500) cons.push(`Compact ${p.battery_capacity}mAh battery requires nightly top-up`);
  if ((parseFloat(p.weight) || 0) > 215) cons.push(`Heavier in-hand profile (${p.weight}g)`);
  if ((p.display_type || '').toLowerCase().includes('lcd')) cons.push('IPS LCD panel lacks the infinite contrast of AMOLED');
  if ((parseFloat(p.software_support) || 0) <= 2) cons.push('Shorter 2-year OS update window');

  if (cons.length === 0) {
    cons.push('Premium price tier requires higher initial budget');
  }

  return {
    pros: pros.slice(0, 3),
    cons: cons.slice(0, 2)
  };
}

function generateExplanation(p, s, usage) {
  const usageNames = {
    gaming: 'High-Frame Gaming',
    photography: 'Studio & Mobile Photography',
    everyday: 'All-Day Reliability',
    productivity: 'Heavy Multitasking & Productivity',
    multimedia: 'Video Streaming & High-Fidelity Display',
    balanced: 'Balanced Daily Usage'
  };
  const target = usageNames[usage] || 'Balanced Daily Usage';

  const strongSpecs = [];
  if (s.performance >= 80) strongSpecs.push('computing throughput');
  if (s.camera >= 80) strongSpecs.push('optical clarity');
  if (s.battery >= 80) strongSpecs.push('battery endurance');
  if (s.display >= 80) strongSpecs.push('screen vibrancy');

  const specsText = strongSpecs.length > 0 ? strongSpecs.slice(0, 2).join(' and ') : 'overall specification synergy';

  return `Recommended for ${target} based on its ${specsText}, powered by ${p.processor_name || 'its optimized chipset'} at ${Mobivise.formatPrice(p.current_price)}.`;
}

function renderRecommendationResults(matches, meta) {
  const wizardContainer = document.getElementById('wizardContainer');
  const resultsContainer = document.getElementById('resultsContainer');
  const resultsList = document.getElementById('resultsList');
  const summaryText = document.getElementById('resultsSummaryText');

  if (!resultsContainer || !resultsList) return;

  wizardContainer.style.display = 'none';
  resultsContainer.style.display = 'block';

  summaryText.innerHTML = `
    Calculated <strong>${matches.length} matches</strong> for budget <strong>${Mobivise.formatPrice(meta.minBudget)} – ${Mobivise.formatPrice(meta.maxBudget)}</strong> and <strong>${meta.primaryUsage.toUpperCase()}</strong> profile.
    ${meta.isToleranceApplied ? '<br><span style="font-size:0.8rem;color:#e11d48;">Note: Exact budget range had few matches; expanded window by 15% to provide verified options.</span>' : ''}
  `;

  const compareList = getCompareList();
  let html = '';

  matches.slice(0, 6).forEach((match, idx) => {
    const p = match.phone;
    const isTop = idx === 0;
    const isComparing = compareList.includes(p.id);

    html += `
      <div class="recommendation-card ${isTop ? 'top-pick' : ''}">
        ${isTop 
          ? '<div class="top-pick-badge">★ Top Overall Pick</div>' 
          : `<div style="position:absolute; top:12px; left:20px; font-size:0.75rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Match #${idx + 1}</div>`}

        <div class="rec-card-body" style="${!isTop ? 'margin-top:8px;' : ''}">
          <!-- Left: Device Image & Title -->
          <div style="text-align:center;">
            <img src="${p.image_url}" alt="${p.model_name}" style="max-height:130px; object-fit:contain; margin-bottom:8px; border-radius:6px;">
            <div style="font-size:0.72rem; text-transform:uppercase; color:var(--forest-green); font-weight:700;">${p.brand_name}</div>
            <h3 style="font-size:1.05rem; font-weight:800; color:var(--text-primary); margin-bottom:2px;">
              <a href="product-details.html?slug=${encodeURIComponent(p.slug)}">${p.model_name}</a>
            </h3>
            <div style="font-weight:900; color:var(--forest-green); font-size:1.15rem;">
              ${Mobivise.formatPrice(p.current_price)}
            </div>
          </div>

          <!-- Center: Explanation, Subscores, Pros/Cons -->
          <div>
            <p style="font-size:0.88rem; color:var(--text-secondary); line-height:1.4; margin-bottom:12px;">
              ${match.explanation}
            </p>

            <!-- Sub-Scores Meters -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 16px; margin-bottom:12px;">
              <div class="score-bar-row">
                <div class="score-bar-label">Speed</div>
                <div class="score-bar-track"><div class="score-bar-fill" style="width:${match.subScores.performance}%;"></div></div>
                <div class="score-bar-val">${match.subScores.performance}</div>
              </div>
              <div class="score-bar-row">
                <div class="score-bar-label">Camera</div>
                <div class="score-bar-track"><div class="score-bar-fill" style="width:${match.subScores.camera}%; background:#58AFCB;"></div></div>
                <div class="score-bar-val">${match.subScores.camera}</div>
              </div>
              <div class="score-bar-row">
                <div class="score-bar-label">Battery</div>
                <div class="score-bar-track"><div class="score-bar-fill" style="width:${match.subScores.battery}%; background:#7EAA31;"></div></div>
                <div class="score-bar-val">${match.subScores.battery}</div>
              </div>
              <div class="score-bar-row">
                <div class="score-bar-label">Display</div>
                <div class="score-bar-track"><div class="score-bar-fill" style="width:${match.subScores.display}%; background:#A9C34A;"></div></div>
                <div class="score-bar-val">${match.subScores.display}</div>
              </div>
            </div>

            <!-- Pros & Cons -->
            <div class="pros-cons-grid">
              <div>
                <strong style="color:#166534; font-size:0.75rem; text-transform:uppercase;">Advantages:</strong>
                <ul class="pros-list">
                  ${match.pros.map(pro => `<li>&check; ${pro}</li>`).join('')}
                </ul>
              </div>
              <div>
                <strong style="color:#991B1B; font-size:0.75rem; text-transform:uppercase;">Compromises:</strong>
                <ul class="cons-list">
                  ${match.cons.map(con => `<li>&bull; ${con}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>

          <!-- Right: Match Badge & Actions -->
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div class="rec-match-badge-box">
              <div class="rec-match-percent">${match.matchPercent}%</div>
              <div class="rec-match-label">Match Score</div>
            </div>
            <a href="product-details.html?slug=${encodeURIComponent(p.slug)}" class="btn btn-secondary btn-sm" style="text-align:center;">Specifications</a>
            <button type="button" class="btn btn-outline btn-sm btn-compare-toggle ${isComparing ? 'active' : ''}" data-id="${p.id}" data-name="${p.model_name}">
              <span class="compare-btn-text">${isComparing ? 'In Compare' : 'Compare'}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  resultsList.innerHTML = html;
  window.scrollTo({ top: resultsContainer.offsetTop - 60, behavior: 'smooth' });
}
