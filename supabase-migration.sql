-- =====================================================
-- MIGRATION — Ajouter les colonnes manquantes
-- Katty & Pascal · Balade Tropicale
-- =====================================================
-- INSTRUCTIONS :
-- 1. Allez sur https://supabase.com -> votre projet -> SQL Editor
-- 2. Copiez-collez CE fichier et cliquez "Run"
-- 3. Vos données existantes sont CONSERVÉES
-- =====================================================

-- Ajouter 'diet' si elle n'existe pas
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS diet TEXT DEFAULT 'standard'
  CHECK (diet IN ('standard','vegetarien','vegan','halal','casher','allergie'));

-- Ajouter 'diet_notes' si elle n'existe pas
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS diet_notes TEXT;

-- Ajouter 'family_group' si elle n'existe pas
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS family_group TEXT;

-- Ajouter 'friend_group' si elle n'existe pas
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS friend_group TEXT;

-- Ajouter '"group"' si elle n'existe pas
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS "group" TEXT DEFAULT 'autre'
  CHECK ("group" IN ('mariee','marie','famille','amis','collegue','autre'));

-- Ajouter 'arrival_time' si elle n'existe pas
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS arrival_time TEXT;

-- Ajouter 'present' si elle n'existe pas
ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS present BOOLEAN DEFAULT FALSE;

-- Mettre à jour les valeurs NULL existantes
UPDATE guests SET diet         = 'standard' WHERE diet         IS NULL;
UPDATE guests SET present      = FALSE       WHERE present      IS NULL;
UPDATE guests SET "group"      = 'autre'     WHERE "group"      IS NULL;

-- Vérification finale
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'guests'
ORDER BY ordinal_position;

SELECT 'Migration réussie ✅ — ' || COUNT(*) || ' invité(s) existant(s) conservé(s)' AS message
FROM guests;
