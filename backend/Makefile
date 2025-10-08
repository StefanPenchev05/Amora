# ---------- Backend Makefile ----------
SHELL := /bin/bash

# Colors
BLUE := \033[34m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
CYAN := \033[36m
RESET := \033[0m

APP_NAME ?= server
MAIN ?= ./cmd/api
BIN_DIR ?= bin
BINARY = $(BIN_DIR)/$(APP_NAME)

# All go files incremental build
SRC := $(shell find . -type f -name '*.go')

# File-target for incremental build
$(BINARY): $(SRC)
	@printf "$(CYAN)🔨 Creating binary directory...$(RESET)\n"
	@mkdir -p $(BIN_DIR)
	@printf "$(YELLOW)⚡ Building Go binary for Linux...$(RESET)\n"
	@CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o $@ $(MAIN)
	@printf "$(GREEN)✅ Binary built successfully: $(BINARY)$(RESET)\n"

.PHONY: build run test fmt clean

build: $(BINARY)
	@printf "$(GREEN)🎉 Build completed! Ready to deploy.$(RESET)\n"

run:
	@printf "$(CYAN)🚀 Starting development server...$(RESET)\n"
	@printf "$(BLUE)📁 Running from: $(MAIN)$(RESET)\n"
	@go run $(MAIN)

test:
	@printf "$(CYAN)🧪 Running Go tests...$(RESET)\n"
	@go test ./... -v
	@printf "$(GREEN)✅ All tests completed$(RESET)\n"

fmt:
	@printf "$(CYAN)📝 Formatting Go code...$(RESET)\n"
	@go fmt ./...
	@printf "$(GREEN)✅ Code formatted successfully$(RESET)\n"

clean:
	@printf "$(YELLOW)🧹 Cleaning build artifacts...$(RESET)\n"
	@rm -rf $(BIN_DIR)
	@printf "$(GREEN)✅ Clean completed$(RESET)\n"
	



