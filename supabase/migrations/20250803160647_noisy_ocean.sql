/*
  # Schéma complet pour Osushi - Restaurant de Sushi

  1. Nouvelles Tables
    - `users` - Profils utilisateurs avec système de fidélité
    - `categories` - Catégories de produits (sashimi, nigiri, maki, etc.)
    - `products` - Produits du menu avec prix et informations
    - `product_variants` - Variantes de produits (tailles, options)
    - `orders` - Commandes clients
    - `order_items` - Articles dans les commandes
    - `loyalty_transactions` - Historique des points de fidélité
    - `restaurant_settings` - Paramètres du restaurant

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Politiques d'accès appropriées pour chaque table
    - Authentification requise pour les données sensibles

  3. Fonctionnalités
    - Système de fidélité complet avec niveaux
    - Gestion des commandes en temps réel
    - Variantes de produits
    - Historique des transactions
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  postal_code text NOT NULL DEFAULT '',
  loyalty_points integer NOT NULL DEFAULT 0,
  loyalty_tier text NOT NULL DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  base_price decimal(10,2) NOT NULL,
  image_url text NOT NULL DEFAULT '',
  is_popular boolean NOT NULL DEFAULT false,
  is_available boolean NOT NULL DEFAULT true,
  allergens text[] DEFAULT '{}',
  nutritional_info jsonb DEFAULT '{}',
  preparation_time integer NOT NULL DEFAULT 15,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_modifier decimal(10,2) NOT NULL DEFAULT 0,
  is_default boolean NOT NULL DEFAULT false,
  is_available boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0
);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  order_number text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  order_type text NOT NULL CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
  total_amount decimal(10,2) NOT NULL,
  delivery_fee decimal(10,2) NOT NULL DEFAULT 0,
  loyalty_points_used integer NOT NULL DEFAULT 0,
  loyalty_points_earned integer NOT NULL DEFAULT 0,
  special_instructions text NOT NULL DEFAULT '',
  delivery_address text NOT NULL DEFAULT '',
  scheduled_time timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  special_instructions text NOT NULL DEFAULT ''
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Loyalty transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  points_change integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'expired', 'bonus')),
  description text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Restaurant settings table
CREATE TABLE IF NOT EXISTS restaurant_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Categories policies (public read)
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Products policies (public read)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT TO anon, authenticated
  USING (is_available = true);

-- Product variants policies (public read)
CREATE POLICY "Product variants are viewable by everyone" ON product_variants
  FOR SELECT TO anon, authenticated
  USING (is_available = true);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can create order items" ON order_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
  ));

-- Loyalty transactions policies
CREATE POLICY "Users can view own loyalty transactions" ON loyalty_transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Restaurant settings policies (public read for basic settings)
CREATE POLICY "Restaurant settings are viewable by everyone" ON restaurant_settings
  FOR SELECT TO anon, authenticated
  USING (key IN ('opening_hours', 'delivery_zones', 'contact_info'));

-- Insert sample data

-- Categories
INSERT INTO categories (name, description, image_url, sort_order) VALUES
('Sashimi', 'Tranches de poisson frais sans riz', 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg', 1),
('Nigiri', 'Riz vinaigré surmonté de poisson', 'https://images.pexels.com/photos/2323398/pexels-photo-2323398.jpeg', 2),
('Maki', 'Rouleaux de sushi traditionnels', 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg', 3),
('Uramaki', 'Rouleaux inversés californiens', 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg', 4),
('Bento', 'Plateaux repas complets', 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg', 5),
('Chirashi', 'Bols de riz aux sashimis', 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg', 6);

-- Products
INSERT INTO products (category_id, name, description, base_price, image_url, is_popular, allergens, preparation_time, sort_order) VALUES
-- Sashimi
((SELECT id FROM categories WHERE name = 'Sashimi'), 'Sashimi Saumon', '6 tranches de saumon frais de Norvège', 12.90, 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg', true, '{"poisson"}', 10, 1),
((SELECT id FROM categories WHERE name = 'Sashimi'), 'Sashimi Thon', '6 tranches de thon rouge de qualité', 14.90, 'https://images.pexels.com/photos/2323398/pexels-photo-2323398.jpeg', true, '{"poisson"}', 10, 2),
((SELECT id FROM categories WHERE name = 'Sashimi'), 'Sashimi Dorade', '6 tranches de dorade royale', 13.90, 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg', false, '{"poisson"}', 10, 3),

-- Nigiri
((SELECT id FROM categories WHERE name = 'Nigiri'), 'Nigiri Saumon', 'Riz vinaigré surmonté de saumon frais', 3.80, 'https://images.pexels.com/photos/2323398/pexels-photo-2323398.jpeg', true, '{"poisson", "gluten"}', 5, 1),
((SELECT id FROM categories WHERE name = 'Nigiri'), 'Nigiri Thon', 'Riz vinaigré surmonté de thon rouge', 4.20, 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg', true, '{"poisson", "gluten"}', 5, 2),
((SELECT id FROM categories WHERE name = 'Nigiri'), 'Nigiri Crevette', 'Riz vinaigré surmonté de crevette cuite', 3.50, 'https://images.pexels.com/photos/2323398/pexels-photo-2323398.jpeg', false, '{"crustacés", "gluten"}', 5, 3),

-- Maki
((SELECT id FROM categories WHERE name = 'Maki'), 'Maki Saumon', '6 pièces au saumon frais et avocat', 7.90, 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg', true, '{"poisson", "gluten"}', 8, 1),
((SELECT id FROM categories WHERE name = 'Maki'), 'Maki Thon', '6 pièces au thon rouge et concombre', 8.50, 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg', false, '{"poisson", "gluten"}', 8, 2),
((SELECT id FROM categories WHERE name = 'Maki'), 'Maki Avocat', '6 pièces végétariennes à l''avocat', 6.50, 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg', false, '{"gluten"}', 8, 3),

-- Uramaki
((SELECT id FROM categories WHERE name = 'Uramaki'), 'California Roll', 'Avocat, concombre, surimi, sésame', 8.50, 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg', true, '{"poisson", "gluten", "sésame"}', 12, 1),
((SELECT id FROM categories WHERE name = 'Uramaki'), 'Dragon Roll', 'Anguille, avocat, concombre, sauce teriyaki', 14.50, 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg', true, '{"poisson", "gluten", "soja"}', 15, 2),
((SELECT id FROM categories WHERE name = 'Uramaki'), 'Rainbow Roll', 'Saumon, thon, avocat sur california', 16.90, 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg', true, '{"poisson", "gluten", "sésame"}', 18, 3),

-- Bento
((SELECT id FROM categories WHERE name = 'Bento'), 'Bento Saumon', 'Sushis saumon, salade, riz, accompagnements', 16.90, 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg', true, '{"poisson", "gluten", "soja"}', 20, 1),
((SELECT id FROM categories WHERE name = 'Bento'), 'Bento Mixte', 'Assortiment varié, salade, riz, miso', 18.90, 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg', true, '{"poisson", "gluten", "soja"}', 25, 2),
((SELECT id FROM categories WHERE name = 'Bento'), 'Bento Végétarien', 'Makis légumes, tofu, salade, riz', 14.90, 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg', false, '{"gluten", "soja"}', 20, 3),

-- Chirashi
((SELECT id FROM categories WHERE name = 'Chirashi'), 'Chirashi Saumon', 'Bol de riz avec saumon, avocat, légumes', 16.90, 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg', false, '{"poisson", "gluten", "soja"}', 15, 1),
((SELECT id FROM categories WHERE name = 'Chirashi'), 'Chirashi Mixte', 'Bol de riz avec assortiment de poissons', 19.90, 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg', true, '{"poisson", "gluten", "soja"}', 18, 2);

-- Product variants (sizes and options)
INSERT INTO product_variants (product_id, name, price_modifier, is_default, sort_order) VALUES
-- Sashimi variants
((SELECT id FROM products WHERE name = 'Sashimi Saumon'), 'Standard (6 pièces)', 0.00, true, 1),
((SELECT id FROM products WHERE name = 'Sashimi Saumon'), 'Large (12 pièces)', 12.00, false, 2),
((SELECT id FROM products WHERE name = 'Sashimi Thon'), 'Standard (6 pièces)', 0.00, true, 1),
((SELECT id FROM products WHERE name = 'Sashimi Thon'), 'Large (12 pièces)', 14.00, false, 2),

-- Bento variants
((SELECT id FROM products WHERE name = 'Bento Mixte'), 'Standard', 0.00, true, 1),
((SELECT id FROM products WHERE name = 'Bento Mixte'), 'Premium (+sashimi)', 8.00, false, 2),

-- Maki variants
((SELECT id FROM products WHERE name = 'Maki Saumon'), '6 pièces', 0.00, true, 1),
((SELECT id FROM products WHERE name = 'Maki Saumon'), '12 pièces', 7.50, false, 2);

-- Restaurant settings
INSERT INTO restaurant_settings (key, value) VALUES
('opening_hours', '{
  "monday": {"open": "11:30", "close": "14:30", "evening_open": "18:30", "evening_close": "22:30"},
  "tuesday": {"open": "11:30", "close": "14:30", "evening_open": "18:30", "evening_close": "22:30"},
  "wednesday": {"open": "11:30", "close": "14:30", "evening_open": "18:30", "evening_close": "22:30"},
  "thursday": {"open": "11:30", "close": "14:30", "evening_open": "18:30", "evening_close": "22:30"},
  "friday": {"open": "11:30", "close": "14:30", "evening_open": "18:30", "evening_close": "22:30"},
  "saturday": {"open": "18:30", "close": "23:00"},
  "sunday": {"open": "18:30", "close": "23:00"}
}'),
('delivery_zones', '{
  "zones": [
    {"name": "Zone 1", "radius": 3, "fee": 0, "min_order": 25},
    {"name": "Zone 2", "radius": 5, "fee": 2.50, "min_order": 30}
  ]
}'),
('contact_info', '{
  "phone": "01 23 45 67 89",
  "email": "contact@osushi.fr",
  "address": "123 Rue de la Paix, 75001 Paris"
}');

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurant_settings_updated_at BEFORE UPDATE ON restaurant_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();