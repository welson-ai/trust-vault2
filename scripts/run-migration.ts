import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.SUPABASE_POSTGRES_URL || "")

async function runMigration() {
  try {
    console.log("[v0] Starting database migration...")

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        trusted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log("[v0] Created users table")

    // Create contracts table
    await sql`
      CREATE TABLE IF NOT EXISTS contracts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL CHECK (type IN ('freelance', 'chama', 'purchase')),
        contract_type TEXT NOT NULL CHECK (contract_type IN ('one-off', 'milestone')),
        amount DECIMAL(18, 2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        deadline TIMESTAMP,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'completed', 'disputed')),
        created_by UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log("[v0] Created contracts table")

    // Create participants table
    await sql`
      CREATE TABLE IF NOT EXISTS participants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('freelancer', 'client', 'member')),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(contract_id, user_id)
      )
    `
    console.log("[v0] Created participants table")

    // Create milestones table
    await sql`
      CREATE TABLE IF NOT EXISTS milestones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        amount DECIMAL(18, 2) NOT NULL,
        due_date TIMESTAMP,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'disputed')),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log("[v0] Created milestones table")

    // Create payments table
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
        milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
        from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(18, 2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'released', 'disputed', 'refunded')),
        transaction_type TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log("[v0] Created payments table")

    // Create trust_scores table
    await sql`
      CREATE TABLE IF NOT EXISTS trust_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        score DECIMAL(3, 2) DEFAULT 0.00,
        completed_contracts INT DEFAULT 0,
        disputed_contracts INT DEFAULT 0,
        on_time_payment BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
    console.log("[v0] Created trust_scores table")

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_contracts_created_by ON contracts(created_by)`
    await sql`CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_participants_contract ON participants(contract_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_participants_user ON participants(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_payments_contract ON payments(contract_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_payments_from_user ON payments(from_user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_payments_to_user ON payments(to_user_id)`
    console.log("[v0] Created indexes")

    console.log("[v0] Migration completed successfully!")
  } catch (error) {
    console.error("[v0] Migration failed:", error)
    process.exit(1)
  }
}

runMigration()
