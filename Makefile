# ---------- Root Makefile ----------
SHELL := /bin/bash

# Colors
BLUE := \033[34m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
CYAN := \033[36m
RESET := \033[0m

# ---------- Versioning (git describe) ----------
VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
# For now it is only the gh, later it will be switch to hosting platform
REGISTRY ?= ghcr.io/stefanpenchev05
IMAGE ?= $(REGISTRY)/amora:$(VERSION)

.DEFAULT_GOAL := help


.PHONY: help
help:
	@printf "$(BLUE)Usage: make <target>$(RESET)\n"
	@printf "\n"
	@printf "$(YELLOW)Setup:$(RESET)\n"
	@printf "  $(GREEN)make be/install$(RESET)     - install Go dependencies\n"
	@printf "  $(GREEN)make fe/install$(RESET)     - install Node.js dependencies\n"
	@printf "\n"
	@printf "$(YELLOW)Dev:$(RESET)\n"
	@printf "  $(GREEN)make be/run$(RESET)         - run backend locally\n"
	@printf "  $(GREEN)make fe/dev$(RESET)         - run frontend dev server\n"
	@printf "\n"
	@printf "$(YELLOW)Build:$(RESET)\n"
	@printf "  $(GREEN)make be/build$(RESET)       - build Go binary\n"
	@printf "  $(GREEN)make fe/build$(RESET)       - build frontend static files\n"
	@printf "\n"
	@printf "$(YELLOW)Tests & Quality:$(RESET)\n"
	@printf "  $(GREEN)make be/test$(RESET)        - run Go tests\n"
	@printf "  $(GREEN)make be/fmt$(RESET)         - format Go\n"
	@printf "  $(GREEN)make fe/lint$(RESET)        - lint frontend\n"
	@printf "\n"
	@printf "$(YELLOW)Docker:$(RESET)\n"
	@printf "  $(GREEN)make dk/build$(RESET)       - build multi-service images\n"
	@printf "  $(GREEN)make dk/up$(RESET)          - docker compose up -d\n"
	@printf "  $(GREEN)make dk/down$(RESET)        - docker compose down\n"
	@printf "  $(GREEN)make dk/logs$(RESET)        - tail compose logs\n"
	@printf "\n"
	@printf "$(YELLOW)Meta:$(RESET)\n"
	@printf "  $(GREEN)make clean$(RESET)          - clean build artifacts\n"


# ----- Root passthroughs -----

setup:
	$(MAKE) -C backend install
	$(MAKE) -C frontend install

# ----- Backend passthroughs -----
.PHONY: be/install be/build be/run be/test be/fmt be/clean

be/install:
	$(MAKE) -C backend install

be/build:
	$(MAKE) -C backend build

be/run:
	$(MAKE) -C backend run

be/test:
	$(MAKE) -C backend test

be/fmt:
	$(MAKE) -C backend fmt

be/clean:
	$(MAKE) -C backend clean

# ----- Frontend commands -----
.PHONY: fe/install fe/dev fe/build fe/lint

fe/install:
	@printf "$(YELLOW)📦 Installing Node.js dependencies...$(RESET)\n"
	@cd $(FRONTEND_DIR) && npm install
	@printf "$(GREEN)✅ Frontend dependencies installed!$(RESET)\n"

fe/dev:
	@printf "$(YELLOW)🎨 Starting frontend dev server...$(RESET)\n"
	@cd $(FRONTEND_DIR) && npm run dev

fe/build:
	@printf "$(YELLOW)🏗️  Building frontend for production...$(RESET)\n"
	@cd $(FRONTEND_DIR) && npm run build
	@printf "$(GREEN)✅ Frontend build complete!$(RESET)\n"

fe/lint:
	@printf "$(YELLOW)🔍 Linting frontend code...$(RESET)\n"
	@cd $(FRONTEND_DIR) && npm run lint