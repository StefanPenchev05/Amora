# ---------- Mobile Makefile ----------
SHELL := /bin/bash

# Colors
BLUE := \033[34m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
CYAN := \033[36m
RESET := \033[0m

.PHONY: install dev build test lint clean start-ios start-android

install:
	@printf "$(CYAN)📦 Installing mobile dependencies...$(RESET)\n"
	@npm install
	@printf "$(GREEN)✅ Mobile dependencies installed!$(RESET)\n"

dev:
	@printf "$(CYAN)📱 Starting Expo development server...$(RESET)\n"
	@printf "$(BLUE)🌐 Expo DevTools will open in your browser$(RESET)\n"
	@npx expo start

start-ios:
	@printf "$(CYAN)📱 Starting iOS simulator...$(RESET)\n"
	@npx expo start --ios

start-android:
	@printf "$(CYAN)📱 Starting Android emulator...$(RESET)\n"
	@npx expo start --android

build:
	@printf "$(CYAN)🏗️ Building mobile app for production...$(RESET)\n"
	@npx expo build
	@printf "$(GREEN)✅ Mobile build complete!$(RESET)\n"

test:
	@printf "$(CYAN)🧪 Running mobile tests...$(RESET)\n"
	@npm test
	@printf "$(GREEN)✅ Mobile tests completed$(RESET)\n"

lint:
	@printf "$(CYAN)🔍 Linting mobile TypeScript code...$(RESET)\n"
	@npm run lint
	@printf "$(GREEN)✅ Mobile linting completed$(RESET)\n"

clean:
	@printf "$(YELLOW)🧹 Cleaning mobile build artifacts...$(RESET)\n"
	@rm -rf .expo dist node_modules/.cache
	@printf "$(GREEN)✅ Mobile cleanup complete!$(RESET)\n"
