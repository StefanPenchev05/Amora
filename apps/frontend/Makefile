# ---------- Frontend Makefile ----------
SHELL := /bin/bash

# Colors
BLUE := \033[34m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
CYAN := \033[36m
RESET := \033[0m

.PHONY: install dev build lint preview clean

install:
	@printf "$(CYAN)📦 Installing Node.js dependencies...$(RESET)\n"
	@npm install
	@printf "$(GREEN)✅ Dependencies installed successfully!$(RESET)\n"

dev:
	@printf "$(CYAN)🎨 Starting development server...$(RESET)\n"
	@printf "$(BLUE)🌐 Server will be available at http://localhost:5173$(RESET)\n"
	@npm run dev

build:
	@printf "$(CYAN)🏗️  Building for production...$(RESET)\n"
	@npm run build
	@printf "$(GREEN)✅ Build completed successfully!$(RESET)\n"

lint:
	@printf "$(CYAN)🔍 Linting TypeScript and React code...$(RESET)\n"
	@npm run lint
	@printf "$(GREEN)✅ Linting completed$(RESET)\n"

preview:
	@printf "$(CYAN)👀 Starting preview server...$(RESET)\n"
	@npm run preview

clean:
	@printf "$(YELLOW)🧹 Cleaning build artifacts...$(RESET)\n"
	@rm -rf dist node_modules/.vite
	@printf "$(GREEN)✅ Clean completed$(RESET)\n"
