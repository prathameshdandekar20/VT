-- ========================================================
-- MOBIVISE - Intelligent Smartphone Purchasing Guide
-- Database Initialization Script: mobivise.sql
-- Academic BTech CSE Project VT
-- Compatible with MySQL 5.7+ / MariaDB 10.4+ / MySQL 8.0+
-- ========================================================

CREATE DATABASE IF NOT EXISTS `mobivise_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `mobivise_db`;

-- Drop existing tables in correct foreign key order
DROP TABLE IF EXISTS `comparison_logs`;
DROP TABLE IF EXISTS `search_logs`;
DROP TABLE IF EXISTS `prices`;
DROP TABLE IF EXISTS `specifications`;
DROP TABLE IF EXISTS `smartphones`;
DROP TABLE IF EXISTS `brands`;

-- --------------------------------------------------------
-- Table: brands
-- --------------------------------------------------------
CREATE TABLE `brands` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `brand_name` VARCHAR(100) NOT NULL UNIQUE,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `logo` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: smartphones
-- --------------------------------------------------------
CREATE TABLE `smartphones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `brand_id` INT NOT NULL,
  `model_name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `image` VARCHAR(255) DEFAULT NULL,
  `launch_date` DATE DEFAULT NULL,
  `base_price` DECIMAL(10,2) NOT NULL,
  `current_price` DECIMAL(10,2) NOT NULL,
  `operating_system` VARCHAR(100) DEFAULT 'Android 14',
  `is_5g` TINYINT(1) DEFAULT 1,
  `popularity` INT DEFAULT 50,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_smartphones_brand` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `idx_current_price` (`current_price`),
  INDEX `idx_brand_id` (`brand_id`),
  INDEX `idx_is_5g` (`is_5g`),
  INDEX `idx_popularity` (`popularity`),
  INDEX `idx_launch_date` (`launch_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: specifications
-- --------------------------------------------------------
CREATE TABLE `specifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `smartphone_id` INT NOT NULL UNIQUE,
  `processor_name` VARCHAR(150) NOT NULL,
  `processor_brand` VARCHAR(100) NOT NULL,
  `ram` INT NOT NULL COMMENT 'RAM in GB',
  `storage` INT NOT NULL COMMENT 'Storage in GB',
  `display_size` DECIMAL(4,2) NOT NULL COMMENT 'Inches',
  `display_type` VARCHAR(100) NOT NULL,
  `refresh_rate` INT DEFAULT 60 COMMENT 'Hz',
  `resolution` VARCHAR(50) DEFAULT '1080 x 2400',
  `rear_camera` VARCHAR(255) NOT NULL,
  `rear_camera_mp` INT NOT NULL COMMENT 'Primary sensor MP',
  `front_camera` VARCHAR(150) NOT NULL,
  `front_camera_mp` INT NOT NULL COMMENT 'Primary front sensor MP',
  `battery_capacity` INT NOT NULL COMMENT 'mAh',
  `charging_speed` INT NOT NULL COMMENT 'Watts (W)',
  `weight` DECIMAL(5,1) DEFAULT 190.0 COMMENT 'Grams',
  `software_support` INT DEFAULT 3 COMMENT 'Years of major OS updates',
  `antutu_score` INT DEFAULT 500000 COMMENT 'AnTuTu v10 benchmark estimate',
  CONSTRAINT `fk_specs_smartphone` FOREIGN KEY (`smartphone_id`) REFERENCES `smartphones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_ram` (`ram`),
  INDEX `idx_storage` (`storage`),
  INDEX `idx_battery` (`battery_capacity`),
  INDEX `idx_processor_brand` (`processor_brand`),
  INDEX `idx_antutu` (`antutu_score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: prices
-- --------------------------------------------------------
CREATE TABLE `prices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `smartphone_id` INT NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `retailer_name` VARCHAR(100) NOT NULL,
  `retailer_url` VARCHAR(255) DEFAULT NULL,
  `source` VARCHAR(100) DEFAULT 'Verified Store Feed',
  `checked_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_prices_smartphone` FOREIGN KEY (`smartphone_id`) REFERENCES `smartphones` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_prices_phone_id` (`smartphone_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: search_logs
-- --------------------------------------------------------
CREATE TABLE `search_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `search_query` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_query` (`search_query`(50))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: comparison_logs
-- --------------------------------------------------------
CREATE TABLE `comparison_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `compared_smartphones` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- INITIAL DATA SEEDING
-- ========================================================

-- Insert Brands
INSERT INTO `brands` (`id`, `brand_name`, `slug`, `logo`, `description`, `website`) VALUES
(1, 'Apple', 'apple', 'apple.svg', 'Global innovator known for premium build, iOS ecosystem, and industry-leading custom silicon.', 'https://www.apple.com'),
(2, 'Samsung', 'samsung', 'samsung.svg', 'Global market leader offering diverse series from entry Galaxy A to flagship Galaxy S and Foldables.', 'https://www.samsung.com'),
(3, 'OnePlus', 'oneplus', 'oneplus.svg', 'Flagship killers and performance-focused phones with fast SuperVOOC charging and clean OxygenOS.', 'https://www.oneplus.com'),
(4, 'Xiaomi', 'xiaomi', 'xiaomi.svg', 'High value-for-money innovator spanning Redmi, Poco, and Leica-collaborated premium flagships.', 'https://www.mi.com'),
(5, 'Google', 'google', 'google.svg', 'Pure Android experience, industry standard computational photography, and bespoke Google Tensor chips.', 'https://store.google.com'),
(6, 'Motorola', 'motorola', 'motorola.svg', 'Clean near-stock Android software, sleek curved designs, and resilient budget-to-flagship devices.', 'https://www.motorola.in'),
(7, 'Vivo', 'vivo', 'vivo.svg', 'Camera-first manufacturer celebrated for ZEISS optics, studio portrait aura lights, and slim ergonomics.', 'https://www.vivo.com'),
(8, 'Realme', 'realme', 'realme.svg', 'Youth-centric brand bringing flagship-grade fast charging, high-refresh displays, and competitive pricing.', 'https://www.realme.com'),
(9, 'Nothing', 'nothing', 'nothing.svg', 'London-based design company delivering transparent aesthetics, Glyph interface, and bloat-free Nothing OS.', 'https://nothing.tech'),
(10, 'iQOO', 'iqoo', 'iqoo.svg', 'Extreme performance and gaming-centric brand engineered with dedicated display chips and vapor chambers.', 'https://www.iqoo.com');

-- Insert Smartphones
INSERT INTO `smartphones` (`id`, `brand_id`, `model_name`, `slug`, `image`, `launch_date`, `base_price`, `current_price`, `operating_system`, `is_5g`, `popularity`) VALUES
-- Under 10k & 10k-15k
(1, 6, 'Motorola Moto G04s', 'motorola-moto-g04s', 'moto-g04s.jpg', '2024-05-10', 7499.00, 6999.00, 'Android 14', 0, 65),
(2, 4, 'Poco C65', 'poco-c65', 'poco-c65.jpg', '2023-12-15', 8999.00, 7999.00, 'Android 13 (MIUI 14)', 0, 70),
(3, 8, 'Realme 12x 5G', 'realme-12x-5g', 'realme-12x.jpg', '2024-04-02', 12999.00, 11999.00, 'Android 14 (Realme UI 5.0)', 1, 78),
(4, 6, 'Motorola Moto G54 5G', 'motorola-moto-g54-5g', 'moto-g54.jpg', '2023-09-06', 15999.00, 13999.00, 'Android 14', 1, 82),
(5, 10, 'iQOO Z9x 5G', 'iqoo-z9x-5g', 'iqoo-z9x.jpg', '2024-05-21', 14999.00, 12999.00, 'Android 14 (Funtouch 14)', 1, 76),

-- 15k - 20k
(6, 6, 'Motorola Moto G85 5G', 'motorola-moto-g85-5g', 'moto-g85.jpg', '2024-07-10', 18999.00, 17999.00, 'Android 14 (Hello UI)', 1, 88),
(7, 7, 'Vivo T3 5G', 'vivo-t3-5g', 'vivo-t3.jpg', '2024-03-21', 20999.00, 19999.00, 'Android 14 (Funtouch 14)', 1, 85),
(8, 8, 'Realme Narzo 70 Pro 5G', 'realme-narzo-70-pro-5g', 'realme-narzo-70-pro.jpg', '2024-03-19', 19999.00, 18999.00, 'Android 14 (Realme UI 5.0)', 1, 80),
(9, 2, 'Samsung Galaxy A15 5G', 'samsung-galaxy-a15-5g', 'samsung-a15.jpg', '2024-01-05', 19499.00, 17999.00, 'Android 14 (One UI 6)', 1, 75),

-- 20k - 30k
(10, 9, 'Nothing Phone (2a)', 'nothing-phone-2a', 'nothing-phone-2a.jpg', '2024-03-05', 25999.00, 23999.00, 'Android 14 (Nothing OS 2.5)', 1, 93),
(11, 3, 'OnePlus Nord CE 4 5G', 'oneplus-nord-ce-4-5g', 'oneplus-nord-ce-4.jpg', '2024-04-01', 26999.00, 24999.00, 'Android 14 (OxygenOS 14)', 1, 90),
(12, 4, 'Poco F6 5G', 'poco-f6-5g', 'poco-f6.jpg', '2024-05-23', 31999.00, 29999.00, 'Android 14 (HyperOS)', 1, 92),
(13, 8, 'Realme GT 6T 5G', 'realme-gt-6t-5g', 'realme-gt-6t.jpg', '2024-05-22', 32999.00, 30999.00, 'Android 14 (Realme UI 5.0)', 1, 89),
(14, 2, 'Samsung Galaxy M55 5G', 'samsung-galaxy-m55-5g', 'samsung-m55.jpg', '2024-04-08', 29999.00, 26999.00, 'Android 14 (One UI 6.1)', 1, 79),

-- 30k - 50k
(15, 3, 'OnePlus Nord 4 5G', 'oneplus-nord-4-5g', 'oneplus-nord-4.jpg', '2024-07-16', 32999.00, 29999.00, 'Android 14 (OxygenOS 14.1)', 1, 91),
(16, 6, 'Motorola Edge 50 Pro 5G', 'motorola-edge-50-pro-5g', 'moto-edge-50-pro.jpg', '2024-04-03', 35999.00, 31999.00, 'Android 14 (Hello UI)', 1, 87),
(17, 3, 'OnePlus 12R 5G', 'oneplus-12r-5g', 'oneplus-12r.jpg', '2024-01-23', 42999.00, 39999.00, 'Android 14 (OxygenOS 14)', 1, 94),
(18, 5, 'Google Pixel 8a', 'google-pixel-8a', 'pixel-8a.jpg', '2024-05-07', 52999.00, 49999.00, 'Android 14', 1, 89),
(19, 2, 'Samsung Galaxy A55 5G', 'samsung-galaxy-a55-5g', 'samsung-a55.jpg', '2024-03-11', 42999.00, 39999.00, 'Android 14 (One UI 6.1)', 1, 84),
(20, 7, 'Vivo V30 Pro 5G', 'vivo-v30-pro-5g', 'vivo-v30-pro.jpg', '2024-02-28', 44999.00, 41999.00, 'Android 14 (Funtouch 14)', 1, 86),

-- 50k - 100k+
(21, 1, 'Apple iPhone 15', 'apple-iphone-15', 'iphone-15.jpg', '2023-09-12', 79900.00, 69900.00, 'iOS 17', 1, 95),
(22, 1, 'Apple iPhone 16 Pro Max', 'apple-iphone-16-pro-max', 'iphone-16-pro-max.jpg', '2024-09-09', 159900.00, 159900.00, 'iOS 18', 1, 98),
(23, 2, 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'samsung-s24-ultra.jpg', '2024-01-17', 134999.00, 129999.00, 'Android 14 (One UI 6.1.1)', 1, 97),
(24, 2, 'Samsung Galaxy S24', 'samsung-galaxy-s24', 'samsung-s24.jpg', '2024-01-17', 79999.00, 74999.00, 'Android 14 (One UI 6.1)', 1, 88),
(25, 4, 'Xiaomi 14 5G', 'xiaomi-14-5g', 'xiaomi-14.jpg', '2024-03-07', 79999.00, 69999.00, 'Android 14 (HyperOS)', 1, 90),
(26, 5, 'Google Pixel 9 Pro XL', 'google-pixel-9-pro-xl', 'pixel-9-pro-xl.jpg', '2024-08-13', 124999.00, 124999.00, 'Android 14', 1, 92),
(27, 7, 'Vivo X100 Pro 5G', 'vivo-x100-pro-5g', 'vivo-x100-pro.jpg', '2024-01-04', 94999.00, 89999.00, 'Android 14 (Funtouch 14)', 1, 91),
(28, 3, 'OnePlus 12 5G', 'oneplus-12-5g', 'oneplus-12.jpg', '2024-01-23', 69999.00, 64999.00, 'Android 14 (OxygenOS 14)', 1, 93);

-- Insert Specifications
INSERT INTO `specifications` (`smartphone_id`, `processor_name`, `processor_brand`, `ram`, `storage`, `display_size`, `display_type`, `refresh_rate`, `resolution`, `rear_camera`, `rear_camera_mp`, `front_camera`, `front_camera_mp`, `battery_capacity`, `charging_speed`, `weight`, `software_support`, `antutu_score`) VALUES
-- 1: Moto G04s
(1, 'Unisoc T606', 'Unisoc', 4, 64, 6.56, 'IPS LCD', 90, '720 x 1612', '50MP (f/1.8) AI Camera', 50, '5MP', 5, 5000, 15, 178.8, 1, 245000),
-- 2: Poco C65
(2, 'MediaTek Helio G85', 'MediaTek', 6, 128, 6.74, 'IPS LCD', 90, '720 x 1600', '50MP Primary + 2MP Macro', 50, '8MP', 8, 5000, 18, 192.0, 2, 265000),
-- 3: Realme 12x 5G
(3, 'MediaTek Dimensity 6100+', 'MediaTek', 6, 128, 6.72, 'IPS LCD', 120, '1080 x 2400', '50MP AI Main + 2MP Portrait', 50, '8MP', 8, 5000, 45, 188.0, 2, 415000),
-- 4: Moto G54 5G
(4, 'MediaTek Dimensity 7020', 'MediaTek', 8, 128, 6.50, 'IPS LCD', 120, '1080 x 2400', '50MP OIS Quad Pixel + 8MP Ultra-wide', 50, '16MP', 16, 6000, 33, 192.0, 2, 460000),
-- 5: iQOO Z9x 5G
(5, 'Snapdragon 6 Gen 1', 'Qualcomm Snapdragon', 6, 128, 6.72, 'IPS LCD', 120, '1080 x 2408', '50MP Primary + 2MP Depth', 50, '8MP', 8, 6000, 44, 199.0, 2, 560000),
-- 6: Moto G85 5G
(6, 'Snapdragon 6s Gen 3', 'Qualcomm Snapdragon', 8, 128, 6.67, 'Curved 3D pOLED', 120, '1080 x 2400', '50MP Sony LYT-600 OIS + 8MP Ultra-wide', 50, '32MP', 32, 5000, 33, 173.0, 2, 480000),
-- 7: Vivo T3 5G
(7, 'MediaTek Dimensity 7200', 'MediaTek', 8, 128, 6.67, 'AMOLED', 120, '1080 x 2400', '50MP Sony IMX882 OIS + 2MP Bokeh', 50, '16MP', 16, 5000, 44, 185.5, 2, 735000),
-- 8: Realme Narzo 70 Pro 5G
(8, 'MediaTek Dimensity 7050', 'MediaTek', 8, 128, 6.67, 'AMOLED', 120, '1080 x 2400', '50MP Sony IMX890 OIS + 8MP Ultra-wide + 2MP Macro', 50, '16MP', 16, 5000, 67, 195.0, 2, 605000),
-- 9: Samsung Galaxy A15 5G
(9, 'MediaTek Dimensity 6100+', 'MediaTek', 6, 128, 6.50, 'Super AMOLED', 90, '1080 x 2340', '50MP Main + 5MP Ultra-wide + 2MP Macro', 50, '13MP', 13, 5000, 25, 200.0, 4, 420000),
-- 10: Nothing Phone (2a)
(10, 'MediaTek Dimensity 7200 Pro', 'MediaTek', 8, 128, 6.70, 'Flexible AMOLED', 120, '1084 x 2412', '50MP OIS Main + 50MP Ultra-wide', 50, '32MP', 32, 5000, 45, 190.0, 3, 740000),
-- 11: OnePlus Nord CE 4 5G
(11, 'Snapdragon 7 Gen 3', 'Qualcomm Snapdragon', 8, 128, 6.70, 'Fluid AMOLED', 120, '1080 x 2412', '50MP Sony LYT-600 OIS + 8MP Ultra-wide', 50, '16MP', 16, 5500, 100, 186.0, 2, 820000),
-- 12: Poco F6 5G
(12, 'Snapdragon 8s Gen 3', 'Qualcomm Snapdragon', 8, 256, 6.67, 'CrystalRes 1.5K AMOLED', 120, '1220 x 2712', '50MP Sony IMX882 OIS + 8MP Ultra-wide', 50, '20MP', 20, 5000, 90, 179.0, 3, 1530000),
-- 13: Realme GT 6T 5G
(13, 'Snapdragon 7+ Gen 3', 'Qualcomm Snapdragon', 8, 128, 6.78, '8T LTPO AMOLED 6000nits', 120, '1264 x 2780', '50MP Sony LYT-600 OIS + 8MP Ultra-wide', 50, '32MP', 32, 5500, 120, 191.0, 3, 1480000),
-- 14: Samsung Galaxy M55 5G
(14, 'Snapdragon 7 Gen 1', 'Qualcomm Snapdragon', 8, 128, 6.70, 'Super AMOLED+ Plus', 120, '1080 x 2400', '50MP OIS Main + 8MP Ultra-wide + 2MP Macro', 50, '50MP', 50, 5000, 45, 180.0, 4, 660000),
-- 15: OnePlus Nord 4 5G
(15, 'Snapdragon 7+ Gen 3', 'Qualcomm Snapdragon', 8, 128, 6.74, 'Super Fluid AMOLED (Metal Unibody)', 120, '1240 x 2772', '50MP Sony LYT-600 OIS + 8MP Ultra-wide', 50, '16MP', 16, 5500, 100, 199.5, 4, 1420000),
-- 16: Motorola Edge 50 Pro 5G
(16, 'Snapdragon 7 Gen 3', 'Qualcomm Snapdragon', 12, 256, 6.70, '1.5K 3D Curved pOLED', 144, '1220 x 2712', '50MP OIS + 13MP Ultra-wide/Macro + 10MP 3x Telephoto', 50, '50MP Quad Pixel', 50, 4500, 125, 186.0, 3, 850000),
-- 17: OnePlus 12R 5G
(17, 'Snapdragon 8 Gen 2', 'Qualcomm Snapdragon', 8, 128, 6.78, '4th Gen LTPO AMOLED', 120, '1264 x 2780', '50MP Sony IMX890 OIS + 8MP Ultra-wide + 2MP Macro', 50, '16MP', 16, 5500, 100, 207.0, 3, 1520000),
-- 18: Google Pixel 8a
(18, 'Google Tensor G3', 'Google Tensor', 8, 128, 6.10, 'Actua OLED 120Hz', 120, '1080 x 2400', '64MP Quad PD OIS + 13MP Ultra-wide', 64, '13MP Ultra-wide', 13, 4492, 18, 188.0, 7, 1080000),
-- 19: Samsung Galaxy A55 5G
(19, 'Exynos 1480 with AMD Xclipse', 'Samsung Exynos', 8, 128, 6.60, 'Super AMOLED (Metal Frame)', 120, '1080 x 2340', '50MP OIS + 12MP Ultra-wide + 5MP Macro', 50, '32MP', 32, 5000, 25, 213.0, 4, 730000),
-- 20: Vivo V30 Pro 5G
(20, 'MediaTek Dimensity 8200', 'MediaTek', 8, 256, 6.78, '3D Curved AMOLED', 120, '1260 x 2800', '50MP Sony IMX920 OIS + 50MP Telephoto 2x + 50MP Ultra-wide ZEISS', 50, '50MP Group Selfie', 50, 5000, 80, 188.0, 3, 980000),
-- 21: Apple iPhone 15
(21, 'Apple A16 Bionic', 'Apple A-series', 6, 128, 6.10, 'Super Retina XDR OLED Dynamic Island', 60, '1179 x 2556', '48MP 2x Telephoto Sensor-shift OIS + 12MP Ultra-wide', 48, '12MP TrueDepth Autofocus', 12, 3349, 20, 171.0, 5, 1450000),
-- 22: Apple iPhone 16 Pro Max
(22, 'Apple A18 Pro', 'Apple A-series', 8, 256, 6.90, 'Super Retina XDR LTPO ProMotion Titanium', 120, '1320 x 2868', '48MP Fusion OIS + 48MP Ultra-wide + 12MP 5x Telephoto', 48, '12MP TrueDepth Autofocus', 12, 4676, 30, 227.0, 6, 1950000),
-- 23: Samsung Galaxy S24 Ultra
(23, 'Snapdragon 8 Gen 3 for Galaxy', 'Qualcomm Snapdragon', 12, 256, 6.80, 'Dynamic AMOLED 2X Flat LTPO Titanium', 120, '1440 x 3120', '200MP OIS + 50MP 5x Periscope + 10MP 3x Telephoto + 12MP Ultra-wide', 200, '12MP Dual Pixel PDAF', 12, 5000, 45, 232.0, 7, 2100000),
-- 24: Samsung Galaxy S24
(24, 'Exynos 2400', 'Samsung Exynos', 8, 256, 6.20, 'Dynamic AMOLED 2X LTPO', 120, '1080 x 2340', '50MP Dual Pixel OIS + 10MP 3x Telephoto + 12MP Ultra-wide', 50, '12MP Dual Pixel PDAF', 12, 4000, 25, 167.0, 7, 1680000),
-- 25: Xiaomi 14 5G
(25, 'Snapdragon 8 Gen 3', 'Qualcomm Snapdragon', 12, 512, 6.36, 'LTPO AMOLED 1.5K Leica', 120, '1200 x 2670', '50MP Light Hunter 900 OIS + 50MP 3.2x Telephoto + 50MP Ultra-wide', 50, '32MP 4K HDR', 32, 4610, 90, 193.0, 4, 2050000),
-- 26: Google Pixel 9 Pro XL
(26, 'Google Tensor G4', 'Google Tensor', 16, 256, 6.80, 'Super Actua LTPO OLED 3000nits', 120, '1344 x 2992', '50MP Octa PD OIS + 48MP 5x Telephoto + 48MP Quad PD Ultra-wide', 50, '42MP Dual PD with AF', 42, 5060, 37, 221.0, 7, 1350000),
-- 27: Vivo X100 Pro 5G
(27, 'MediaTek Dimensity 9300', 'MediaTek', 16, 512, 6.78, '8T LTPO AMOLED ZEISS APO', 120, '1260 x 2800', '50MP 1-inch Sony IMX989 OIS + 50MP ZEISS APO Telephoto + 50MP Ultra-wide', 50, '32MP', 32, 5400, 100, 225.0, 3, 2150000),
-- 28: OnePlus 12 5G
(28, 'Snapdragon 8 Gen 3', 'Qualcomm Snapdragon', 12, 256, 6.82, '2K ProXDR 120Hz LTPO', 120, '1440 x 3168', '50MP Sony LYT-808 OIS + 64MP 3x Periscope + 48MP Ultra-wide Hasselblad', 50, '32MP Sony IMX615', 32, 5400, 100, 220.0, 4, 2120000);

-- Insert Prices across multiple retailers
INSERT INTO `prices` (`smartphone_id`, `price`, `retailer_name`, `retailer_url`, `source`, `checked_at`) VALUES
(1, 6999.00, 'Flipkart', 'https://www.flipkart.com', 'Online Store Feed', '2024-10-25 10:00:00'),
(1, 7299.00, 'Amazon India', 'https://www.amazon.in', 'Retail API', '2024-10-25 10:00:00'),
(2, 7999.00, 'Amazon India', 'https://www.amazon.in', 'Retail API', '2024-10-26 11:30:00'),
(2, 8299.00, 'Flipkart', 'https://www.flipkart.com', 'Online Store Feed', '2024-10-26 11:30:00'),
(3, 11999.00, 'Flipkart', 'https://www.flipkart.com', 'Official Store', '2024-10-27 09:15:00'),
(4, 13999.00, 'Flipkart', 'https://www.flipkart.com', 'Online Store Feed', '2024-10-27 09:15:00'),
(5, 12999.00, 'Amazon India', 'https://www.amazon.in', 'Retail API', '2024-10-28 14:00:00'),
(6, 17999.00, 'Flipkart', 'https://www.flipkart.com', 'Online Store Feed', '2024-10-28 14:00:00'),
(6, 18499.00, 'Croma', 'https://www.croma.com', 'Partner Feed', '2024-10-28 14:00:00'),
(7, 19999.00, 'Flipkart', 'https://www.flipkart.com', 'Online Store Feed', '2024-10-29 16:45:00'),
(8, 18999.00, 'Amazon India', 'https://www.amazon.in', 'Retail API', '2024-10-29 16:45:00'),
(9, 17999.00, 'Amazon India', 'https://www.amazon.in', 'Retail API', '2024-10-30 08:30:00'),
(10, 23999.00, 'Flipkart', 'https://www.flipkart.com', 'Exclusive Brand Partner', '2024-10-30 08:30:00'),
(10, 24499.00, 'Croma', 'https://www.croma.com', 'Partner Feed', '2024-10-30 08:30:00'),
(11, 24999.00, 'Amazon India', 'https://www.amazon.in', 'Retail API', '2024-10-30 12:00:00'),
(11, 24999.00, 'OnePlus Store', 'https://www.oneplus.in', 'Official Store', '2024-10-30 12:00:00'),
(12, 29999.00, 'Flipkart', 'https://www.flipkart.com', 'Online Store Feed', '2024-10-31 10:20:00'),
(13, 30999.00, 'Amazon India', 'https://www.amazon.in', 'Retail API', '2024-10-31 10:20:00'),
(14, 26999.00, 'Amazon India', 'https://www.amazon.in', 'Retail API', '2024-10-31 15:10:00'),
(15, 29999.00, 'Amazon India', 'https://www.amazon.in', 'Retail API', '2024-10-31 15:10:00'),
(16, 31999.00, 'Flipkart', 'https://www.flipkart.com', 'Online Store Feed', '2024-11-01 09:00:00'),
(17, 39999.00, 'Amazon India', 'https://www.amazon.in', 'Retail API', '2024-11-01 09:00:00'),
(18, 49999.00, 'Flipkart', 'https://www.flipkart.com', 'Official Partner Feed', '2024-11-01 11:30:00'),
(19, 39999.00, 'Samsung Shop', 'https://www.samsung.com', 'Official Store', '2024-11-01 11:30:00'),
(20, 41999.00, 'Flipkart', 'https://www.flipkart.com', 'Online Store Feed', '2024-11-01 14:00:00'),
(21, 69900.00, 'Amazon India', 'https://www.amazon.in', 'Retail API', '2024-11-01 17:00:00'),
(21, 69900.00, 'Flipkart', 'https://www.flipkart.com', 'Online Store Feed', '2024-11-01 17:00:00'),
(22, 159900.00, 'Apple Store', 'https://www.apple.com/in', 'Official Store', '2024-11-02 08:00:00'),
(22, 159900.00, 'Amazon India', 'https://www.amazon.in', 'Retail API', '2024-11-02 08:00:00'),
(23, 129999.00, 'Amazon India', 'https://www.amazon.in', 'Retail API', '2024-11-02 08:00:00'),
(23, 131999.00, 'Samsung Shop', 'https://www.samsung.com', 'Official Store', '2024-11-02 08:00:00'),
(24, 74999.00, 'Samsung Shop', 'https://www.samsung.com', 'Official Store', '2024-11-02 08:00:00'),
(25, 69999.00, 'Amazon India', 'https://www.amazon.in', 'Retail API', '2024-11-02 09:00:00'),
(26, 124999.00, 'Flipkart', 'https://www.flipkart.com', 'Official Partner Feed', '2024-11-02 09:30:00'),
(27, 89999.00, 'Flipkart', 'https://www.flipkart.com', 'Online Store Feed', '2024-11-02 09:30:00'),
(28, 64999.00, 'Amazon India', 'https://www.amazon.in', 'Retail API', '2024-11-02 10:00:00'),
(28, 64999.00, 'OnePlus Store', 'https://www.oneplus.in', 'Official Store', '2024-11-02 10:00:00');

-- Insert Sample Search and Comparison Logs
INSERT INTO `search_logs` (`search_query`, `created_at`) VALUES
('OnePlus 12R', NOW() - INTERVAL 1 HOUR),
('Samsung S24 Ultra', NOW() - INTERVAL 2 HOUR),
('Nothing Phone (2a)', NOW() - INTERVAL 3 HOUR),
('budget 5G phone under 15000', NOW() - INTERVAL 4 HOUR);

INSERT INTO `comparison_logs` (`compared_smartphones`, `created_at`) VALUES
('11,10', NOW() - INTERVAL 2 HOUR),
('21,24', NOW() - INTERVAL 5 HOUR),
('22,23,26', NOW() - INTERVAL 6 HOUR);
