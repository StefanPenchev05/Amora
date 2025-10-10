# 💕 Amora  

**Amora** is a private web application designed to bring couples closer and give deeper meaning to their relationship.  
It helps partners stay connected by sharing calendars, moods, love notes, and memories — while celebrating milestones and uplifting each other with affirmations and achievements.  

## 📖 Table of Contents
- [💭 Where Does the Idea Come From?](#where-does-the-idea-come-from)
- [⚙️ Tech Stack (Main Versions)](#️-tech-stack-main-versions)  
- [📂 Project Structure](#-project-structure)
- [🛠️ Quick Start with Makefile](#️-quick-start-with-makefile)
  - [Makefile Structure](#makefile-structure)
  - [Prerequisites](#prerequisites)
  - [Common Commands](#common-commands)
  - [Getting Started](#getting-started)
- [🌳 Branching Rules](#-branching-rules)
- [🛡️ Security Guidelines](#️-security-guidelines)
- [🚀 Project Status](#-project-status)
- [📜 License](#-license)

---

## Where Does the Idea Come From?  
The idea for **Amora** started as a personal project — a Christmas gift to create a meaningful digital space for my partner.  
It later grew into a broader vision: a platform for all couples who want to strengthen their bond, stay organized together, and celebrate the small and big moments of their shared journey.  

---

## ⚙️ Tech Stack (Main Versions)  
- **Frontend:** React (v18) + TypeScript + Vite  
- **Mobile:** React Native + TypeScript + Expo  
- **Backend:** Go (v1.22+) + Chi/Fiber (HTTP framework)  

- **Database:** MySQL (v14.14)  
- **Realtime:** WebSockets (deferred for MVP)  
- **Deployment:** Docker + Docker Compose  
- **Hosting:** Vercel / Render / AWS (TBD)  

> Versions may evolve as the project grows, but these represent the foundation for the MVP.  

---

## 📂 Project Structure  
/apps/frontend → React + TypeScript web app

/apps/mobile → React Native + Expo mobile app

/backend → Go services (API, DB)

/docs → Documentation, DB schema, diagrams

/infra → Docker, configs, deployment scripts

📖 Full documentation can be found in the [`/docs`](./docs) folder.  

---

## 🛠️ Quick Start with Makefile  

This project includes **Makefiles** to simplify development. No need to remember complex commands!  

### **Makefile Structure**
- **Root Makefile** (`./Makefile`) - Main commands that coordinate backend/frontend
- **Backend Makefile** (`./backend/Makefile`) - Go-specific build and test commands
- **Frontend Makefile** (`./frontend/Makefile`) - Node.js-specific build and dev commands

The root Makefile acts as a **coordinator**, passing commands to the appropriate subdirectory Makefiles.

### **Prerequisites**  
- **Go** (v1.22+)  
- **Node.js** (v18+)  
- **Make** (usually pre-installed on macOS/Linux)  

### **Common Commands**  
```bash
# See all available commands
make help

# Setup & Installation
make be/install     # Install Go dependencies
make fe/install     # Install Node.js dependencies
make mb/install     # Install mobile dependencies

# Development
make be/run         # Start backend server
make fe/dev         # Start frontend dev server
make mb/dev         # Start mobile expo server

# Building
make be/build       # Build Go binary
make fe/build       # Build frontend for production
make mb/build       # Build mobile app

# Code Quality
make be/test        # Run backend tests
make be/fmt         # Format Go code
make fe/lint        # Lint frontend code
make mb/test        # Run mobile tests
make mb/lint        # Lint mobile code

# Cleanup
make clean          # Remove build artifacts
```

### **Getting Started**  
```bash
# 1. Clone the repository
git clone https://github.com/StefanPenchev05/Amora.git
cd Amora

# 2. Install all dependencies
make setup

# 3. Start backend
make be/run

# 4. In another terminal, start web frontend  
make fe/dev

# 5. In another terminal, start mobile app
make mb/dev

# 6. Open applications:
#    - Web: http://localhost:5173
#    - Mobile: Expo DevTools will guide you to simulator/device
```

> **Windows users:** Use WSL2 or Git Bash for Make support.

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
