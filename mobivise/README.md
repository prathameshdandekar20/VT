# MOBIVISE — Intelligent Smartphone Purchasing Guide

> **Academic BTech Computer Science & Engineering (CSE) Capstone Project**  
> Developed using strictly: **HTML5, CSS3 (Custom Botanical Fresh Theme), Vanilla JavaScript (ES6+), JSON Dataset, and Chart.js**.  
> **100% Pure Client-Side Static Web Application — Zero PHP, Zero Backend Servers, Zero Frameworks.**

---

## 1. Project Overview

**Mobivise** is an intelligent, client-side web application engineered to solve **specification overload** and **analysis paralysis** in smartphone purchasing decisions. 

Modern smartphone buyers are flooded with obscure marketing metrics (clock speeds, sensor nanometers, peak nits, camera megapixel races) without clear understanding of real-world value. Commercial platforms are heavily distorted by sponsored product placements.

Mobivise bridges this gap with:
1. **Intelligent Rule-Based Recommendation Engine:** Employs Multi-Attribute Utility Theory (MAUT) with dynamic usage weights (Gaming, Photography, Battery, Productivity, Multimedia, Balanced) to calculate objective compatibility percentages.
2. **Multi-Smartphone Side-by-Side Comparison:** Compare up to 4 devices simultaneously with automated "Best-in-Class" specification highlighting and Chart.js radar/bar visualizers.
3. **Multi-Attribute Catalogue Explorer:** Search and combine filters (brand, price min/max, RAM, processor, 5G availability) with instant sub-millisecond in-memory filtering.
4. **Verified Centralized Database:** 47 verified smartphones with exact device photos across 12 leading manufacturers (Apple, Samsung, OnePlus, Xiaomi, Vivo, Oppo, Realme, Motorola, Google Pixel, Nothing, iQOO, Poco).
5. **Completely Serverless & Offline Capable:** Runs directly in any modern browser via HTTP or local `file:///` protocol without MySQL daemon or PHP runtime requirements.

---

## 2. Technology Stack & Architectural Principles

| Layer | Technology | Engineering Principle |
| :--- | :--- | :--- |
| **Structure** | HTML5 | Clean semantic markup, accessible forms, W3C standards |
| **Styling** | Vanilla CSS3 | Custom Emerald Mint / Botanical Fresh design system, CSS Grid & Flexbox, no CSS frameworks |
| **Client Engine** | Vanilla JavaScript (ES6+) | No React/Vue/jQuery. `localStorage` comparison state, instant in-memory live search, MAUT algorithm |
| **Data Layer** | JSON / Static JS Dataset | 47 smartphones, 12 brands, specifications, retailer pricing in `data/smartphones-data.js` |
| **Data Visualization** | Chart.js 4.x (Local) | Radar & bar charts for multi-dimensional specification comparison |

### Deliberate Scope Exclusions
As per academic design guidelines:
- **Zero User Accounts / Login / Passwords:** Unbiased public access; comparison state persists in browser `localStorage`.
- **Zero E-Commerce Shopping Cart / Payment Gateway:** Mobivise is an advisory decision support guide, not a retailer.
- **Zero Backend Daemon Dependencies:** No Apache PHP handler, no MySQL connection pools.

---

## 3. Directory Structure

```
mobivise/
│
├── index.html                # Landing page with hero, search, budget tiers, featured phones
├── products.html             # Smartphone Explorer with multi-filtering, sorting, pagination
├── product-details.html      # Single phone specifications, retailer prices, similar devices
├── compare.html              # Side-by-side comparison (up to 4 devices) with Chart.js
├── recommendations.html      # 4-step Smart Finder questionnaire with client-side MAUT engine
├── brands.html               # Brand explorer directory and brand device catalogues
├── about.html                # Project documentation, MAUT mathematical formulas, viva defense
│
├── data/
│   ├── smartphones.json      # Structured JSON database export (47 phones, 12 brands)
│   └── smartphones-data.js   # Global window.MOBIVISE_DATA portable script
│
├── assets/
│   ├── css/
│   │   ├── style.css         # Theme tokens (Emerald Mint / Botanical Fresh), typography, base
│   │   ├── components.css    # Cards, comparison table, questionnaire wizard, buttons
│   │   └── responsive.css    # Mobile breakpoints (<= 992px, <= 768px, <= 480px)
│   ├── js/
│   │   ├── main.js           # Core Mobivise engine, in-memory live search, localStorage compare
│   │   ├── products.js       # Dynamic catalog filters, sorting, pagination
│   │   ├── details.js        # Dynamic specification renderer & retailer prices
│   │   ├── finder.js         # Client-side MAUT recommendation mathematical algorithm
│   │   ├── comparison.js     # Side-by-side spec comparison & Chart.js radar/bar charts
│   │   ├── brands.js         # Brand directory and brand device viewer
│   │   └── chart.min.js      # Local Chart.js v4.4.1 library (100% offline)
│   └── images/
│       ├── brands/           # Brand logo icons (Apple, Samsung, OnePlus, etc.)
│       ├── featured/         # Hero device promotional renders
│       └── phones/           # 47 exact device photos for all cataloged smartphones
│
└── database/
    └── schema.sql            # 3NF relational database schema documentation
```

---

## 4. How to Run

Because Mobivise is a 100% static client-side web application, you can run it in multiple convenient ways:

### Option A: Open Directly in Browser
Double-click `index.html` or open `file:///c:/Users/HI/Desktop/VT/mobivise/index.html` in any modern web browser (Edge, Chrome, Firefox, Safari).

### Option B: Local Static Web Server
Run using any standard static server:
```bash
# Python 3
cd c:\Users\HI\Desktop\VT\mobivise
python -m http.server 8000
# Then visit: http://localhost:8000
```
or via Node.js:
```bash
npx serve c:\Users\HI\Desktop\VT\mobivise
```
or via XAMPP Apache:
```
http://localhost/mobivise/index.html
```
