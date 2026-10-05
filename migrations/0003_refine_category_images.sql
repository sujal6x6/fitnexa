-- Use cleaner product-focused images for homepage category cards.
UPDATE categories SET image_url = '/brand/hero-cutout.png' WHERE slug = 'air-bikes';
UPDATE categories SET image_url = '/products/fn-4009.webp' WHERE slug = 'orbit-bikes';
UPDATE categories SET image_url = '/products/bench.webp' WHERE slug = 'adjustable-benches';
UPDATE categories SET image_url = '/products/hg-3003.webp' WHERE slug = 'multi-home-gym';
UPDATE categories SET image_url = '/products/fn-002-3-in-1-manual-treadmill.jpeg' WHERE slug = 'treadmills';
