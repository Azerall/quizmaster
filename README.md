# Quiz Master ++

Quiz Master ++ est une application web interactive de quiz où les utilisateurs peuvent jouer à des quiz existants ou créer les leurs. L’application propose un système de niveaux et de monnaie permettant d'obtenir des antisèches avec des effets variés, allant de l'élimination de mauvaises réponses à l'assistance d'un chatbot intelligent.

Le frontend est déployé à l'adresse suivante :  
🔗 [Quiz Master ++](https://azerall.github.io/quizmaster/)  

Cependant, pour un usage complet, le backend doit être lancé localement.

---

## 🛠 Technologies utilisées

- **Frontend** : React + Vite  
- **Backend** : Go  
- **Base de données** : MongoDB  
- **APIs externes** :  
  - [Open Trivia DB](https://opentdb.com/) (Génération de quiz par défaut)  
  - [AI/ML API](https://aimlapi.com/) (Chatbot intelligent)  
- **Conteneurisation** : Docker  

---

## ⚙️ Prérequis

Avant de lancer l'application, assurez-vous d'avoir installé :  
- **Docker** (si vous souhaitez utiliser l’option Docker)  
- **Golang 1.23+**  
- **Node.js 18+**  
- **MongoDB** (si vous ne passez pas par Docker)  

---

## 🚀 Lancer l’application

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
4. Accéder à l’application via :  
   [http://localhost:5173/quizmaster/dashboard](http://localhost:5173/quizmaster/)

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
3. Le backend écoutera sur le port **8080**.

---

## 🏆 Fonctionnalités principales

✅ Jouer à des quiz existants  
✅ Créer et partager des quiz  
✅ Gagner des niveaux et des récompenses  
✅ Obtenir des antisèches avec un système de loterie  
✅ Classement des utilisateurs  
✅ Profil personnalisable (nom d’utilisateur et avatar)  

---

**🚀 Amusez-vous bien avec Quiz Master ++ ! 🎉**
