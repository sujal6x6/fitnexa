-- Bundle artwork and prices supplied by FITNEXA. Stock starts at zero until actual inventory is confirmed in Admin.
INSERT INTO products (sku, slug, name, category_id, price_paise, short_description, description, features, specifications, stock, is_featured, is_active, seo_title, seo_description)
VALUES
  ('COMBO-FN2005-FN001', 'fitnexa-cardio-combo-fn-2005-fn-001', 'FITNEXA Cardio Combo: FN-2005 Air Bike + FN-001 Treadmill', (SELECT id FROM categories WHERE slug = 'combo'), 2099900,
   'Air bike and manual treadmill with four fitness gifts.', 'A home cardio bundle with the FITNEXA FN-2005 exercise air bike and FN-001 manual treadmill. The package includes a shaker, jumping rope, resistance band and yoga mat.',
   '["FN-2005 exercise air bike","FN-001 manual treadmill","Free gifts: shaker, jumping rope, resistance band and yoga mat","Free Pan-India delivery"]',
   '{"Air bike":"FN-2005","Manual treadmill":"FN-001","Included gifts":"Shaker, jumping rope, resistance band, yoga mat"}', 0, 0, 1,
   'FITNEXA Cardio Combo | FN-2005 + FN-001', 'Shop the FITNEXA FN-2005 air bike and FN-001 manual treadmill combo with four fitness gifts and free Pan-India delivery.'),
  ('COMBO-FN2012BST-FN003', 'fitnexa-cardio-combo-fn-2012bst-fn-003', 'FITNEXA Cardio Combo: FN-2012BST Air Bike + FN-003 Treadmill', (SELECT id FROM categories WHERE slug = 'combo'), 2599900,
   'Air bike with back seat and 3-in-1 manual treadmill.', 'A home cardio bundle with the FITNEXA FN-2012BST exercise air bike with back seat, twister and push-up bar handle, plus the FN-003 manual treadmill with twister, push-up bar and stepper. Includes a shaker, jumping rope, yoga mat and hand gripper.',
   '["FN-2012BST air bike with back seat, twister and push-up bar handle","FN-003 manual treadmill with twister, push-up bar and stepper","Free gifts: shaker, jumping rope, yoga mat and hand gripper","Free Pan-India delivery"]',
   '{"Air bike":"FN-2012BST","Manual treadmill":"FN-003","Included gifts":"Shaker, jumping rope, yoga mat, hand gripper"}', 0, 0, 1,
   'FITNEXA Cardio Combo | FN-2012BST + FN-003', 'Shop the FITNEXA FN-2012BST air bike and FN-003 manual treadmill bundle with four gifts and free Pan-India delivery.'),
  ('COMBO-FN4012BST-FN003', 'fitnexa-fitness-combo-fn-4012bst-fn-003', 'FITNEXA Fitness Combo: FN-4012BST Orbit Bike + FN-003 Treadmill', (SELECT id FROM categories WHERE slug = 'combo'), 2999900,
   'Orbit bike with back seat and 4-in-1 manual treadmill.', 'A home fitness bundle with the FITNEXA FN-4012BST orbit bike and FN-003 manual treadmill. A digital weighing scale is included as a gift.',
   '["FN-4012BST chain-drive orbit bike with back seat, twister and push-up bar","FN-003 manual treadmill with running, twister, push-up bar and stepper functions","Free digital weighing scale","Free Pan-India delivery"]',
   '{"Orbit bike":"FN-4012BST","Manual treadmill":"FN-003","Included gift":"Digital weighing scale"}', 0, 0, 1,
   'FITNEXA Fitness Combo | FN-4012BST + FN-003', 'Shop the FITNEXA FN-4012BST orbit bike and FN-003 manual treadmill combo with free Pan-India delivery.'),
  ('COMBO-FULL-HOME-GYM', 'fitnexa-full-home-gym-setup-combo', 'FITNEXA Full Home Gym Set-Up Combo', (SELECT id FROM categories WHERE slug = 'combo'), 7999900,
   'Five-machine home gym bundle with fitness gifts.', 'A complete home fitness set-up featuring the FN-4012BST orbit bike, FN-3001 multi home gym, FN-2005 air bike, an adjustable bench and the FN-003 manual treadmill. The artwork also includes a 50 kg dumbbell set, yoga mat, gym gloves and shaker as gifts.',
   '["FN-4012BST orbit bike","FN-3001 multi home gym","FN-2005 air bike","Adjustable bench with support","FN-003 manual treadmill","Free gifts: 50 kg dumbbell set, yoga mat, gym gloves and shaker","Free Pan-India delivery"]',
   '{"Orbit bike":"FN-4012BST","Multi home gym":"FN-3001","Air bike":"FN-2005","Manual treadmill":"FN-003","Included gifts":"50 kg dumbbell set, yoga mat, gym gloves, shaker"}', 0, 0, 1,
   'FITNEXA Full Home Gym Set-Up Combo', 'Build a home gym with FITNEXA orbit bike, multi home gym, air bike, bench and treadmill, plus fitness gifts and free Pan-India delivery.')
ON CONFLICT(sku) DO NOTHING;

INSERT INTO product_images (product_id, url, alt, position)
SELECT p.id, v.url, v.alt, 0
FROM (SELECT 'COMBO-FN2005-FN001' AS sku, '/products/combo-cardio-fn-2005-fn-001.webp' AS url, 'FITNEXA FN-2005 air bike and FN-001 treadmill cardio combo' AS alt
      UNION ALL SELECT 'COMBO-FN2012BST-FN003', '/products/combo-cardio-fn-2012bst-fn-003.webp', 'FITNEXA FN-2012BST air bike and FN-003 treadmill cardio combo'
      UNION ALL SELECT 'COMBO-FN4012BST-FN003', '/products/combo-fitness-fn-4012bst-fn-003.webp', 'FITNEXA FN-4012BST orbit bike and FN-003 treadmill fitness combo'
      UNION ALL SELECT 'COMBO-FULL-HOME-GYM', '/products/combo-full-home-gym.webp', 'FITNEXA full home gym set-up combo') v
JOIN products p ON p.sku = v.sku
WHERE NOT EXISTS (SELECT 1 FROM product_images i WHERE i.product_id = p.id AND i.url = v.url);
