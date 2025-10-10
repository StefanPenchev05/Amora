# ---------- Mobile Makefile ----------
SHELL := /bin/bash

# Colors
BLUE := \033[34m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
CYAN := \033[36m
RESET := \033[0m

.PHONY: install dev build build-dev build-ios build-android test lint clean start-ios start-android setup-eas

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
	@printf "$(BLUE)📱 Creating optimized bundle...$(RESET)\n"
	@npx expo export --platform all
	@printf "$(GREEN)✅ Mobile build complete! Check dist/ folder$(RESET)\n"

build-dev:
	@printf "$(CYAN)📦 Creating development build...$(RESET)\n"
	@npx expo export --dev
	@printf "$(GREEN)✅ Development build complete!$(RESET)\n"

build-ios:
	@printf "$(CYAN)🍎 Building for iOS (requires EAS Build)...$(RESET)\n"
	@npx eas build --platform ios --non-interactive 2>/dev/null || \
	printf "$(YELLOW)⚠️  Run 'make setup-eas' to configure EAS Build first$(RESET)\n"

build-android:
	@printf "$(CYAN)🤖 Building for Android (requires EAS Build)...$(RESET)\n"
	@npx eas build --platform android --non-interactive 2>/dev/null || \
	printf "$(YELLOW)⚠️  Run 'make setup-eas' to configure EAS Build first$(RESET)\n"

setup-eas:
	@printf "$(CYAN)⚙️  Setting up EAS Build...$(RESET)\n"
	@npx eas build:configure
	@printf "$(GREEN)✅ EAS Build configured! Now you can use build-ios/build-android$(RESET)\n"

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
