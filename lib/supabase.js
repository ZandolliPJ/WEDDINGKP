// lib/supabase.js
// ─────────────────────────────────────────────────────
// Ce fichier crée la connexion avec Supabase.
// On l'importe partout où on a besoin de la base de données.
// ─────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

// Ces valeurs viennent du fichier .env.local
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Création du client Supabase (la "porte d'entrée" vers la BDD)
export const supabase = createClient(supabaseUrl, supabaseKey)
