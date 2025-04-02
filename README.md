# Quiz Master ++

Quiz Master ++ est une application web interactive de quiz où les utilisateurs peuvent jouer à des quiz existants ou créer les leurs. L’application propose un système de niveaux et de monnaie permettant d'obtenir des antisèches avec des effets variés, allant de l'élimination de mauvaises réponses à l'assistance d'un chatbot intelligent.

Le frontend est déployé à l'adresse suivante :  
🔗 [Quiz Master ++](https://azerall.github.io/quizmaster/)  

Cependant, pour un usage complet, le backend doit être lancé localement.

---

## 🏆 Fonctionnalités principales

✅ Jouer à des quiz existants  
✅ Créer et partager des quiz  
✅ Gagner des niveaux et des récompenses  
✅ Obtenir des antisèches avec un système de loterie  
✅ Classement des utilisateurs  
✅ Profil personnalisable (nom d’utilisateur et avatar)  

---

## 🛠 Technologies utilisées

- **Frontend** : React + Vite  
- **Backend** : Go  
- **Base de données** : MongoDB   
- **Conteneurisation** : Docker  

---

## 🌐 APIs externes utilisées

- [Open Trivia DB](https://opentdb.com/) (Génération de quiz par défaut)  
- [AI/ML API](https://aimlapi.com/) (Chatbot intelligent)  

---

## ⚙️ Prérequis

Avant de lancer l'application, assurez-vous d'avoir installé :  
- **Docker** (si vous souhaitez lancer avec Docker)  
- **Golang 1.23+**  
- **Node.js 18+**  

---

## 🚀 Lancer l’application

Après le lancement, le frontend sera disponible localement via :   [http://localhost:5173/quizmaster/](http://localhost:5173/quizmaster/)

Le backend écoutera sur le port **8080**.

### Avec Docker (recommandé)

1. **Démarrer Docker**  
2. **Exécuter la commande suivante dans le répertoire du projet :**  

   ```sh
   docker-compose up --build
   ```

Cela démarre à la fois le backend et le frontend dans des conteneurs configurés.

---

### Sans Docker

#### Lancer le **Frontend**  
1. Se déplacer dans le dossier du frontend :  
   ```sh
   cd frontend
   ```
2. Installer les dépendances :  
   ```sh
   npm install
   ```
3. Démarrer le serveur de développement :  
   ```sh
   npm run dev
   ```

---

#### Lancer le **Backend**  
1. Se déplacer dans le dossier du backend :  
   ```sh
   cd backend
   ```
2. Démarrer le serveur :  
   ```sh
   go run main.go
   ```

---

**🚀 Amusez-vous bien avec Quiz Master ++ ! 🎉**
