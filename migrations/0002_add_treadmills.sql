-- Add FITNEXA manual treadmill draft listings.
-- Prices are intentionally 0 and products inactive until real selling prices are confirmed.
INSERT INTO categories (name, slug, description, image_url, position, is_active)
VALUES ('Treadmills', 'treadmills', 'Manual treadmills and compact cardio machines for home workouts.', '/products/fn-001-002-003-treadmills-poster.jpeg', 5, 1)
ON CONFLICT(slug) DO UPDATE SET
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  position = excluded.position,
  is_active = excluded.is_active;

INSERT INTO products (
  sku, slug, name, category_id, price_paise, short_description, description,
  features, specifications, stock, is_featured, is_active, seo_title, seo_description
) VALUES (
  'FN-001',
  'fitnexa-fn-001-manual-treadmill',
  'FITNEXA FN-001 Manual Treadmill',
  (SELECT id FROM categories WHERE slug = 'treadmills'),
  0,
  'Simple, durable manual treadmill for compact home workouts.',
  'The FITNEXA FN-001 is a simple, durable, and space-saving manual treadmill designed for home workouts. It operates without electricity and features an LCD display to track daily workout performance.',
  '["Manual running treadmill","Running surface: 1000 x 340 mm","Maximum user weight: 100 KG (tested)","Product weight: 31 KG","Heavy-duty steel frame","LCD display: Speed, Distance, Time, Scan and Calories","Foldable and space-saving design","Ideal for home use"]',
  '{"Type":"Manual Treadmill","Running Surface":"1000 x 340 mm","Maximum User Weight":"100 KG (Tested)","Product Weight":"31 KG","Frame":"Heavy-Duty Steel Frame","Display":"Speed, Distance, Time, Scan and Calories","Usage":"Home Use"}',
  10,
  0,
  0,
  'FITNEXA FN-001 Manual Treadmill',
  'Simple, durable and foldable manual treadmill for home workouts with LCD display.'
) ON CONFLICT(sku) DO UPDATE SET
  slug = excluded.slug,
  name = excluded.name,
  category_id = excluded.category_id,
  short_description = excluded.short_description,
  description = excluded.description,
  features = excluded.features,
  specifications = excluded.specifications,
  stock = excluded.stock,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now');

INSERT INTO products (
  sku, slug, name, category_id, price_paise, short_description, description,
  features, specifications, stock, is_featured, is_active, seo_title, seo_description
) VALUES (
  'FN-002',
  'fitnexa-fn-002-3-in-1-manual-treadmill',
  'FITNEXA FN-002 3 in 1 Manual Treadmill',
  (SELECT id FROM categories WHERE slug = 'treadmills'),
  0,
  '3 in 1 treadmill with twister and push-up stand for home fitness.',
  'The FITNEXA FN-002 is a multifunctional 3-in-1 fitness machine combining a manual treadmill, twister, and push-up stand. Its sturdy construction and 2-level inclination make it a practical all-in-one solution for home fitness.',
  '["3 in 1: Treadmill + Twister + Push-up Stand","Manual running treadmill","Running surface: 1000 x 340 mm","Maximum user weight: 100 KG (tested)","Product weight: 35 KG","2-level inclination","Heavy-duty steel frame","LCD display: Speed, Distance, Time, Scan and Calories","Foldable and space-saving design","Ideal for home use"]',
  '{"Type":"3 in 1 Manual Treadmill with Twister and Push-up Stand","Running Surface":"1000 x 340 mm","Maximum User Weight":"100 KG (Tested)","Product Weight":"35 KG","Inclination":"2 Level Inclination","Frame":"Heavy-Duty Steel Frame","Display":"Speed, Distance, Time, Scan and Calories","Usage":"Home Use"}',
  10,
  0,
  0,
  'FITNEXA FN-002 3 in 1 Manual Treadmill',
  'Multifunctional 3 in 1 manual treadmill with twister, push-up stand, LCD display and foldable frame.'
) ON CONFLICT(sku) DO UPDATE SET
  slug = excluded.slug,
  name = excluded.name,
  category_id = excluded.category_id,
  short_description = excluded.short_description,
  description = excluded.description,
  features = excluded.features,
  specifications = excluded.specifications,
  stock = excluded.stock,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now');

INSERT INTO products (
  sku, slug, name, category_id, price_paise, short_description, description,
  features, specifications, stock, is_featured, is_active, seo_title, seo_description
) VALUES (
  'FN-003',
  'fitnexa-fn-003-4-in-1-manual-treadmill-deluxe',
  'FITNEXA FN-003 4 in 1 Manual Treadmill Deluxe',
  (SELECT id FROM categories WHERE slug = 'treadmills'),
  0,
  '4 in 1 deluxe treadmill with twister, push-up bar and stepper.',
  'The FITNEXA FN-003 Deluxe is a complete 4-in-1 home fitness solution, combining a manual treadmill, twister, push-up bar, and stepper. Designed for versatile workouts, it allows users to perform cardio and multiple exercises using a single compact fitness machine.',
  '["4 in 1: Treadmill + Twister + Push-up Bar + Stepper","Manual running treadmill","Running surface: 1000 x 340 mm","Maximum user weight: 100 KG (tested)","Product weight: 58 KG","2-level inclination","Heavy-duty steel frame","LCD display: Speed, Distance, Time, Scan and Calories","Foldable and space-saving design","Ideal for home use"]',
  '{"Type":"4 in 1 Manual Treadmill with Twister, Push-up Bar and Stepper","Running Surface":"1000 x 340 mm","Maximum User Weight":"100 KG (Tested)","Product Weight":"58 KG","Inclination":"2 Level Inclination","Frame":"Heavy-Duty Steel Frame","Display":"Speed, Distance, Time, Scan and Calories","Usage":"Home Use"}',
  10,
  0,
  0,
  'FITNEXA FN-003 4 in 1 Manual Treadmill Deluxe',
  'Complete 4 in 1 manual treadmill with twister, push-up bar, stepper, LCD display and foldable frame.'
) ON CONFLICT(sku) DO UPDATE SET
  slug = excluded.slug,
  name = excluded.name,
  category_id = excluded.category_id,
  short_description = excluded.short_description,
  description = excluded.description,
  features = excluded.features,
  specifications = excluded.specifications,
  stock = excluded.stock,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now');

DELETE FROM product_images WHERE product_id IN (
  SELECT id FROM products WHERE sku IN ('FN-001', 'FN-002', 'FN-003')
);

INSERT INTO product_images (product_id, url, alt, position)
SELECT id, '/products/fn-001-manual-treadmill.jpeg', 'FITNEXA FN-001 Manual Treadmill', 0
FROM products WHERE sku = 'FN-001';
INSERT INTO product_images (product_id, url, alt, position)
SELECT id, '/products/fn-001-002-003-treadmills-poster.jpeg', 'FITNEXA manual treadmill specifications poster', 1
FROM products WHERE sku = 'FN-001';

INSERT INTO product_images (product_id, url, alt, position)
SELECT id, '/products/fn-002-3-in-1-manual-treadmill.jpeg', 'FITNEXA FN-002 3 in 1 Manual Treadmill', 0
FROM products WHERE sku = 'FN-002';
INSERT INTO product_images (product_id, url, alt, position)
SELECT id, '/products/fn-001-002-003-treadmills-poster.jpeg', 'FITNEXA manual treadmill specifications poster', 1
FROM products WHERE sku = 'FN-002';

INSERT INTO product_images (product_id, url, alt, position)
SELECT id, '/products/fn-003-4-in-1-manual-treadmill.jpeg', 'FITNEXA FN-003 4 in 1 Manual Treadmill Deluxe', 0
FROM products WHERE sku = 'FN-003';
INSERT INTO product_images (product_id, url, alt, position)
SELECT id, '/products/fn-003-4-in-1-manual-treadmill-side.jpeg', 'FITNEXA FN-003 side view', 1
FROM products WHERE sku = 'FN-003';
INSERT INTO product_images (product_id, url, alt, position)
SELECT id, '/products/fn-001-002-003-treadmills-poster.jpeg', 'FITNEXA manual treadmill specifications poster', 2
FROM products WHERE sku = 'FN-003';
