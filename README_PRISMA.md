# 🗄️ Guide de gestion de la base de données (Prisma)

Ce document regroupe les commandes essentielles pour maintenir et faire évoluer la base de données du projet **Trackr**.

## 🚀 Commandes de base

### Synchroniser le schéma
Met à jour la base de données pour qu'elle corresponde à votre fichier `schema.prisma` (sans générer de fichiers de migration, idéal pour le développement rapide).
```bash
npx prisma db push
```

### Générer le client
À exécuter après chaque modification du schéma pour mettre à jour l'autocomplétion TypeScript.
```bash
npx prisma generate
```

### Exécuter le Seed
Peuple la base de données avec les données initiales (banques système, catégories, admin).
```bash
npx prisma db seed
```

### Ouvrir l'explorateur visuel
Ouvre une interface web (`http://localhost:5555`) pour visualiser et modifier vos données facilement.
```bash
npx prisma studio
```

---

## 🛠️ Maintenance & Introspection

### Récupérer le schéma depuis la DB
Si des changements ont été faits directement sur la base de données (ex: via Neon console), cette commande mettra à jour votre `schema.prisma`.
```bash
npx prisma db pull
```

### Réinitialiser la base de données
**Attention : Supprime toutes les données !** Utile pour repartir de zéro proprement.
```bash
npx prisma migrate reset
```

---

## 📈 Flux de production (Migrations)

Pour la production ou un suivi rigoureux des changements :

1. **Créer une migration** :
   ```bash
   npx prisma migrate dev --name nom_de_la_modification
   ```
2. **Appliquer les migrations en attente** :
   ```bash
   npx prisma migrate deploy
   ```

---

## 💡 Astuce
Si vous ajoutez une nouvelle banque ou catégorie dans `prisma/seed.ts`, il vous suffit de relancer `npx prisma db seed` pour qu'elle soit ajoutée (le script utilise `upsert` pour ne pas créer de doublons).
