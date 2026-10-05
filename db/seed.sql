-- Categories + the 11 launch products. Specs/features are empty on purpose: fill them in from /admin/products.
-- IMPORTANT: stock is a PLACEHOLDER (10 each). Set real stock in the admin before taking real orders.
-- Products without photos are inactive (hidden) until you add photos and switch them on.
INSERT INTO categories (name,slug,description,image_url,position) VALUES ('Air Bikes','air-bikes','Full-body cardio, powered by your effort.','/categories/air.webp',1);
INSERT INTO categories (name,slug,description,image_url,position) VALUES ('Orbit Bikes','orbit-bikes','Smooth, low-impact riding at home.','/categories/orbit.webp',2);
INSERT INTO categories (name,slug,description,image_url,position) VALUES ('Adjustable Benches','adjustable-benches','Strength training, any angle.','/categories/bench.webp',3);
INSERT INTO categories (name,slug,description,image_url,position) VALUES ('Multi Home Gym','multi-home-gym','A complete gym in one footprint.','/categories/hg.webp',4);
INSERT INTO products (sku,slug,name,category_id,price_paise,short_description,stock,is_featured,is_active) VALUES ('FN-2005','fitnexa-fn-2005','FITNEXA FN 2005',(SELECT id FROM categories WHERE slug='air-bikes'),699900,'Air Bike',10,1,1);
INSERT INTO product_images (product_id,url,alt,position) SELECT id,'/products/fn-2005.webp',name,0 FROM products WHERE slug='fitnexa-fn-2005';
INSERT INTO products (sku,slug,name,category_id,price_paise,short_description,stock,is_featured,is_active) VALUES ('FN-2007-BS','fitnexa-fn-2007-bs','FITNEXA FN 2007 BS',(SELECT id FROM categories WHERE slug='air-bikes'),749900,'Air Bike with Back Rest',10,1,1);
INSERT INTO product_images (product_id,url,alt,position) SELECT id,'/products/fn-2007.webp',name,0 FROM products WHERE slug='fitnexa-fn-2007-bs';
INSERT INTO products (sku,slug,name,category_id,price_paise,short_description,stock,is_featured,is_active) VALUES ('FN-2012-BST','fitnexa-fn-2012-bst','FITNEXA FN 2012 BST',(SELECT id FROM categories WHERE slug='air-bikes'),799900,'Air Bike with Back Rest & Twister Plate',10,1,1);
INSERT INTO product_images (product_id,url,alt,position) SELECT id,'/products/fn-2012.webp',name,0 FROM products WHERE slug='fitnexa-fn-2012-bst';
INSERT INTO products (sku,slug,name,category_id,price_paise,short_description,stock,is_featured,is_active) VALUES ('FN-4009','fitnexa-fn-4009','FITNEXA FN 4009',(SELECT id FROM categories WHERE slug='orbit-bikes'),1299900,'Air Walker + Exercise Bike with Adjustable Seat Height',10,1,1);
INSERT INTO product_images (product_id,url,alt,position) SELECT id,'/products/fn-4009.webp',name,0 FROM products WHERE slug='fitnexa-fn-4009';
INSERT INTO products (sku,slug,name,category_id,price_paise,short_description,stock,is_featured,is_active) VALUES ('FN-4010-BS','fitnexa-fn-4010-bs','FITNEXA FN 4010 BS',(SELECT id FROM categories WHERE slug='orbit-bikes'),1399900,NULL,10,1,0);
INSERT INTO products (sku,slug,name,category_id,price_paise,short_description,stock,is_featured,is_active) VALUES ('FN-4012-BST','fitnexa-fn-4012-bst','FITNEXA FN 4012 BST',(SELECT id FROM categories WHERE slug='orbit-bikes'),1499900,'Air Walker + Exercise Bike with Back Seat & Twister',10,1,1);
INSERT INTO product_images (product_id,url,alt,position) SELECT id,'/products/fn-4012.webp',name,0 FROM products WHERE slug='fitnexa-fn-4012-bst';
INSERT INTO products (sku,slug,name,category_id,price_paise,short_description,stock,is_featured,is_active) VALUES ('MB-1000','fitnexa-multi-bench-1000','FITNEXA Multi Bench 1000',(SELECT id FROM categories WHERE slug='adjustable-benches'),799900,'Multi-purpose Adjustable Bench',10,1,1);
INSERT INTO product_images (product_id,url,alt,position) SELECT id,'/products/bench.webp',name,0 FROM products WHERE slug='fitnexa-multi-bench-1000';
INSERT INTO products (sku,slug,name,category_id,price_paise,short_description,stock,is_featured,is_active) VALUES ('AB-1001','fitnexa-adjustable-bench-1001','FITNEXA Adjustable Bench 1001',(SELECT id FROM categories WHERE slug='adjustable-benches'),499900,NULL,10,1,0);
INSERT INTO products (sku,slug,name,category_id,price_paise,short_description,stock,is_featured,is_active) VALUES ('HG-3001','fitnexa-hg-3001','FITNEXA HG 3001',(SELECT id FROM categories WHERE slug='multi-home-gym'),2999900,NULL,10,1,1);
INSERT INTO product_images (product_id,url,alt,position) SELECT id,'/products/hg-3001.webp',name,0 FROM products WHERE slug='fitnexa-hg-3001';
INSERT INTO products (sku,slug,name,category_id,price_paise,short_description,stock,is_featured,is_active) VALUES ('HG-3002','fitnexa-hg-3002','FITNEXA HG 3002',(SELECT id FROM categories WHERE slug='multi-home-gym'),3499800,NULL,10,1,1);
INSERT INTO product_images (product_id,url,alt,position) SELECT id,'/products/hg-3002.webp',name,0 FROM products WHERE slug='fitnexa-hg-3002';
INSERT INTO products (sku,slug,name,category_id,price_paise,short_description,stock,is_featured,is_active) VALUES ('HG-3003','fitnexa-hg-3003','FITNEXA HG 3003',(SELECT id FROM categories WHERE slug='multi-home-gym'),3999900,NULL,10,1,1);
INSERT INTO product_images (product_id,url,alt,position) SELECT id,'/products/hg-3003.webp',name,0 FROM products WHERE slug='fitnexa-hg-3003';
