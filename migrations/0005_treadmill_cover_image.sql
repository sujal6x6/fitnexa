-- Use the clean treadmill cover image for the public treadmill category and main treadmill listing.
UPDATE categories
SET image_url = '/products/treadmill-front-fitnexa.png'
WHERE slug = 'treadmills';

UPDATE products
SET is_active = 1,
    stock = CASE WHEN stock < 1 THEN 10 ELSE stock END,
    updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE sku IN ('FN-001', 'FN-002', 'FN-003');

UPDATE product_images
SET url = '/products/treadmill-front-fitnexa.png',
    alt = 'FITNEXA treadmill cover image'
WHERE position = 0
  AND product_id IN (SELECT id FROM products WHERE sku IN ('FN-001', 'FN-002', 'FN-003'));
