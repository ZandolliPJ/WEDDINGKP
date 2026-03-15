# 🌺 Wedding Planner — Katty & Pascal
## Balade Tropicale — Next.js + Supabase

---

## ✅ ÉTAPE 1 — Installer Node.js

👉 Allez sur **https://nodejs.org** → téléchargez la version **LTS**

Vérifiez dans le terminal :
```bash
node --version   # doit afficher v18 ou plus
```

---

## ✅ ÉTAPE 2 — Installer les dépendances du projet

Ouvrez un terminal **dans le dossier du projet** et tapez :

```bash
npm install
```

⏳ Attendez que tout s'installe (1-2 minutes)

---

## ✅ ÉTAPE 3 — Configurer Supabase (base de données gratuite)

### 3.1 — Créer un compte
👉 Allez sur **https://supabase.com** → cliquez **"Start for free"**

### 3.2 — Créer un projet
- Cliquez **"New project"**
- Donnez un nom : `wedding-katty-pascal`
- Choisissez un mot de passe (notez-le)
- Choisissez la région : **West EU (Paris)**
- Cliquez **"Create new project"** (attendez ~1 minute)

### 3.3 — Récupérer les clés API
- Dans le menu gauche : **Settings** → **API**
- Copiez :
  - **Project URL** (ressemble à `https://xxxx.supabase.co`)
  - **anon public** key (longue chaîne de caractères)

### 3.4 — Coller les clés dans .env.local
Ouvrez le fichier `.env.local` et remplacez :
```
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=VOTRE_CLE_ANON_ICI
```

### 3.5 — Créer les tables dans Supabase
- Dans Supabase, cliquez **SQL Editor** dans le menu gauche
- Cliquez **New query**
- Ouvrez le fichier `supabase-schema.sql` de ce projet
- Copiez-collez tout le contenu dans l'éditeur
- Cliquez le bouton vert **Run**
- Vous devriez voir : `Tables créées : 11`  ✅

---

## ✅ ÉTAPE 4 — Lancer l'application

```bash
npm run dev
```

👉 Ouvrez votre navigateur sur **http://localhost:3000**

🎉 **Votre Wedding Planner est en ligne !**

---

## 📂 Structure du projet

```
wedding-planner-katty-pascal/
├── app/
│   ├── api/
│   │   ├── guests/route.js       ← API invités (Supabase)
│   │   ├── invitations/route.js  ← API invitations
│   │   └── checkin/route.js      ← API check-in
│   ├── globals.css               ← Styles globaux
│   ├── layout.js                 ← Squelette HTML
│   └── page.js                   ← Page principale
├── components/
│   ├── tabs/
│   │   ├── Dashboard.js          ← Statistiques
│   │   ├── Tables.js             ← Plan de tables + QR
│   │   ├── Guests.js             ← Gestion invités
│   │   ├── Invitations.js        ← Faire-part
│   │   └── Checkin.js            ← Check-in jour J
│   ├── Header.js
│   ├── Navigation.js
│   ├── QRCodeDisplay.js
│   ├── StatCard.js
│   └── LoadingSpinner.js
├── lib/
│   ├── supabase.js               ← Connexion Supabase
│   └── data.js                   ← Données des tables
├── public/
│   └── background.png            ← Image Balade Tropicale
├── .env.local                    ← 🔑 Vos clés Supabase (à remplir)
├── supabase-schema.sql           ← Script SQL à exécuter
└── README.md                     ← Ce fichier
```

---

## 🚀 Déployer en ligne (optionnel)

Pour mettre votre site accessible à tous gratuitement :

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel
```

Ajoutez vos variables d'environnement sur vercel.com dans les settings du projet.

---

## 🆘 Problèmes fréquents

| Problème | Solution |
|---|---|
| `node: command not found` | Réinstallez Node.js depuis nodejs.org |
| `Cannot find module` | Relancez `npm install` |
| Page blanche avec erreur Supabase | Vérifiez le fichier `.env.local` |
| QR Code ne s'affiche pas | Rechargez la page (Ctrl+R) |

---

*🌺 Avec amour pour Katty & Pascal — Balade Tropicale 2026*
