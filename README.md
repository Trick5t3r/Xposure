# Xposure - Analyse de l'image de marque pour Engie

Xposure est une application développée par une équipe de Polytechniciens (X), conçue pour agréger des ressources médias et fournir des analyses approfondies de l'image de marque d'Engie.

---

## Fonctionnalités principales

### **Backend Django**
- Gestion des API pour l'agrégation de ressources médias.
- Analyse des données pour fournir des bilans sur l'image de marque.
- Système de gestion des utilisateurs avec des rôles personnalisés (analystes, administrateurs, etc.).

### **Frontend React (Vite) + MUI**
- Interface intuitive pour consulter et analyser les bilans d'image de marque.
- Tableaux de bord interactifs affichant des données clés et des insights visuels.
- Communication fluide avec l'API backend via des appels HTTP.
- Utilisation de MUI

### **Conteneurisation Docker**
- Conteneurs distincts pour le backend, le frontend, et le serveur Nginx.
- Intégration des fichiers statiques pour un déploiement fluide.

### **Nginx**
- Proxy inverse pour servir les fichiers statiques et gérer les requêtes API.
- Optimisation pour un usage en environnement de production.

---

## Prérequis

- **Docker** et **Docker Compose** installés sur votre machine.

---

## Configuration

### Étape 1 : Cloner le projet depuis GitHub
Clonez le dépôt GitHub :
```bash
git clone https://github.com/Trick5t3r/Xposure.git
cd Xposure
```

### Étape 2 : Configurer le backend

1. Copiez le fichier d'exemple `.env` :
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Modifiez les variables d'environnement dans le fichier `.env` pour y inclure les clés d'API, les mots de passe, et autres configurations spécifiques.

3. Vérifié qu'un fichier vide `db.sqlite3` existe dans le repertoire `/backend`, sinon (pour Linux):
   ```bash
   nano backend/db.sqlite3
   ```
   Le docker va créer un superuser avec le nom et le mdp définie dans .env (default test/test)

### Étape 3 : Configurer le frontend (par défaut : `localhost`)

1. Copiez le fichier d'exemple `.env` :
   ```bash
   cp frontend/.env.example frontend/.env
   ```

2. Ajoutez l'URL backend dans le fichier `.env`.

### Étape 4 : Builder les conteneurs Docker

Lancez les commandes suivantes pour construire et démarrer les conteneurs :
```bash
docker-compose up --build -d
```
Et voilà, le serveur est en marche !

---

## Commandes supplémentaires

- **Arrêter le serveur** :
  ```bash
  docker-compose down
  ```

- **Redémarrer le serveur** :
  ```bash
  docker-compose up
  ```

- **Lancer en arrière-plan** :
  ```bash
  docker-compose up -d
  ```

- **Lister les conteneurs actifs** :
  ```bash
  docker ps
  ```

- **Rebuild complet avec les fichiers requis Python** (pour Linux) :
  ```bash
  ./build_assets_force.sh
  ```

- **Exécution sans Docker** (pour Linux) :
  ```bash
  ./manage.sh start/stop
  ```

---

## Objectifs du projet

**Xposure : Parce que l'image de marque compte.**
