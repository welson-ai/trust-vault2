-- Gig Categories
CREATE TYPE gig_category AS ENUM ('Design', 'Dev', 'Writing', 'Marketing', 'Video', 'Music', 'Business');

-- Package Tiers
CREATE TYPE package_tier AS ENUM ('Basic', 'Standard', 'Premium');

-- Order Status
CREATE TYPE order_status AS ENUM ('pending', 'in_progress', 'submitted', 'completed', 'disputed', 'cancelled');

-- Escrow Status
CREATE TYPE escrow_status AS ENUM ('held', 'released', 'refunded', 'disputed');

-- Gig Status
CREATE TYPE gig_status AS ENUM ('active', 'paused', 'deleted');

-- Seller Profiles Table
CREATE TABLE seller_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  completed_jobs INTEGER DEFAULT 0,
  description TEXT,
  response_time INTEGER, -- in hours
  languages TEXT[], -- array of language strings
  skills TEXT[], -- array of skill strings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gig Packages Table
CREATE TABLE gig_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  tier package_tier NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  delivery_days INTEGER NOT NULL CHECK (delivery_days > 0),
  revisions INTEGER NOT NULL CHECK (revisions >= 0),
  features TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(gig_id, tier)
);

-- Gigs Table
CREATE TABLE gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category gig_category NOT NULL,
  seller_id UUID REFERENCES seller_profiles(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  gallery TEXT[] DEFAULT '{}', -- URLs to images/samples
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  status gig_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  package_id UUID REFERENCES gig_packages(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES seller_profiles(id) ON DELETE CASCADE,
  status order_status DEFAULT 'pending',
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'USD',
  requirements TEXT,
  deliverables TEXT[] DEFAULT '{}',
  delivery_date TIMESTAMP WITH TIME ZONE,
  actual_delivery_date TIMESTAMP WITH TIME ZONE,
  buyer_approved_at TIMESTAMP WITH TIME ZONE,
  disputed_at TIMESTAMP WITH TIME ZONE,
  dispute_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Escrow Table
CREATE TABLE escrows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'USD',
  status escrow_status DEFAULT 'held',
  held_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  released_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  disputed_at TIMESTAMP WITH TIME ZONE,
  dispute_resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  gig_id UUID REFERENCES gigs(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES seller_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id) -- One review per order
);

-- Indexes for performance
CREATE INDEX idx_gigs_seller_id ON gigs(seller_id);
CREATE INDEX idx_gigs_category ON gigs(category);
CREATE INDEX idx_gigs_status ON gigs(status);
CREATE INDEX idx_gigs_rating ON gigs(rating DESC);
CREATE INDEX idx_gigs_created_at ON gigs(created_at DESC);

CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX idx_escrows_order_id ON escrows(order_id);
CREATE INDEX idx_escrows_status ON escrows(status);

CREATE INDEX idx_reviews_gig_id ON reviews(gig_id);
CREATE INDEX idx_reviews_seller_id ON reviews(seller_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- RLS Policies
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gig_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Seller Profiles Policies
CREATE POLICY "Users can view all seller profiles" ON seller_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own seller profile" ON seller_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own seller profile" ON seller_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Gigs Policies
CREATE POLICY "Anyone can view active gigs" ON gigs FOR SELECT USING (status = 'active');
CREATE POLICY "Sellers can manage own gigs" ON gigs FOR ALL USING (auth.uid() = (SELECT user_id FROM seller_profiles WHERE id = seller_id));

-- Gig Packages Policies
CREATE POLICY "Anyone can view gig packages for active gigs" ON gig_packages FOR SELECT USING (
  EXISTS (SELECT 1 FROM gigs WHERE gigs.id = gig_packages.gig_id AND gigs.status = 'active')
);
CREATE POLICY "Sellers can manage packages for own gigs" ON gig_packages FOR ALL USING (
  auth.uid() = (SELECT user_id FROM seller_profiles WHERE id = (SELECT seller_id FROM gigs WHERE gigs.id = gig_packages.gig_id))
);

-- Orders Policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = (SELECT user_id FROM seller_profiles WHERE id = seller_id));
CREATE POLICY "Buyers can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = (SELECT user_id FROM seller_profiles WHERE id = seller_id));

-- Escrows Policies
CREATE POLICY "Users can view own escrows" ON escrows FOR SELECT USING (
  auth.uid() = (SELECT buyer_id FROM orders WHERE orders.id = order_id) OR 
  auth.uid() = (SELECT user_id FROM seller_profiles WHERE id = (SELECT seller_id FROM orders WHERE orders.id = order_id))
);
CREATE POLICY "System can manage escrows" ON escrows FOR ALL USING (true); -- Admin function will handle this

-- Reviews Policies
CREATE POLICY "Anyone can view public reviews" ON reviews FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own reviews" ON reviews FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = (SELECT user_id FROM seller_profiles WHERE id = seller_id));
CREATE POLICY "Buyers can create reviews for completed orders" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = buyer_id AND 
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_id AND orders.status = 'completed' AND orders.buyer_id = auth.uid())
);

-- Functions for updating gig statistics
CREATE OR REPLACE FUNCTION update_gig_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE gigs 
    SET order_count = order_count + 1,
        updated_at = NOW()
    WHERE id = NEW.gig_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
      -- Update seller stats
      UPDATE seller_profiles 
      SET completed_jobs = completed_jobs + 1,
          updated_at = NOW()
      WHERE id = NEW.seller_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_gig_stats
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_gig_stats();

-- Function for updating gig rating
CREATE OR REPLACE FUNCTION update_gig_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE gigs 
  SET rating = (
    SELECT COALESCE(AVG(rating), 0) 
    FROM reviews 
    WHERE gig_id = NEW.gig_id AND is_public = true
  ),
  review_count = (
    SELECT COUNT(*) 
    FROM reviews 
    WHERE gig_id = NEW.gig_id AND is_public = true
  ),
  updated_at = NOW()
  WHERE id = NEW.gig_id;
  
  -- Update seller rating
  UPDATE seller_profiles 
  SET rating = (
    SELECT COALESCE(AVG(r.rating), 0)
    FROM reviews r
    JOIN gigs g ON g.id = r.gig_id
    WHERE g.seller_id = NEW.seller_id AND r.is_public = true
  ),
  updated_at = NOW()
  WHERE id = NEW.seller_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_gig_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_gig_rating();
