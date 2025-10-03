# 💕 Viki  

**Viki** is a private web application designed to bring couples closer and give deeper meaning to their relationship.  
It helps partners stay connected by sharing calendars, moods, love notes, and memories — while celebrating milestones and uplifting each other with affirmations and achievements.  

---

## Where Does the Idea Come From?  
The idea for **Viki** started as a personal project — a Christmas gift to create a meaningful digital space for my partner.  
It later grew into a broader vision: a platform for all couples who want to strengthen their bond, stay organized together, and celebrate the small and big moments of their shared journey.  

---

## ⚙️ Tech Stack (Main Versions)  
- **Frontend:** React (v18) + TypeScript + Vite  
- **Backend:** Go (v1.22+) + Chi/Fiber (HTTP framework)  

- **Database:** MySQL (v14.14)  
- **Realtime:** WebSockets (deferred for MVP)  
- **Deployment:** Docker + Docker Compose  
- **Hosting:** Vercel / Render / AWS (TBD)  

> Versions may evolve as the project grows, but these represent the foundation for the MVP.  

---

## 📂 Project Structure  
/frontend → React + TypeScript app

/backend → Go services (API, DB)

/docs → Documentation, DB schema, diagrams

/infra → Docker, configs, deployment scripts

📖 Full documentation can be found in the [`/docs`](./docs) folder.  

---

## 🌳 Branching Rules  

We follow a **Git Flow-inspired branching strategy** to keep development organized:  

- **`main`** → Stable, production-ready code only.  
- **`develop`** → Active development branch; merged into `main` when stable.  
- **Feature branches:**  
  - Format: `feature/<short-description>`  
  - Example: `feature/calendar-recurring-events`  
- **Fix branches:**  
  - Format: `fix/<short-description>`  
  - Example: `fix/mood-check-timezone`  
- **Release branches:**  
  - Format: `release/<version>`  
  - Example: `release/1.0.0`  
- **Hotfix branches:**  
  - Format: `hotfix/<short-description>`  
  - Used for urgent fixes on production.  

### Rules  
1. **Never push directly to `main`.**  
2. Always create a branch from `develop`.  
3. Open a Pull Request (PR) when ready to merge.  
4. **Merging into `main` requires at least one review from a team member.**  
5. Write clear commit messages following the format:  
   - `feat(calendar): add recurring event support`  
   - `fix(auth): handle expired tokens`  

---

## 🛡️ Security Guidelines  
- Do not commit `.env` or any secrets to the repository.  
- All sensitive credentials are managed via Docker Compose or a secret manager (Vault, AWS Secrets Manager, etc.).  
- Passwords are always hashed using strong algorithms (bcrypt/argon2).  
- Access tokens and refresh tokens must be stored securely.  
- Always use HTTPS in production deployments.  

---

## 🚀 Project Status  
🎄 **MVP Goal:** Production-ready by Christmas (Dec 25).  

---

## 📜 License  
This project is licensed under the **MIT License**.  
You are free to use, modify, and distribute it, provided proper attribution is given.  

---
