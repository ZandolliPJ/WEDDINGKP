# 🌺 Guide Déploiement Complet — Katty & Pascal
## GitHub + Vercel + Sous-domaine OVH
### Pour débutants — Étape par étape

---

> ⏱️ **Durée totale estimée : 45 minutes**
> 💻 **Niveau requis : aucun** — chaque clic est expliqué
> 💰 **Coût : 0 € (Vercel gratuit) + votre domaine OVH existant**

---

## 📋 CE QU'ON VA FAIRE

```
Votre ordinateur  →  GitHub  →  Vercel  →  Internet
                                    ↕
                              Sous-domaine OVH
                         mariage.votre-domaine.fr
```

**À la fin vous aurez :**
- 🌺 Page invités : `https://mariage.votre-domaine.fr/bienvenue`
- 🔒 Admin : `https://mariage.votre-domaine.fr/admin/login`

---

## 🔵 ÉTAPE 1 — Installer les outils sur votre PC
*(5 minutes)*

### 1.1 — Installer Node.js

1. Ouvrez votre navigateur et allez sur : **https://nodejs.org**
2. Cliquez sur le gros bouton vert **"LTS"** (ex: "20.x.x LTS")
3. Un fichier `.msi` se télécharge → double-cliquez dessus
4. Cliquez **"Next"** jusqu'à la fin → **"Install"** → **"Finish"**

✅ **Vérification** : Ouvrez le menu Démarrer → tapez `cmd` → ouvrez l'invite de commandes → tapez :
```
node --version
```
Vous devez voir quelque chose comme `v20.11.0` ✅

---

### 1.2 — Installer Git

1. Allez sur : **https://git-scm.com/download/win**
2. Le téléchargement démarre automatiquement
3. Double-cliquez sur le fichier téléchargé
4. Cliquez **"Next"** à chaque écran sans rien changer → **"Install"** → **"Finish"**

✅ **Vérification** : Dans l'invite de commandes, tapez :
```
git --version
```
Vous devez voir `git version 2.x.x` ✅

---

## 🟢 ÉTAPE 2 — Créer votre base de données Supabase
*(10 minutes)*

### 2.1 — Créer un compte Supabase

1. Allez sur : **https://supabase.com**
2. Cliquez **"Start your project"** (bouton vert en haut à droite)
3. Cliquez **"Continue with GitHub"** ou **"Sign up"** avec votre email
4. Confirmez votre email si demandé

---

### 2.2 — Créer le projet

1. Vous êtes sur le tableau de bord Supabase
2. Cliquez **"New Project"**
3. Remplissez :
   - **Name** : `wedding-katty-pascal`
   - **Database Password** : inventez un mot de passe fort (notez-le !)
   - **Region** : choisissez **"West EU (Ireland)"**
4. Cliquez **"Create new project"**
5. ⏳ Attendez 2 minutes (barre de chargement en haut)

---

### 2.3 — Créer les tables de la base de données

1. Dans le menu de gauche, cliquez **"SQL Editor"** (icône </> )
2. Cliquez **"New query"**
3. Ouvrez le fichier `supabase-schema.sql` depuis votre ZIP avec Bloc-Notes
4. Sélectionnez TOUT le texte (Ctrl+A) → Copiez (Ctrl+C)
5. Collez dans l'éditeur SQL (Ctrl+V)
6. Cliquez le bouton **"Run"** (triangle vert ▶ en bas à droite)
7. Vous devez voir en bas : **`Tables créées avec succès ✅`**

---

### 2.4 — Récupérer vos clés API Supabase

1. Dans le menu de gauche, cliquez **"Settings"** (icône ⚙️ en bas)
2. Puis cliquez **"API"**
3. Vous voyez deux informations importantes — **NOTEZ-LES** :

```
Project URL    →  https://abcdefghij.supabase.co
                  (copiez cette URL complète)

anon public    →  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                  (cliquez "Copy" à droite de cette longue clé)
```

> 💡 **Astuce** : Collez ces deux valeurs dans un fichier Bloc-Notes pour les retrouver facilement.

---

## 🟡 ÉTAPE 3 — Configurer votre projet
*(5 minutes)*

### 3.1 — Extraire le ZIP

1. Localisez le fichier `wedding-planner-katty-pascal.zip` que vous avez téléchargé
2. Clic droit → **"Extraire tout"** → choisissez un emplacement facile (ex: `C:\Mes Sites\`)
3. Vous obtenez un dossier `wedding-planner`

---

### 3.2 — Modifier le fichier .env.local

1. Ouvrez le dossier `wedding-planner`
2. Trouvez le fichier **`.env.local`**
   > ⚠️ Si vous ne le voyez pas : dans l'explorateur Windows, allez dans **Affichage → Options → Afficher les fichiers cachés**
3. Clic droit sur `.env.local` → **"Ouvrir avec"** → **"Bloc-notes"**
4. Remplacez les valeurs :

```
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE_URL.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=VOTRE_CLE_ANON_ICI
ADMIN_PASSWORD=UnMotDePasseSecretPourAdmin2026!
SESSION_SECRET=allez-sur-generate-secret-vercel-app-32
```

5. Pour **SESSION_SECRET** : allez sur **https://generate-secret.vercel.app/32**
   → copiez la valeur générée → collez-la

6. Sauvegardez : **Fichier → Enregistrer** (Ctrl+S)

---

### 3.3 — Tester en local (optionnel mais recommandé)

1. Ouvrez l'invite de commandes (menu Démarrer → `cmd`)
2. Tapez ces commandes une par une :

```bash
cd C:\Mes Sites\wedding-planner
npm install
npm run dev
```

3. ⏳ Attendez 1-2 minutes (téléchargement des modules)
4. Ouvrez votre navigateur : **http://localhost:3000/bienvenue**
5. Vous devez voir la page du mariage ✅
6. Pour arrêter : revenez dans l'invite de commandes → appuyez **Ctrl+C**

---

## 🔵 ÉTAPE 4 — Mettre le code sur GitHub
*(10 minutes)*

### 4.1 — Créer un compte GitHub

1. Allez sur : **https://github.com**
2. Cliquez **"Sign up"** (en haut à droite)
3. Remplissez : email, mot de passe, nom d'utilisateur
4. Confirmez votre email
5. Sur la page d'accueil GitHub, cliquez **"Create repository"**

---

### 4.2 — Créer un nouveau dépôt

1. Remplissez le formulaire :
   - **Repository name** : `wedding-katty-pascal`
   - **Visibility** : cochez **"Private"** ← IMPORTANT (pour protéger vos mots de passe !)
   - Laissez tout le reste par défaut
2. Cliquez **"Create repository"**
3. GitHub affiche une page avec des instructions → **ne fermez pas cette page**

---

### 4.3 — Protéger les fichiers secrets avant d'envoyer

> ⚠️ TRÈS IMPORTANT : On ne doit JAMAIS envoyer le fichier `.env.local` sur GitHub car il contient vos mots de passe !

1. Ouvrez le dossier `wedding-planner`
2. Vérifiez que le fichier **`.gitignore`** existe (il est déjà configuré pour protéger `.env.local`)
3. Si vous ne voyez pas `.gitignore`, créez-le avec Bloc-Notes et ajoutez :
```
.env.local
node_modules/
.next/
```

---

### 4.4 — Envoyer le code sur GitHub

1. Ouvrez l'invite de commandes
2. Tapez ces commandes **une par une** (remplacez `VOTRE_PSEUDO` par votre nom GitHub) :

```bash
cd C:\Mes Sites\wedding-planner
git init
git add .
git commit -m "Wedding Planner Katty et Pascal"
git branch -M main
git remote add origin https://github.com/VOTRE_PSEUDO/wedding-katty-pascal.git
git push -u origin main
```

3. Git va demander vos identifiants GitHub → entrez votre email + mot de passe
   > 💡 Si une fenêtre de connexion Windows s'ouvre, cliquez "Se connecter avec le navigateur"

4. ✅ Vos fichiers sont maintenant sur GitHub !

**Vérification** : Retournez sur GitHub → votre page `wedding-katty-pascal` → vous devez voir tous vos fichiers.

---

## 🟠 ÉTAPE 5 — Déployer sur Vercel
*(10 minutes)*

### 5.1 — Créer un compte Vercel

1. Allez sur : **https://vercel.com**
2. Cliquez **"Sign Up"**
3. Cliquez **"Continue with GitHub"** → autorisez Vercel à accéder à GitHub
4. Vous êtes maintenant sur le tableau de bord Vercel

---

### 5.2 — Importer votre projet

1. Cliquez **"Add New..."** puis **"Project"**
2. Vous voyez la liste de vos dépôts GitHub
3. En face de **`wedding-katty-pascal`**, cliquez **"Import"**

---

### 5.3 — Configurer les variables d'environnement

> ⚠️ ÉTAPE CRITIQUE : Sans ces variables, le site ne fonctionnera pas !

1. Sur la page de configuration, déroulez **"Environment Variables"**
2. Ajoutez ces 4 variables **une par une** :

| Nom (Name) | Valeur (Value) |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Votre URL Supabase (ex: https://abc.supabase.co) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Votre longue clé anon Supabase |
| `ADMIN_PASSWORD` | Le mot de passe admin que vous avez choisi |
| `SESSION_SECRET` | La valeur générée sur generate-secret.vercel.app |

Pour chaque variable :
   - Tapez le **Nom** dans le premier champ
   - Tapez la **Valeur** dans le deuxième champ
   - Cliquez **"Add"**

3. Vérifiez que les 4 variables sont bien listées

---

### 5.4 — Lancer le déploiement

1. Cliquez **"Deploy"** (gros bouton bleu)
2. ⏳ Attendez 2-3 minutes (vous voyez les logs en direct)
3. 🎉 Vercel affiche **"Congratulations!"** avec des confettis

Votre site est maintenant accessible à l'adresse :
```
https://wedding-katty-pascal.vercel.app
```

✅ **Testez** :
- Page invités : `https://wedding-katty-pascal.vercel.app/bienvenue`
- Admin : `https://wedding-katty-pascal.vercel.app/admin/login`

---

## 🔴 ÉTAPE 6 — Configurer le sous-domaine OVH
*(10 minutes)*

> 🎯 **Objectif** : Transformer `wedding-katty-pascal.vercel.app` en `mariage.votre-domaine.fr`

---

### 6.1 — Ajouter votre domaine sur Vercel

1. Sur Vercel, cliquez sur votre projet `wedding-katty-pascal`
2. Cliquez sur l'onglet **"Settings"**
3. Dans le menu de gauche, cliquez **"Domains"**
4. Dans le champ, tapez votre sous-domaine :
   ```
   mariage.votre-domaine.fr
   ```
   (remplacez `votre-domaine.fr` par votre vrai domaine OVH)
5. Cliquez **"Add"**

6. Vercel affiche une erreur rouge — **c'est normal !** Il faut configurer OVH.
7. **Notez bien** l'information affichée, qui ressemble à :
   ```
   Type   : CNAME
   Name   : mariage
   Value  : cname.vercel-dns.com
   ```

---

### 6.2 — Se connecter à l'espace client OVH

1. Allez sur : **https://www.ovh.com/manager/**
2. Connectez-vous avec vos identifiants OVH
3. Dans le menu, cherchez **"Web Cloud"** ou **"Noms de domaine"**
4. Cliquez sur votre nom de domaine (ex: `votre-domaine.fr`)

---

### 6.3 — Ajouter l'entrée DNS dans OVH

1. Cliquez sur l'onglet **"Zone DNS"**
2. Cliquez le bouton **"Ajouter une entrée"**
3. Choisissez le type **"CNAME"**
4. Remplissez le formulaire :

   ```
   Sous-domaine   →  mariage
   (laissez le domaine principal tel quel)

   Cible          →  cname.vercel-dns.com.
   (avec le point à la fin !)

   TTL            →  3600 (ou laissez par défaut)
   ```

5. Cliquez **"Suivant"** puis **"Confirmer"**

---

### 6.4 — Attendre la propagation DNS

> ⏳ **Patience requise : 15 minutes à 24 heures**
> (généralement 15-30 minutes chez OVH)

**Comment vérifier que c'est bon :**
1. Allez sur : **https://dnschecker.org**
2. Tapez `mariage.votre-domaine.fr`
3. Sélectionnez type **"CNAME"**
4. Cliquez **"Search"**
5. Quand vous voyez des coches vertes ✅ partout → c'est propagé !

---

### 6.5 — Vérifier sur Vercel

1. Retournez sur Vercel → votre projet → **Settings → Domains**
2. L'erreur rouge doit avoir disparu
3. Vous verrez **✅ Valid Configuration** en vert

🎉 **Votre site est maintenant accessible sur :**
```
https://mariage.votre-domaine.fr/bienvenue
https://mariage.votre-domaine.fr/admin/login
```

---

## 🔄 ÉTAPE 7 — Mettre à jour le site après une modification
*(2 minutes à chaque fois)*

Après avoir modifié des fichiers dans le dossier `wedding-planner` :

```bash
cd C:\Mes Sites\wedding-planner
git add .
git commit -m "Description de ma modification"
git push
```

✅ Vercel détecte automatiquement le push GitHub et redéploie en ~2 minutes !

---

## ❓ PROBLÈMES FRÉQUENTS & SOLUTIONS

### ❌ "npm: command not found"
→ Node.js n'est pas installé correctement → refaites l'étape 1.1

### ❌ "git: command not found"
→ Git n'est pas installé → refaites l'étape 1.2

### ❌ "Authentication failed" lors du git push
→ Allez sur GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic) → Generate new token → cochez "repo" → utilisez ce token comme mot de passe

### ❌ Le site s'affiche mais les données ne se sauvegardent pas
→ Vos variables Supabase sont incorrectes sur Vercel → vérifiez Settings → Environment Variables

### ❌ "Build failed" sur Vercel
→ Cliquez sur le déploiement échoué → lisez les logs rouges → cherchez la ligne d'erreur → contactez le support

### ❌ Le sous-domaine OVH ne fonctionne pas après 24h
→ Vérifiez que vous avez bien mis le point final après `cname.vercel-dns.com.`
→ Vérifiez sur https://dnschecker.org

### ❌ Vercel affiche "Invalid Configuration" pour le domaine
→ Attendez encore, la propagation DNS peut prendre jusqu'à 48h

---

## 📱 RÉSUMÉ RAPIDE

```
ÉTAPE 1  →  Installer Node.js + Git sur votre PC
ÉTAPE 2  →  Créer base de données sur supabase.com
ÉTAPE 3  →  Configurer .env.local avec vos clés
ÉTAPE 4  →  Envoyer le code sur github.com (dépôt privé)
ÉTAPE 5  →  Déployer sur vercel.com (connecté à GitHub)
ÉTAPE 6  →  Ajouter entrée CNAME dans OVH
ÉTAPE 7  →  Pour les mises à jour : git add . && git commit && git push
```

---

## 🆘 BESOIN D'AIDE ?

Si vous êtes bloqué à une étape :
1. Notez le message d'erreur exact (faites une capture d'écran)
2. L'erreur est souvent très descriptive et indique exactement quoi faire

**Ressources utiles :**
- Documentation Vercel FR : https://vercel.com/docs
- Support OVH : https://help.ovhcloud.com/fr/
- Vérificateur DNS : https://dnschecker.org

---

*Guide créé pour Katty & Pascal — Balade Tropicale 2026 🌺*
