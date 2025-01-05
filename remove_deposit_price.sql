ALTER TABLE services DROP COLUMN deposit_price;

ALTER TABLE services RENAME COLUMN price TO deposit_price; 