DROP DATABASE If EXISTS bamazon_db;

CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NOT NULL,
  department VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock_qty INT NOT NULL,
  PRIMARY KEY (item_id)
);

INSERT INTO products
(product_name, department, price, stock_qty)
VALUES
("Current Fish Tank 10gal", "Pet Supplies", 15.99, 20),
("Prana XL Yoga Mat", "Sports & Exercise", 49.99, 8),
("Home Bar Kit, 12pc.", "Home Living", 40.00, 3),
("HP All-in-one Officejet Wireless Printer", "Computers & Electronics", 250.00, 10),
("Fancy Jumbo Paperclips, 100ct.", "Office Supplies", 3.99, 967),
("New Balance Impulse Men's Running Shoes", "Sports & Exercise", 159.99, 2),
("Fender Telecaster - Beginner Electric Guitar w/Gig bag", "Musical Instruments", 199.99, 4),
("TempurCloud Pillow by Tempur-Pedic", "Home Living", 149.00, 31),
("Apple iPad 6th Gen 128GB", "Computers & Electronics", 469.00, 6),
("Ibanez Mandolin - f-model two-tone sunburst", "Musical Instruments", 165.00, 1);