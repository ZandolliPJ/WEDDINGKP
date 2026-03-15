# 🌺 Guide Déploiement — Katty & Pascal

## Étape 1 — Prérequis (5 min)
Installez ces outils gratuits :
- **Node.js** : https://nodejs.org (version 18+)
- **Git** : https://git-scm.com

## Étape 2 — Supabase (10 min)
1. Allez sur https://supabase.com → "Start your project"
2. Créez un compte gratuit (Google ou email)
3. Cliquez **"New Project"** → nommez-le `wedding-katty-pascal`
4. Choisissez une région (Europe West)
5. Attendez ~2 minutes que le projet démarre
6. Dans le menu gauche : **SQL Editor** → collez le contenu de `supabase-schema.sql` → cliquez **Run**
7. Dans **Settings → API** : copiez :
   - `Project URL` → c'est votre `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → c'est votre `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Étape 3 — Configuration locale (2 min)
Ouvrez le fichier `.env.local` et remplissez :
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
ADMIN_PASSWORD=VotreMotDePasseSecret!
SESSION_SECRET=une-chaine-aleatoire-longue-32-caracteres
```
> 🔑 Générez SESSION_SECRET sur : https://generate-secret.vercel.app/32

## Étape 4 — Test local (3 min)
```bash
cd wedding-planner
npm install
npm run dev
```
Ouvrez http://localhost:3000 → vous verrez la page invités
Admin : http://localhost:3000/admin/login

## Étape 5 — GitHub (5 min)
1. Créez un compte sur https://github.com
2. Cliquez **"New repository"** → nommez `wedding-katty-pascal`
3. Dans votre terminal :
```bash
cd wedding-planner
git init
git add .
git commit -m "🌺 Wedding Planner Katty & Pascal"
git remote add origin https://github.com/VOTRE_PSEUDO/wedding-katty-pascal.git
git push -u origin main
```

## Étape 6 — Déploiement Vercel (5 min)
1. Allez sur https://vercel.com → Connexion avec votre compte GitHub
2. Cliquez **"New Project"** → importez votre repo `wedding-katty-pascal`
3. Dans **Environment Variables**, ajoutez ces 4 variables :
   | Nom | Valeur |
   |-----|--------|
   | NEXT_PUBLIC_SUPABASE_URL | votre URL Supabase |
   | NEXT_PUBLIC_SUPABASE_ANON_KEY | votre clé anon |
   | ADMIN_PASSWORD | votre mot de passe admin |
   | SESSION_SECRET | votre secret de session |
4. Cliquez **"Deploy"** → attendez ~2 min
5. 🎉 Votre site est en ligne ! Vercel vous donne une URL gratuite type `wedding-katty-pascal.vercel.app`

## Étape 7 — Domaine personnalisé (optionnel, 10 min)
Dans Vercel : **Settings → Domains** → ajoutez votre domaine
- Achetez un domaine sur OVH, Namecheap, ou Google Domains
- Suivez les instructions DNS de Vercel

## URLs finales
- 🌺 **Invités** : https://votre-domaine.vercel.app/bienvenue
- 🔒 **Admin** : https://votre-domaine.vercel.app/admin/login

## Mises à jour
Pour modifier le site :
```bash
# Faites vos modifications
git add .
git commit -m "Mise à jour"
git push
```
Vercel redéploie automatiquement en ~1 minute !

## ❓ Problèmes fréquents
- **"Module not found"** → relancez `npm install`
- **"Supabase error"** → vérifiez vos variables dans `.env.local`
- **"401 Unauthorized"** → vérifiez ADMIN_PASSWORD et SESSION_SECRET
- **Build échoue sur Vercel** → vérifiez que les variables d'environnement sont bien ajoutées
