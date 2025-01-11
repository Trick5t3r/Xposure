# Projet Django - React (Vite) - Nginx - Docker

Ce projet est une implémentation d'un clone de ChatGPT, en se basant sur le modèle **Mistral**. Il combine un **backend Django** pour l'API, un **frontend React** (utilisant Vite), et une architecture de conteneurisation complète avec **Docker** et **Nginx**.

Ce projet m'a permis de :
- Apprendre à développer une application frontend en React intégrée avec un backend Django.
- Mettre en œuvre la conteneurisation avec Docker, en créant des images personnalisées pour chaque composant.
- Configurer un serveur de production avec Nginx.

---

## Fonctionnalités principales

- **Backend Django** :
  - Gestion des API pour communiquer avec le frontend.
  - Intégration avec le modèle Mistral pour répondre aux requêtes utilisateur.
  - Système de gestion des utilisateurs et des sessions.

- **Frontend React (Vite)** :
  - Interface utilisateur moderne et interactive.
  - Communication avec l'API Django via des appels HTTP.

- **Conteneurisation Docker** :
  - Images distinctes pour le backend, le frontend, et le serveur Nginx.
  - Utilisation de volumes pour gérer les fichiers statiques et médias.

- **Nginx** :
  - Proxy inverse pour servir les fichiers statiques de React et rediriger les requêtes API vers Django.

---

## Prérequis

- **Docker** et **Docker Compose** installés sur votre machine.

---

## Configuration


### Étape 1 : Cloner le projet depuis GitHub

Clonez le dépôt GitHub à l'adresse `XXX` :
   ```bash
   git clone https://github.com/Trick5t3r/Django-React-Docker-Project.git
   cd Django-React-Docker-Project
   ```

### Étape 2 : Configurer le backend

1. Copiez le fichier d'exemple `.env` :
   ```bash
   cp /backend/.env.example /backend/.env
   ```

2. Editer les variables d'environnement pour mettre vos clefs d'API et vos mots de passe du fichier `.env`

4. Copiez le fichier d'exemple `.env` :
   ```bash
   cp /frotend/.env.example /frontend/.env
   ```

4. Editer les variables d'environnement pour mettre votre url dans le fichier `.env` (defaul localhost)


### Étape 3 : Builder le docker
  ```bash
  docker-compose up --build -d
  ```

Et voilà le serveur tourne
### Commandes supplémentaires
Pour stop le serveur
```bash
  docker-compose down
  ```
  Pour juste redemarrer
  ```bash
  docker-compose up
  ```
  et pour run (redemarrer) en background
  ```bash
  docker-compose up -d
  ```

Pour lister les process docker
  ```bash
  docker ps
  ```

  Pour mettre tous les requirements python dans le bon fichier et tout rebuild :
  ```bash
  ./build_assets_force.sh
  ```

  Pour run en dehors du docker directement sur un ordi linux avec les différents serveurs avec une conf nginx deja installé idoine
  ```bash
  ./manage.sh start/stop
  ```
