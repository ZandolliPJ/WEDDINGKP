-- =====================================================
-- SCRIPT SQL COMPLET — Katty & Pascal · Balade Tropicale
-- =====================================================
-- INSTRUCTIONS :
-- 1. Allez sur https://supabase.com -> votre projet -> SQL Editor
-- 2. Copiez-collez ce fichier entier et cliquez "Run"
-- =====================================================

-- TABLE GUESTS (invités)
CREATE TABLE IF NOT EXISTS guests (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  table_id      INT,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','declined')),
  present       BOOLEAN DEFAULT FALSE,
  arrival_time  TEXT,
  "group"       TEXT DEFAULT 'autre'   CHECK ("group" IN ('mariee','marie','famille','amis','collegue','autre')),
  family_group  TEXT,
  friend_group  TEXT,
  diet          TEXT DEFAULT 'standard' CHECK (diet IN ('standard','vegetarien','vegan','halal','casher','allergie')),
  diet_notes    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE INVITATIONS
CREATE TABLE IF NOT EXISTS invitations (
  id          SERIAL PRIMARY KEY,
  guest_id    TEXT,
  guest_name  TEXT,
  guest_email TEXT,
  sent_at     TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE RSVP (réponses invités depuis /bienvenue)
CREATE TABLE IF NOT EXISTS rsvp (
  id         SERIAL PRIMARY KEY,
  prenom     TEXT,
  nom        TEXT,
  telephone  TEXT,
  presence   TEXT DEFAULT 'oui',
  personnes  INT DEFAULT 1,
  menu       TEXT DEFAULT 'standard',
  message    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PERMISSIONS
ALTER TABLE guests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp        ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "g_all"  ON guests;
DROP POLICY IF EXISTS "i_all"  ON invitations;
DROP POLICY IF EXISTS "rv_all" ON rsvp;

CREATE POLICY "g_all"  ON guests      FOR ALL USING (true);
CREATE POLICY "i_all"  ON invitations FOR ALL USING (true);
CREATE POLICY "rv_all" ON rsvp        FOR ALL USING (true);

-- VERIFICATION
SELECT 'Tables créées avec succès ✅' as message;
